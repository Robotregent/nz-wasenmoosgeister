import { createApiClient } from "@storyblok/api-client";
import { STORYBLOK_DELIVERY_TOKEN, STORYBLOK_OFFLINE, STORYBLOK_PREVIEW, STORYBLOK_PREVIEW_TOKEN } from "astro:env/server";

/** Minimale Story-Form, die wir im Frontend verwenden. */
export interface Story {
  name: string;
  slug: string;
  full_slug: string;
  published_at?: string | null;
  content: Record<string, any> & { component: string; _uid: string; _editable?: string };
}

const version = STORYBLOK_PREVIEW ? "draft" : "published";

// Preview braucht einen Preview-Token (Entwürfe); Production den Public-Token.
// Fallback: Ist STORYBLOK_DELIVERY_TOKEN selbst ein Preview-Token, reicht er für beides.
const accessToken = STORYBLOK_PREVIEW ? (STORYBLOK_PREVIEW_TOKEN ?? STORYBLOK_DELIVERY_TOKEN) : STORYBLOK_DELIVERY_TOKEN;
const tokenName = STORYBLOK_PREVIEW ? "STORYBLOK_PREVIEW_TOKEN" : "STORYBLOK_DELIVERY_TOKEN";

const client = !STORYBLOK_OFFLINE && accessToken ? createApiClient({ accessToken, region: "eu" }) : null;

function ensureSource() {
  if (!client && !STORYBLOK_OFFLINE) {
    throw new Error(
      `${tokenName} fehlt. Token in .env bzw. in den Netlify-Umgebungsvariablen setzen ` +
        "oder STORYBLOK_OFFLINE=true für einen Build mit den lokalen Seed-Inhalten.",
    );
  }
}

async function offlineStories(): Promise<Story[]> {
  const { allStories } = await import("../../scripts/seed/content.mjs");
  return allStories.map((s: any) => ({ ...s, full_slug: s.slug, published_at: null }));
}

/** Alle Stories (Seiten + config). */
export async function getAllStories(): Promise<Story[]> {
  ensureSource();
  if (!client) return offlineStories();

  const stories: Story[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await client.stories.list({ query: { version, per_page: 100, page } });
    if (error) throw new Error(`Storyblok: Stories konnten nicht geladen werden (${error.message})`);
    const batch = (data?.stories ?? []) as unknown as Story[];
    stories.push(...batch);
    if (batch.length < 100) break;
  }
  return stories;
}

export async function getStory(slug: string): Promise<Story | undefined> {
  ensureSource();
  if (!client) return (await offlineStories()).find((s) => s.full_slug === slug);

  const { data, error } = await client.stories.get(slug, { query: { version } });
  if (error) {
    if (error.response.status === 404) return undefined;
    throw new Error(`Storyblok: Story "${slug}" konnte nicht geladen werden (${error.message})`);
  }
  return data?.story as unknown as Story | undefined;
}

export const isPreview = STORYBLOK_PREVIEW;

/** Stories, die nicht als eigene Seite ausgeliefert werden (globale Einstellungen). */
export const HIDDEN_SLUGS = new Set(["config"]);

/** full_slug → Routen-Parameter für [...slug] ("home" = Startseite "/"). */
export const toRouteParam = (fullSlug: string) => (fullSlug === "home" ? undefined : fullSlug.replace(/\/$/, ""));
