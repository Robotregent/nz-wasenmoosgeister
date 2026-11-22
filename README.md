# NZ Wasenmoosgeister Höll e.V. – Website

Neubau von nz-wasenmoosgeister-hoell.de mit **Astro 7**, **Tailwind CSS 4**, **Storyblok** (CMS, Free-Plan) und **Netlify** (Hosting, Free-Plan).

- Rein statische Seiten in Production: schnell, ohne Cookies, ohne Tracking
- Alle Inhalte, auch Navigation und Footer, pflegt ihr in Storyblok
- Seite **Fasnet 2026/27** mit pflegbarer Termintabelle: je Termin ein Link oder ein Download, automatisch nach Datum sortiert, vergangene Termine werden ausgegraut
- Vorschau mit Live-Editing im Storyblok Visual Editor über einen eigenen Netlify-Branch-Deploy

## Schnellstart (lokal, ohne CMS)

```bash
npm install
cp .env.example .env
# in .env: STORYBLOK_OFFLINE=true
npm run dev          # http://localhost:4321
```

Mit `STORYBLOK_OFFLINE=true` kommen die Inhalte aus `scripts/seed/content.mjs`. So lässt sich die Seite ohne Storyblok-Zugang entwickeln oder vorführen.

## 1. Storyblok einrichten

1. Auf [storyblok.com](https://www.storyblok.com) einen kostenlosen Account anlegen, dann einen neuen Space erstellen (Region **EU**).
2. Die **Space-ID** steht unter *Settings → Space*.
3. Ein **Personal Access Token** anlegen: *My Account → Account settings → Personal access token*.
4. Komponenten und Startinhalte importieren:

   ```bash
   # in .env: STORYBLOK_MANAGEMENT_TOKEN=…  STORYBLOK_SPACE_ID=…
   npm run seed
   ```

   Das Skript legt alle Block-Typen an und importiert alle Seiten mit den Texten der alten Website, dazu Beispiel-Termine und Platzhalterbilder. Es kann gefahrlos erneut laufen: Bereits vorhandene Seiten bleiben unverändert.
   - `npm run seed -- --components-only` aktualisiert nur die Block-Schemas.
   - `npm run seed -- --overwrite` überschreibt vorhandene Seiten mit dem Seed-Stand. **Achtung:** Änderungen aus dem CMS gehen dabei verloren.
5. Unter *Settings → Access Tokens* zwei Tokens anlegen:
   - **Public**: für die Live-Seite, liefert nur veröffentlichte Inhalte
   - **Preview**: für die Vorschau, liefert auch Entwürfe

### Inhalte pflegen

| Story | Inhalt |
|---|---|
| `config` (Einstellungen) | Seitenname, Narrenruf, Logo, Hauptnavigation, Footer-Links, Adresse, E-Mail |
| `home` | Startseite (Hero, Teaser) |
| `fasnet-2026-27` | Termintabelle: Block *Termintabelle* → *Termine* |
| übrige Seiten | Geschichte, Zunftrat, Mitglied werden, Kontakt, Links, Impressum, Datenschutz |

**Termin-Felder:** Datum, Uhrzeit (Freitext), Veranstaltung, Ort, Beschreibung, *Link (optional)*, *Download (optional)* und Button-Beschriftung. Ist ein Download hinterlegt, hat er Vorrang vor dem Link. Für die nächste Saison legt ihr einfach eine neue Seite an, z. B. `fasnet-2027-28`, und passt den Menüpunkt in `config` an.

Neue Seiten bekommen den Inhaltstyp **Seite**. Ihre URL ergibt sich aus dem Slug.

## 2. Netlify einrichten

1. Das Repository zu GitHub oder GitLab pushen und in Netlify unter *Add new site → Import an existing project* verbinden. Build-Einstellungen kommen aus `netlify.toml`.
2. Unter *Site configuration → Environment variables* setzen:
   - `STORYBLOK_DELIVERY_TOKEN` = **Public**-Token (Scope: Production)
   - `STORYBLOK_DELIVERY_TOKEN` = **Preview**-Token (Scope: Branch deploys / `preview`)
   - `SITE_URL` = `https://nz-wasenmoosgeister-hoell.de`
3. **Automatisch neu bauen bei Veröffentlichung:**
   - Netlify: *Site configuration → Build & deploy → Build hooks* → Hook „Storyblok publish“ (Branch `main`) anlegen und die URL kopieren.
   - Storyblok: *Settings → Webhooks* → neuer Webhook mit dieser URL, Trigger *Story published* und *Story unpublished*. Bei Downloads/Bildern zusätzlich *Asset replaced*.
4. Domain unter *Domain management* verbinden. Netlify stellt das HTTPS-Zertifikat automatisch aus. Damit ist auch das alte Problem mit dem selbstsignierten Zertifikat gelöst.

## 3. Visual Editor (Vorschau)

Die Vorschau läuft als eigener Netlify-**Branch-Deploy** vom Branch `preview`. Dort ist `STORYBLOK_PREVIEW=true` gesetzt (siehe `netlify.toml`): Seiten werden on demand gerendert, zeigen Entwürfe und aktualisieren sich live beim Tippen.

1. Netlify: *Site configuration → Build & deploy → Branches and deploy contexts* → Branch deploys für `preview` aktivieren.
2. `git push origin main:preview` (bei Code-Änderungen wiederholen)
3. Storyblok: *Settings → Visual Editor* → Location `https://preview--<site-name>.netlify.app/`
4. Bei der Story `home` unter *Entry configuration → Real path* `/` eintragen

Lokal geht es ebenfalls: `.env` mit `STORYBLOK_PREVIEW=true`, Preview-Token und `DEV_HTTPS=true`, dann `npm run dev` und `https://localhost:4321/` als Location eintragen.

## Projektstruktur

```
astro.config.mjs          Static (Production) bzw. Server-Output (Preview)
netlify.toml              Build, Preview-Kontext, Header
src/lib/storyblok.ts      Laden der Stories (Storyblok / offline)
src/lib/helpers.ts        Links, Bild-URLs (Storyblok Image Service), Datum
src/storyblok/            eine Astro-Komponente je Storyblok-Block + Registry (index.ts)
src/pages/[...slug].astro Catch-all-Route für alle Seiten
src/styles/global.css     Tailwind-Theme (Moos-, Rinden-, Torf- und Leinentöne)
scripts/seed/             Komponenten-Schemas, Startinhalte, Seed-Skript
public/placeholders/      Platzhalterbilder (in Storyblok austauschen)
```

## Free-Tier-Hinweise

- **Netlify Free:** 300 Build-Minuten pro Monat. Ein Build dauert etwa 30 Sekunden, das reicht also für sehr viele Veröffentlichungen.
- **Storyblok Starter (Free):** 1 Benutzer, eine Content Delivery API, die für eine Vereinsseite reicht. Die Seite wird beim Build statisch erzeugt, Besucher belasten die API also nicht.

## Offene Punkte / bitte prüfen

- **Datenschutzerklärung:** Die Erklärung ist ein **Entwurf**, angepasst an die neue Technik: Netlify als Hosting, Storyblok-CDN, keine Cookies, lokal eingebundene Schriften. Google Maps, YouTube und das ungültige „Privacy Shield“ sind entfernt. **Vor dem Livegang rechtlich prüfen lassen.** Außerdem bei Netlify den Auftragsverarbeitungsvertrag (DPA) abschließen.
- **Impressum:** Die Rechtsgrundlage ist von § 5 TMG auf **§ 5 DDG** aktualisiert (das TMG gilt seit Mai 2024 nicht mehr). Die Telefonnummer war auf der alten Seite leer.
- **Bilder und Logo** sind Platzhalter. Echte Fotos einfach in Storyblok hochladen und austauschen.
- **Termine** auf der Fasnet-Seite sind Beispiele (mit „(Beispiel)“ markiert).
- **Downloads (PDF) im Storyblok-Free-Plan:** PDFs und SVGs lassen sich erst hochladen, wenn im Space eine Kreditkarte hinterlegt ist (Starter-Plan bleibt kostenlos). Ohne Karte lehnt Storyblok den Upload ab. Das Seed-Skript behält dann den lokalen Pfad (`/downloads/…` aus `public/`) und gibt eine Warnung aus. Alternative: die Datei woanders ablegen und beim Termin als Link eintragen.
- Space-ID in `.env` **ohne** führendes `#` eintragen.
