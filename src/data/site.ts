/* ============================================================
   KOFFIEBAR MARCUS — single source of truth
   Swap the wordmark / name / details here and the whole site
   updates. Demo content is plausible and made to be corrected.
   ============================================================ */

export const SITE = {
  name: "Koffiebar Marcus",
  wordmark: "MARCUS",
  legal: "Koffie & Teabar Marcus",
  tagline: "Alles huisgemaakt, aan het Bellamypark",
  intro:
    "Een warme koffie- en theebar in het hart van Vlissingen, met een Marokkaanse ziel en een keuken waar alles met de hand wordt gemaakt.",

  address: {
    street: "Bellamypark 52",
    zip: "4381 CG",
    city: "Vlissingen",
    maps: "https://maps.google.com/?q=Koffiebar+Marcus+Bellamypark+52+Vlissingen",
  },
  contact: {
    phone: "0118 - 250 460",
    phoneHref: "tel:+31118250460",
    email: "hallo@koffiebarmarcus.nl",
    emailHref: "mailto:hallo@koffiebarmarcus.nl",
  },
  socials: {
    instagram: "https://www.instagram.com/koffiebar_marcus/",
    instagramHandle: "@koffiebar_marcus",
    facebook: "https://www.facebook.com/koffiebarmarcus",
  },

  // Display hours (demo)
  hours: [
    { day: "Maandag", time: "Gesloten", closed: true },
    { day: "Dinsdag", time: "08:30 – 17:30" },
    { day: "Woensdag", time: "08:30 – 17:30" },
    { day: "Donderdag", time: "08:30 – 17:30" },
    { day: "Vrijdag", time: "08:30 – 18:00" },
    { day: "Zaterdag", time: "08:30 – 18:00" },
    { day: "Zondag", time: "09:30 – 17:00" },
  ],

  nav: [
    { label: "Menu", href: "/menu" },
    { label: "Sfeer", href: "/sfeer" },
    { label: "High Tea", href: "/high-tea" },
    { label: "Reserveren", href: "/reserveren" },
  ],
} as const;

/* ---------- The scroll-film: 5 staged scenes ---------- */
export interface Scene {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  line: string;
  image: string;
}

export const SCENES: Scene[] = [
  {
    id: "welkom",
    index: "01",
    eyebrow: "Bellamypark · Vlissingen",
    title: "Welkom bij Marcus",
    line: "Duw de deur open en de geur van versgemalen koffie en muntthee komt je tegemoet.",
    image: "/img/scene-1.webp",
  },
  {
    id: "homemade",
    index: "02",
    eyebrow: "Alles #homemade",
    title: "Met de hand gemaakt",
    line: "Van de espresso tot de taart uit eigen oven. Elke ochtend opnieuw, alles zelf.",
    image: "/img/scene-2.webp",
  },
  {
    id: "koffie-thee",
    index: "03",
    eyebrow: "Koffie & thee",
    title: "De kunst in een glas",
    line: "Laagjes, latte-art en losse thee uit de pot, geserveerd zoals het hoort.",
    image: "/img/scene-3.webp",
  },
  {
    id: "keuken",
    index: "04",
    eyebrow: "De keuken",
    title: "Marokkaanse ziel op tafel",
    line: "Mezze, warme platte broodjes en zoet, op smaak gebracht met kruiden van het zuiden.",
    image: "/img/scene-4.webp",
  },
  {
    id: "kom-langs",
    index: "05",
    eyebrow: "Tot zo",
    title: "Schuif aan",
    line: "Pak een plek aan het raam. De koffie staat klaar, de oven is warm.",
    image: "/img/scene-5.webp",
  },
];

/* ---------- Signature drinks ---------- */
export interface Signature {
  name: string;
  note: string;
  price: string;
}
export const SIGNATURES: Signature[] = [
  { name: "Rasputin", note: "Signature koffie, mysterieus, zoet en spicy", price: "4,50" },
  { name: "Spicy mango thee", note: "Verrassend, friszoet met een kick", price: "3,90" },
  { name: "House-blend thee", note: "Onze eigen melange, een absolute aanrader", price: "3,60" },
  { name: "Chai masala", note: "Kruidig en warm, met gestoomde melk", price: "4,20" },
];

/* ---------- Menu ---------- */
export interface MenuItem {
  name: string;
  desc?: string;
  price: string;
  tag?: string;
}
export interface MenuCategory {
  id: string;
  title: string;
  blurb: string;
  items: MenuItem[];
}

export const MENU: MenuCategory[] = [
  {
    id: "koffie",
    title: "Koffie",
    blurb: "Eigen branding, ook met havermelk.",
    items: [
      { name: "Espresso", price: "3,00" },
      { name: "Cappuccino", price: "3,60" },
      { name: "Havercappuccino", desc: "met havermelk", price: "3,90" },
      { name: "Flat white", price: "4,10" },
      { name: "Rasputin", desc: "mysterieus, zoet en spicy", price: "4,50", tag: "huis" },
      { name: "Spanish latte", desc: "gecondenseerde melk", price: "4,60" },
    ],
  },
  {
    id: "thee",
    title: "Thee",
    blurb: "Eigen house-blends, verse thee en chai.",
    items: [
      { name: "House-blend thee", desc: "onze eigen melange, per pot", price: "3,60", tag: "huis" },
      { name: "Spicy mango thee", desc: "friszoet met een kick", price: "3,90", tag: "huis" },
      { name: "Marokkaanse muntthee", desc: "verse munt, honing", price: "3,90" },
      { name: "Chai masala", desc: "kruidige melkthee", price: "4,20" },
      { name: "Chai latte golden milk", desc: "kurkuma en kruiden", price: "4,40" },
    ],
  },
  {
    id: "zoet",
    title: "Zoet & taart",
    blurb: "Alles uit eigen oven, elke dag vers.",
    items: [
      { name: "Taart van de dag", desc: "o.a. cinnamon swirl of amandel-framboos", price: "4,75", tag: "huis" },
      { name: "Worteltaart", price: "4,50", tag: "huis" },
      { name: "Cinnamon swirl", price: "3,75", tag: "huis" },
      { name: "Baklava-cheesecake", desc: "honing, pistache", price: "5,25" },
      { name: "Huisgemaakte koekjes (3)", price: "3,25" },
    ],
  },
  {
    id: "lunch",
    title: "Ontbijt & lunch",
    blurb: "Hartig en vers, met onze zelfgemaakte hummus.",
    items: [
      { name: "Ontbijtbord", desc: "met helemaal zelfgemaakte hummus", price: "11,50", tag: "huis" },
      { name: "Shakshuka", desc: "eieren, tomaat, brood", price: "11,00" },
      { name: "Truffeltosti", desc: "drie kazen", price: "8,50" },
      { name: "Avocado & ei", desc: "zuurdesem, dukkah", price: "9,75" },
      { name: "Mezze-plank", desc: "om te delen", price: "13,50", tag: "deel" },
    ],
  },
];

/* ---------- High tea ---------- */
export const HIGHTEA = {
  price: "29,50",
  per: "per persoon",
  blurb:
    "Drie etages huisgemaakt zoet en hartig, met onbeperkt losse thee en muntthee. Reserveer minimaal een dag vooruit.",
  tiers: [
    { name: "Hartig", items: ["Mini msemen-broodjes", "Mezze-hapjes", "Quiche van de dag"] },
    { name: "Zoet", items: ["Baklava-cheesecake", "Macarons", "Taart van de dag"] },
    { name: "Erbij", items: ["Onbeperkt thee", "Verse muntthee", "Glaasje bubbels (+ 4,50)"] },
  ],
};

/* ---------- Reviews (demo) ---------- */
export interface Review {
  quote: string;
  name: string;
  meta: string;
}
export const REVIEWS: Review[] = [
  {
    quote:
      "De taartjes van de dag waren zalig en de havercappuccino was ook een banger. De inrichting is bijzonder, die oude draagmuur brengt sfeer.",
    name: "Nienke van Soeren",
    meta: "Local Guide · Google",
  },
  {
    quote:
      "Een tentje dat aanvoelt als een warme deken. De sfeer is ontspannen, het eten is goed en de spicy mango thee is echt verrassend.",
    name: "Roshni Mahabier",
    meta: "Local Guide · Google",
  },
  {
    quote:
      "Het ontbijt is perfect, vooral de helemaal zelfgemaakte hummus. De service is super vriendelijk en er zijn ontzettend veel lekkere koffies.",
    name: "Sophie Walraven",
    meta: "Google",
  },
  {
    quote:
      "Een gezellige plek met vriendelijk personeel. Veel keuze, en vooral het assortiment house-blend thee is een absolute aanrader.",
    name: "Erwin Vogel",
    meta: "Local Guide · Google",
  },
  {
    quote:
      "Zeer lekker eten en heel vriendelijk personeel. Doe je een dagje Vlissingen, dan is dit als tussenstop echt de moeite waard.",
    name: "Senna Decoo",
    meta: "Google",
  },
  {
    quote:
      "De Rasputin-koffie, mysterieus, zoet en spicy, vind ik fantastisch. En de high tea was heerlijk, met leuke uitleg over de soorten thee.",
    name: "Diana Zonnevijlle",
    meta: "Local Guide · Google",
  },
];

/* ---------- Owner / story ---------- */
export const STORY = {
  eyebrow: "Eén eigenaar, één visie",
  title: "Geboren uit gastvrijheid",
  body: [
    "Marcus begon met één espressomachine, een oven en een simpele belofte: alles zelf maken, niets half doen.",
    "Die belofte proef je nog in elk kopje en op elk bordje. Marokkaanse gastvrijheid, Zeeuwse nuchterheid en koffie waar tijd in zit.",
  ],
  signature: "De eigenaar",
  image: "/img/owner-craft.webp",
};

/* ---------- Instagram feed (demo squares) ---------- */
export const FEED: string[] = [
  "/img/feed-1.webp",
  "/img/feed-2.webp",
  "/img/feed-3.webp",
  "/img/feed-4.webp",
];

export const AGENCY = {
  name: "Agensea",
  url: "https://agensea.nl",
  note: "Demo door Agensea",
};
