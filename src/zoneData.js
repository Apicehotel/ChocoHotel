// Elenco ufficiale numeri camera + zone comuni con varianti WhatsApp.
// STESSA fonte dati usata dalla Edge Function whatsapp-webhook quando verra'
// creata per Chocohotel (oggi il bot WhatsApp e' ancora escluso).
// Duplicare qui e nella edge function se questo file cambia.
//
// Camere: foglio Google "Camere Chocohotel" (P2 201-232, P3 301-332,
// P4 401-430 - struttura unica, non Wine/Jazz come Hotel Giò).
// Zone: foglio Google "Zone App Manutenzioni Chocohotel", 25 zone reali.

const P2 = [
  201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215,
  216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230,
  231, 232,
];
const P3 = [
  301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315,
  316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330,
  331, 332,
];
const P4 = [
  401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415,
  416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430,
];

// Piani selezionabili per gli interventi con checklist camere (es. pulizia filtri)
export const PIANI = [
  { id: "choco_p2", label: "2\u00b0 piano", rooms: P2 },
  { id: "choco_p3", label: "3\u00b0 piano", rooms: P3 },
  { id: "choco_p4", label: "4\u00b0 piano", rooms: P4 },
].map((p) => ({ ...p, rooms: p.rooms.map(String) }));

export const ROOM_NUMBERS = new Set([...P2, ...P3, ...P4].map(String));

export const ZONES = {
  "Parcheggio Hall": [],
  "Ingresso Hall": [],
  "Hall Chocohotel": ["hall"],
  "Bagni Uomini Hall": [],
  "Bagni Donne Hall": [],
  "Choco Store": [],
  "Sala Fondente 1": [],
  "Sala Fondente 2": [],
  "Sala Gianduia": [],
  Sala: [],
  "Sala Latte": [],
  "Locale Caldaie": [],
  "Giardino 1 piano": ["giardino", "pratone"],
  "Parcheggio 1 Piano": [],
  "Isola dei golosi": ["colazione", "sala colazione"],
  "Office 2 Chocohotel": [],
  "Corridoio 2 Chocohotel": [],
  "Office 3 Chocohotel": [],
  "Corridoio 3 Chocohotel": [],
  "Office 4 Chocohotel": [],
  "Corridoio 4 Chocohotel": [],
  Piscina: [],
  "Giardino Piscina": [],
  "Office Piscina": [],
  "-1 Chocohotel": [],
  "Garage -1 Chocohotel": [],
};

export const ZONE_NAMES = Object.keys(ZONES);

function normalizeText(s) {
  return s
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // rimuove accenti
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, " ") // rimuove punteggiatura (mantiene lettere/numeri/spazi/trattino)
    .replace(/\s+/g, " ")
    .trim();
}

const ZONE_LOOKUP = new Map();
for (const [canonical, variants] of Object.entries(ZONES)) {
  ZONE_LOOKUP.set(normalizeText(canonical), canonical);
  for (const v of variants) {
    ZONE_LOOKUP.set(normalizeText(v), canonical);
  }
}

// Valida/normalizza un valore camera scritto dall'utente.
// Ritorna { ok:true, value, kind:"room"|"zone" } se valido, altrimenti { ok:false }.
export function resolveCamera(raw) {
  if (raw == null) return { ok: false };
  const rawTrim = String(raw).trim();
  if (!rawTrim) return { ok: false };

  if (/^\d{1,4}$/.test(rawTrim) && ROOM_NUMBERS.has(rawTrim)) {
    return { ok: true, value: rawTrim, kind: "room" };
  }

  const canonical = ZONE_LOOKUP.get(normalizeText(rawTrim));
  if (canonical) return { ok: true, value: canonical, kind: "zone" };

  return { ok: false };
}
