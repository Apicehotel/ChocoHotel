// ── Cache locale + coda di sync per il tabellone Camere (offline-first) ─────
// Le governanti girano per i piani dove il WiFi va e viene: ogni tocco
// ("fatta", modifica camera, ...) deve salvarsi SUBITO in IndexedDB (Dexie),
// aggiornare la UI all'istante, e finire in una coda che si svuota da sola
// verso Supabase quando torna la rete. Se una camera cambia sia in coda
// locale sia su Supabase (Realtime/altro dispositivo), vince il timestamp
// piu' recente — vedi reconcile() sotto.

import Dexie from "dexie";
import { DB } from "./db.js";

const db = new Dexie("hgCamere");
db.version(1).stores({
  giorno: "camera",
  lavoro: "camera",
  // chiave = `${kind}:${camera}`: un solo pendente per camera+tabella, cosi'
  // un nuovo tocco sulla stessa camera sovrascrive quello precedente in coda
  // ("l'ultima modifica per camera vince") gia' lato client.
  outbox: "chiave, kind, camera",
});

const tsOf = (row) => (row?.aggiornato_il ? new Date(row.aggiornato_il).getTime() : 0);

// Scrive uno snapshot fresco da Supabase nella cache locale, rispettando le
// modifiche ancora in coda: se sono piu' recenti del dato server restano
// loro (il server non le ha ancora viste); se il server e' piu' recente
// (es. modifica arrivata nel frattempo da un altro telefono), la modifica
// in coda e' superata e viene scartata.
async function reconcile(table, kind, serverRows) {
  if (!serverRows || !serverRows.length) return;
  const inCoda = await db.outbox.where("kind").equals(kind).toArray();
  const pendingByCamera = new Map(inCoda.map((e) => [e.camera, e]));
  const daScrivere = [];
  const daScartare = [];
  for (const row of serverRows) {
    const pending = pendingByCamera.get(row.camera);
    if (pending && pending.ts > tsOf(row)) continue; // la coda e' piu' recente
    if (pending) daScartare.push(pending.chiave); // il server ha gia' superato la coda
    daScrivere.push(row);
  }
  await db.transaction("rw", table, db.outbox, async () => {
    if (daScrivere.length) await table.bulkPut(daScrivere);
    if (daScartare.length) await db.outbox.bulkDelete(daScartare);
  });
}

export async function cacheSnapshot(giorno, lavoro) {
  await reconcile(db.giorno, "giorno", giorno);
  await reconcile(db.lavoro, "lavoro", lavoro);
}

export async function getCachedSnapshot() {
  const [giorno, lavoro] = await Promise.all([db.giorno.toArray(), db.lavoro.toArray()]);
  return { giorno, lavoro };
}

export async function contaInAttesa() {
  return db.outbox.count();
}

export async function enqueueLavoro(camera, stato, nome) {
  const ts = Date.now();
  const row = { camera, stato, da_chi: nome, aggiornato_il: new Date(ts).toISOString() };
  await db.transaction("rw", db.lavoro, db.outbox, async () => {
    await db.lavoro.put(row);
    await db.outbox.put({ chiave: `lavoro:${camera}`, kind: "lavoro", camera, nome, ts, payload: { stato } });
  });
  drainOutbox();
  return row;
}

// `cameraAttuale` e' la riga camere_giorno gia' in memoria (per completare la
// scrittura locale: put() sostituisce l'intera riga in cache, quindi serve
// partire dai campi esistenti e sovrascrivere solo quelli modificati).
export async function enqueueModifica(camera, campi, nome, cameraAttuale) {
  const ts = Date.now();
  const iso = new Date(ts).toISOString();
  const row = {
    ...(cameraAttuale || { camera }),
    ...campi,
    camera,
    manuale: true,
    manuale_da: nome,
    manuale_il: iso,
    aggiornato_il: iso,
  };
  await db.transaction("rw", db.giorno, db.outbox, async () => {
    await db.giorno.put(row);
    await db.outbox.put({ chiave: `giorno:${camera}`, kind: "giorno", camera, nome, ts, payload: campi });
  });
  drainOutbox();
  return row;
}

let drainando = false;
export async function drainOutbox() {
  if (drainando) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  drainando = true;
  try {
    const voci = await db.outbox.toArray();
    for (const voce of voci) {
      const ok =
        voce.kind === "lavoro"
          ? await DB.segnaLavoroCamera(voce.camera, voce.payload.stato, voce.nome, voce.ts)
          : await DB.aggiornaCameraGiorno(voce.camera, voce.payload, voce.nome, voce.ts);
      if (ok) await db.outbox.delete(voce.chiave);
    }
  } finally {
    drainando = false;
  }
}

// Avvia lo svuotamento automatico della coda: subito, ad ogni ritorno online,
// e a intervalli regolari (rete che va e viene, evento 'online' non sempre
// affidabile su mobile). Ritorna una funzione per fermarlo.
export function avviaSyncAutomatico() {
  const onOnline = () => drainOutbox();
  window.addEventListener("online", onOnline);
  const interval = setInterval(drainOutbox, 15000);
  drainOutbox();
  return () => {
    window.removeEventListener("online", onOnline);
    clearInterval(interval);
  };
}
