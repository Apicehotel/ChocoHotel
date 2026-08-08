import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jmhzmwyolxzacjunfwcq.supabase.co";
const SUPABASE_KEY = "sb_publishable_XTYCLV5jSdk3ztG7PNuL_Q_1zu3tDwJ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Coda locale per salvataggi falliti (segnalazioni) ────────────────────────
// Se il salvataggio su Supabase fallisce (rete assente, errore server, bug
// lato DB come successo il 6/8 con il trigger del report), la segnalazione
// NON va persa: resta in questa coda su localStorage, visibile in app con
// un badge "in attesa", e viene ritentata da sola ogni 30s + a ogni ritorno
// online, finche' non va a buon fine.
const PENDING_KEY = "hg_pending_segnalazioni";

function loadPendingQueue() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
  } catch {
    return [];
  }
}
function savePendingQueue(q) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(q));
  } catch (e) {
    console.error("Errore salvataggio coda locale:", e);
  }
}

// ── Mappatura DB <-> forma usata dall'app ────────────────────────────────────
// L'app usa oggetti "item" (segnalazioni) e "planned" (interventi) con chiavi
// camelCase. Il DB usa snake_case. Queste funzioni traducono avanti e indietro.

function itemFromRow(r) {
  return {
    id: r.id,
    room: r.camera,
    urgency: r.urgenza,
    category: r.categoria,
    status: r.stato,
    roomStatus: r.stato_camera,
    notes: r.note,
    photoBefore: r.foto_prima,
    photoAfter: r.foto_dopo,
    createdBy: r.creato_da,
    createdAt: r.creato_il ? new Date(r.creato_il).getTime() : Date.now(),
    completedBy: r.completato_da,
    completedAt: r.completato_il ? new Date(r.completato_il).getTime() : null,
    pieceName: r.pezzo_nome,
    pieceDecision: r.pezzo_decisione,
    pieceDecisionBy: r.pezzo_decisione_da,
    waitingBy: r.attesa_da,
    waitingSince: r.attesa_dal ? new Date(r.attesa_dal).getTime() : null,
    pieceReplaced: r.pezzo_sostituito,
    pieceReplacedBy: r.pezzo_sostituito_da,
    pieceReplacedAt: r.pezzo_sostituito_il
      ? new Date(r.pezzo_sostituito_il).getTime()
      : null,
    tecnicoId: r.tecnico_id,
    tecnicoNome: r.tecnico_nome,
    tecnicoTelefono: r.tecnico_telefono,
    tecnicoRequestedBy: r.tecnico_richiesto_da,
    tecnicoRequestedAt: r.tecnico_richiesto_il
      ? new Date(r.tecnico_richiesto_il).getTime()
      : null,
    tecnicoCalledBy: r.tecnico_chiamato_da,
    tecnicoCalledAt: r.tecnico_chiamato_il
      ? new Date(r.tecnico_chiamato_il).getTime()
      : null,
    tecnicoCompleted: r.tecnico_completato,
    tecnicoAskedBy: r.tecnico_sollecitato_da,
    tecnicoAskedAt: r.tecnico_sollecitato_il
      ? new Date(r.tecnico_sollecitato_il).getTime()
      : null,
    tecnicoMsgSid: r.tecnico_msg_sid,
    tecnicoMsgStato: r.tecnico_msg_stato,
    tecnicoRispostaStato: r.tecnico_risposta_stato,
    tecnicoArrivoTesto: r.tecnico_arrivo_testo,
    tecnicoArrivoAt: r.tecnico_arrivo_at
      ? new Date(r.tecnico_arrivo_at).getTime()
      : null,
    tecnicoSollecitoInviato: r.tecnico_sollecito_inviato,
  };
}
function itemToRow(it) {
  return {
    id: it.id,
    camera: it.room,
    urgenza: it.urgency,
    categoria: it.category,
    stato: it.status,
    stato_camera: it.roomStatus || null,
    note: it.notes,
    foto_prima: it.photoBefore || null,
    foto_dopo: it.photoAfter || null,
    creato_da: it.createdBy,
    creato_il: it.createdAt
      ? new Date(it.createdAt).toISOString()
      : new Date().toISOString(),
    completato_da: it.completedBy || null,
    completato_il: it.completedAt
      ? new Date(it.completedAt).toISOString()
      : null,
    pezzo_nome: it.pieceName || null,
    pezzo_decisione: it.pieceDecision || null,
    pezzo_decisione_da: it.pieceDecisionBy || null,
    attesa_da: it.waitingBy || null,
    attesa_dal: it.waitingSince
      ? new Date(it.waitingSince).toISOString()
      : null,
    pezzo_sostituito: it.pieceReplaced || null,
    pezzo_sostituito_da: it.pieceReplacedBy || null,
    pezzo_sostituito_il: it.pieceReplacedAt
      ? new Date(it.pieceReplacedAt).toISOString()
      : null,
    tecnico_id: it.tecnicoId || null,
    tecnico_nome: it.tecnicoNome || null,
    tecnico_telefono: it.tecnicoTelefono || null,
    tecnico_richiesto_da: it.tecnicoRequestedBy || null,
    tecnico_richiesto_il: it.tecnicoRequestedAt
      ? new Date(it.tecnicoRequestedAt).toISOString()
      : null,
    tecnico_chiamato_da: it.tecnicoCalledBy || null,
    tecnico_chiamato_il: it.tecnicoCalledAt
      ? new Date(it.tecnicoCalledAt).toISOString()
      : null,
    tecnico_completato: it.tecnicoCompleted || false,
    tecnico_sollecitato_da: it.tecnicoAskedBy || null,
    tecnico_sollecitato_il: it.tecnicoAskedAt
      ? new Date(it.tecnicoAskedAt).toISOString()
      : null,
    tecnico_risposta_stato: it.tecnicoRispostaStato || null,
    tecnico_arrivo_testo: it.tecnicoArrivoTesto || null,
    tecnico_arrivo_at: it.tecnicoArrivoAt
      ? new Date(it.tecnicoArrivoAt).toISOString()
      : null,
  };
}

function planFromRow(r) {
  return {
    id: r.id,
    room: r.camera,
    category: r.categoria,
    notes: r.note,
    scheduledAt: r.programmato_il ? new Date(r.programmato_il).getTime() : null,
    scheduledUntil: r.programmato_al ? new Date(r.programmato_al).getTime() : null,
    piani: r.piani || [],
    assignees: r.assegnatari || [],
    status: r.stato,
    createdBy: r.creato_da,
    createdAt: r.creato_il ? new Date(r.creato_il).getTime() : Date.now(),
    completedBy: r.completato_da,
    completedAt: r.completato_il ? new Date(r.completato_il).getTime() : null,
    photoAfter: r.foto_dopo,
    pieceName: r.pezzo_nome,
    pieceDecision: r.pezzo_decisione,
    pieceDecisionBy: r.pezzo_decisione_da,
    waitingBy: r.attesa_da,
    waitingSince: r.attesa_dal ? new Date(r.attesa_dal).getTime() : null,
    pieceReplaced: r.pezzo_sostituito,
    pieceReplacedBy: r.pezzo_sostituito_da,
    pieceReplacedAt: r.pezzo_sostituito_il
      ? new Date(r.pezzo_sostituito_il).getTime()
      : null,
    rooms: r.camere || null,
    roomsDone: r.camere_fatte || {},
  };
}
function planToRow(p) {
  return {
    id: p.id,
    camera: p.room,
    categoria: p.category,
    note: p.notes,
    programmato_il: p.scheduledAt
      ? new Date(p.scheduledAt).toISOString()
      : null,
    programmato_al: p.scheduledUntil
      ? new Date(p.scheduledUntil).toISOString()
      : null,
    piani: p.piani || [],
    assegnatari: p.assignees || [],
    stato: p.status,
    creato_da: p.createdBy,
    creato_il: p.createdAt
      ? new Date(p.createdAt).toISOString()
      : new Date().toISOString(),
    completato_da: p.completedBy || null,
    completato_il: p.completedAt ? new Date(p.completedAt).toISOString() : null,
    foto_dopo: p.photoAfter || null,
    pezzo_nome: p.pieceName || null,
    pezzo_decisione: p.pieceDecision || null,
    pezzo_decisione_da: p.pieceDecisionBy || null,
    attesa_da: p.waitingBy || null,
    attesa_dal: p.waitingSince ? new Date(p.waitingSince).toISOString() : null,
    pezzo_sostituito: p.pieceReplaced || null,
    pezzo_sostituito_da: p.pieceReplacedBy || null,
    pezzo_sostituito_il: p.pieceReplacedAt
      ? new Date(p.pieceReplacedAt).toISOString()
      : null,
    camere: p.rooms || null,
    camere_fatte: p.roomsDone || {},
  };
}

// ── API dati (async) ─────────────────────────────────────────────────────────
export const DB = {
  async loadItems() {
    const { data, error } = await supabase.from("segnalazioni").select("*");
    if (error) {
      console.error(error);
      return [];
    }
    return data.map(itemFromRow);
  },
  async saveItem(it) {
    const row = itemToRow(it);
    const { error } = await supabase.from("segnalazioni").upsert(row);
    if (error) {
      console.error(error);
      const q = loadPendingQueue();
      const idx = q.findIndex((p) => p.item.id === it.id);
      const entry = {
        item: it,
        error: error.message || String(error),
        attempts: (idx >= 0 ? q[idx].attempts : 0) + 1,
        updatedAt: Date.now(),
      };
      if (idx >= 0) q[idx] = entry;
      else q.push(entry);
      savePendingQueue(q);
      return { ok: false, pending: true };
    }
    // se era in coda locale ed ora e' andata a buon fine, la togliamo
    const q = loadPendingQueue().filter((p) => p.item.id !== it.id);
    savePendingQueue(q);
    return { ok: true, pending: false };
  },
  // Segnalazioni in attesa di sincronizzazione (salvate solo sul telefono).
  getPendingItems() {
    return loadPendingQueue().map((p) => ({
      ...p.item,
      pendingSync: true,
      pendingAttempts: p.attempts,
      pendingError: p.error,
    }));
  },
  // Riprova a salvare tutte le segnalazioni in coda. Ritorna quante sono
  // andate a buon fine e quante restano ancora in attesa.
  async retryPendingItems() {
    const q = loadPendingQueue();
    if (q.length === 0) return { retried: 0, stillPending: 0 };
    const stillFailing = [];
    let retried = 0;
    for (const entry of q) {
      const row = itemToRow(entry.item);
      const { error } = await supabase.from("segnalazioni").upsert(row);
      if (error) {
        stillFailing.push({
          ...entry,
          error: error.message || String(error),
          attempts: entry.attempts + 1,
          updatedAt: Date.now(),
        });
      } else {
        retried++;
      }
    }
    savePendingQueue(stillFailing);
    return { retried, stillPending: stillFailing.length };
  },
  async deleteItem(id) {
    const { error } = await supabase.from("segnalazioni").delete().eq("id", id);
    if (error) console.error(error);
  },

  async loadPlanned() {
    const { data, error } = await supabase.from("interventi").select("*");
    if (error) {
      console.error(error);
      return [];
    }
    return data.map(planFromRow);
  },
  async savePlanned(p) {
    const row = planToRow(p);
    const { error } = await supabase.from("interventi").upsert(row);
    if (error) console.error(error);
  },
  async deletePlanned(id) {
    const { error } = await supabase.from("interventi").delete().eq("id", id);
    if (error) console.error(error);
  },

  async loadUsers() {
    const { data, error } = await supabase.from("utenti").select("*");
    if (error) {
      console.error(error);
      return [];
    }
    return data.map((u) => ({
      id: u.id,
      name: u.nome,
      role: u.ruolo,
      pin: u.pin,
      zones: u.zone_consentite || [],
      mustChangePin: !!u.deve_cambiare_pin,
      telefono: u.telefono || "",
    }));
  },
  async saveUsers(users) {
    // Sostituzione completa: cancella e reinserisce
    await supabase
      .from("utenti")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (users.length) {
      const rows = users.map((u) => ({
        nome: u.name,
        ruolo: u.role,
        pin: u.pin,
        zone_consentite: u.zones || null,
        deve_cambiare_pin: u.mustChangePin || false,
        telefono: u.telefono || null,
      }));
      const { error } = await supabase.from("utenti").insert(rows);
      if (error) console.error(error);
    }
  },
  // Inserisce un solo utente, senza toccare gli altri (evita di sovrascrivere
  // PIN cambiati nel frattempo da altri, come faceva saveUsers con una lista intera).
  async addUser(u) {
    const row = {
      id: u.id,
      nome: u.name,
      ruolo: u.role,
      pin: u.pin,
      zone_consentite: u.zones || null,
      deve_cambiare_pin: u.mustChangePin || false,
      telefono: u.telefono || null,
    };
    const { error } = await supabase.from("utenti").insert(row);
    if (error) console.error(error);
  },
  // Elimina un solo utente per id, senza toccare gli altri.
  async deleteUser(id) {
    const { error } = await supabase.from("utenti").delete().eq("id", id);
    if (error) console.error(error);
  },
  async updateUserPin(name, role, newPin) {
    const { error } = await supabase
      .from("utenti")
      .update({ pin: newPin, deve_cambiare_pin: false })
      .eq("nome", name)
      .eq("ruolo", role);
    if (error) console.error(error);
  },

  async loadTecnici() {
    const { data, error } = await supabase.from("tecnici").select("*");
    if (error) {
      console.error(error);
      return [];
    }
    return data.map((t) => ({ id: t.id, nome: t.nome, telefono: t.telefono }));
  },
  async saveTecnici(list) {
    await supabase
      .from("tecnici")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (list.length) {
      const rows = list.map((t) => ({
        nome: t.nome,
        telefono: t.telefono || null,
      }));
      const { error } = await supabase.from("tecnici").insert(rows);
      if (error) console.error(error);
    }
  },

  async loadPrenotazioni() {
    const { data, error } = await supabase
      .from("prenotazioni_sale")
      .select("*");
    if (error) {
      console.error(error);
      return [];
    }
    return data.map(prenotazioneFromRow);
  },
  async savePrenotazione(p) {
    const row = prenotazioneToRow(p);
    const { error } = await supabase.from("prenotazioni_sale").upsert(row);
    if (error) console.error(error);
    return !error;
  },
  async deletePrenotazione(id) {
    const { error } = await supabase
      .from("prenotazioni_sale")
      .delete()
      .eq("id", id);
    if (error) console.error(error);
  },

  // ── Planning Lavori (centro congressi) ────────────────────────────────
  async loadPlanningLavori() {
    const { data: lavori, error: e1 } = await supabase
      .from("planning_lavori")
      .select("*");
    if (e1) {
      console.error(e1);
      return [];
    }
    const { data: giorni, error: e2 } = await supabase
      .from("planning_lavori_giorni")
      .select("*");
    if (e2) {
      console.error(e2);
      return [];
    }
    return lavori.map((l) => ({
      id: l.id,
      descrizione: l.descrizione,
      createdBy: l.creato_da,
      createdAt: l.creato_il ? new Date(l.creato_il).getTime() : Date.now(),
      giorni: giorni
        .filter((g) => g.lavoro_id === l.id)
        .map((g) => ({
          id: g.id,
          data: g.data,
          stato: g.stato || (g.fatto ? "fatto" : "aperto"),
          fattoDa: g.fatto_da,
          fattoIl: g.fatto_il ? new Date(g.fatto_il).getTime() : null,
          note: g.note,
        })),
    }));
  },
  async creaPlanningLavoro(descrizione, dateArr, createdBy) {
    const { data: lavoro, error: e1 } = await supabase
      .from("planning_lavori")
      .insert({ descrizione, creato_da: createdBy })
      .select()
      .single();
    if (e1) {
      console.error(e1);
      return false;
    }
    const rows = dateArr.map((data) => ({ lavoro_id: lavoro.id, data }));
    const { error: e2 } = await supabase
      .from("planning_lavori_giorni")
      .insert(rows);
    if (e2) console.error(e2);
    return !e2;
  },
  async impostaStatoGiornoLavoro(giornoId, stato, chi, note) {
    const { error } = await supabase
      .from("planning_lavori_giorni")
      .update({
        stato,
        fatto: stato === "fatto",
        fatto_da: stato === "aperto" ? null : chi,
        fatto_il: stato === "aperto" ? null : new Date().toISOString(),
        note: stato === "aperto" ? null : note || null,
      })
      .eq("id", giornoId);
    if (error) console.error(error);
    return !error;
  },
  async eliminaPlanningLavoro(id) {
    const { error } = await supabase
      .from("planning_lavori")
      .delete()
      .eq("id", id);
    if (error) console.error(error);
    return !error;
  },

  // ── Richieste urgenti (allarme broadcast a tutti i manutentori) ──────────
  async loadUrgenze() {
    const { data, error } = await supabase
      .from("richieste_urgenti")
      .select("*")
      .order("creato_il", { ascending: false })
      .limit(20);
    if (error) {
      console.error(error);
      return [];
    }
    return data.map(urgenzaFromRow);
  },
  async addUrgenza(nota, creatoDa) {
    const row = {
      nota: String(nota).slice(0, 255),
      creato_da: creatoDa,
      stato: "aperta",
    };
    const { data, error } = await supabase
      .from("richieste_urgenti")
      .insert(row)
      .select()
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    return urgenzaFromRow(data);
  },
  async prendiUrgenza(id, nome) {
    const { error } = await supabase
      .from("richieste_urgenti")
      .update({
        stato: "presa_in_carico",
        presa_in_carico_da: nome,
        presa_in_carico_il: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) console.error(error);
    return !error;
  },
  async completaUrgenza(id, nome) {
    const { error } = await supabase
      .from("richieste_urgenti")
      .update({
        stato: "completata",
        completata_da: nome,
        completata_il: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) console.error(error);
    return !error;
  },
  // Trasforma una richiesta urgente non risolvibile sul momento in una
  // segnalazione vera (con camera/categoria/urgenza), e chiude l'urgenza
  // collegandola — resta tracciabile, ma sparisce dagli attivi.
  async trasformaUrgenzaInSegnalazione(urgenzaId, nome, dati) {
    const row = {
      camera: dati.camera,
      categoria: dati.categoria,
      urgenza: dati.urgenza,
      note: dati.note,
      creato_da: nome,
      stato: "todo",
    };
    const { data: nuova, error: errIns } = await supabase
      .from("segnalazioni")
      .insert(row)
      .select()
      .single();
    if (errIns) {
      console.error(errIns);
      return null;
    }
    const { error: errUpd } = await supabase
      .from("richieste_urgenti")
      .update({
        stato: "completata",
        completata_da: nome,
        completata_il: new Date().toISOString(),
        trasformata_in_segnalazione_id: nuova.id,
      })
      .eq("id", urgenzaId);
    if (errUpd) console.error(errUpd);
    return nuova;
  },

  // ── Presenza in struttura (check-in manuale + rilevamento GPS) ────────────
  // in_struttura_via distingue chi l'ha impostato:
  // 'manuale' = il manutentore ha toccato il pulsante, ha sempre la
  //             precedenza e il GPS non lo tocca finche' non lo cambia lui;
  // 'gps'     = rilevato in automatico, il GPS puo' aggiornarlo liberamente.
  async loadMiaPresenza(nome) {
    const { data, error } = await supabase
      .from("utenti")
      .select("in_struttura, in_struttura_dal, in_struttura_via")
      .eq("nome", nome)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },
  async setInStrutturaManuale(nome, valore) {
    const { error } = await supabase
      .from("utenti")
      .update({
        in_struttura: valore,
        in_struttura_dal: new Date().toISOString(),
        in_struttura_via: "manuale",
      })
      .eq("nome", nome);
    if (error) console.error(error);
    return !error;
  },
  async autoSetInStrutturaGPS(nome, dentroRaggio) {
    // Non sovrascrive mai un check-in fatto a mano: lo aggiorna solo se lo
    // stato attuale non e' 'manuale' (cioe' non ancora impostato, o gia'
    // impostato in automatico da un rilevamento GPS precedente).
    const { data } = await supabase
      .from("utenti")
      .select("in_struttura_via")
      .eq("nome", nome)
      .limit(1)
      .maybeSingle();
    if (data?.in_struttura_via === "manuale") return;
    const { error } = await supabase
      .from("utenti")
      .update({
        in_struttura: dentroRaggio,
        in_struttura_dal: new Date().toISOString(),
        in_struttura_via: "gps",
      })
      .eq("nome", nome);
    if (error) console.error(error);
  },
  async loadManutentoriPresenza() {
    const { data, error } = await supabase
      .from("utenti")
      .select("nome, in_struttura, in_struttura_dal, in_struttura_via")
      .eq("ruolo", "manutentore")
      .order("nome");
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  },

  // ── Tabellone camere (housekeeping) ──────────────────────────────────────
  // camere_giorno: il tabellone del giorno, riscritto per intero dalla RPC
  // ad ogni caricamento file. camere_lavoro: stato lavoro delle governanti,
  // separato cosi' segnare "fatta" non tocca mai i dati Slope.
  async loadCamereGiorno() {
    const { data, error } = await supabase.from("camere_giorno").select("*");
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  },
  // Ricerca mirata di una sola camera nel tabellone del giorno: usata dal
  // form "Nuova segnalazione" per suggerire lo Stato camera (In arrivo /
  // Fermata con cliente / Libera) in base a quello che dice l'housekeeping
  // di oggi, invece di doverlo scegliere sempre a mano.
  async getCameraGiornoOggi(camera) {
    const { data, error } = await supabase
      .from("camere_giorno")
      .select("camera, stato_slope")
      .eq("camera", String(camera))
      .maybeSingle();
    if (error) return null;
    return data;
  },
  async loadCamereLavoro() {
    const { data, error } = await supabase.from("camere_lavoro").select("*");
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  },
  // `ts` (ms epoch) e' opzionale: se l'azione arriva dalla coda offline, e'
  // il momento del tocco originale, non quello (successivo) del sync, cosi'
  // il confronto "ultima modifica vince" con Realtime resta corretto.
  async segnaLavoroCamera(camera, stato, nome, ts) {
    const { error } = await supabase
      .from("camere_lavoro")
      .upsert({
        camera,
        stato,
        da_chi: nome,
        aggiornato_il: new Date(ts || Date.now()).toISOString(),
      });
    if (error) console.error(error);
    return !error;
  },
  // Modifica manuale di una camera (reception/governante): cambia stato_slope,
  // letti o note. Marca sempre manuale=true con chi e quando, cosi' resta
  // tracciabile rispetto ai dati originali del file Slope.
  async aggiornaCameraGiorno(camera, campi, nome, ts) {
    const iso = new Date(ts || Date.now()).toISOString();
    const { error } = await supabase
      .from("camere_giorno")
      .update({
        ...campi,
        manuale: true,
        manuale_da: nome,
        manuale_il: iso,
        aggiornato_il: iso,
      })
      .eq("camera", camera);
    if (error) console.error(error);
    return !error;
  },
  // Carica il file Slope del giorno (gia' anonimizzato nel browser): riscrive
  // camere_giorno e fa ripartire camere_lavoro lato server.
  async caricaCamereGiorno(nome, camere) {
    const { data, error } = await supabase.rpc("carica_camere_giorno", {
      p_caricato_da: nome,
      p_camere: camere,
    });
    if (error) {
      console.error(error);
      return { ok: false, error: error.message || String(error) };
    }
    return { ok: true, id: data };
  },
};

// UID per nuovi record (Supabase genera comunque il suo, ma serve per la UI)
export const newId = () => crypto.randomUUID();

function urgenzaFromRow(r) {
  return {
    id: r.id,
    note: r.nota,
    createdBy: r.creato_da,
    createdAt: r.creato_il ? new Date(r.creato_il).getTime() : Date.now(),
    status: r.stato,
    takenBy: r.presa_in_carico_da,
    takenAt: r.presa_in_carico_il
      ? new Date(r.presa_in_carico_il).getTime()
      : null,
    completedBy: r.completata_da,
    completedAt: r.completata_il
      ? new Date(r.completata_il).getTime()
      : null,
    trasformataInSegnalazioneId: r.trasformata_in_segnalazione_id || null,
  };
}

function prenotazioneFromRow(r) {
  return {
    id: r.id,
    room: r.sala,
    date: r.data,
    shift: r.turno,
    client: r.cliente,
    notes: r.note,
    createdBy: r.creato_da,
    createdAt: r.creato_il ? new Date(r.creato_il).getTime() : Date.now(),
  };
}
function prenotazioneToRow(p) {
  return {
    id: p.id,
    sala: p.room,
    data: p.date,
    turno: p.shift,
    cliente: p.client,
    note: p.notes || null,
    creato_da: p.createdBy,
    creato_il: p.createdAt
      ? new Date(p.createdAt).toISOString()
      : new Date().toISOString(),
  };
}
