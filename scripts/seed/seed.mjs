#!/usr/bin/env node
// Legt Komponenten und Startinhalte im Storyblok-Space an (idempotent).
//
//   STORYBLOK_MANAGEMENT_TOKEN=… STORYBLOK_SPACE_ID=… npm run seed
//
// Optionen:
//   --components-only   nur Komponenten (Schemas) anlegen/aktualisieren
//   --overwrite         bestehende Stories mit den Seed-Inhalten überschreiben
//                       (Standard: vorhandene Stories bleiben unangetastet)

import { readFile, stat } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { components } from "./components.mjs";
import { allStories } from "./content.mjs";

const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;
const SPACE_ID = process.env.STORYBLOK_SPACE_ID?.replace(/^#/, "");
const API = process.env.STORYBLOK_MAPI_URL || "https://mapi.storyblok.com/v1";
const args = new Set(process.argv.slice(2));
const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../public");

if (!TOKEN || !SPACE_ID) {
  console.error("Bitte STORYBLOK_MANAGEMENT_TOKEN und STORYBLOK_SPACE_ID setzen (siehe .env.example).");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function api(method, path, body, attempt = 1) {
  const res = await fetch(`${API}/spaces/${SPACE_ID}${path}`, {
    method,
    headers: { Authorization: TOKEN, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  // 429 = Rate-Limit; Storyblok nutzt 429 aber auch für Plan-Beschränkungen (error_code) – die nicht wiederholen.
  if (res.status === 429 && !data?.error_code && attempt < 6) {
    await sleep(1000 * attempt);
    return api(method, path, body, attempt + 1);
  }
  if (!res.ok) throw new ApiError(`${method} ${path} → ${res.status} ${JSON.stringify(data)}`, res.status, data);
  await sleep(200); // Rate-Limit schonen (Free-Plan: 3 Requests/s)
  return data;
}

// ---------- Komponenten ----------

async function seedComponents() {
  const { components: existing } = await api("GET", "/components");
  const byName = new Map(existing.map((c) => [c.name, c]));

  for (const component of components) {
    const current = byName.get(component.name);
    if (current) {
      await api("PUT", `/components/${current.id}`, { component: { ...current, ...component } });
      console.log(`  ↻ Komponente ${component.name}`);
    } else {
      await api("POST", "/components", { component });
      console.log(`  + Komponente ${component.name}`);
    }
  }
}

// ---------- Assets ----------

const assetCache = new Map();

/** Lädt eine Datei aus /public als Storyblok-Asset hoch und gibt das Asset-Feld zurück. */
async function uploadAsset(localPath, alt) {
  if (assetCache.has(localPath)) return assetCache.get(localPath);

  const file = join(PUBLIC_DIR, localPath);
  const { size } = await stat(file);
  let signed;
  try {
    signed = await api("POST", "/assets", { filename: basename(file), size });
  } catch (err) {
    // Free-Plan: manche Dateitypen (z. B. SVG, PDF) nur mit hinterlegter Kreditkarte.
    if (err instanceof ApiError && err.data?.error_code) {
      console.warn(`  ! Asset ${localPath} nicht hochgeladen (${err.data.error}) – lokaler Pfad bleibt erhalten`);
      const asset = { id: null, filename: localPath, alt, title: alt, name: "", focus: "", fieldtype: "asset" };
      assetCache.set(localPath, asset);
      return asset;
    }
    throw err;
  }

  const form = new FormData();
  for (const [k, v] of Object.entries(signed.fields)) form.append(k, v);
  form.append("file", new Blob([await readFile(file)]), basename(file));
  const upload = await fetch(signed.post_url, { method: "POST", body: form });
  if (!upload.ok) throw new Error(`Upload ${localPath} fehlgeschlagen (${upload.status})`);
  await api("GET", `/assets/${signed.id}/finish_upload`);

  const filename = signed.public_url || `https:${signed.pretty_url}`;
  const asset = { id: signed.id, filename, alt, title: alt, name: "", focus: "", fieldtype: "asset" };
  assetCache.set(localPath, asset);
  console.log(`  ⇪ Asset ${localPath}`);
  return asset;
}

/** Ersetzt lokale Asset-Pfade (/placeholders/…, /downloads/…) rekursiv durch hochgeladene Assets. */
async function replaceLocalAssets(value) {
  // Sequentiell statt parallel: schont das Rate-Limit und vermeidet doppelte Uploads.
  if (Array.isArray(value)) {
    const out = [];
    for (const v of value) out.push(await replaceLocalAssets(v));
    return out;
  }
  if (value && typeof value === "object") {
    if (value.fieldtype === "asset" && value.filename?.startsWith("/")) {
      return uploadAsset(value.filename, value.alt ?? "");
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = await replaceLocalAssets(v);
    return out;
  }
  return value;
}

// ---------- Stories ----------

async function seedStories() {
  const overwrite = args.has("--overwrite");

  for (const seed of allStories) {
    const { stories } = await api("GET", `/stories?with_slug=${encodeURIComponent(seed.slug)}`);
    const current = stories[0];

    if (current && !overwrite) {
      console.log(`  = Story ${seed.slug} existiert bereits (übersprungen, --overwrite zum Überschreiben)`);
      continue;
    }

    const content = await replaceLocalAssets(seed.content);
    const story = { name: seed.name, slug: seed.slug, content };

    if (current) {
      await api("PUT", `/stories/${current.id}`, { story, force_update: 1, publish: 1 });
      console.log(`  ↻ Story ${seed.slug}`);
    } else {
      await api("POST", "/stories", { story, publish: 1 });
      console.log(`  + Story ${seed.slug}`);
    }
  }
}

console.log(`Storyblok-Space ${SPACE_ID}`);
console.log("Komponenten …");
await seedComponents();
if (!args.has("--components-only")) {
  console.log("Stories …");
  await seedStories();
}
console.log("Fertig.");
