import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jmhzmwyolxzacjunfwcq.supabase.co";
const SUPABASE_KEY = "sb_publishable_XTYCLV5jSdk3ztG7PNuL_Q_1zu3tDwJ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  };
}

function planFromRow(r) {
  return {
    id: r.id,
    room: r.camera,
    category: r.categoria,
    notes: r.note,
    scheduledAt: r.programmato_il ? new Date(r.programmato_il).getTime() : null,
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
    if (error) console.error(error);
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
};

// UID per nuovi record (Supabase genera comunque il suo, ma serve per la UI)
export const newId = () => crypto.randomUUID();

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
