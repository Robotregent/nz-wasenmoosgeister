// Startinhalte der Website im Storyblok-Story-Format.
// Wird von `npm run seed` in den Storyblok-Space importiert und dient bei
// STORYBLOK_OFFLINE=true als lokale Datenquelle (Build ohne CMS).

let uidCounter = 0;
const uid = () => `seed-${(++uidCounter).toString(36).padStart(6, "0")}`;

/** Erzeugt einen Block mit stabiler _uid. */
const block = (component, fields = {}) => ({ _uid: uid(), component, ...fields });

// ---------- Rich Text Helfer (Mini-Markup: **fett**, *kursiv*, [Text](url)) ----------

function inline(text) {
  const nodes = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push({ type: "text", text: text.slice(last, m.index) });
    if (m[2]) nodes.push({ type: "text", text: m[2], marks: [{ type: "bold" }] });
    else if (m[3]) nodes.push({ type: "text", text: m[3], marks: [{ type: "italic" }] });
    else {
      const href = m[5];
      const external = /^https?:/.test(href);
      nodes.push({
        type: "text",
        text: m[4],
        marks: [
          {
            type: "link",
            attrs: {
              href,
              linktype: href.startsWith("mailto:") ? "email" : "url",
              target: external ? "_blank" : "_self",
            },
          },
        ],
      });
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push({ type: "text", text: text.slice(last) });
  return nodes;
}

/** Absatz; "\n" wird zu einem Zeilenumbruch (hard_break). */
const p = (text) => ({
  type: "paragraph",
  content: text.split("\n").flatMap((line, i) => [...(i ? [{ type: "hard_break" }] : []), ...inline(line)]),
});
const h = (level, text) => ({ type: "heading", attrs: { level }, content: inline(text) });
const ul = (...items) => ({
  type: "bullet_list",
  content: items.map((t) => ({ type: "list_item", content: [p(t)] })),
});
const doc = (...content) => ({ type: "doc", content });

// ---------- Links ----------

const url = (href, target) => ({
  id: "",
  url: href,
  linktype: "url",
  fieldtype: "multilink",
  cached_url: href,
  ...(target ? { target } : {}),
});
const ext = (href) => url(href, "_blank");
const email = (address) => ({ id: "", email: address, linktype: "email", fieldtype: "multilink", url: "", cached_url: "" });

const emptyAsset = () => ({ id: null, alt: "", name: "", focus: "", title: "", filename: "", fieldtype: "asset" });
const localAsset = (filename, alt) => ({ ...emptyAsset(), filename, alt, title: alt });

const ZUNFT_NAME = "Narrenzunft Wasenmoosgeister Höll e.V.";
const MAIL = "info@nz-wasenmoosgeister-hoell.de";
const NARRENRUF = "Wasenmoos – de Goischt isch los";

// ---------- Globale Einstellungen ----------

export const config = {
  name: "Einstellungen",
  slug: "config",
  content: block("config", {
    site_name: "NZ Wasenmoosgeister Höll e.V.",
    site_claim: NARRENRUF,
    logo: emptyAsset(),
    nav: [
      block("nav_item", { label: "Startseite", link: url("/") }),
      block("nav_item", { label: "Fasnet 2026/27", link: url("/fasnet-2026-27") }),
      block("nav_item", { label: "Geschichte", link: url("/geschichte") }),
      block("nav_item", { label: "Zunftrat", link: url("/zunftrat") }),
      block("nav_item", { label: "Mitglied werden", link: url("/mitglied-werden") }),
      block("nav_item", { label: "Kontakt", link: url("/kontakt") }),
      block("nav_item", { label: "Links", link: url("/links") }),
    ],
    footer_nav: [
      block("nav_item", { label: "Impressum", link: url("/impressum") }),
      block("nav_item", { label: "Datenschutz", link: url("/datenschutz") }),
    ],
    address: `${ZUNFT_NAME}\nHöll 6\n88069 Tettnang`,
    email: MAIL,
  }),
};

// ---------- Seiten ----------

const page = (name, slug, seo_description, body) => ({
  name,
  slug,
  content: block("page", { seo_title: name === "Startseite" ? "" : name, seo_description, body }),
});

export const pages = [
  page("Startseite", "home", "Die Narrenzunft Wasenmoosgeister aus Tettnang-Höll – Fasnet, Brauchtum und Gemeinschaft seit 1993.", [
    block("hero", {
      eyebrow: "Herzlich Willkommen auf den Internetseiten der",
      headline: ZUNFT_NAME,
      quote: NARRENRUF,
      image: localAsset("/placeholders/hero.png", "Wasenmoosgeister im Nebel über dem Moor (Platzhalter)"),
      buttons: [
        block("button", { label: "Fasnet 2026/27", link: url("/fasnet-2026-27"), variant: "accent" }),
        block("button", { label: "Unsere Geschichte", link: url("/geschichte"), variant: "secondary" }),
      ],
    }),
    block("teaser_grid", {
      title: "Entdecke die Wasenmoosgeister",
      items: [
        block("teaser", {
          title: "Geschichte",
          text: "Wie aus der Sage der Torfstecher im Wasenmoos 1993 eine Fasnetfigur wurde.",
          link: url("/geschichte"),
          image: localAsset("/placeholders/moor.png", "Moorlandschaft (Platzhalter)"),
        }),
        block("teaser", {
          title: "Fasnet 2026/27",
          text: "Alle Termine der kommenden Fasnet – mit Infos und Downloads.",
          link: url("/fasnet-2026-27"),
          image: localAsset("/placeholders/fasnet.png", "Narren beim Umzug (Platzhalter)"),
        }),
        block("teaser", {
          title: "Mitglied werden",
          text: "Spaß an der Fasnet – mit der ganzen Familie. Wir freuen uns auf dich!",
          link: url("/mitglied-werden"),
          image: localAsset("/placeholders/haes.png", "Häs der Wasenmoosgeister (Platzhalter)"),
        }),
      ],
    }),
  ]),

  page("Fasnet 2026/27", "fasnet-2026-27", "Termine der Narrenzunft Wasenmoosgeister Höll für die Fasnet 2026/27.", [
    block("page_header", {
      title: "Fasnet 2026/27",
      intro: "Hier findest du alle Termine der Wasenmoosgeister für die kommende Fasnet. Änderungen vorbehalten – schau einfach regelmäßig vorbei!",
    }),
    block("event_table", {
      title: "Termine",
      intro: "",
      show_past: true,
      events: [
        block("event", { date: "2026-11-11 00:00", time_text: "19:11 Uhr", title: "Fasnetseröffnung (Beispiel)", location: "Höll", description: "", link: url(""), file: emptyAsset(), action_label: "" }),
        block("event", { date: "2027-01-06 00:00", time_text: "14:00 Uhr", title: "Häs abstauben (Beispiel)", location: "Dorfplatz Höll", description: "Traditioneller Auftakt in die heiße Phase.", link: url(""), file: emptyAsset(), action_label: "" }),
        block("event", { date: "2027-01-16 00:00", time_text: "13:30 Uhr", title: "Narrentreffen Tettnang (Beispiel)", location: "Tettnang", description: "", link: ext("https://www.narrenzunft-tettnang.de"), file: emptyAsset(), action_label: "Zum Veranstalter" }),
        block("event", { date: "2027-01-23 00:00", time_text: "20:00 Uhr", title: "Zunftball (Beispiel)", location: "Festhalle", description: "Mit Musik und Brauchtumsvorführungen.", link: url(""), file: localAsset("/downloads/programm-zunftball-beispiel.pdf", "Programm Zunftball (Beispiel)"), action_label: "Programm" }),
        block("event", { date: "2027-02-04 00:00", time_text: "06:00 Uhr", title: "Schmotziger Dunschtig – Narrenweckruf (Beispiel)", location: "Höll", description: "", link: url(""), file: emptyAsset(), action_label: "" }),
        block("event", { date: "2027-02-07 00:00", time_text: "14:00 Uhr", title: "Fasnetsumzug (Beispiel)", location: "Tettnang", description: "", link: ext("https://www.tettnang.de"), file: emptyAsset(), action_label: "Mehr Infos" }),
        block("event", { date: "2027-02-09 00:00", time_text: "19:00 Uhr", title: "Fasnetsverbrennung (Beispiel)", location: "Höll", description: "", link: url(""), file: emptyAsset(), action_label: "" }),
      ],
    }),
  ]),

  page("Geschichte", "geschichte", "Die Geschichte des Wasenmoosgeistes – von der Sage der Torfstecher zur Fasnetfigur.", [
    block("page_header", { title: "Geschichte", intro: "Die Geschichte des Wasenmoosgeistes" }),
    block("image_text", {
      image: localAsset("/placeholders/moor.png", "Nebel über dem Wasenmoos (Platzhalter)"),
      image_position: "right",
      text: doc(
        h(2, "Das Wasenmoos"),
        p("Am Dorfrand von Höll bei Tettnang liegt das Moor Wasenmoos. In diesem wurde in früheren Zeiten noch Torf gestochen. Wenn im Moor der Nebel aufstieg, sollen Geister ihren Schabernack mit den armen Torfstechern getrieben haben. Ob es dabei die eigenen Kameraden waren, die sich einen Scherz erlaubten, oder echte Geister – das blieb allerdings bis heute im Trüben …"),
      ),
    }),
    block("image_text", {
      image: localAsset("/placeholders/haes.png", "Häs des Wasenmoosgeistes (Platzhalter)"),
      image_position: "left",
      text: doc(
        h(2, "Vom Geist zur Fasnetfigur"),
        p("Im Herbst 1993 traf sich eine kleine Gruppe von Dorfbewohnern und entwarf aus dieser Geschichte den Wasenmoosgeist als Fasnetfigur. Dieser tauchte dann in der Fasnet 1994 zum ersten Mal auf."),
        p("Die Kopfbedeckung aus Schafwolle gefertigt, soll dabei an den Nebel, das Häs mit den Fellflecken und den Tannenzapfen an den Wald und das Moor erinnern."),
      ),
    }),
    block("quote", { label: "Der Narrenruf der Wasenmoosgeister lautet:", text: NARRENRUF }),
  ]),

  page("Zunftrat", "zunftrat", "Der Zunftrat der Narrenzunft Wasenmoosgeister Höll e.V.", [
    block("page_header", { title: "Zunftrat", intro: "Die Ansprechpartner unserer Zunft." }),
    block("person_grid", {
      title: "",
      people: [
        block("person", { name: "Christian Junker", role: "Zunftmeister / 1. Vorstand", email: "zunftmeister@nz-wasenmoosgeister-hoell.de", image: emptyAsset() }),
        block("person", { name: "Sabrina Junker", role: "Vize-Zunftmeisterin", email: "", image: emptyAsset() }),
        block("person", { name: "Paul Gesell", role: "Schriftführer", email: "schriftfuehrer@nz-wasenmoosgeister-hoell.de", image: emptyAsset() }),
        block("person", { name: "Conny Gesell", role: "Kassier", email: "", image: emptyAsset() }),
        block("person", { name: "Anni Junker", role: "Häswart", email: "", image: emptyAsset() }),
      ],
    }),
    block("rich_text", { text: doc(p(`Allgemeine Anfragen gerne an [${MAIL}](mailto:${MAIL}).`)) }),
  ]),

  page("Mitglied werden", "mitglied-werden", "Werde Wasenmoosgeist! Mitglied werden bei der Narrenzunft Wasenmoosgeister Höll e.V.", [
    block("page_header", { title: "Mitglied werden", intro: "Du hast Interesse, ein Wasenmoosgeist zu werden?" }),
    block("image_text", {
      image: localAsset("/placeholders/fasnet.png", "Wasenmoosgeister mit Familie bei der Fasnet (Platzhalter)"),
      image_position: "right",
      text: doc(
        p("Du hast Spaß an der Fasnet und willst auch übers Jahr etwas erleben, auch mit der ganzen Familie? Dann melde dich einfach bei uns."),
        p("Wir sind eine kleine Zunft, die gerne mit der ganzen Familie Spaß an der Fasnet hat."),
        h(3, "Was dich auch noch interessieren könnte"),
        ul(
          "Wir haben eine Jahreshauptversammlung.",
          "Bei Aktivitäten unterm Jahr (Teilnahme bei Hobbyturnieren, Zunftgrillfestle, Stammtische usw.) würden wir dich auch gerne sehen.",
        ),
        p(`Für weitere Fragen ruf einfach an oder melde dich unter [${MAIL}](mailto:${MAIL}).`),
        p("Auf Euer Kommen freuen sich die Wasenmoosgeister."),
      ),
    }),
    block("quote", { label: "", text: NARRENRUF }),
  ]),

  page("Kontakt", "kontakt", "Kontakt zur Narrenzunft Wasenmoosgeister Höll e.V. in Tettnang.", [
    block("page_header", { title: "Kontakt", intro: "" }),
    block("contact_card", {
      title: "Kontaktadresse",
      name: ZUNFT_NAME,
      street: "Höll 6",
      zip_city: "88069 Tettnang",
      email: MAIL,
      phone: "",
      buttons: [block("button", { label: "Mitglied werden", link: url("/mitglied-werden"), variant: "primary" })],
    }),
  ]),

  page("Links", "links", "Befreundete Narrenzünfte und Links rund um die Fasnet in Tettnang.", [
    block("page_header", { title: "Links", intro: "" }),
    block("link_group", {
      title: "Internetseiten Tettnanger Narrenzünfte",
      links: [
        block("link_item", { label: "NZ Kogenmale Obereisenbach", description: "www.kogenmale.de", link: ext("http://www.kogenmale.de") }),
        block("link_item", { label: "NZ Waldteufel Kau", description: "www.waldteufel.de", link: ext("http://www.waldteufel.de") }),
        block("link_item", { label: "NZ Bürgermoos", description: "www.nz-buergermoos.de", link: ext("http://www.nz-buergermoos.de") }),
        block("link_item", { label: "Feuerhexen Tettnang", description: "www.feuerhexen.de", link: ext("http://www.feuerhexen.de") }),
        block("link_item", { label: "Narrenzunft Tettnang", description: "www.narrenzunft-tettnang.de", link: ext("http://www.narrenzunft-tettnang.de") }),
      ],
    }),
    block("link_group", {
      title: "Befreundete Narrenzünfte",
      links: [
        block("link_item", { label: "Narrenzunft Brochenzell", description: "www.narrenzunft-brochenzell.de", link: ext("http://www.narrenzunft-brochenzell.de/") }),
        block("link_item", { label: "Gorilla Club Russenried e.V.", description: "www.gorillaclub.de", link: ext("http://www.gorillaclub.de") }),
        block("link_item", { label: "Narrenverein „Griesebigger“ Kreßbronn e.V.", description: "www.griesebigger.de", link: ext("http://www.griesebigger.de/") }),
        block("link_item", { label: "Breithutgilde Gosbach", description: "www.breithutgilde.de", link: ext("http://www.breithutgilde.de/") }),
      ],
    }),
    block("link_group", {
      title: "Sonstiges",
      links: [block("link_item", { label: "Stadt Tettnang", description: "www.tettnang.de", link: ext("http://www.tettnang.de") })],
    }),
  ]),

  page("Impressum", "impressum", "Impressum der Narrenzunft Wasenmoosgeister Tettnang-Höll e.V.", [
    block("page_header", { title: "Impressum", intro: "" }),
    block("rich_text", {
      text: doc(
        h(2, "Angaben gemäß § 5 DDG"),
        p("**Narrenzunft Wasenmoosgeister Tettnang-Höll e.V.**"),
        p("Höll 6\n88069 Tettnang"),
        h(3, "Kontakt"),
        p(`E-Mail: [${MAIL}](mailto:${MAIL})`),
        h(3, "Vertreten durch"),
        p("Zunftmeister Christian Junker\nstellv. Zunftmeisterin Sabrina Junker"),
        h(3, "Registereintrag"),
        p("Eingetragen im Vereinsregister\nRegistergericht: Amtsgericht Ulm\nRegisternummer: VR 630619"),
        h(3, "Information gemäß § 36 VSBG"),
        p("Gemäß § 36 VSBG (Verbraucherstreitbeilegungsgesetz – Gesetz über die alternative Streitbeilegung in Verbrauchersachen) erklärt der Betreiber dieser Website: Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."),
      ),
    }),
  ]),

  page("Datenschutz", "datenschutz", "Datenschutzerklärung der Narrenzunft Wasenmoosgeister Tettnang-Höll e.V.", [
    block("page_header", { title: "Datenschutz", intro: "" }),
    block("rich_text", {
      text: doc(
        h(2, "Datenschutzerklärung"),
        p("Verantwortliche Stelle im Sinne der Datenschutzgesetze, insbesondere der EU-Datenschutzgrundverordnung (DSGVO), ist:"),
        p(`**Narrenzunft Wasenmoosgeister Tettnang-Höll e.V.**\nHöll 6\n88069 Tettnang\nE-Mail: [${MAIL}](mailto:${MAIL})`),

        h(3, "Ihre Betroffenenrechte"),
        p("Unter den angegebenen Kontaktdaten können Sie jederzeit folgende Rechte ausüben:"),
        ul(
          "Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung (Art. 15 DSGVO),",
          "Berichtigung unrichtiger personenbezogener Daten (Art. 16 DSGVO),",
          "Löschung Ihrer bei uns gespeicherten Daten (Art. 17 DSGVO),",
          "Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund gesetzlicher Pflichten noch nicht löschen dürfen (Art. 18 DSGVO),",
          "Widerspruch gegen die Verarbeitung Ihrer Daten bei uns (Art. 21 DSGVO) und",
          "Datenübertragbarkeit, sofern Sie in die Datenverarbeitung eingewilligt haben oder einen Vertrag mit uns abgeschlossen haben (Art. 20 DSGVO).",
        ),
        p("Sofern Sie uns eine Einwilligung erteilt haben, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen."),
        p("Sie können sich jederzeit mit einer Beschwerde an eine Aufsichtsbehörde wenden, z. B. an die zuständige Aufsichtsbehörde des Bundeslands Ihres Wohnsitzes oder an die für uns als verantwortliche Stelle zuständige Behörde. Eine Liste der Aufsichtsbehörden (für den nichtöffentlichen Bereich) mit Anschrift finden Sie unter: [www.bfdi.bund.de](https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html)."),

        h(3, "Hosting"),
        p("Diese Website wird bei Netlify, Inc., 101 2nd Street, San Francisco, CA 94105, USA gehostet. Beim Aufruf der Website verarbeitet Netlify technisch notwendige Daten (z. B. IP-Adresse, Datum und Uhrzeit des Abrufs, aufgerufene Seite, Browser- und Betriebssysteminformationen) in Server-Logfiles, um die Website auszuliefern und deren Sicherheit zu gewährleisten."),
        p("Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und zuverlässigen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO). Netlify ist unter dem EU-US Data Privacy Framework zertifiziert; zudem haben wir mit Netlify einen Auftragsverarbeitungsvertrag inkl. EU-Standardvertragsklauseln geschlossen. Weitere Informationen: [Datenschutzerklärung von Netlify](https://www.netlify.com/privacy/)."),

        h(3, "Inhalte und Bilder (Storyblok)"),
        p("Die Inhalte dieser Website werden mit dem Content-Management-System Storyblok (Storyblok GmbH, Linz, Österreich) gepflegt. Bilder und Dateien werden über das Content Delivery Network von Storyblok ausgeliefert; dabei wird Ihre IP-Adresse an Storyblok übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Weitere Informationen: [Datenschutzerklärung von Storyblok](https://www.storyblok.com/legal/privacy-policy)."),

        h(3, "Cookies, Tracking und Schriftarten"),
        p("Diese Website setzt keine Cookies und verwendet keine Analyse- oder Tracking-Dienste. Die verwendeten Schriftarten sind lokal eingebunden; es findet keine Verbindung zu Servern Dritter (z. B. Google Fonts) statt."),

        h(3, "Externe Links"),
        p("Unsere Website enthält Links zu Websites Dritter. Erst wenn Sie einen solchen Link anklicken, werden Daten an den jeweiligen Anbieter übertragen. Für dessen Datenverarbeitung ist der jeweilige Anbieter verantwortlich."),

        h(3, "Kontakt per E-Mail"),
        p("Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung Ihrer Anfrage (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Die Daten werden gelöscht, sobald sie nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen."),
      ),
    }),
  ]),
];

export const allStories = [config, ...pages];
