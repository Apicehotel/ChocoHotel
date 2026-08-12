import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import { DB, supabase } from "./db.js";
import { PIANI as PIANI_ZONE, ROOM_NUMBERS } from "./zoneData.js";
import { Sheet, Field, ctaSt, inputSt } from "./ui.jsx";
import {
  cacheSnapshot,
  getCachedSnapshot,
  contaInAttesa,
  enqueueLavoro,
  enqueueModifica,
  avviaSyncAutomatico,
} from "./camereOffline.js";

// ── Ruoli che possono caricare il file Slope del giorno ─────────────────────
const RUOLI_CARICAMENTO = ["reception", "portiere_notturno", "sviluppatore"];
// Ruoli che vedono la sezione "Modifica" dentro il foglio di una camera
const RUOLI_MODIFICA = ["reception", "governante"];

const STRUTTURE = ["Wine", "Jazz"];
const PIANI_NUM = [1, 2, 3, 4];

const SLOPE_LABELS = {
  b2b: "PART. + ARR.",
  partenza: "PARTENZA",
  arrivo: "ARRIVO",
  fermata: "FERMATA",
  libera: "LIBERA",
};
const SLOPE_COLORS = {
  b2b: { bg: "#FDEAEA", fg: "#B23A2E" },
  partenza: { bg: "#FBF0DF", fg: "#A87F34" },
  arrivo: { bg: "#EAF2FF", fg: "#2563EB" },
  fermata: { bg: "#F5F3FF", fg: "#6D28D9" },
  libera: { bg: "#E6F2EB", fg: "#2E7D5B" },
};
const LAVORO_LABELS = {
  dafare: "Da fare",
  corso: "In corso",
  fatto: "Fatta",
  nondist: "Non disturbare",
};
const LAVORO_COLORS = {
  dafare: "#9CA3AF",
  corso: "#B9842F",
  fatto: "#16A34A",
  nondist: "#4C6FA5",
};
const LETTI_CHIPS = ["Matrimoniale", "Singolo", "Culla", "Letto aggiunto"];
const ORDINE_LABELS = { urgenti: "Urgenti prima", numero: "Per numero" };
// Regola fondamentale: SOLO le camere libere partono gia' "fatto" (niente
// da fare); tutte le altre (b2b, partenza, arrivo, fermata) partono
// "dafare", anche se per qualche motivo manca ancora il record esplicito in
// camere_lavoro (l'RPC di caricamento lo crea sempre, questo e' solo un
// fallback difensivo coerente con la stessa regola).
function lavoroDefault(statoSlope) {
  return statoSlope === "libera" ? "fatto" : "dafare";
}

// ── Lookup camera → struttura/piano ufficiale, dal file zoneData.js ─────────
// Usato sia per completare il tabellone con le camere non presenti nel file
// caricato (restano "libera"), sia come riferimento in fase di parsing.
const CAMERA_STRUTTURA_PIANO = {};
PIANI_ZONE.forEach((p) => {
  const struttura = p.id.startsWith("jazz") ? "Jazz" : "Wine";
  const piano = Number(p.id.slice(-1));
  p.rooms.forEach((r) => {
    CAMERA_STRUTTURA_PIANO[r] = { struttura, piano };
  });
});

// Tipologia ufficiale delle 202 camere (struttura stabile dell'hotel, non
// cambia col caricamento del file). Usata come fallback per le camere
// assenti dal file di oggi, cosi' restano "libera" ma con la tipologia
// comunque visibile in card invece che vuota.
const BASE_TIPOLOGIA = {
  101: "Tripla", 102: "Standard", 103: "Standard", 104: "Standard", 105: "Standard",
  106: "Standard", 107: "Standard", 108: "Tripla", 109: "Standard", 110: "Tripla",
  111: "Cantina", 112: "Cantina", 113: "Standard", 114: "Standard", 115: "Tripla",
  116: "Quadrupla", 117: "Standard", 119: "Standard", 120: "Quadrupla", 121: "Economy",
  122: "Economy", 123: "Quadrupla", 124: "Standard", 125: "Singola", 126: "Cantina",
  127: "Cantina", 128: "Cantina", 129: "Cantina", 130: "Cantina", 131: "Cantina",
  201: "Tripla", 202: "Standard", 203: "Standard", 204: "Standard", 205: "Standard",
  206: "Quadrupla", 207: "Tripla", 208: "Tripla", 209: "Standard", 210: "Standard",
  211: "Singola", 212: "Tripla", 213: "Standard", 214: "Standard", 216: "Standard",
  217: "Economy", 218: "Singola", 219: "Economy", 220: "Economy", 221: "Singola",
  222: "Economy", 223: "Standard", 224: "Singola", 225: "Cantina", 226: "Cantina",
  227: "Cantina", 228: "Cantina", 229: "Cantina", 230: "Cantina", 231: "Cantina",
  232: "Cantina", 233: "Cantina", 301: "Standard", 302: "Standard", 303: "Standard",
  304: "Standard", 305: "Tripla", 306: "Standard", 307: "Tripla", 308: "Tripla",
  309: "Standard", 310: "Standard", 311: "Standard", 312: "Singola", 313: "Tripla",
  314: "Standard", 315: "Tripla", 317: "Standard", 318: "Quadrupla", 319: "Economy",
  320: "Economy", 321: "Quadrupla", 322: "Standard", 323: "Singola", 324: "Cantina",
  325: "Cantina", 326: "Cantina", 327: "Cantina", 328: "Cantina", 329: "Cantina",
  330: "Cantina", 331: "Cantina", 332: "Cantina", 401: "Standard", 402: "Standard",
  403: "Tripla", 404: "Standard", 405: "Tripla", 406: "Standard", 407: "Tripla",
  408: "Standard", 409: "Standard", 410: "Standard", 411: "Standard", 412: "Singola",
  413: "Tripla", 414: "Standard", 415: "Tripla", 417: "Standard", 418: "Economy",
  419: "Singola", 420: "Economy", 421: "Economy", 422: "Singola", 423: "Economy",
  424: "Standard", 425: "Singola", 426: "Cantina", 427: "Cantina", 428: "Cantina",
  429: "Cantina", 430: "Cantina", 431: "Cantina", 432: "Cantina", 433: "Cantina",
  434: "Cantina", 1101: "Superior", 1102: "Suite", 1103: "Superior", 1104: "Superior",
  1105: "Superior", 1106: "Superior", 1107: "Superior", 1108: "Superior", 1109: "Superior",
  1110: "Superior", 1111: "Superior", 1112: "Superior", 1114: "Superior", 1115: "Superior",
  1116: "Superior", 1118: "Superior", 1119: "Superior", 1120: "Superior", 1121: "Superior",
  2201: "Superior", 2202: "Suite", 2203: "Superior", 2204: "Superior", 2205: "Superior",
  2206: "Superior", 2207: "Superior", 2208: "Superior", 2209: "Superior", 2210: "Superior",
  2211: "Superior", 2212: "Superior", 2214: "Superior", 2215: "Superior", 2216: "Superior",
  2218: "Superior", 2219: "Superior", 2220: "Superior", 2221: "Superior", 3301: "Superior",
  3302: "Suite", 3303: "Superior", 3304: "Superior", 3305: "Superior", 3306: "Superior",
  3307: "Superior", 3308: "Superior", 3309: "Superior", 3310: "Superior", 3311: "Superior",
  3312: "Superior", 3314: "Superior", 3315: "Superior", 3316: "Superior", 3318: "Superior",
  3319: "Superior", 3320: "Superior", 3321: "Superior", 4401: "Superior", 4402: "Suite",
  4403: "Superior", 4404: "Superior", 4405: "Superior", 4406: "Superior", 4407: "Superior",
  4408: "Superior", 4409: "Superior", 4410: "Superior", 4411: "Superior", 4412: "Superior",
  4414: "Superior", 4415: "Superior", 4416: "Superior", 4418: "Superior", 4419: "Superior",
  4420: "Superior", 4421: "Superior",
};

// Normalizza il testo tipologia grezzo del file Slope (che puo' essere
// lungo/vario) in una categoria breve, cosi' entra nel badge della card.
function tipoBreve(t) {
  const s = (t || "").toLowerCase();
  if (s.includes("accessibile") || s.includes("handicap")) return "Handicap";
  if (s.includes("suite")) return "Suite";
  if (s.includes("cantina")) return "Cantina";
  if (s.includes("superior")) return "Superior";
  if (s.includes("quadrupla")) return "Quadrupla";
  if (s.includes("tripla")) return "Tripla";
  if (s.includes("singola")) return "Singola";
  if (s.includes("economy")) return "Economy";
  return t ? "Standard" : "";
}

// ── Parsing file Slope (housekeeping .xls/.xlsx) ─────────────────────────────
// Colonne (0-based): 0=Piano/interno, 1=Tipologia, 2=Alloggio(camera),
// 3=Stato soggiorno, 4=Arrivo, 5=Partenza, 6=Config letti alloggio,
// 7=Config letti prenotazione, 8=Note.

const ORDINALI = { primo: 1, secondo: 2, terzo: 3, quarto: 4 };

function pianoInterno(raw) {
  const norm = String(raw || "").toLowerCase();
  let struttura = null;
  if (norm.includes("jazz")) struttura = "Jazz";
  else if (norm.includes("wine")) struttura = "Wine";
  let piano = null;
  for (const [k, v] of Object.entries(ORDINALI)) {
    if (norm.includes(k)) {
      piano = v;
      break;
    }
  }
  return { struttura, piano };
}

// Riduce una data (stringa o oggetto Date, a seconda di come SheetJS la
// restituisce) al solo "gg/mm" richiesto dallo schema camere_giorno.
function soloData(v) {
  if (v == null || v === "") return "";
  if (v instanceof Date && !isNaN(v)) {
    const dd = String(v.getDate()).padStart(2, "0");
    const mm = String(v.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}`;
  }
  const s = String(v).trim();
  // ISO (aaaa-mm-gg), va controllata PRIMA del regex generico sotto: altrimenti
  // su "2026-08-08" quel regex prende le cifre sbagliate (es. "26/08" invece
  // di "08/08"), perche' non sa distinguere l'ordine aaaa-mm-gg da gg/mm.
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}`;
  const m = s.match(/(\d{1,2})[\/\-.](\d{1,2})/);
  if (m) return `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}`;
  return s;
}

// Classifica una singola riga del file in base al TESTO della colonna
// "Stato soggiorno" (es. "In arrivo", "In arrivo (14:00)", "In partenza",
// "In soggiorno"). NON usare la presenza delle colonne Arrivo/Partenza: sono
// SEMPRE valorizzate per qualunque prenotazione (rappresentano l'intero
// check-in/check-out del soggiorno, non "il movimento di oggi"), quindi
// classificherebbero quasi ogni camera occupata come b2b per errore.
function classificaRiga(row) {
  const statoTxt = String(row[3] ?? "").trim().toLowerCase();
  if (!statoTxt) return [];
  if (statoTxt.includes("partenza")) return ["partenza"];
  if (statoTxt.includes("arrivo")) return ["arrivo"];
  if (statoTxt.includes("soggiorno")) return ["soggiorno"];
  return [];
}

// Trasforma le righe grezze del foglio Excel nell'elenco camere anonimizzato
// da passare alla RPC carica_camere_giorno. Ritorna anche qualche statistica
// per il messaggio di conferma dopo il caricamento.
export function elaboraRighe(rows) {
  const perCamera = {};
  for (const row of rows) {
    if (!row || row.length === 0) continue;
    if (row.some((c) => String(c ?? "").toLowerCase().includes("alloggio")))
      continue; // riga di intestazione
    const camera = String(row[2] ?? "").trim();
    if (!camera || !ROOM_NUMBERS.has(camera)) continue; // scarta righe non-camera

    const { struttura: strFile, piano: pianoFile } = pianoInterno(row[0]);
    const fallback = CAMERA_STRUTTURA_PIANO[camera] || {};
    const struttura = strFile || fallback.struttura || "Wine";
    const piano = pianoFile || fallback.piano || 1;
    const tipologia = tipoBreve(String(row[1] ?? "").trim());
    const letti = String(row[7] ?? row[6] ?? "").trim();
    const note = String(row[8] ?? "").trim();
    const arrivo = soloData(row[4]);
    const partenza = soloData(row[5]);
    const tipi = classificaRiga(row);

    if (!perCamera[camera]) {
      perCamera[camera] = {
        camera,
        struttura,
        piano,
        tipologia,
        letti,
        note,
        arrivo: "",
        partenza: "",
        tipi: [],
      };
    }
    const c = perCamera[camera];
    if (tipologia) c.tipologia = tipologia;
    if (letti) c.letti = letti;
    if (note) c.note = note;
    if (arrivo) c.arrivo = arrivo;
    if (partenza) c.partenza = partenza;
    c.tipi.push(...tipi);
  }

  let nB2b = 0;
  const camereFile = Object.values(perCamera).map((c) => {
    const haArrivo = c.tipi.includes("arrivo");
    const haPartenza = c.tipi.includes("partenza");
    const haSoggiorno = c.tipi.includes("soggiorno");
    let stato_slope;
    if (haArrivo && haPartenza) {
      stato_slope = "b2b";
      nB2b++;
    } else if (haPartenza) stato_slope = "partenza";
    else if (haArrivo) stato_slope = "arrivo";
    else if (haSoggiorno) stato_slope = "fermata";
    else stato_slope = "libera";
    const { tipi, ...resto } = c;
    return { ...resto, stato_slope };
  });

  // Completa con le camere ufficiali assenti dal file: restano "libera".
  const trovate = new Set(camereFile.map((c) => c.camera));
  const mancanti = Object.entries(CAMERA_STRUTTURA_PIANO)
    .filter(([num]) => !trovate.has(num))
    .map(([camera, { struttura, piano }]) => ({
      camera,
      struttura,
      piano,
      tipologia: BASE_TIPOLOGIA[camera] || "",
      stato_slope: "libera",
      letti: "",
      note: "",
      arrivo: "",
      partenza: "",
    }));

  return { camere: [...camereFile, ...mancanti], nCamere: camereFile.length, nB2b };
}

async function leggiWorkbook(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "" });
}

// ── Componente principale ────────────────────────────────────────────────
export default function Camere({ user, onFlash }) {
  const [giorno, setGiorno] = useState([]); // camere_giorno
  const [lavoro, setLavoro] = useState([]); // camere_lavoro
  const [loading, setLoading] = useState(true);
  const [struttura, setStruttura] = useState("Wine");
  const [piano, setPiano] = useState(1);
  const [ordine, setOrdine] = useState("urgenti");
  const [aperta, setAperta] = useState(null); // camera selezionata (numero)
  const [uploading, setUploading] = useState(false);
  const [inAttesa, setInAttesa] = useState(0);
  const fileRef = useRef(null);

  // Offline-first: se si e' online scarica lo stato fresco da Supabase e lo
  // riconcilia con la cache locale (le modifiche ancora in coda, se piu'
  // recenti, restano valide); in ogni caso il tabellone mostrato viene
  // sempre letto dalla cache Dexie, cosi' funziona anche appena aperto
  // offline con l'ultimo stato salvato sul telefono.
  const refresh = useCallback(async () => {
    if (typeof navigator === "undefined" || navigator.onLine) {
      const [g, l] = await Promise.all([
        DB.loadCamereGiorno(),
        DB.loadCamereLavoro(),
      ]);
      if (g.length || l.length) await cacheSnapshot(g, l);
    }
    const cached = await getCachedSnapshot();
    setGiorno(cached.giorno);
    setLavoro(cached.lavoro);
    setLoading(false);
  }, []);

  const aggiornaInAttesa = useCallback(() => {
    contaInAttesa().then(setInAttesa);
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("camere-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "camere_giorno" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "camere_lavoro" },
        () => refresh(),
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [refresh]);

  useEffect(() => {
    const fermaSync = avviaSyncAutomatico();
    aggiornaInAttesa();
    const timer = setInterval(aggiornaInAttesa, 4000);
    return () => {
      fermaSync();
      clearInterval(timer);
    };
  }, [aggiornaInAttesa]);

  const lavoroByCamera = useMemo(() => {
    const m = {};
    lavoro.forEach((l) => (m[l.camera] = l));
    return m;
  }, [lavoro]);

  const camere = useMemo(
    () =>
      giorno
        .filter((c) => c.struttura === struttura && c.piano === piano)
        .map((c) => ({ ...c, lavoro: lavoroByCamera[c.camera]?.stato || lavoroDefault(c.stato_slope) })),
    [giorno, struttura, piano, lavoroByCamera],
  );

  const sorted = useMemo(() => {
    if (ordine === "numero") {
      return [...camere].sort((a, b) =>
        a.camera.localeCompare(b.camera, undefined, { numeric: true }),
      );
    }
    // Priorita' decrescente: b2b (da rifare subito), partenze, arrivi,
    // fermate, poi le gia' gestite (fatte o non-disturbare) e infine le libere.
    const gestita = (c) => c.lavoro === "fatto" || c.lavoro === "nondist";
    const peso = (c) => {
      if (gestita(c)) return 4;
      if (c.stato_slope === "libera") return 5;
      if (c.stato_slope === "b2b") return 0;
      if (c.stato_slope === "partenza") return 1;
      if (c.stato_slope === "arrivo") return 2;
      return 3; // fermata
    };
    return [...camere].sort(
      (a, b) => peso(a) - peso(b) || a.camera.localeCompare(b.camera, undefined, { numeric: true }),
    );
  }, [camere, ordine]);

  const contaDaFarePerPiano = useCallback(
    (p) =>
      giorno.filter((c) => {
        if (c.struttura !== struttura || c.piano !== p) return false;
        if (c.stato_slope === "libera") return false;
        const stato = lavoroByCamera[c.camera]?.stato || "dafare";
        return stato !== "fatto" && stato !== "nondist"; // = !gestita(c)
      }).length,
    [giorno, struttura, lavoroByCamera],
  );

  const contaB2bPerPiano = useCallback(
    (p) =>
      giorno.filter((c) => {
        if (c.struttura !== struttura || c.piano !== p) return false;
        if (c.stato_slope !== "b2b") return false;
        const stato = lavoroByCamera[c.camera]?.stato || "dafare";
        return stato !== "fatto" && stato !== "nondist"; // = !gestita(c)
      }).length,
    [giorno, struttura, lavoroByCamera],
  );

  const cameraAperta = aperta ? giorno.find((c) => c.camera === aperta) : null;

  const puoCaricare = RUOLI_CARICAMENTO.includes(user.role);
  const puoModificare = RUOLI_MODIFICA.includes(user.role);

  // Scrive subito in locale (Dexie) e mette in coda per Supabase: funziona
  // anche senza rete, il tocco non va mai perso. onFlash/refresh leggono
  // di nuovo dalla cache, non da Supabase, cosi' la card si aggiorna
  // all'istante anche offline.
  const segnaLavoro = async (camera, stato) => {
    await enqueueLavoro(camera, stato, user.name);
    const cached = await getCachedSnapshot();
    setGiorno(cached.giorno);
    setLavoro(cached.lavoro);
    aggiornaInAttesa();
    onFlash?.(`Camera ${camera} · ${LAVORO_LABELS[stato].toLowerCase()}`);
  };

  const salvaModifica = async (camera, campi) => {
    const attuale = giorno.find((c) => c.camera === camera);
    await enqueueModifica(camera, campi, user.name, attuale);
    const cached = await getCachedSnapshot();
    setGiorno(cached.giorno);
    setLavoro(cached.lavoro);
    aggiornaInAttesa();
    onFlash?.(`Camera ${camera} aggiornata`);
  };

  const caricaFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const rows = await leggiWorkbook(file);
      const { camere: elenco, nCamere, nB2b } = elaboraRighe(rows);
      const res = await DB.caricaCamereGiorno(user.name, elenco);
      if (res.ok) {
        onFlash?.(`Caricate ${nCamere} camere dal file, ${nB2b} back-to-back ✓`);
        refresh();
      } else {
        onFlash?.(`Errore caricamento: ${res.error}`, false);
      }
    } catch (err) {
      console.error(err);
      onFlash?.("File non leggibile: controlla che sia l'export housekeeping di Slope", false);
    }
    setUploading(false);
  };

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "14px 14px 90px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11.5,
          fontWeight: 700,
          color: inAttesa ? "#B23A2E" : "#2E7D5B",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: inAttesa ? "#B23A2E" : "#2E7D5B",
            flexShrink: 0,
          }}
        />
        {inAttesa ? `${inAttesa} in attesa di rete` : "Sincronizzato"}
      </div>

      {puoCaricare && (
        <div style={{ marginBottom: 14 }}>
          <input
            ref={fileRef}
            type="file"
            accept=".xls,.xlsx"
            hidden
            onChange={caricaFile}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ ...ctaSt, opacity: uploading ? 0.6 : 1 }}
          >
            {uploading ? "Caricamento…" : "Carica file di oggi"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        {STRUTTURE.map((s) => (
          <button
            key={s}
            onClick={() => setStruttura(s)}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: "-0.01em",
              cursor: "pointer",
              border: "1.5px solid " + (struttura === s ? "#640A0A" : "#E4E0D6"),
              background: struttura === s ? "#640A0A" : "#fff",
              color: struttura === s ? "#fff" : "#1B2420",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {PIANI_NUM.map((p) => {
          const n = contaDaFarePerPiano(p);
          const b = contaB2bPerPiano(p);
          const on = piano === p;
          return (
            <button
              key={p}
              onClick={() => setPiano(p)}
              style={{
                flex: 1,
                position: "relative",
                padding: "11px 6px",
                borderRadius: 13,
                textAlign: "center",
                cursor: "pointer",
                border: "1.5px solid " + (on ? "#640A0A" : "#E4E0D6"),
                background: on ? "#EAF1EE" : "#fff",
              }}
            >
              {b > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -4,
                    background: "#B23A2E",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    minWidth: 19,
                    height: 19,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 5px",
                    border: "2px solid #F7F0E3",
                  }}
                >
                  {b}
                </span>
              )}
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: on ? "#640A0A" : "#1B2420",
                }}
              >
                {p}°
              </div>
              <div style={{ fontSize: 10, color: "#9CA39C", marginTop: 2, fontWeight: 600 }}>
                {n > 0 ? `${n} da fare` : "ok"}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {Object.entries(ORDINE_LABELS).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setOrdine(val)}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 12,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              border: "1.5px solid " + (ordine === val ? "#640A0A" : "#E4E0D6"),
              background: ordine === val ? "#640A0A" : "#fff",
              color: ordine === val ? "#fff" : "#5C645E",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: "#5C645E" }}>
          Caricamento…
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: 30, color: "#5C645E", fontSize: 13.5 }}>
          Nessuna camera su questo piano. Se il tabellone è vuoto, carica il
          file di oggi.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
            gap: 10,
          }}
        >
          {sorted.map((c) => (
            <CameraCard key={c.camera} c={c} onClick={() => setAperta(c.camera)} />
          ))}
        </div>
      )}

      {cameraAperta && (
        <CameraSheet
          c={{ ...cameraAperta, lavoro: lavoroByCamera[cameraAperta.camera]?.stato || lavoroDefault(cameraAperta.stato_slope) }}
          puoModificare={puoModificare}
          onClose={() => setAperta(null)}
          onSegnaLavoro={segnaLavoro}
          onSalvaModifica={salvaModifica}
        />
      )}
    </main>
  );
}

function CameraCard({ c, onClick }) {
  const slope = SLOPE_COLORS[c.stato_slope] || SLOPE_COLORS.libera;
  const fatta = c.lavoro === "fatto";
  const nondist = c.lavoro === "nondist";
  const priorita = c.stato_slope === "b2b" && !fatta;
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        textAlign: "center",
        padding: "12px 8px",
        borderRadius: 15,
        cursor: "pointer",
        minHeight: 104,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        border: priorita ? "1.5px solid #B23A2E" : "1px solid #E4E0D6",
        background: fatta ? "#E6F2EB" : nondist ? "#EEF1F5" : "#fff",
        boxShadow: "0 1px 2px rgba(20,40,30,.04), 0 4px 14px rgba(20,50,40,.06)",
      }}
    >
      {priorita && (
        <span
          style={{
            position: "absolute",
            top: 7,
            left: 7,
            fontSize: 8,
            fontWeight: 800,
            color: "#fff",
            background: "#B23A2E",
            padding: "2px 6px",
            borderRadius: 6,
            letterSpacing: 0.3,
          }}
        >
          SUBITO
        </span>
      )}
      <span
        style={{
          position: "absolute",
          top: 7,
          right: 7,
          width: 19,
          height: 19,
          borderRadius: "50%",
          background: fatta ? "#2E7D5B" : "transparent",
          color: "#fff",
          display: fatta ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        {nondist ? "✋" : "✓"}
      </span>
      {!fatta && (c.letti || c.note) && (
        <span
          title="Ci sono dettagli"
          style={{
            position: "absolute",
            top: 9,
            right: 9,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#B9842F",
          }}
        />
      )}
      <div
        style={{
          fontSize: 19,
          fontWeight: 800,
          color: fatta ? "#2E7D5B" : "#1B2420",
        }}
      >
        {c.camera}
      </div>
      {c.tipologia && (
        <div
          style={{
            fontSize: 9.5,
            color: "#9CA39C",
            marginTop: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {c.tipologia}
        </div>
      )}
      <span
        style={{
          display: "inline-block",
          fontSize: 8.5,
          fontWeight: 800,
          padding: "3px 6px",
          borderRadius: 6,
          letterSpacing: 0.2,
          marginTop: 8,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          background: slope.bg,
          color: slope.fg,
        }}
      >
        {SLOPE_LABELS[c.stato_slope]}
      </span>
    </button>
  );
}

function CameraSheet({ c, puoModificare, onClose, onSegnaLavoro, onSalvaModifica }) {
  const [modificaOpen, setModificaOpen] = useState(false);
  const [statoSlope, setStatoSlope] = useState(c.stato_slope);
  const [letti, setLetti] = useState(c.letti || "");
  const [note, setNote] = useState(c.note || "");
  const [busy, setBusy] = useState(false);
  const slope = SLOPE_COLORS[c.stato_slope] || SLOPE_COLORS.libera;

  const salva = async () => {
    setBusy(true);
    await onSalvaModifica(c.camera, { stato_slope: statoSlope, letti: letti.trim(), note: note.trim() });
    setBusy(false);
    setModificaOpen(false);
  };

  return (
    <Sheet onClose={onClose} title={`Camera ${c.camera}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        {c.tipologia && (
          <span style={{ fontSize: 13.5, color: "#5C645E" }}>{c.tipologia}</span>
        )}
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 7,
            background: slope.bg,
            color: slope.fg,
          }}
        >
          {SLOPE_LABELS[c.stato_slope]}
        </span>
      </div>

      {(c.arrivo || c.partenza || c.letti || c.note) && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #E4E0D6",
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {(c.arrivo || c.partenza) && (
            <div style={{ display: "flex", gap: 16, marginBottom: c.letti || c.note ? 8 : 0 }}>
              {c.arrivo && (
                <div>
                  <div style={{ color: "#5C645E", fontSize: 11 }}>Arrivo</div>
                  <div style={{ fontWeight: 700 }}>{c.arrivo}</div>
                </div>
              )}
              {c.partenza && (
                <div>
                  <div style={{ color: "#5C645E", fontSize: 11 }}>Partenza</div>
                  <div style={{ fontWeight: 700 }}>{c.partenza}</div>
                </div>
              )}
            </div>
          )}
          {c.letti && (
            <div style={{ marginBottom: c.note ? 6 : 0 }}>
              <span style={{ color: "#5C645E" }}>Letti: </span>
              {c.letti}
            </div>
          )}
          {c.note && (
            <div>
              <span style={{ color: "#5C645E" }}>Note: </span>
              {c.note}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Segna il lavoro</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
        {["dafare", "corso", "fatto"].map((s) => (
          <button
            key={s}
            onClick={() => onSegnaLavoro(c.camera, s)}
            style={{
              padding: "12px 6px",
              borderRadius: 11,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              border: "1.5px solid " + (c.lavoro === s ? LAVORO_COLORS[s] : "#E4E0D6"),
              background: c.lavoro === s ? LAVORO_COLORS[s] + "22" : "#fff",
              color: c.lavoro === s ? LAVORO_COLORS[s] : "#5C645E",
            }}
          >
            {LAVORO_LABELS[s]}
          </button>
        ))}
      </div>
      {c.stato_slope === "fermata" && (
        <button
          onClick={() => onSegnaLavoro(c.camera, "nondist")}
          style={{
            width: "100%",
            padding: "12px 6px",
            borderRadius: 11,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            border: "1.5px solid " + (c.lavoro === "nondist" ? LAVORO_COLORS.nondist : "#E4E0D6"),
            background: c.lavoro === "nondist" ? LAVORO_COLORS.nondist + "22" : "#fff",
            color: c.lavoro === "nondist" ? LAVORO_COLORS.nondist : "#5C645E",
            marginBottom: 8,
          }}
        >
          {LAVORO_LABELS.nondist}
        </button>
      )}

      {puoModificare && (
        <div style={{ marginTop: 16, borderTop: "1px solid #E4E0D6", paddingTop: 16 }}>
          {!modificaOpen ? (
            <button
              onClick={() => setModificaOpen(true)}
              style={{
                width: "100%",
                background: "none",
                border: "1.5px solid #E4E0D6",
                color: "#1B2420",
                fontWeight: 700,
                fontSize: 13,
                padding: 12,
                borderRadius: 11,
                cursor: "pointer",
              }}
            >
              Modifica camera
            </button>
          ) : (
            <>
              <Field label="Stato">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.keys(SLOPE_LABELS).map((k) => (
                    <button
                      key={k}
                      onClick={() => setStatoSlope(k)}
                      style={{
                        padding: "7px 11px",
                        borderRadius: 9,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "1.5px solid " + (statoSlope === k ? SLOPE_COLORS[k].fg : "#E4E0D6"),
                        background: statoSlope === k ? SLOPE_COLORS[k].bg : "#fff",
                        color: statoSlope === k ? SLOPE_COLORS[k].fg : "#5C645E",
                      }}
                    >
                      {SLOPE_LABELS[k]}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Letti">
                <input style={inputSt} value={letti} onChange={(e) => setLetti(e.target.value)} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {LETTI_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() =>
                        setLetti((prev) => (prev ? `${prev}, ${chip}` : chip))
                      }
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "1px solid #E4E0D6",
                        background: "#fff",
                        color: "#5C645E",
                      }}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Note">
                <textarea
                  style={{ ...inputSt, minHeight: 70, resize: "vertical" }}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
              <button disabled={busy} onClick={salva} style={{ ...ctaSt, opacity: busy ? 0.6 : 1 }}>
                {busy ? "Salvataggio…" : "Salva modifiche"}
              </button>
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}
