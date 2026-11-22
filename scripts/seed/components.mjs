// Storyblok-Komponenten (Block-Schemas) für die Management API.
// Feldtypen: https://www.storyblok.com/docs/api/management/components

let pos = 0;
const f = (type, display_name, extra = {}) => ({ type, display_name, pos: pos++, ...extra });
const text = (name, extra) => f("text", name, extra);
const textarea = (name, extra) => f("textarea", name, extra);
const image = (name = "Bild") => f("asset", name, { filetypes: ["images"] });
const link = (name = "Link", extra = {}) =>
  f("multilink", name, { email_link_type: true, asset_link_type: true, allow_target_blank: true, ...extra });
const bloks = (name, whitelist, extra = {}) =>
  f("bloks", name, { restrict_components: true, component_whitelist: whitelist, ...extra });

const nestable = (name, display_name, schema, extra = {}) => ({
  name,
  display_name,
  is_root: false,
  is_nestable: true,
  schema: ((pos = 0), schema()),
  ...extra,
});
const root = (name, display_name, schema, extra = {}) => ({
  name,
  display_name,
  is_root: true,
  is_nestable: false,
  schema: ((pos = 0), schema()),
  ...extra,
});

const PAGE_BLOCKS = [
  "hero",
  "page_header",
  "rich_text",
  "image_text",
  "quote",
  "teaser_grid",
  "person_grid",
  "contact_card",
  "link_group",
  "event_table",
];

export const components = [
  root("page", "Seite", () => ({
    body: bloks("Inhalt", PAGE_BLOCKS),
    seo_title: text("SEO-Titel", { description: "Leer = Seitenname" }),
    seo_description: textarea("SEO-Beschreibung", { max_length: 160 }),
  })),

  root("config", "Einstellungen", () => ({
    site_name: text("Name der Website", { required: true }),
    site_claim: text("Claim / Narrenruf"),
    logo: image("Logo"),
    nav: bloks("Hauptnavigation", ["nav_item"]),
    footer_nav: bloks("Footer-Links (Rechtliches)", ["nav_item"]),
    address: textarea("Adresse (Footer)"),
    email: text("E-Mail"),
  })),

  nestable("nav_item", "Navigationspunkt", () => ({
    label: text("Bezeichnung", { required: true }),
    link: link("Link", {
      description: "Für eigene Seiten „Internal“ wählen – dann bleibt der Link auch nach einer Umbenennung gültig.",
    }),
    hidden: f("boolean", "Im Menü ausblenden", {
      description: "Menüpunkt vorübergehend ausblenden, ohne ihn zu löschen. Unveröffentlichte Seiten werden automatisch ausgeblendet.",
    }),
  }), { preview_field: "label" }),

  nestable("hero", "Hero (Startbild)", () => ({
    eyebrow: text("Überzeile"),
    headline: text("Überschrift", { required: true }),
    quote: text("Zitat / Narrenruf"),
    image: image("Hintergrundbild"),
    buttons: bloks("Buttons", ["button"], { maximum: 3 }),
  })),

  nestable("page_header", "Seitenkopf", () => ({
    title: text("Titel", { required: true }),
    intro: textarea("Einleitung"),
  }), { preview_field: "title" }),

  nestable("button", "Button", () => ({
    label: text("Beschriftung", { required: true }),
    link: link(),
    variant: f("option", "Stil", {
      default_value: "primary",
      options: [
        { name: "Grün (Standard)", value: "primary" },
        { name: "Ocker (Akzent)", value: "accent" },
        { name: "Hell (Sekundär)", value: "secondary" },
      ],
    }),
  }), { preview_field: "label" }),

  nestable("teaser_grid", "Teaser-Raster", () => ({
    title: text("Überschrift"),
    items: bloks("Teaser", ["teaser"]),
  })),

  nestable("teaser", "Teaser", () => ({
    title: text("Titel", { required: true }),
    text: textarea("Text"),
    image: image(),
    link: link(),
  }), { preview_field: "title" }),

  nestable("rich_text", "Text", () => ({
    text: f("richtext", "Text"),
  })),

  nestable("image_text", "Bild + Text", () => ({
    text: f("richtext", "Text"),
    image: image(),
    image_position: f("option", "Bildposition", {
      default_value: "right",
      options: [
        { name: "Rechts", value: "right" },
        { name: "Links", value: "left" },
      ],
    }),
  })),

  nestable("quote", "Zitat / Narrenruf", () => ({
    label: text("Überzeile"),
    text: text("Zitat", { required: true }),
  }), { preview_field: "text" }),

  nestable("person_grid", "Personen-Raster", () => ({
    title: text("Überschrift"),
    people: bloks("Personen", ["person"]),
  })),

  nestable("person", "Person", () => ({
    name: text("Name", { required: true }),
    role: text("Funktion"),
    email: text("E-Mail"),
    image: image("Foto"),
  }), { preview_field: "name" }),

  nestable("contact_card", "Kontaktkarte", () => ({
    title: text("Überschrift"),
    name: text("Name"),
    street: text("Straße"),
    zip_city: text("PLZ / Ort"),
    email: text("E-Mail"),
    phone: text("Telefon"),
    buttons: bloks("Buttons", ["button"], { maximum: 3 }),
  })),

  nestable("link_group", "Link-Gruppe", () => ({
    title: text("Überschrift"),
    links: bloks("Links", ["link_item"]),
  }), { preview_field: "title" }),

  nestable("link_item", "Link", () => ({
    label: text("Bezeichnung", { required: true }),
    description: text("Beschreibung"),
    link: link(),
  }), { preview_field: "label" }),

  nestable("event_table", "Termintabelle", () => ({
    title: text("Überschrift"),
    intro: textarea("Einleitung"),
    show_past: f("boolean", "Vergangene Termine anzeigen (ausgegraut)", { default_value: true }),
    events: bloks("Termine", ["event"], { description: "Werden automatisch nach Datum sortiert." }),
  })),

  nestable("event", "Termin", () => ({
    date: f("datetime", "Datum", { required: true, disable_time: true }),
    time_text: text("Uhrzeit", { description: "z. B. 19:11 Uhr" }),
    title: text("Veranstaltung", { required: true }),
    location: text("Ort"),
    description: textarea("Beschreibung"),
    link: link("Link (optional)"),
    file: f("asset", "Download (optional)", {
      filetypes: ["documents", "images"],
      description: "Hat Vorrang vor dem Link.",
    }),
    action_label: text("Button-Beschriftung", { description: "Standard: „Download“ bzw. „Mehr Infos“" }),
  }), { preview_field: "title" }),
];
