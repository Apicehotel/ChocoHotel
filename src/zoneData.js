// PLACEHOLDER — Chocohotel: camere e zone ancora da definire.
// L'utente deve fornire il file camere/zone; nel frattempo qualsiasi
// numero/zona scritto viene accettato cosi' com'e' (nessuna lista chiusa),
// per non bloccare i test prima che i dati veri siano pronti.
// STESSA fonte dati da duplicare anche nella Edge Function whatsapp-webhook
// quando verra' creata per Chocohotel.

// Nessun piano ancora definito: da popolare con i piani veri di Chocohotel.
export const PIANI = [];

// Nessun numero camera ancora whitelisted: resolveCamera() accetta tutto.
export const ROOM_NUMBERS = new Set();

// Nessuna zona ancora definita.
export const ZONES = {};
export const ZONE_NAMES = Object.keys(ZONES);

// Placeholder permissivo: finche' non arrivano i dati veri, qualunque
// valore scritto (numero o testo) viene accettato come "room".
// Quando arriveranno camere/zone reali, sostituire con la stessa logica
// a lista chiusa usata da Hotel Giò (vedi versione originale in HotelGio).
export function resolveCamera(raw) {
  if (raw == null) return { ok: false };
  const rawTrim = String(raw).trim();
  if (!rawTrim) return { ok: false };
  return { ok: true, value: rawTrim, kind: "room" };
}
