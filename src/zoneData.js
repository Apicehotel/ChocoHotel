// Elenco ufficiale numeri camera + zone comuni con varianti WhatsApp.
// STESSA fonte dati usata dalla Edge Function whatsapp-webhook (supabase/functions/whatsapp-webhook/index.ts).
// Duplicato volutamente qui (frontend, runtime Vite/React) invece di condiviso via import cross-progetto,
// perche' la edge function gira su Deno lato server e non puo' importare file da src/.
// Se aggiorni le camere/zone, aggiorna ENTRAMBE le copie (qui e nella edge function).

const JAZZ_P1 = [
  1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1114,
  1115, 1116, 1118, 1119, 1120, 1121,
];
const JAZZ_P2 = [
  2201, 2202, 2203, 2204, 2205, 2206, 2207, 2208, 2209, 2210, 2211, 2212, 2214,
  2215, 2216, 2218, 2219, 2220, 2221,
];
const JAZZ_P3 = [
  3301, 3302, 3303, 3304, 3305, 3306, 3307, 3308, 3309, 3310, 3311, 3312, 3314,
  3315, 3316, 3318, 3319, 3320, 3321,
];
const JAZZ_P4 = [
  4401, 4402, 4403, 4404, 4405, 4406, 4407, 4408, 4409, 4410, 4411, 4412, 4414,
  4415, 4416, 4418, 4419, 4420, 4421,
];
const WINE_P1 = [
  101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
  116, 117, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131,
];
const WINE_P2 = [
  201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 216,
  217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231,
  232, 233,
];
const WINE_P3 = [
  301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315,
  317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331,
  332,
];
const WINE_P4 = [
  401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415,
  417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431,
  432, 433, 434,
];

// Piani selezionabili per gli interventi con checklist camere (es. pulizia filtri)
export const PIANI = [
  { id: "jazz_p1", label: "Jazz 1\u00b0 piano", rooms: JAZZ_P1 },
  { id: "jazz_p2", label: "Jazz 2\u00b0 piano", rooms: JAZZ_P2 },
  { id: "jazz_p3", label: "Jazz 3\u00b0 piano", rooms: JAZZ_P3 },
  { id: "jazz_p4", label: "Jazz 4\u00b0 piano", rooms: JAZZ_P4 },
  { id: "wine_p1", label: "Wine 1\u00b0 piano", rooms: WINE_P1 },
  { id: "wine_p2", label: "Wine 2\u00b0 piano", rooms: WINE_P2 },
  { id: "wine_p3", label: "Wine 3\u00b0 piano", rooms: WINE_P3 },
  { id: "wine_p4", label: "Wine 4\u00b0 piano", rooms: WINE_P4 },
].map((p) => ({ ...p, rooms: p.rooms.map(String) }));

export const ROOM_NUMBERS = new Set(
  [
    ...JAZZ_P1,
    ...JAZZ_P2,
    ...JAZZ_P3,
    ...JAZZ_P4,
    ...WINE_P1,
    ...WINE_P2,
    ...WINE_P3,
    ...WINE_P4,
  ].map(String),
);

export const ZONES = {
  "Giardino Jazz": ["giardino jazz", "giardino j", "verde jazz"],
  "Hall Jazz": ["hall jazz", "ingresso jazz", "reception jazz", "hall j"],
  "Ufficio Alberto": ["ufficio alberto", "stanza alberto", "alberto"],
  "Ufficio Paolo": ["ufficio paolo", "stanza paolo", "paolo"],
  Reception: ["recepion", "accoglienza"],
  "Back Office Reception": [
    "dietro la reception",
    "dietro accoglienza",
    "backoffice",
    "back office",
  ],
  "Bagni Hall Donne": [
    "bagno hall donne",
    "bagni donne hall",
    "toilette hall donne",
  ],
  "Bagni Hall Uomini": [
    "bagno hall uomini",
    "bagni uomini hall",
    "toilette hall uomini",
  ],
  Piano: ["piano", "sala piano", "pianoforte"],
  Drums: ["drums", "batteria", "sala batteria"],
  Guitar: ["guitar", "chitarra", "sala chitarra"],
  "Office 1 Jazz": ["primo jazz", "1 jazz", "1jazz", "ufficio primo jazz"],
  "Corridoio 1 Jazz": [],
  "Terrazza 1 Jazz": ["terrazza primo", "terrazzo 1", "dehors"],
  "Office 2 Jazz": ["secondo jazz", "2 jazz", "2jazz", "ufficio secondo jazz"],
  "Corridoio 2 Jazz": [],
  "Office 3 Jazz": ["terzo jazz", "3 jazz", "3jazz", "ufficio terzo jazz"],
  "Corridoio 3 Jazz": [],
  "Office 4 Jazz": ["quarto jazz", "4 jazz", "4jazz", "ufficio quarto jazz"],
  "Corridoio 4 Jazz": [
    "corridoio 4 jazz",
    "4 paino jazz",
    "4piano jazz",
    "piano4 jazz",
  ],
  "Terrazza 4 Jazz": ["terrazza quarto", "terrazzo quarto", "dehors quarto"],
  Piscina: ["pool", "5 piano", "quinto piano", "5piano"],
  "-1 Jazz": ["meno 1 jazz", "meno uno jazz", "-1 jazz", "piano meno 1 jazz"],
  "Parcheggio -1 Jazz": [
    "parcheggio meno 1 jazz",
    "parcheggio -1",
    "garage meno 1 jazz",
  ],
  "Corridoio -1": [],
  "Bagni - 1 Jazz Donne": ["bagno meno 1 jazz donne", "bagni -1 donne jazz"],
  "Bagni - 1 Jazz Uomini": ["bagno meno 1 jazz uomini", "bagni -1 uomini jazz"],
  Cool: ["cool", "sala cool"],
  "Bagni Cool Donne": ["bagno cool donne", "bagni donne cool"],
  "Bagni Cool Uomini": ["bagno cool uomini", "bagni uomini cool"],
  Preservation: ["preservation", "sala preservation"],
  "Sala Colazioni": [
    "colazioni",
    "sala colazione",
    "breakfast",
    "sala breakfast",
  ],
  "Breakfast 1": ["breakfast 1", "colazione 1", "sala breakfast 1"],
  "Breakfast 2": ["breakfast 2", "colazione 2", "sala breakfast 2"],
  "-2 Jazz": ["meno 2 jazz", "meno due jazz", "-2 jazz", "piano meno 2 jazz"],
  "Parcheggio -2 Jazz": [
    "parcheggio meno 2 jazz",
    "parcheggio -2",
    "garage meno 2 jazz",
  ],
  "Corridoio -2": [],
  "Bagni -2 Jazz Donne": ["bagno meno 2 jazz donne", "bagni -2 donne jazz"],
  "Bagni -2 Jazz Uomini": ["bagno meno 2 jazz uomini", "bagni -2 uomini jazz"],
  "Magazzino Elettronico": ["magazzino elettronico", "deposito elettronico"],
  "Magazzino Idrailico": ["magazzino idraulico", "deposito idraulico"],
  "Magazzino Tavoli": ["magazzino tavoli", "deposito tavoli"],
  Sax: ["sax", "sassofono", "sala sax"],
  Trumpet: ["trumpet", "tromba", "sala tromba"],
  Auditorium: ["auditorium", "sala auditorium"],
  "Auditorium Bagni Donne": [
    "bagno auditorium donne",
    "bagni donne auditorium",
  ],
  "Auditorium Bagni Uomini": [
    "bagno auditorium uomini",
    "bagni uomini auditorium",
  ],
  "Parcheggio -3 Jazz": ["garage", "-3"],
  "Giardino Wine": ["giardino", "verde", "aiuole", "esterno"],
  "Hall Wine": ["hall wine", "ingresso wine", "reception wine", "hall w"],
  "Scale Auditorium": ["scale auditorium", "scala auditorium"],
  "Office Wine": [
    "office wine",
    "ufficio wine",
    "back office wine",
    "office hall wine",
  ],
  "Lavanderia Wine": ["lavanderia", "stireria", "laundry"],
  "Risto Wine": ["risto wine", "ristorante wine", "sala ristorante wine"],
  "Sala Cravatte": ["sala cravatte", "cravatte"],
  "Sala Fontivegge": ["sala fontivegge", "fontivegge"],
  "Sala Vinarelli": ["sala vinarelli", "vinarelli"],
  "Sala Etichette": ["sala etichette", "etichette"],
  "Office 1 Wine": ["primo wine", "1 wine", "1wine", "ufficio primo wine"],
  "Corridoio 1 Wine": [],
  "Office 2 Wine": ["secondo wine", "2 wine", "2wine", "ufficio secondo wine"],
  "Corridoio 2 Wine": [],
  "Office 3 Wine": ["terzo wine", "3 wine", "3wine", "ufficio terzo wine"],
  "Corridoio 3 Wine": [],
  "Office 4 Wine": ["quarto wine", "4 wine", "4wine", "ufficio quarto wine"],
  "Corridoio 4 Wine": [],
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
