/** Hilfsfunktionen für Storyblok-Feldwerte (Links, Assets, Datum). */

export interface Multilink {
  linktype?: "url" | "story" | "email" | "asset";
  url?: string;
  cached_url?: string;
  email?: string;
  target?: string;
  anchor?: string;
  story?: { full_slug?: string };
}

export interface Asset {
  filename?: string | null;
  alt?: string | null;
  title?: string | null;
  name?: string;
  focus?: string | null;
}

/** Wandelt ein Storyblok-Multilink-Feld in eine href um (leer = kein Link). */
export function linkHref(link?: Multilink | null): string {
  if (!link) return "";
  switch (link.linktype) {
    case "email":
      return link.email ? `mailto:${link.email}` : "";
    case "story": {
      const slug = link.story?.full_slug ?? link.cached_url ?? "";
      if (!slug) return "";
      const path = slug === "home" ? "/" : `/${slug.replace(/^\/|\/$/g, "")}`;
      return link.anchor ? `${path}#${link.anchor}` : path;
    }
    default: {
      const href = link.url || link.cached_url || "";
      return link.anchor && href ? `${href}#${link.anchor}` : href;
    }
  }
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

/** Attribute für <a>: externe Links öffnen in neuem Tab. */
export function linkAttrs(link?: Multilink | null) {
  const href = linkHref(link);
  const external = isExternal(href) || link?.target === "_blank";
  return external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };
}

const isStoryblokAsset = (url: string) => /^https:\/\/a(-us)?\.storyblok\.com\//.test(url);

/**
 * Bild-URL über den Storyblok Image Service (WebP, skaliert).
 * Lokale Platzhalter (/placeholders/…) werden unverändert zurückgegeben.
 */
export function imageUrl(asset: Asset | null | undefined, width: number, height = 0): string {
  const src = asset?.filename;
  if (!src) return "";
  if (!isStoryblokAsset(src) || src.endsWith(".svg")) return src;
  const focus = asset?.focus ? `:focal(${asset.focus})` : "";
  return `${src}/m/${width}x${height}/filters:format(webp)${focus}`;
}

/** Ursprüngliche Bildmaße aus Storyblok-Asset-URLs (…/1920x1080/…). */
export function imageSize(asset: Asset | null | undefined): { width: number; height: number } | undefined {
  const m = asset?.filename?.match(/\/(\d+)x(\d+)\//);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : undefined;
}

/** Storyblok-Datumsfeld ("2027-02-04 00:00") → Date (lokale Zeit). */
export function parseDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const [d, t = "00:00"] = value.split(" ");
  const date = new Date(`${d}T${t}:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

const TZ = "Europe/Berlin";

export function formatDate(date: Date, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("de-DE", { timeZone: TZ, ...opts }).format(date);
}

/** Dateiendung eines Assets in Großbuchstaben, z. B. "PDF". */
export function fileExtension(asset?: Asset | null): string {
  const m = asset?.filename?.match(/\.([a-z0-9]{2,5})(?:$|\?)/i);
  return m ? m[1].toUpperCase() : "";
}
