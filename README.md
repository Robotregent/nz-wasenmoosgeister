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
npm run dev:preview  # https://localhost:4321 – Live-Preview für den Visual Editor
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
5. Unter *Settings → Access Tokens* zwei Tokens anlegen bzw. kopieren und in `.env` eintragen:
   - **Public** → `STORYBLOK_DELIVERY_TOKEN`: für die Live-Seite, liefert nur veröffentlichte Inhalte
   - **Preview** → `STORYBLOK_PREVIEW_TOKEN`: für die Vorschau, liefert auch Entwürfe

### Inhalte pflegen

| Story | Inhalt |
|---|---|
| `config` (Einstellungen) | Seitenname, Narrenruf, Logo, Hauptnavigation, Footer-Links, Adresse, E-Mail |
| `home` | Startseite (Hero, Teaser) |
| `fasnet-2026-27` | Termintabelle: Block *Termintabelle* → *Termine* |
| übrige Seiten | Geschichte, Zunftrat, Mitglied werden, Kontakt, Links, Impressum, Datenschutz |

**Termin-Felder:** Datum, Uhrzeit (Freitext), Veranstaltung, Ort, Beschreibung, *Link (optional)*, *Download (optional)* und Button-Beschriftung. Ist ein Download hinterlegt, hat er Vorrang vor dem Link. Für die nächste Saison legt ihr einfach eine neue Seite an, z. B. `fasnet-2027-28`, und passt den Menüpunkt in `config` an.

Neue Seiten bekommen den Inhaltstyp **Seite**. Ihre URL ergibt sich aus dem Slug.

### Seiten ins Menü aufnehmen oder herausnehmen

Alles ohne Code-Änderung, in Storyblok:

| Ich möchte … | So geht's |
|---|---|
| eine neue Seite ins Menü aufnehmen | Seite anlegen (Inhaltstyp *Seite*) und veröffentlichen. In **Einstellungen** (`config`) unter *Hauptnavigation* einen *Navigationspunkt* hinzufügen. Beim Link **Internal** wählen und die Seite aussuchen. Veröffentlichen. |
| einen Menüpunkt vorübergehend verstecken | Im Navigationspunkt **„Im Menü ausblenden“** aktivieren und *Einstellungen* veröffentlichen. Die Seite selbst bleibt erreichbar. |
| eine Seite komplett offline nehmen | Bei der Seite **Unpublish** wählen. Sie verschwindet von der Website **und automatisch aus dem Menü**, der Menüpunkt muss nicht gelöscht werden. Nach erneutem Veröffentlichen ist beides wieder da. |
| die Reihenfolge ändern | In *Einstellungen → Hauptnavigation* die Punkte per Drag & Drop verschieben. |
| eine Seite umbenennen (Slug ändern) | Einfach umbenennen und veröffentlichen. Interne Links in Menü, Buttons und Teasern passen sich automatisch an. |

Die Live-Seite baut nach jeder Veröffentlichung automatisch neu (Webhook), Änderungen sind nach etwa einer Minute sichtbar.

## 2. Netlify einrichten

1. Das Repository zu GitHub oder GitLab pushen und in Netlify unter *Add new site → Import an existing project* verbinden. Build-Einstellungen kommen aus `netlify.toml`.
2. Unter *Site configuration → Environment variables* setzen:
   - `STORYBLOK_DELIVERY_TOKEN` = **Public**-Token
   - `STORYBLOK_PREVIEW_TOKEN` = **Preview**-Token (wird nur im Preview-Deploy genutzt)
   - `SITE_URL` = `https://nz-wasenmoosgeister-hoell.de`
3. **Automatisch neu bauen bei Veröffentlichung:**
   - Netlify: *Site configuration → Build & deploy → Build hooks* → Hook „Storyblok publish“ (Branch `main`) anlegen und die URL kopieren.
   - Storyblok: *Settings → Webhooks* → neuer Webhook mit dieser URL, Trigger *Story published* und *Story unpublished*. Bei Downloads/Bildern zusätzlich *Asset replaced*.
4. Domain unter *Domain management* verbinden. Netlify stellt das HTTPS-Zertifikat automatisch aus. Damit ist auch das alte Problem mit dem selbstsignierten Zertifikat gelöst.

## 3. Visual Editor / Live-Preview

Im Preview-Modus (`STORYBLOK_PREVIEW=true`) werden Seiten on demand gerendert, zeigen Entwürfe und aktualisieren sich live beim Tippen. Die Story `config` (Einstellungen) ist dort ebenfalls als Seite erreichbar, Änderungen an Navigation und Footer sieht man sofort.

### Lokal

1. `STORYBLOK_PREVIEW_TOKEN` in `.env` eintragen (Storyblok → *Settings → Access Tokens*, Zugriff „Preview“).
2. `npm run dev:preview` starten (setzt Preview-Modus und HTTPS).
3. Einmalig **https://localhost:4321/** im Browser öffnen und die Zertifikatswarnung akzeptieren (selbstsigniertes Zertifikat). Ohne diesen Schritt bleibt der Visual Editor leer.
4. In Storyblok eine Story öffnen. Die Vorschau-URL ist auf `https://localhost:4321/` gestellt, und `home` hat den Real Path `/`.

Beenden: `npx astro dev stop`.

### Auf Netlify (für alle Redakteure)

Die Vorschau läuft als eigener **Branch-Deploy** vom Branch `preview`, dort ist `STORYBLOK_PREVIEW=true` gesetzt (siehe `netlify.toml`).

1. Netlify: *Site configuration → Build & deploy → Branches and deploy contexts* → Branch deploys für `preview` aktivieren.
2. Code-Änderungen auf den Preview-Branch bringen (Inhaltsänderungen brauchen keinen neuen Deploy):
   ```bash
   git checkout preview && git merge main && git push && git checkout main
   ```
3. Storyblok: *Settings → Visual Editor* → zusätzliche Preview-URL `https://preview--<site-name>.netlify.app/` anlegen und als Standard setzen. Die lokale URL kann als zweite Umgebung bleiben.

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
