/* ============================================================
   KOFFIEBAR MARCUS — reserveringen datalaag (client-side)
   localStorage als demo-backend. In de live site swapt dit naar
   een echte database / mailkoppeling; de rest van de UI blijft gelijk.
   ============================================================ */
import { SITE } from "../data/site";

export type ResType = "tafel" | "hightea";
export type ResStatus = "nieuw" | "bevestigd" | "geannuleerd";

export interface Reservering {
  id: string;
  ref: string;
  type: ResType;
  personen: number;
  datum: string; // YYYY-MM-DD
  tijd: string; // HH:MM
  naam: string;
  telefoon: string;
  email: string;
  opmerking: string;
  status: ResStatus;
  aangemaakt: string; // ISO
}

const KEY = "marcus_reserveringen_v1";
export const SLOT_CAP = 24; // max gasten per tijdslot (tafel)
export const HIGHTEA_CAP = 12; // max gasten per tijdslot (high tea)

export function laad(): Reservering[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Reservering[]) : [];
  } catch {
    return [];
  }
}
function bewaar(list: Reservering[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function maakRef(): string {
  const t = Date.now().toString(36).slice(-4);
  const r = Math.random().toString(36).slice(2, 4);
  return ("MAR-" + t + r).toUpperCase();
}

export function voegToe(
  data: Omit<Reservering, "id" | "ref" | "status" | "aangemaakt">
): Reservering {
  const list = laad();
  const res: Reservering = {
    ...data,
    id: (crypto as any).randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
    ref: maakRef(),
    status: "nieuw",
    aangemaakt: new Date().toISOString(),
  };
  list.push(res);
  bewaar(list);
  return res;
}

export function zetStatus(id: string, status: ResStatus) {
  const list = laad();
  const r = list.find((x) => x.id === id);
  if (r) {
    r.status = status;
    bewaar(list);
  }
}
export function verwijder(id: string) {
  bewaar(laad().filter((x) => x.id !== id));
}

/* ---------- Openingstijden -> beschikbaarheid ---------- */
// SITE.hours volgorde: Maandag..Zondag. getDay(): 0=zo..6=za.
function hoursVoor(datum: string) {
  const d = new Date(datum + "T12:00:00");
  const idx = (d.getDay() + 6) % 7; // ma=0 .. zo=6
  return SITE.hours[idx];
}

export function isOpen(datum: string): boolean {
  const h = hoursVoor(datum);
  return !!h && !("closed" in h && h.closed);
}

function parseWindow(datum: string): { open: number; dicht: number } | null {
  const h = hoursVoor(datum);
  if (!h || ("closed" in h && h.closed)) return null;
  const m = h.time.match(/(\d{1,2}):(\d{2}).*?(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return { open: +m[1] * 60 + +m[2], dicht: +m[3] * 60 + +m[4] };
}

const pad = (n: number) => String(n).padStart(2, "0");
const toHHMM = (mins: number) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

/** Gasten al geboekt op een datum+tijd (exclusief geannuleerd). */
export function bezetting(datum: string, tijd: string, list?: Reservering[]): number {
  const all = list ?? laad();
  return all
    .filter((r) => r.datum === datum && r.tijd === tijd && r.status !== "geannuleerd")
    .reduce((s, r) => s + r.personen, 0);
}

/** Beschikbare tijdslots voor een datum, met resterende capaciteit. */
export function slotsVoor(
  datum: string,
  type: ResType,
  personen: number
): { tijd: string; vrij: number; vol: boolean }[] {
  const win = parseWindow(datum);
  if (!win) return [];
  const cap = type === "hightea" ? HIGHTEA_CAP : SLOT_CAP;
  const buffer = type === "hightea" ? 120 : 60; // laatste zitting voor sluiting
  const list = laad();
  const slots: { tijd: string; vrij: number; vol: boolean }[] = [];

  // vandaag: alleen slots minimaal 60 min in de toekomst
  const now = new Date();
  const isToday = datum === toISODate(now);
  const nowMins = now.getHours() * 60 + now.getMinutes() + 60;

  for (let t = win.open; t <= win.dicht - buffer; t += 30) {
    if (isToday && t < nowMins) continue;
    const tijd = toHHMM(t);
    const vrij = Math.max(0, cap - bezetting(datum, tijd, list));
    slots.push({ tijd, vrij, vol: vrij < personen });
  }
  return slots;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Eerstvolgende open datum vanaf vandaag (max 14 dagen vooruit). */
export function eersteOpenDatum(): string {
  const d = new Date();
  for (let i = 0; i < 14; i++) {
    const iso = toISODate(d);
    if (isOpen(iso) && slotsVoor(iso, "tafel", 1).length > 0) return iso;
    d.setDate(d.getDate() + 1);
  }
  return toISODate(new Date());
}

export function formatNL(datum: string): string {
  try {
    return new Intl.DateTimeFormat("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(datum + "T12:00:00"));
  } catch {
    return datum;
  }
}
