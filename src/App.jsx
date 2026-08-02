import { useState, useEffect, useCallback, useRef } from "react";
import { DB, supabase, newId } from "./db.js";
import { resolveCamera, ZONE_NAMES, ROOM_NUMBERS, PIANI } from "./zoneData.js";
import NotificheSettings, { playNotifSound } from "./NotificheSettings";
import {
  playUrgentSiren,
  canInviaUrgenza,
  UrgenzaSendButton,
  UrgenzaBanner,
  UrgenzeLog,
  InStrutturaToggle,
  useAutoCheckInGPS,
  useUnlockUrgentAudio,
} from "./Urgenza";

const HOTEL_LOGO =
  "data:image/jpeg;base64,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";

const I = {
  hotel: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  ),
  msg: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  lock: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  refresh: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  logout: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  plus: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  check: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  back: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  trash: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  ),
  camera: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  image: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  phone: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  pkg: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  shield: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  list: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  wrench: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  bell: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  clock: (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  clock16: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  bed: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </svg>
  ),
  download: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  book: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  userplus: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  menu: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  droplet: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  zap: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  wind: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  ),
  hammer: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M15.45 5.05L19 8.6l-3.55 3.54-3.54-3.54z" />
      <path d="M9.09 11.09L2 18.17V22h3.83l7.08-7.08" />
    </svg>
  ),
  cal: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  users: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  wine: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 22h8" />
      <path d="M12 15v7" />
      <path d="M12 15a7 7 0 0 0 7-7V2H5v6a7 7 0 0 0 7 7z" />
    </svg>
  ),
  coffee: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  ),
  paint: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 3h16v6H2z" />
      <path d="M8 9v6a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v2" />
      <circle cx="13" cy="19" r="1" />
    </svg>
  ),
  leaf: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
};

const URG = {
  alta: { label: "Alta", fg: "#B23A2E", bg: "#FBE9E6", rank: 0 },
  media: { label: "Media", fg: "#C07A12", bg: "#FBF0DC", rank: 1 },
  bassa: { label: "Bassa", fg: "#2E7D5B", bg: "#E6F2EB", rank: 2 },
};
const CAT = {
  idraulico: { label: "Idraulico", icon: "droplet", color: "#2563EB" },
  elettrico: { label: "Elettrico", icon: "zap", color: "#D97706" },
  clima: { label: "Climatizzazione", icon: "wind", color: "#0E7490" },
  arredo: { label: "Arredo", icon: "hammer", color: "#7C5CFC" },
  edilizio: { label: "Edilizio", icon: "paint", color: "#92400E" },
  giardinaggio: { label: "Giardinaggio", icon: "leaf", color: "#16A34A" },
  filtri: { label: "Pulizia filtri", icon: "wind", color: "#0891B2" },
  idromassaggio: { label: "Idromassaggio", icon: "droplet", color: "#7C5CFC" },
  varie: { label: "Varie", icon: "wrench", color: "#6B7280" },
};
const ROOM_ST = {
  fermata_libera: { label: "Fermata libera", fg: "#7C5CFC", bg: "#EDE9FE" },
  fermata_cliente: {
    label: "Fermata con cliente",
    fg: "#B23A2E",
    bg: "#FBE9E6",
  },
  libera: { label: "Libera", fg: "#2E7D5B", bg: "#E6F2EB" },
  arrivo: { label: "In arrivo", fg: "#C07A12", bg: "#FBF0DC" },
};
const ROLES = {
  direzione: {
    label: "Direzione",
    desc: "Supervisione e statistiche",
    icon: "shield",
  },
  governante: {
    label: "Governante",
    desc: "Segnala dalle camere",
    icon: "list",
  },
  portiere_notturno: {
    label: "Portiere Notturno",
    desc: "Segnala durante il turno di notte",
    icon: "list",
  },
  manutentore: {
    label: "Manutentore",
    desc: "Esegue gli interventi",
    icon: "wrench",
  },
  reception: {
    label: "Reception",
    desc: "Segnala dal ricevimento",
    icon: "bell",
  },
  direttore_congressi: {
    label: "Direttore Centro Congressi",
    desc: "Supervisione Centro Congressi",
    icon: "cal",
  },
  sviluppatore: {
    label: "Sviluppatore",
    desc: "Accesso completo",
    icon: "shield",
  },
  responsabile_area: {
    label: "Area",
    desc: "Segnala per la propria zona",
    icon: "list",
  },
};
function roleDisplayFor(role, zones) {
  if (role !== "responsabile_area")
    return { label: ROLES[role]?.label, icon: ROLES[role]?.icon };
  const zz = (zones || []).map((z) => String(z).toLowerCase());
  if (zz.some((z) => z.includes("risto")))
    return { label: "Ristorante", icon: "wine" };
  if (zz.some((z) => z.includes("golosi")))
    return { label: "Isola dei Golosi", icon: "coffee" };
  return { label: "Area", icon: "list" };
}
// Tecnici esterni: ancora nessuno per Chocohotel, da aggiungere quando disponibili.
const DEF_TEC = [];
const DEF_USERS = [
  { id: "d1", name: "Simona", role: "direzione", pin: "0000" },
  { id: "d2", name: "Michele", role: "direzione", pin: "0000" },
  { id: "dv1", name: "Randagio", role: "sviluppatore", pin: "0000" },
  { id: "r1", name: "Reception", role: "reception", pin: "0000" },
  // Manutentori: Mauro fisso, gli altri tre in prestito da Hotel Giò
  // (stesso nome/PIN in entrambi i sistemi per il passaggio rapido tra le app).
  { id: "u1", name: "Mauro", role: "manutentore", pin: "0000" },
  { id: "u2", name: "Domenico", role: "manutentore", pin: "0000" },
  { id: "u3", name: "Aly", role: "manutentore", pin: "0000" },
  { id: "u4", name: "Patricio", role: "manutentore", pin: "0000" },
  // Portieri notturni: Fabio e Leonardo propri di Chocohotel; Michele C./Marco/Amin
  // lavorano stabilmente su entrambe le strutture (non in prestito occasionale).
  { id: "pn1", name: "Fabio", role: "portiere_notturno", pin: "0000" },
  { id: "pn2", name: "Leonardo", role: "portiere_notturno", pin: "0000" },
  { id: "pn3", name: "Michele C.", role: "portiere_notturno", pin: "0000" },
  { id: "pn4", name: "Marco", role: "portiere_notturno", pin: "0000" },
  { id: "pn5", name: "Amin", role: "portiere_notturno", pin: "0000" },
  // Governanti: segnalano e basta, come a Hotel Giò. Zone indicate per riferimento.
  { id: "g1", name: "Veronica", role: "governante", pin: "0000", zones: ["Piani"] },
  { id: "g2", name: "Olisea", role: "governante", pin: "0000", zones: ["Hotel"] },
  { id: "g3", name: "Eriona", role: "responsabile_area", pin: "0000", zones: ["Isola dei Golosi"] },
];
const ADMIN_PIN_DEFAULT = "0000";

const ST = {
  set(k, v) {
    try {
      localStorage.setItem("gm_" + k, JSON.stringify(v));
    } catch {}
  },
  get(k) {
    try {
      const v = localStorage.getItem("gm_" + k);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  del(k) {
    try {
      localStorage.removeItem("gm_" + k);
    } catch {}
  },
  all(p) {
    const o = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("gm_" + p)) {
          try {
            o[k.slice(3 + p.length)] = JSON.parse(localStorage.getItem(k));
          } catch {}
        }
      }
    } catch {}
    return o;
  },
};

const uid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
const fmt = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return (
    d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" }) +
    " · " +
    d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
  );
};
const fmtDate = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return (
    d.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }) +
    " · " +
    d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
  );
};
function compress(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const m = 1000;
        let { width: w, height: h } = img;
        if (w > h && w > m) {
          h = Math.round((h * m) / w);
          w = m;
        } else if (h > m) {
          w = Math.round((w * m) / h);
          h = m;
        }
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        res(c.toDataURL("image/jpeg", 0.62));
      };
      img.onerror = rej;
      img.src = e.target.result;
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function sortItems(arr) {
  return [...arr].sort((a, b) => {
    const ord = { todo: 0, tecnico: 1, waiting: 2, done: 3 };
    const d = (ord[a.status] ?? 0) - (ord[b.status] ?? 0);
    if (d) return d;
    if (a.status === "todo") {
      const r = (URG[a.urgency]?.rank ?? 1) - (URG[b.urgency]?.rank ?? 1);
      if (r) return r;
    }
    return a.createdAt - b.createdAt;
  });
}
function sortPlanned(arr) {
  return [...arr].sort((a, b) => {
    const sd = { pending: 0, waiting: 0, done: 1 };
    const d = (sd[a.status] ?? 0) - (sd[b.status] ?? 0);
    if (d) return d;
    return (a.scheduledAt || 0) - (b.scheduledAt || 0);
  });
}
function exportCSV(items) {
  const h = [
    "Camera",
    "Categoria",
    "Urgenza",
    "Stato",
    "Descrizione",
    "Pezzo sostituito",
    "Da",
    "Data",
  ];
  const rows = items.map((it) => [
    it.room,
    CAT[it.category]?.label || "",
    URG[it.urgency]?.label || "",
    it.status === "done"
      ? "Completata"
      : it.status === "waiting"
        ? "Attesa"
        : it.status === "tecnico"
          ? "Tecnico"
          : "Da fare",
    it.notes || "",
    it.pieceReplaced || "",
    it.createdBy || "",
    it.createdAt ? new Date(it.createdAt).toLocaleString("it-IT") : "",
  ]);
  const e = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  const csv = [h, ...rows].map((r) => r.map(e).join(";")).join("\r\n");
  const b = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u;
  a.download = "manutenzioni_" + new Date().toISOString().slice(0, 10) + ".csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(u);
}

const inputSt = {
  width: "100%",
  background: "#fff",
  border: "1px solid #E4E0D6",
  borderRadius: 11,
  padding: "12px 13px",
  fontSize: 15,
  color: "#1B2420",
  outline: "none",
  fontFamily: "inherit",
};
const ctaSt = {
  width: "100%",
  background: "#640A0A",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  padding: 14,
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label
      style={{
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 7,
      }}
    >
      {label}
    </label>
    {children}
  </div>
);
const ROOM_NUMBER_LIST = [...ROOM_NUMBERS].sort((a, b) => +a - +b);
// ── CameraZonaField: selettore Camera/Zona (sostituisce datalist nativo, che su iOS apre menu a schermo intero) ──
function CameraZonaField({
  value,
  onChange,
  placeholder,
  autoFocus,
  onModeChange,
}) {
  const [mode, setMode] = useState("camera");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef();
  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const q = value.trim().toLowerCase();
  const suggestions = q
    ? mode === "camera"
      ? ROOM_NUMBER_LIST.filter((r) => r.startsWith(q)).slice(0, 8)
      : ZONE_NAMES.filter((z) => z.toLowerCase().includes(q)).slice(0, 8)
    : [];
  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {" "}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {" "}
        {[
          ["camera", "Camera"],
          ["zona", "Zona"],
        ].map(([m, lbl]) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              onChange("");
              setOpen(false);
              onModeChange?.(m);
            }}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 9,
              border: "1.5px solid " + (mode === m ? "#640A0A" : "#E4E0D6"),
              background: mode === m ? "#640A0A" : "#fff",
              color: mode === m ? "#fff" : "#5C645E",
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            {lbl}
          </button>
        ))}{" "}
      </div>{" "}
      <input
        style={inputSt}
        inputMode={mode === "camera" ? "numeric" : "text"}
        pattern={mode === "camera" ? "[0-9]*" : undefined}
        placeholder={
          placeholder ||
          (mode === "camera"
            ? "Numero camera, es. 214"
            : "Cerca zona: Hall Jazz, Reception...")
        }
        value={value}
        onChange={(e) => {
          const v =
            mode === "camera"
              ? e.target.value.replace(/[^0-9]/g, "")
              : e.target.value;
          onChange(v);
          setOpen(!!v.trim());
        }}
        autoFocus={autoFocus}
      />{" "}
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "#fff",
            border: "1px solid #E4E0D6",
            borderRadius: 11,
            boxShadow: "0 6px 18px rgba(0,0,0,.14)",
            maxHeight: 220,
            overflowY: "auto",
            zIndex: 30,
          }}
        >
          {suggestions.map((s) => (
            <div
              key={s}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              style={{
                padding: "10px 13px",
                fontSize: 14,
                cursor: "pointer",
                borderBottom: "1px solid #F7F0E3",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}{" "}
    </div>
  );
}

// Pagina a schermo intero: usata per le sezioni che meritano spazio (es. Planning Sale)
function FullPage({ onClose, title, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "#F7F0E3",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "#640A0A",
          color: "#fff",
          padding: "calc(env(safe-area-inset-top, 0px) + 12px) 14px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Torna indietro"
          style={{
            background: "rgba(255,255,255,.14)",
            border: "none",
            color: "#fff",
            width: 34,
            height: 34,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          {I.back}
        </button>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h2>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "14px 16px calc(env(safe-area-inset-bottom, 0px) + 28px)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>{children}</div>
      </div>
    </div>
  );
}

function Sheet({ onClose, title, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(20,26,23,.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#F7F0E3",
          width: "100%",
          maxWidth: 760,
          maxHeight: "93vh",
          overflow: "auto",
          borderRadius: "20px 20px 0 0",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "#F7F0E3",
            padding: "16px 16px 6px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 2,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#fff",
              border: "1px solid #E4E0D6",
              color: "#1B2420",
              width: 34,
              height: 34,
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            {I.back}
          </button>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h2>
        </div>
        <div style={{ padding: "4px 16px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

function ManualViewer({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const lib = window.pdfjsLib;
      if (!lib || !ref.current) return;
      lib.GlobalWorkerOptions.workerSrc = window.PDFJS_WORKER_SRC;
      const pdf = await lib.getDocument("/manuale.pdf").promise;
      for (let n = 1; n <= pdf.numPages; n++) {
        if (cancelled) return;
        const page = await pdf.getPage(n);
        const vp0 = page.getViewport({ scale: 1 });
        const scale = (ref.current.clientWidth || 360) / vp0.width;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.display = "block";
        canvas.style.margin = "0 auto 10px";
        canvas.style.maxWidth = "100%";
        canvas.style.boxShadow = "0 2px 10px rgba(0,0,0,.25)";
        ref.current.appendChild(canvas);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport })
          .promise;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 85,
        background: "#1B2420",
        overflowY: "auto",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 2,
          background: "#fff",
          border: "none",
          color: "#1B2420",
          width: 38,
          height: 38,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,.3)",
        }}
      >
        {I.x}
      </button>
      <div ref={ref} style={{ padding: "60px 10px 30px" }} />
    </div>
  );
}
function ForceChangePin({ user, onDone, onFlash }) {
  const [old, setOld] = useState("");
  const [np, setNp] = useState("");
  const [np2, setNp2] = useState("");
  const [err, setErr] = useState("");
  const save = async () => {
    if (np !== np2) {
      setErr("I PIN non coincidono");
      return;
    }
    if (np === old) {
      setErr("Scegli un PIN diverso da quello attuale");
      return;
    }
    const users = await DB.loadUsers();
    const found = users.find(
      (u) =>
        u.name.trim().toLowerCase() === user.name.trim().toLowerCase() &&
        u.role === user.role,
    );
    if (!found) {
      setErr("Utente non trovato");
      return;
    }
    if (found.pin !== old) {
      setErr("PIN attuale errato");
      setOld("");
      return;
    }
    await DB.updateUserPin(user.name, user.role, np);
    onFlash("PIN aggiornato ✓");
    onDone(np);
  };
  const pIn = (val, set) => (
    <input
      style={{
        ...inputSt,
        textAlign: "center",
        fontSize: 20,
        letterSpacing: 8,
      }}
      type="password"
      inputMode="numeric"
      maxLength={4}
      placeholder="••••"
      value={val}
      onChange={(e) => set(e.target.value.replace(/\D/g, "").slice(0, 4))}
    />
  );
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#F7F0E3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {" "}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 40px rgba(0,0,0,.15)",
        }}
      >
        {" "}
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
          Imposta un nuovo PIN
        </div>{" "}
        <div style={{ fontSize: 13, color: "#5C645E", marginBottom: 16 }}>
          Per motivi di sicurezza devi cambiare il PIN prima di continuare.
        </div>{" "}
        <Field label="PIN attuale">{pIn(old, setOld)}</Field>{" "}
        <Field label="Nuovo PIN">{pIn(np, setNp)}</Field>{" "}
        <Field label="Conferma nuovo PIN">{pIn(np2, setNp2)}</Field>{" "}
        {err && (
          <div style={{ color: "#B23A2E", fontSize: 13, marginBottom: 10 }}>
            {err}
          </div>
        )}{" "}
        <button
          onClick={save}
          disabled={old.length !== 4 || np.length !== 4 || np2.length !== 4}
          style={{
            ...ctaSt,
            opacity:
              old.length !== 4 || np.length !== 4 || np2.length !== 4 ? 0.5 : 1,
          }}
        >
          {I.check} Salva PIN
        </button>{" "}
      </div>{" "}
    </div>
  );
}
// ── Planning Sale ──────────────────────────────────────────────
// Sale del centro congressi, come nel planning cartaceo.
// "parts" elenca gli spazi base occupati: serve a bloccare le combinazioni
// (es. prenotando Trumpet 1+2 non sono piu' disponibili Trumpet 1 e Trumpet 2).
const SALE_DEF = [
  { name: "Guitar", parts: ["guitar"] },
  { name: "Drums", parts: ["drums"] },
  { name: "Room", parts: ["room"] },
  { name: "Preservation", parts: ["preservation"] },
  { name: "Cool", parts: ["cool"] },
  { name: "Trumpet 1", parts: ["t1"] },
  { name: "Trumpet 2", parts: ["t2"] },
  { name: "Trumpet 3", parts: ["t3"] },
  { name: "Trumpet 4", parts: ["t4"] },
  { name: "Trumpet 1+2", parts: ["t1", "t2"] },
  { name: "Trumpet 2+3", parts: ["t2", "t3"] },
  { name: "Trumpet 3+4", parts: ["t3", "t4"] },
  { name: "Trumpet 1+2+3", parts: ["t1", "t2", "t3"] },
  { name: "Trumpet 2+3+4", parts: ["t2", "t3", "t4"] },
  { name: "Trumpet 1+2+3+4", parts: ["t1", "t2", "t3", "t4"] },
  { name: "Sax 1", parts: ["s1"] },
  { name: "Sax 2", parts: ["s2"] },
  { name: "Sax 3", parts: ["s3"] },
  { name: "Sax 1+2", parts: ["s1", "s2"] },
  { name: "Sax 2+3", parts: ["s2", "s3"] },
  { name: "Sax 1+2+3", parts: ["s1", "s2", "s3"] },
  { name: "Auditorium", parts: ["auditorium"] },
  { name: "Cantina", parts: ["cantina"] },
  { name: "Gusto", parts: ["gusto"] },
  { name: "Cravatte", parts: ["cravatte"] },
  { name: "Sala delle Feste", parts: ["feste"] },
];
const SALE_CONGRESSI = SALE_DEF.map((s) => s.name);
const SALA_PARTS = Object.fromEntries(SALE_DEF.map((s) => [s.name, s.parts]));
// due sale sono in conflitto se condividono almeno uno spazio base
const saleInConflitto = (a, b) => {
  const pa = SALA_PARTS[a] || [];
  const pb = SALA_PARTS[b] || [];
  return pa.some((x) => pb.includes(x));
};
// Raggruppa le sale in famiglie: Trumpet e Sax hanno le combinazioni,
// le altre sono singole. Serve al form: scegli la famiglia e appaiono le combo.
const SALA_FAMILIES = (() => {
  const order = [];
  const map = {};
  for (const s of SALE_DEF) {
    const fam = s.name.startsWith("Trumpet")
      ? "Trumpet"
      : s.name.startsWith("Sax")
        ? "Sax"
        : s.name;
    if (!map[fam]) {
      map[fam] = [];
      order.push(fam);
    }
    map[fam].push(s.name);
  }
  return order.map((fam) => ({ fam, rooms: map[fam] }));
})();
// colori dei turni, come nel planning cartaceo
const SHIFT_COLORS = {
  mattina: { bg: "#E7EFFB", border: "#BBD1F0", fg: "#1D4ED8" },
  pomeriggio: { bg: "#FBE7F3", border: "#F0BFDC", fg: "#B0338B" },
  tutto_giorno: { bg: "#FBE9E6", border: "#F3CEC7", fg: "#B23A2E" },
};
const SHIFT_LABELS = {
  mattina: "Mattina",
  pomeriggio: "Pomeriggio",
  tutto_giorno: "Giornata intera",
};
const PLANNING_VIEWS = [
  { key: "giorno", label: "Giorno", days: 1 },
  { key: "settimana", label: "Settimana", days: 7 },
  { key: "quindicina", label: "Quindicina", days: 15 },
];
const WD_IT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const fmtISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDaysP = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const startOfDayP = (d) => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};
const dayLabelP = (d) =>
  `${WD_IT[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

const planningNavBtnSt = {
  padding: "9px 14px",
  borderRadius: 10,
  border: "1px solid #E4E0D6",
  background: "#fff",
  color: "#1B2420",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};


function SlotSheet({ onClose, onSave, isBusy }) {
  const [fam, setFam] = useState(null);
  const [room, setRoom] = useState(null);
  const [date, setDate] = useState(() => fmtISO(new Date()));
  const [shift, setShift] = useState("mattina");
  const [client, setClient] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const famObj = SALA_FAMILIES.find((f) => f.fam === fam);
  const hasCombo = famObj && famObj.rooms.length > 1;

  const pickFamily = (f) => {
    setFam(f.fam);
    setRoom(f.rooms.length === 1 ? f.rooms[0] : null);
  };

  const occupata = room && isBusy(room, date, shift);
  const canSave = room && date && shift && client.trim() && !occupata && !busy;

  const save = async () => {
    if (!canSave) return;
    setBusy(true);
    await onSave({ room, date, shift, client: client.trim(), notes: notes.trim() });
    setBusy(false);
  };

  const shiftBtns = [
    ["mattina", "Mattina"],
    ["pomeriggio", "Pomeriggio"],
    ["tutto_giorno", "Tutto il giorno"],
  ];

  return (
    <Sheet onClose={onClose} title="Nuova prenotazione">
      <Field label="Sala *">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {SALA_FAMILIES.map((f) => {
            const sel = fam === f.fam;
            return (
              <button
                key={f.fam}
                onClick={() => pickFamily(f)}
                style={{
                  padding: "8px 13px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1.5px solid " + (sel ? "#640A0A" : "#E4E0D6"),
                  background: sel ? "#E6F2EB" : "#fff",
                  color: sel ? "#640A0A" : "#5C645E",
                }}
              >
                {f.fam}
              </button>
            );
          })}
        </div>
      </Field>
      {hasCombo && (
        <Field label="Combinazione *">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {famObj.rooms.map((r) => {
              const sel = room === r;
              const short = r.replace(fam + " ", "");
              return (
                <button
                  key={r}
                  onClick={() => setRoom(r)}
                  style={{
                    minWidth: 44,
                    padding: "8px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "1.5px solid " + (sel ? "#640A0A" : "#E4E0D6"),
                    background: sel ? "#640A0A" : "#fff",
                    color: sel ? "#fff" : "#5C645E",
                  }}
                >
                  {short}
                </button>
              );
            })}
          </div>
        </Field>
      )}
      <Field label="Data *">
        <input
          type="date"
          style={inputSt}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
      <Field label="Turno *">
        <div style={{ display: "flex", gap: 7 }}>
          {shiftBtns.map(([k, l]) => {
            const c = SHIFT_COLORS[k];
            const sel = shift === k;
            return (
              <button
                key={k}
                onClick={() => setShift(k)}
                style={{
                  flex: 1,
                  padding: "10px 6px",
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1.5px solid " + (sel ? c.fg : "#E4E0D6"),
                  background: sel ? c.bg : "#fff",
                  color: sel ? c.fg : "#5C645E",
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
      </Field>
      {occupata && (
        <div style={{ fontSize: 12.5, color: "#B23A2E", marginBottom: 10 }}>
          {room} non e' disponibile in questo turno (sala gia' occupata o in
          conflitto con una combinazione).
        </div>
      )}
      <Field label="Cliente *">
        <input
          style={inputSt}
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Nome cliente/azienda"
        />
      </Field>
      <Field label="Note (opzionale)">
        <textarea
          style={{ ...inputSt, resize: "vertical", minHeight: 70 }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <button style={{ ...ctaSt, opacity: canSave ? 1 : 0.5 }} disabled={!canSave} onClick={save}>
        {I.check} Prenota
      </button>
    </Sheet>
  );
}
function PlanningSale({ user, onClose, onFlash }) {
  const canEdit =
    user.role === "direttore_congressi" || user.role === "sviluppatore";
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [view, setView] = useState("settimana");
  const [anchor, setAnchor] = useState(() => startOfDayP(new Date()));
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setPrenotazioni(await DB.loadPrenotazioni());
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("prenotazioni_sale_ch")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prenotazioni_sale" },
        () => load(),
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  const viewCfg = PLANNING_VIEWS.find((v) => v.key === view);
  const days = Array.from({ length: viewCfg.days }, (_, i) =>
    addDaysP(anchor, i),
  );

  const prev = () => setAnchor((a) => addDaysP(a, -viewCfg.days));
  const next = () => setAnchor((a) => addDaysP(a, viewCfg.days));
  const today = () => setAnchor(startOfDayP(new Date()));


  // disponibilita' di una sala in un turno, considerando anche le combinazioni
  // (es. Trumpet 1+2 rende occupate Trumpet 1 e Trumpet 2)
  const isBusy = (sala, dateStr, shift) => {
    const all = prenotazioni.filter(
      (p) =>
        p.date === dateStr &&
        (p.room === sala || saleInConflitto(p.room, sala)),
    );
    if (shift === "tutto_giorno") return all.length > 0;
    if (all.some((b) => b.shift === "tutto_giorno")) return true;
    return all.some((b) => b.shift === shift);
  };

  const handleSave = async ({ room, date, shift, client, notes }) => {
    if (isBusy(room, date, shift)) {
      onFlash("Sala non piu' disponibile in questo turno", false);
      setSelected(null);
      return;
    }
    const ok = await DB.savePrenotazione({
      id: newId(),
      room,
      date,
      shift,
      client,
      notes,
      createdBy: user.name,
      createdAt: Date.now(),
    });
    if (ok) {
      onFlash("Prenotazione salvata ✓");
      await load();
    } else {
      onFlash("Errore nel salvataggio", false);
    }
    setSelected(null);
  };

  const handleDelete = async (booking) => {
    if (!canEdit) return;
    if (!window.confirm(`Eliminare la prenotazione di "${booking.client}"?`))
      return;
    await DB.deletePrenotazione(booking.id);
    onFlash("Prenotazione eliminata");
    await load();
  };

  return (
    <FullPage onClose={onClose} title="Planning Sale">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {PLANNING_VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              flex: 1,
              padding: "9px 6px",
              borderRadius: 10,
              border: "1px solid #E4E0D6",
              background: view === v.key ? "#640A0A" : "#fff",
              color: view === v.key ? "#fff" : "#1B2420",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}
      >
        <button onClick={prev} style={planningNavBtnSt}>
          {"‹"}
        </button>
        <button onClick={today} style={{ ...planningNavBtnSt, flex: 1 }}>
          Oggi
        </button>
        <button onClick={next} style={planningNavBtnSt}>
          {"›"}
        </button>
      </div>

      {/* legenda turni */}
      <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          ["mattina", "Mattina"],
          ["pomeriggio", "Pomeriggio"],
          ["tutto_giorno", "Tutto il giorno"],
        ].map(([k, l]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: SHIFT_COLORS[k].bg,
                border: "1px solid " + SHIFT_COLORS[k].border,
              }}
            />
            <span style={{ fontSize: 12, color: "#5C645E" }}>{l}</span>
          </div>
        ))}
      </div>

      {/* agenda: un blocco per giorno, con le sole prenotazioni */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingBottom: canEdit ? 84 : 12,
        }}
      >
        {days.map((d) => {
          const dateStr = fmtISO(d);
          const isToday = dateStr === fmtISO(new Date());
          const dayBookings = prenotazioni
            .filter((b) => b.date === dateStr)
            .sort((a, b) => {
              const ra = SALE_CONGRESSI.indexOf(a.room);
              const rb = SALE_CONGRESSI.indexOf(b.room);
              return ra - rb;
            });
          return (
            <div
              key={dateStr}
              style={{
                border: "1px solid #E4E0D6",
                borderRadius: 12,
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "9px 12px",
                  background: isToday ? "#E6F2EB" : "#FBFAF7",
                  borderBottom: "1px solid #F0EEE7",
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: isToday ? "#640A0A" : "#1B2420",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{dayLabelP(d)}</span>
                {isToday && (
                  <span style={{ fontSize: 11, fontWeight: 700 }}>OGGI</span>
                )}
              </div>
              {dayBookings.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    fontSize: 12.5,
                    color: "#B5AF9E",
                    fontStyle: "italic",
                  }}
                >
                  Nessuna prenotazione
                </div>
              ) : (
                <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {dayBookings.map((b) => {
                    const c = SHIFT_COLORS[b.shift] || SHIFT_COLORS.tutto_giorno;
                    return (
                      <div
                        key={b.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 10px",
                          borderRadius: 9,
                          background: c.bg,
                          border: "1px solid " + c.border,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: c.fg }}>
                            {b.room}
                          </div>
                          <div
                            style={{
                              fontSize: 12.5,
                              color: "#1B2420",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {b.client}
                            {b.notes ? " \u00b7 " + b.notes : ""}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c.fg, whiteSpace: "nowrap" }}>
                          {SHIFT_LABELS[b.shift]}
                        </span>
                        {canEdit && (
                          <button
                            onClick={() => handleDelete(b)}
                            title="Elimina prenotazione"
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#B23A2E",
                              cursor: "pointer",
                              padding: 2,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {I.trash}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!canEdit && (
        <div style={{ marginTop: 12, fontSize: 12, color: "#5C645E" }}>
          Sola visualizzazione.
        </div>
      )}

      {canEdit && (
        <button
          onClick={() => setSelected(true)}
          style={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#640A0A",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: "14px 24px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 10px 30px -8px rgba(14,92,73,.6)",
            zIndex: 65,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {I.plus} Nuova prenotazione
        </button>
      )}

      {selected && (
        <SlotSheet
          onClose={() => setSelected(null)}
          onSave={handleSave}
          isBusy={isBusy}
        />
      )}
    </FullPage>
  );
}

export default function App() {
  const [user, setUser] = useState(() => ST.get("ses"));
  useAutoCheckInGPS(user);
  useUnlockUrgentAudio(user);
  const [items, setItems] = useState([]);
  const [planned, setPlanned] = useState([]);
  const [tec, setTec] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("segnalazioni"); // "segnalazioni" | "interventi"
  const [filter, setFilter] = useState("aperte");
  const [sheet, setSheet] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [toast, setToast] = useState(null);
  const [pinSheet, setPinSheet] = useState(false);
  // Avviso una-tantum per dispositivo sul bug dei PIN gia' risolto.
  // La chiave e' versionata (v1): per un futuro avviso diverso basta
  // cambiare il suffisso, senza dover toccare la logica.
  const [pinBugNotice, setPinBugNotice] = useState(
    () => !ST.get("pin_bug_notice_v1_seen"),
  );
  const dismissPinBugNotice = () => {
    ST.set("pin_bug_notice_v1_seen", true);
    setPinBugNotice(false);
  };
  // Conferma prima di passare all'altra struttura: window.location.href
  // e' impostato solo dopo che l'utente conferma nel pannello.
  const [switchConfirm, setSwitchConfirm] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" && !navigator.onLine,
  );
  const [myWorkOpen, setMyWorkOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [urgenze, setUrgenze] = useState([]);
  // Badge rosso con contatore sull'icona dell'app (come nelle app native),
  // non solo nella notifica push: Badging API, supportata da iOS 16.4+ e
  // Chrome/Android per PWA installate. Se il browser non la supporta non
  // succede nulla (nessun errore, solo nessun badge). Deve stare qui,
  // PRIMA del return condizionale piu' sotto (se (!user) return <Login/>),
  // altrimenti l'hook non verrebbe chiamato in modo coerente ad ogni
  // render e React va in crash (schermata bianca).
  useEffect(() => {
    if (user?.role !== "manutentore") return;
    if (!("setAppBadge" in navigator)) return;
    const nAperte = (urgenze || []).filter(
      (u) => u.status !== "presa_in_carico",
    ).length;
    if (nAperte > 0) {
      navigator.setAppBadge(nAperte).catch(() => {});
    } else {
      navigator.clearAppBadge?.().catch(() => {});
    }
  }, [urgenze, user]);
  const toastRef = useRef();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("urgenza");
  const [sortDir, setSortDir] = useState("asc");
  const FILTERS =
    user?.role === "responsabile_area"
      ? ["aperte", "fatte", "tutte"]
      : user?.role === "manutentore" ||
          user?.role === "direzione" ||
          user?.role === "reception"
        ? ["aperte", "tec", "att", "urg", "fatte", "tutte"]
        : ["aperte", "tec", "att", "fatte", "tutte"];
  const swipeRef = useRef(null);
  const swipeStart = useRef(null);
  const swipeAnim = useRef(null);
  const [swipeDir, setSwipeDir] = useState(null);

  const flash = (m, ok = true) => {
    setToast({ m, ok });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2500);
  };
  const REPORT_URL =
    "https://script.google.com/macros/s/AKfycbyQmNtdsN03jWice9r0FMKjEDNRmxTJo6HOUlf7c_ZmMy_NfMc3lyLNWQaUBPB9csI0Qw/exec";
  const aggiornaReport = async () => {
    flash("Aggiornamento report in corso…");
    try {
      await fetch(REPORT_URL, { method: "GET", mode: "no-cors" });
      setTimeout(() => flash("Report aggiornato ✓"), 1500);
    } catch (err) {
      flash("Errore aggiornamento report", false);
    }
  };
  const refresh = useCallback(async () => {
    const [its, plans, tecs] = await Promise.all([
      DB.loadItems(),
      DB.loadPlanned(),
      DB.loadTecnici(),
    ]);
    setItems(sortItems(its));
    setPlanned(sortPlanned(plans));
    setTec(tecs);
  }, []);
  const refreshUrgenze = useCallback(async () => {
    setUrgenze(await DB.loadUrgenze());
  }, []);
  const sendUrgenza = async (nota) => {
    await DB.addUrgenza(nota, user.name);
    await refreshUrgenze();
    try {
      await fetch(
        "https://ooqlfldcrnkudhgjnied.supabase.co/functions/v1/send-push",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roles: ["manutentore"],
            urgent: true,
            title: "🚨 Richiesta urgente",
            body: `${user.name}: ${nota}`,
          }),
        },
      );
    } catch {}
  };
  const prendiUrgenza = async (id) => {
    await DB.prendiUrgenza(id, user.name);
    await refreshUrgenze();
    flash("Presa in carico ✓");
  };
  const saveItem = async (m) => {
    setItems((prev) => sortItems([...prev.filter((i) => i.id !== m.id), m]));
    await DB.saveItem(m);
    refresh();
  };
  const removeItem = async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await DB.deleteItem(id);
    refresh();
  };
  const savePlanned = async (p) => {
    setPlanned((prev) =>
      sortPlanned([...prev.filter((i) => i.id !== p.id), p]),
    );
    await DB.savePlanned(p);
    refresh();
  };
  const removePlanned = async (id) => {
    setPlanned((prev) => prev.filter((i) => i.id !== id));
    await DB.deletePlanned(id);
    refresh();
  };
  const saveTec = async (l) => {
    setTec(l);
    await DB.saveTecnici(l);
    refresh();
  };
  const login = (role, name, mustChangePin) => {
    const u = { role, name: name.trim(), mustChangePin: !!mustChangePin };
    setUser(u);
    ST.set("ses", u);
  };
  const [allUsers, setAllUsers] = useState([]);
  useEffect(() => {
    DB.loadUsers().then((u) => setAllUsers(u));
  }, []);
  const myZones = allUsers.find((u) => u.name === user?.name)?.zones || [];
  const areaInfo =
    user && user.role === "responsabile_area"
      ? myZones
          .map((z) => String(z).toLowerCase())
          .some((z) => z.includes("risto"))
        ? { label: "Ristorante", icon: "wine" }
        : myZones
              .map((z) => String(z).toLowerCase())
              .some((z) => z.includes("golosi"))
          ? { label: "Isola dei Golosi", icon: "coffee" }
          : { label: "Area", icon: "list" }
      : null;
  const myRoleLabel = areaInfo ? areaInfo.label : ROLES[user?.role]?.label;
  const myRoleIcon = areaInfo ? areaInfo.icon : ROLES[user?.role]?.icon;
  const logout = () => {
    setUser(null);
    ST.del("ses");
  };

  const switchTab = (t) => {
    setTab(t);
    setSearch("");
  };
  const onTouchStart = (e) => {
    swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    if (!swipeStart.current) return;
    const dx = e.changedTouches[0].clientX - swipeStart.current.x;
    const dy = e.changedTouches[0].clientY - swipeStart.current.y;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx) * 0.8) {
      swipeStart.current = null;
      return;
    }
    if (tab === "segnalazioni") {
      const idx = FILTERS.indexOf(filter);
      if (dx < 0 && idx < FILTERS.length - 1) {
        setSwipeDir("left");
        setFilter(FILTERS[idx + 1]);
      } else if (dx > 0 && idx > 0) {
        setSwipeDir("right");
        setFilter(FILTERS[idx - 1]);
      }
    }
    swipeStart.current = null;
    clearTimeout(swipeAnim.current);
    swipeAnim.current = setTimeout(() => setSwipeDir(null), 300);
  };

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      await Promise.all([refresh(), refreshUrgenze()]);
      if (mounted) setLoading(false);
    })();
    // Realtime: aggiorna quando altri dispositivi cambiano i dati
    const ch = supabase
      .channel("apice-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "segnalazioni" },
        (p) => {
          if (p.eventType === "INSERT") playNotifSound();
          refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "interventi" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tecnici" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "richieste_urgenti" },
        (p) => {
          // Il suono forte parte solo se l'app e' aperta con questa scheda:
          // ad app chiusa ci pensa la notifica push (vedi sw.js).
          if (p.eventType === "INSERT" && user.role === "manutentore")
            playUrgentSiren();
          refreshUrgenze();
        },
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [user, refresh, refreshUrgenze]);

  useEffect(() => {
    const on = () => setIsOffline(false),
      off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    const fn = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [refresh]);

  useEffect(() => {
    let lastTouch = 0;
    const blockDoubleTapZoom = (e) => {
      const now = Date.now();
      if (now - lastTouch < 350) {
        e.preventDefault();
      }
      lastTouch = now;
    };
    document.addEventListener("touchend", blockDoubleTapZoom, {
      passive: false,
    });
    return () => document.removeEventListener("touchend", blockDoubleTapZoom);
  }, []);

  if (!user) return <Login onLogin={login} />;
  if (user.mustChangePin)
    return (
      <ForceChangePin
        user={user}
        onFlash={flash}
        onDone={(np) => {
          const u = { ...user, pin: np, mustChangePin: false };
          setUser(u);
          ST.set("ses", u);
        }}
      />
    );

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#F7F0E3",
          fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#640A0A",
            display: "grid",
            placeItems: "center",
            color: "#fff",
          }}
        >
          {I.hotel}
        </div>
        <div style={{ fontSize: 14, color: "#5C645E", fontWeight: 600 }}>
          Caricamento…
        </div>
      </div>
    );

  const cntPlan = {
    pending: planned.filter((p) => p.status === "pending").length,
    done: planned.filter((p) => p.status === "done").length,
  };
  const cnt = {
    todo: items.filter(
      (i) => i.status === "todo" && !i.tecnicoAskedBy,
    ).length,
    tec: items.filter(
      (i) =>
        i.status === "tecnico" ||
        (i.tecnicoAskedBy && i.status === "todo"),
    ).length,
    att: items.filter((i) => i.status === "waiting").length,
    done: items.filter((i) => i.status === "done").length + cntPlan.done,
    alta: items.filter(
      (i) =>
        i.status === "todo" && i.urgency === "alta" && !i.tecnicoAskedBy,
    ).length,
  };
  const fil = items.filter((i) => {
    const matchFilter =
      filter === "aperte"
        ? i.status === "todo" && !i.tecnicoAskedBy
        : filter === "att"
          ? i.status === "waiting"
          : filter === "tec"
            ? i.status === "tecnico" ||
              (i.tecnicoAskedBy && i.status === "todo")
            : filter === "fatte"
              ? i.status === "done"
              : true;
    if (!matchFilter) return false;
    if (
      myZones.length &&
      !myZones.some(
        (z) => String(i.room).trim().toLowerCase() === z.trim().toLowerCase(),
      )
    )
      return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(i.room).toLowerCase().includes(q) ||
      (i.notes || "").toLowerCase().includes(q) ||
      (i.createdBy || "").toLowerCase().includes(q)
    );
  });
  const sortedFil = [...fil].sort((a, b) => {
    let c = 0;
    if (sortBy === "urgenza")
      c = (URG[a.urgency]?.rank ?? 1) - (URG[b.urgency]?.rank ?? 1);
    else if (sortBy === "camera") c = compareRoom(a.room, b.room);
    else c = (a.createdAt || 0) - (b.createdAt || 0);
    return sortDir === "desc" ? -c : c;
  });

  const isAreaRole =
    user.role === "responsabile_area" || user.role === "sviluppatore";
  const cntUrgApertePerBadge = (urgenze || []).filter(
    (u) => u.status !== "presa_in_carico",
  ).length;
  const filterRow1 = isAreaRole
    ? [["aperte", "Da fare", cnt.todo]]
    : user.role === "manutentore" ||
        user.role === "direzione" ||
        user.role === "reception"
      ? [
          ["aperte", "Da fare", cnt.todo],
          ["tec", "Tecnico", cnt.tec],
          ["att", "Attesa pezzo", cnt.att],
          ["urg", "Urgenze", cntUrgApertePerBadge],
        ]
      : [
          ["aperte", "Da fare", cnt.todo],
          ["tec", "Tecnico", cnt.tec],
          ["att", "Attesa pezzo", cnt.att],
        ];

  // ruoli che gestiscono la struttura (vedono tutto)
  const isGestione =
    user.role === "direzione" ||
    user.role === "direttore_congressi" ||
    user.role === "reception" ||
    user.role === "sviluppatore";
  // ruoli operativi che vedono gli interventi
  const vedeInterventi =
    isGestione || user.role === "manutentore";
  // ruoli che vedono il Planning Sale
  const vedePlanning = vedeInterventi;

  const menuItems = [
    {
      icon: I.refresh,
      label: "Aggiorna",
      fn: () => {
        refresh();
        setMenuOpen(false);
      },
    },
    // Switch tra le due strutture: solo per chi lavora stabilmente su
    // entrambe (3 manutentori in prestito + 3 portieri notturni di Hotel Giò).
    // Stesso PIN in entrambi i sistemi, un tocco per cambiare app.
    ...(["Domenico", "Aly", "Patricio", "Michele C.", "Marco", "Amin", "Michele"].includes(
      user.name,
    )
      ? [
          {
            icon: I.hotel,
            label: "Vai a Hotel Giò",
            fn: () => {
              setSwitchConfirm("https://hotelgio.vercel.app");
              setMenuOpen(false);
            },
          },
        ]
      : []),
    ...(isGestione
      ? [
          {
            icon: I.msg,
            label: "Centro WhatsApp",
            fn: () => {
              setSheet("wa");
              setMenuOpen(false);
            },
          },
        ]
      : []),
    {
      icon: I.lock,
      label: "Cambia PIN",
      fn: () => {
        setPinSheet(true);
        setMenuOpen(false);
      },
    },
    {
      icon: I.bell,
      label: "Notifiche",
      fn: () => {
        setNotifOpen(true);
        setMenuOpen(false);
      },
    },
    {
      icon: I.book,
      label: "Manuale",
      fn: () => {
        setManualOpen(true);
        setMenuOpen(false);
      },
    },
    {
      icon: I.msg,
      label: "Feedback",
      fn: () => {
        setFeedbackOpen(true);
        setMenuOpen(false);
      },
    },
    ...(user.role === "direzione" ||
    user.role === "direttore_congressi" ||
    user.role === "sviluppatore" ||
    user.role === "reception"
      ? [
          {
            icon: I.download,
            label: "Esporta CSV",
            fn: () => {
              exportCSV(items);
              setMenuOpen(false);
            },
            disabled: !items.length,
          },
          {
            icon: I.book,
            label: "Rubrica tecnici",
            fn: () => {
              setSheet("tec");
              setMenuOpen(false);
            },
          },
          {
            icon: I.refresh,
            label: "Aggiorna report",
            fn: () => {
              aggiornaReport();
              setMenuOpen(false);
            },
          },
        ]
      : []),
    ...(vedePlanning
      ? [
          {
            icon: I.clock,
            label: "Planning Sale",
            fn: () => {
              setPlanningOpen(true);
              setMenuOpen(false);
            },
          },
        ]
      : []),
    // "Manutenzioni" non e' ancora pronta: visibile solo allo sviluppatore
    ...(user.role === "sviluppatore"
      ? [
          {
            icon: I.wrench,
            label: "Manutenzioni",
            fn: () => {
              flash("Sezione in sviluppo");
              setMenuOpen(false);
            },
          },
        ]
      : []),
  ];

  const pendingPlanned = planned.filter(
    (p) => p.status === "pending" || p.status === "waiting",
  );
  const donePlanned = planned.filter((p) => p.status === "done");
  const filteredPlanned = pendingPlanned.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(p.room).toLowerCase().includes(q) ||
      (p.notes || "").toLowerCase().includes(q) ||
      p.assignees?.some((a) => a.name.toLowerCase().includes(q))
    );
  });
  const filteredDonePlanned = donePlanned.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(p.room).toLowerCase().includes(q) ||
      (p.notes || "").toLowerCase().includes(q) ||
      p.assignees?.some((a) => a.name.toLowerCase().includes(q))
    );
  });

  return (
    <div
      style={{
        background: "#F7F0E3",
        minHeight: "100vh",
        fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif",
        color: "#1B2420",
      }}
    >
      {/* Topbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#640A0A",
          color: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,.15)",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {I.hotel}
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                Manutenzioni - Chocohotel
              </div>
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.75,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                Chocohotel
              </div>
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.2 }}>
                {myRoleLabel}
              </div>
            </div>
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                background: "rgba(255,255,255,.14)",
                border: "none",
                color: "#fff",
                width: 34,
                height: 34,
                borderRadius: 9,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {I.menu}
            </button>
          </div>
        </div>
        {/* Tab bar */}
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            borderTop: "1px solid rgba(255,255,255,.15)",
          }}
        >
          {[
            ["segnalazioni", "Segnalazioni", cnt.todo],
            ...(vedeInterventi
              ? [["interventi", "Interventi", cntPlan.pending]]
              : []),
          ].map(([k, l, n]) => (
            <button
              key={k}
              onClick={() => switchTab(k)}
              style={{
                flex: 1,
                padding: "10px 8px",
                background: "none",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                borderBottom:
                  "2px solid " + (tab === k ? "#fff" : "transparent"),
                opacity: tab === k ? 1 : 0.65,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {l}
              {n > 0 && (
                <span
                  style={{
                    background:
                      tab === k
                        ? "rgba(255,255,255,.25)"
                        : "rgba(255,255,255,.15)",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                  }}
                >
                  {n}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>
      {user.role === "manutentore" && (
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <InStrutturaToggle user={user} />
          {!(tab === "segnalazioni" && filter === "urg") && (
            <UrgenzaBanner
              urgenze={urgenze}
              user={user}
              onTake={prendiUrgenza}
            />
          )}
        </div>
      )}
      {canInviaUrgenza(user.role) && (
        <UrgenzaSendButton
          user={user}
          onSend={sendUrgenza}
          onFlash={(msg, ok = true) => flash(msg, ok)}
        />
      )}
      {/* Menu laterale */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,.35)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: 260,
              zIndex: 70,
              background: "#fff",
              boxShadow: "-8px 0 30px rgba(0,0,0,.15)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: "#640A0A",
                padding: "20px 16px 16px",
                color: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 15 }}>Menu</div>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    background: "rgba(255,255,255,.15)",
                    border: "none",
                    color: "#fff",
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {I.x}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255,255,255,.12)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(255,255,255,.2)",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                  }}
                >
                  {I[myRoleIcon]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>
                    {myRoleLabel}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {menuItems.map((v, i) => (
                <button
                  key={i}
                  onClick={v.fn}
                  disabled={v.disabled}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 20px",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #F7F0E3",
                    cursor: v.disabled ? "default" : "pointer",
                    color: v.disabled ? "#ccc" : "#1B2420",
                    fontSize: 14,
                    fontWeight: 500,
                    opacity: v.disabled ? 0.4 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: "#F7F0E3",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {v.icon}
                  </div>
                  {v.label}
                </button>
              ))}
              {/* I miei lavori — apre pagina dedicata */}
              <MyWorkBtn
                user={user}
                items={items}
                planned={planned}
                onOpen={() => {
                  setMyWorkOpen(true);
                  setMenuOpen(false);
                }}
              />
            </div>
            <div style={{ borderTop: "1px solid #F7F0E3" }}>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#B23A2E",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "#FBE9E6",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {I.logout}
                </div>
                Esci
              </button>
            </div>
          </div>
        </>
      )}
      {isOffline && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 95,
            pointerEvents: "none",
            background: "#8A6D2F",
            color: "#fff",
            padding: "10px 16px",
            fontSize: 12.5,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Sei offline — stai vedendo gli ultimi dati salvati. Le modifiche non
          verranno inviate.
        </div>
      )}
      {notifOpen && (
        <NotificheSettings
          user={user}
          flash={flash}
          onClose={() => setNotifOpen(false)}
        />
      )}
      {/* ===== TAB: SEGNALAZIONI ===== */}
      {tab === "segnalazioni" && (
        <main
          ref={swipeRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px 100px" }}
        >
          {(user.role === "direzione" ||
            user.role === "direttore_congressi" ||
            user.role === "sviluppatore" ||
            user.role === "reception") && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 10,
                marginTop: 14,
                marginBottom: 4,
              }}
            >
              {[
                ["Da fare", cnt.todo, "#B9842F"],
                ["Urgenti", cnt.alta, "#B23A2E"],
                ["Fatte", cnt.done, "#2E7D5B"],
              ].map(([k, n, c]) => (
                <div
                  key={k}
                  style={{
                    background: "#fff",
                    border: "1px solid #E4E0D6",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 26, fontWeight: 800, color: c }}>
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#5C645E",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginTop: 3,
                    }}
                  >
                    {k}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(" + filterRow1.length + ",1fr)",
              gap: 7,
              padding: "12px 0 7px",
            }}
          >
            {filterRow1.map(([k, l, n]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  padding: "8px 6px",
                  borderRadius: 11,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background:
                    filter === k
                      ? "#1B2420"
                      : k === "urg" && n > 0
                        ? "#FDEAEA"
                        : "#fff",
                  color:
                    filter === k
                      ? "#fff"
                      : k === "urg" && n > 0
                        ? "#8A0F0F"
                        : "#5C645E",
                  border:
                    "1px solid " +
                    (filter === k
                      ? "#1B2420"
                      : k === "urg" && n > 0
                        ? "#C81E1E"
                        : "#E4E0D6"),
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {l}{" "}
                <span
                  style={{
                    fontSize: 11,
                    opacity: filter === k || (k === "urg" && n > 0) ? 1 : 0.7,
                    fontWeight: k === "urg" && n > 0 ? 800 : 600,
                  }}
                >
                  {n}
                </span>
              </button>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 7,
              paddingBottom: 8,
            }}
          >
            {[
              ["fatte", "Completate", cnt.done],
              ["tutte", "Tutte", items.length],
            ].map(([k, l, n]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  padding: "8px 6px",
                  borderRadius: 11,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: filter === k ? "#1B2420" : "#fff",
                  color: filter === k ? "#fff" : "#5C645E",
                  border: "1px solid " + (filter === k ? "#1B2420" : "#E4E0D6"),
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {l} <span style={{ fontSize: 11, opacity: 0.7 }}>{n}</span>
              </button>
            ))}
          </div>
          {filter !== "urg" && (
          <>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca camera, descrizione..."
              style={{
                ...inputSt,
                paddingLeft: 36,
                paddingTop: 10,
                paddingBottom: 10,
                fontSize: 14,
                background: "#fff",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {I.x}
              </button>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: 7,
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                flex: 1,
                background: "#fff",
                border: "1px solid #E4E0D6",
                borderRadius: 11,
                padding: "9px 10px",
                fontSize: 13,
                fontWeight: 600,
                color: "#1B2420",
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              <option value="urgenza">Ordina: Urgenza</option>
              <option value="camera">Ordina: Numero camera</option>
              <option value="data">Ordina: Data</option>
            </select>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title="Inverti ordine"
              style={{
                background: "#fff",
                border: "1px solid #E4E0D6",
                color: "#1B2420",
                width: 38,
                height: 38,
                borderRadius: 11,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flexShrink: 0,
                fontSize: 15,
              }}
            >
              {sortDir === "asc" ? "↓" : "↑"}
            </button>
          </div>
          {fil.length === 0 &&
          (filter !== "fatte" || filteredDonePlanned.length === 0) ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#5C645E",
              }}
            >
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "center",
                  opacity: 0.3,
                }}
              >
                {I.bed}
              </div>
              <div style={{ fontWeight: 600, color: "#1B2420" }}>
                Nessuna segnalazione
              </div>
            </div>
          ) : (
            <>
              {sortedFil.map((it) => (
                <Card
                  key={it.id}
                  it={it}
                  onOpen={() => setSheet({ d: it })}
                  onPhoto={setViewer}
                />
              ))}
              {filter === "fatte" && vedeInterventi && filteredDonePlanned.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#5C645E",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      margin: "14px 0 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {I.cal} Interventi pianificati ·{" "}
                    {filteredDonePlanned.length}
                  </div>
                  {filteredDonePlanned.map((p) => (
                    <PlannedCard
                      key={p.id}
                      p={p}
                      user={user}
                      onOpen={() => setSheet({ pd: p })}
                    />
                  ))}
                </>
              )}
            </>
          )}
          </>
          )}
          {filter === "urg" && (
            <UrgenzeLog
              urgenze={urgenze}
              onTake={prendiUrgenza}
              canTake={user.role === "manutentore"}
            />
          )}
        </main>
      )}
      {/* ===== TAB: INTERVENTI PIANIFICATI ===== */}
      {tab === "interventi" && (
        <main
          style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px 100px" }}
        >
          {(user.role === "direzione" ||
            user.role === "direttore_congressi" ||
            user.role === "sviluppatore" ||
            user.role === "reception") &&
            cntPlan.pending > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 14,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #E4E0D6",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div
                    style={{ fontSize: 26, fontWeight: 800, color: "#1B2420" }}
                  >
                    {cntPlan.pending}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#5C645E",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginTop: 3,
                    }}
                  >
                    Da fare
                  </div>
                </div>
                <div
                  style={{
                    background: "#E6F2EB",
                    border: "1px solid #bfe2cf",
                    borderRadius: 14,
                    padding: 12,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setTab("segnalazioni");
                    setFilter("fatte");
                  }}
                >
                  <div
                    style={{ fontSize: 26, fontWeight: 800, color: "#2E7D5B" }}
                  >
                    {cntPlan.done}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#2E7D5B",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginTop: 3,
                    }}
                  >
                    Completati →
                  </div>
                </div>
              </div>
            )}

          {/* Solo Da completare — i completati vanno nella tab Segnalazioni > Completate */}
          <div style={{ position: "relative", marginTop: 10, marginBottom: 4 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca camera, nome, assegnatario..."
              style={{
                ...inputSt,
                paddingLeft: 36,
                paddingTop: 10,
                paddingBottom: 10,
                fontSize: 14,
                background: "#fff",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {I.x}
              </button>
            )}
          </div>
          {filteredPlanned.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5C645E",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  margin: "14px 0 8px",
                }}
              >
                Da completare · {filteredPlanned.length}
              </div>
              {filteredPlanned.map((p) => (
                <PlannedCard
                  key={p.id}
                  p={p}
                  user={user}
                  onOpen={() => setSheet({ pd: p })}
                />
              ))}
            </>
          )}

          {filteredPlanned.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#5C645E",
              }}
            >
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "center",
                  opacity: 0.3,
                }}
              >
                {I.cal}
              </div>
              <div style={{ fontWeight: 600, color: "#1B2420" }}>
                Nessun intervento da completare
              </div>
              {cntPlan.done > 0 && (
                <div
                  style={{
                    fontSize: 13,
                    marginTop: 6,
                    color: "#2E7D5B",
                    fontWeight: 600,
                  }}
                >
                  ✓ {cntPlan.done} completat{cntPlan.done === 1 ? "o" : "i"} —
                  vedi in Segnalazioni › Completate
                </div>
              )}
              {(user.role === "direzione" ||
                user.role === "direttore_congressi" ||
                user.role === "sviluppatore" ||
                user.role === "reception") && (
                <div style={{ fontSize: 13, marginTop: 6 }}>
                  Usa il pulsante + per crearne uno
                </div>
              )}
            </div>
          )}
        </main>
      )}
      {/* FAB */}
      <button
        onClick={() => setSheet(tab === "segnalazioni" ? "new" : "newplan")}
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: tab === "interventi" ? "#1D4ED8" : "#B9842F",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          padding: "14px 24px",
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxShadow:
            tab === "interventi"
              ? "0 10px 30px -8px rgba(29,78,216,.5)"
              : "0 10px 30px -8px rgba(185,132,47,.6)",
          zIndex: 30,
          display:
            tab === "interventi" &&
            !(
              user.role === "direzione" ||
              user.role === "direttore_congressi" ||
              user.role === "reception" ||
              user.role === "sviluppatore"
            )
              ? "none"
              : "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {I.plus}{" "}
        {tab === "segnalazioni" ? "Nuova segnalazione" : "Nuovo intervento"}
      </button>
      {sheet === "new" && (
        <NewForm
          user={user}
          zones={myZones}
          onClose={() => setSheet(null)}
          onSave={(m) => {
            saveItem(m);
            setSheet(null);
            flash("Segnalazione inviata");
          }}
        />
      )}
      {sheet === "newplan" &&
        (user.role === "direzione" ||
          user.role === "direttore_congressi" ||
          user.role === "sviluppatore" ||
          user.role === "reception") && (
          <NewPlanned
            user={user}
            tec={tec}
            onClose={() => setSheet(null)}
            onSave={(p) => {
              savePlanned(p);
              setSheet(null);
              flash("Intervento pianificato ✓");
            }}
          />
        )}
      {sheet === "wa" && (
        <WACenter
          user={user}
          items={items}
          onSave={saveItem}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === "tec" && (
        <Tecnici tec={tec} onSave={saveTec} onClose={() => setSheet(null)} />
      )}
      {sheet?.d && (
        <Detail
          user={user}
          it={items.find((i) => i.id === sheet.d.id) || sheet.d}
          tec={tec}
          onClose={() => setSheet(null)}
          onPhoto={setViewer}
          onSave={saveItem}
          onDelete={(id) => {
            removeItem(id);
            setSheet(null);
            flash("Eliminata", false);
          }}
          onFlash={flash}
        />
      )}
      {sheet?.pd && (
        <PlannedDetail
          user={user}
          p={planned.find((p) => p.id === sheet.pd.id) || sheet.pd}
          onClose={() => setSheet(null)}
          onSave={savePlanned}
          onDelete={(id) => {
            removePlanned(id);
            setSheet(null);
            flash("Eliminato", false);
          }}
          onFlash={flash}
          onPhoto={(src) => setViewer(src)}
        />
      )}
      {myWorkOpen && (
        <MyWorkPage
          user={user}
          items={items}
          planned={planned}
          onClose={() => setMyWorkOpen(false)}
          onOpen={(s) => {
            setSheet(s);
            setMyWorkOpen(false);
          }}
        />
      )}
      {pinSheet && (
        <ChangePIN
          user={user}
          onClose={() => setPinSheet(false)}
          onFlash={flash}
        />
      )}{" "}
      {pinBugNotice && !user.mustChangePin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,36,32,.45)",
            zIndex: 90,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={dismissPinBugNotice}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 480,
              borderRadius: "18px 18px 0 0",
              padding: "20px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
              🔧 Bug dei PIN risolto
            </div>
            <div
              style={{
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "#3a4340",
                marginBottom: 16,
              }}
            >
              Nei giorni scorsi un errore poteva riportare alcuni PIN al
              valore iniziale <b>0000</b>. Il problema è stato corretto. Se
              da oggi il tuo PIN non funziona più, prova ad entrare con{" "}
              <b>0000</b> e poi impostane subito uno nuovo da qui sotto.
            </div>
            <button
              onClick={() => {
                dismissPinBugNotice();
                setPinSheet(true);
              }}
              style={{ ...ctaSt, marginBottom: 8 }}
            >
              Cambia il PIN ora
            </button>
            <button
              onClick={dismissPinBugNotice}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#5C645E",
                fontSize: 13,
                padding: 8,
                cursor: "pointer",
              }}
            >
              Va tutto bene, chiudi
            </button>
          </div>
        </div>
      )}
      {switchConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,36,32,.45)",
            zIndex: 90,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setSwitchConfirm(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 480,
              borderRadius: "18px 18px 0 0",
              padding: "20px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
              {I.hotel} Cambio struttura
            </div>
            <div
              style={{
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "#3a4340",
                marginBottom: 16,
              }}
            >
              Stai per uscire da questa app e passare all'altra struttura.
              Serve il tuo PIN solo se non sei già collegato.
            </div>
            <button
              onClick={() => {
                window.location.href = switchConfirm;
              }}
              style={{ ...ctaSt, marginBottom: 8 }}
            >
              Continua
            </button>
            <button
              onClick={() => setSwitchConfirm(null)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#5C645E",
                fontSize: 13,
                padding: 8,
                cursor: "pointer",
              }}
            >
              Annulla
            </button>
          </div>
        </div>
      )}
      {viewer && (
        <div
          onClick={() => setViewer(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(0,0,0,.92)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            cursor: "pointer",
          }}
        >
          <img
            src={viewer}
            alt=""
            style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 10 }}
          />
        </div>
      )}{" "}
      {manualOpen && <ManualViewer onClose={() => setManualOpen(false)} />}{" "}
      {feedbackOpen && (
        <FeedbackForm
          user={user}
          onClose={() => setFeedbackOpen(false)}
          onFlash={flash}
        />
      )}
      {planningOpen && (
        <PlanningSale
          user={user}
          onClose={() => setPlanningOpen(false)}
          onFlash={flash}
        />
      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1B2420",
            color: "#fff",
            padding: "11px 16px",
            borderRadius: 11,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 90,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {toast.ok ? I.check : I.x} {toast.m}
        </div>
      )}
    </div>
  );
}

// ── Card segnalazione ─────────────────────────────────────────────────────────
function isRoomNumber(camera) {
  return /^\d{3,4}$/.test(String(camera || "").trim());
}
function zoneFontSize(v) {
  if (isRoomNumber(v)) return 18;
  const n = String(v || "").length;
  if (n > 13) return 12;
  if (n > 9) return 14;
  return 16;
}
function compareRoom(a, b) {
  const an = isRoomNumber(a),
    bn = isRoomNumber(b);
  if (an && bn) return parseInt(a, 10) - parseInt(b, 10);
  if (an && !bn) return -1;
  if (!an && bn) return 1;
  return String(a || "").localeCompare(String(b || ""), "it", {
    sensitivity: "base",
  });
}
function Card({ it, onOpen, onPhoto }) {
  const u = URG[it.urgency] || URG.media;
  const st = it.status === "tecnico"
    ? { l: "Tecnico contattato", bg: "#FEF3C7", fg: "#92400E" }
    : it.tecnicoAskedBy && it.status === "todo"
      ? { l: "Contattare tecnico", bg: "#FEF3C7", fg: "#92400E" }
      : {
          todo: { l: "Da fare", bg: "#F1E4CC", fg: "#7a5212" },
          done: { l: "Completata", bg: "#E6F2EB", fg: "#2E7D5B" },
          waiting: { l: "Attesa pezzo", bg: "#EDE9FE", fg: "#7C3AED" },
        }[it.status] || { l: "Da fare", bg: "#F1E4CC", fg: "#7a5212" };
  return (
    <div
      onClick={onOpen}
      style={{
        background: "#fff",
        border: "1px solid #E4E0D6",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      <div style={{ width: 6, background: u.fg, flexShrink: 0 }} />
      <div style={{ padding: "12px 14px", flex: 1 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div
            style={{
              width: 88,
              minHeight: 62,
              borderRadius: 11,
              background: "#FBFAF7",
              border: "1px solid #E4E0D6",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 7,
                color: "#B9842F",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {isRoomNumber(it.room) ? "Cam." : "Zona"}
            </div>
            <div
              style={{
                fontSize: zoneFontSize(it.room),
                fontWeight: 800,
                lineHeight: 1.05,
                textAlign: "center",
                padding: "0 2px",
              }}
            >
              {it.room}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: u.bg,
                  color: u.fg,
                  textTransform: "uppercase",
                }}
              >
                {u.label}
              </span>
              {CAT[it.category] && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: CAT[it.category].color + "14",
                    color: CAT[it.category].color,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {I[CAT[it.category].icon]} {CAT[it.category].label}
                </span>
              )}
              {it.roomStatus && ROOM_ST[it.roomStatus] && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: ROOM_ST[it.roomStatus].bg,
                    color: ROOM_ST[it.roomStatus].fg,
                  }}
                >
                  {ROOM_ST[it.roomStatus].label}
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: st.bg,
                  color: st.fg,
                }}
              >
                {st.l}
              </span>
            </div>
            <div
              style={{ fontSize: 14, lineHeight: 1.4, wordBreak: "break-word" }}
            >
              {it.notes || <em style={{ color: "#5C645E" }}>Nessuna nota</em>}
            </div>
            <div style={{ fontSize: 11, color: "#5C645E", marginTop: 5 }}>
              Da {it.createdBy} · {fmt(it.createdAt)}
              {it.status === "done" && (
                <>
                  {" "}
                  ·{" "}
                  <span style={{ color: "#2E7D5B", fontWeight: 600 }}>
                    Risolta da{" "}
                    {it.tecnicoCompleted ? it.tecnicoNome : it.completedBy}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {(it.photoBefore || it.photoAfter) && (
          <div
            style={{ display: "flex", gap: 8, marginTop: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            {it.photoBefore && (
              <div>
                <img
                  src={it.photoBefore}
                  alt=""
                  onClick={() => onPhoto(it.photoBefore)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid #E4E0D6",
                    cursor: "pointer",
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    color: "#5C645E",
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  Prima
                </div>
              </div>
            )}{" "}
            {it.photoAfter && (
              <div>
                <img
                  src={it.photoAfter}
                  alt=""
                  onClick={() => onPhoto(it.photoAfter)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid #E4E0D6",
                    cursor: "pointer",
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    color: "#5C645E",
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  Dopo
                </div>
              </div>
            )}{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
} // ── Card intervento pianificato ───────────────────────────────────────────────
function PlannedCard({ p, user, onOpen }) {
  const done = p.status === "done";
  const isAssigned = p.assignees?.some(
    (a) => a.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
  );
  return (
    <div
      onClick={onOpen}
      style={{
        background: "#fff",
        border:
          "1.5px solid " +
          (done ? "#bfe2cf" : isAssigned ? "#93C5FD" : "#E4E0D6"),
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        marginBottom: 10,
        cursor: "pointer",
        opacity: done ? 0.75 : 1,
      }}
    >
      {" "}
      <div
        style={{
          width: 6,
          background: done ? "#2E7D5B" : "#1D4ED8",
          flexShrink: 0,
        }}
      />{" "}
      <div style={{ padding: "12px 14px", flex: 1 }}>
        {" "}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          {" "}
          <div
            style={{
              width: 88,
              minHeight: 62,
              borderRadius: 11,
              background: done ? "#E6F2EB" : "#EFF6FF",
              border: "1px solid " + (done ? "#bfe2cf" : "#BFDBFE"),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {" "}
            <div
              style={{
                fontSize: 7,
                color: done ? "#2E7D5B" : "#1D4ED8",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {isRoomNumber(p.room) ? "Cam." : "Zona"}
            </div>{" "}
            <div
              style={{
                fontSize: zoneFontSize(p.room),
                fontWeight: 800,
                lineHeight: 1.05,
                color: done ? "#2E7D5B" : "#1D4ED8",
                textAlign: "center",
                padding: "0 2px",
              }}
            >
              {p.room}
            </div>{" "}
          </div>{" "}
          <div style={{ flex: 1, minWidth: 0 }}>
            {" "}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 4,
                alignItems: "center",
              }}
            >
              {" "}
              {CAT[p.category] && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: CAT[p.category].color + "14",
                    color: CAT[p.category].color,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {I[CAT[p.category].icon]} {CAT[p.category].label}
                </span>
              )}{" "}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: done
                    ? "#E6F2EB"
                    : p.status === "waiting"
                      ? "#EDE9FE"
                      : "#EFF6FF",
                  color: done
                    ? "#2E7D5B"
                    : p.status === "waiting"
                      ? "#7C3AED"
                      : "#1D4ED8",
                }}
              >
                {done
                  ? "Completato"
                  : p.status === "waiting"
                    ? "Attesa pezzo"
                    : "Pianificato"}
              </span>{" "}
              {isAssigned && !done && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "#FEF3C7",
                    color: "#92400E",
                  }}
                >
                  Tu
                </span>
              )}{" "}
            </div>{" "}
            <div
              style={{ fontSize: 14, lineHeight: 1.4, wordBreak: "break-word" }}
            >
              {p.notes || <em style={{ color: "#5C645E" }}>Nessuna nota</em>}
            </div>{" "}
            {Array.isArray(p.rooms) && p.rooms.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 7, borderRadius: 4, background: "#E9F3F5", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width:
                        Math.round((Object.keys(p.roomsDone || {}).length / p.rooms.length) * 100) + "%",
                      background: "#0891B2",
                      transition: "width .3s",
                    }}
                  />
                </div>
                <div style={{ fontSize: 11.5, color: "#0E7490", marginTop: 4, fontWeight: 600 }}>
                  {Object.keys(p.roomsDone || {}).length} di {p.rooms.length} camere ·{" "}
                  {Math.round((Object.keys(p.roomsDone || {}).length / p.rooms.length) * 100)}%
                </div>
              </div>
            )}
            <div
              style={{
                fontSize: 11,
                color: "#5C645E",
                marginTop: 5,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {" "}
              {I.clock}{" "}
              {p.scheduledAt
                ? fmtDate(p.scheduledAt)
                : "Data non impostata"}{" "}
            </div>{" "}
            {p.assignees?.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  marginTop: 6,
                  flexWrap: "wrap",
                }}
              >
                {" "}
                {p.assignees.map((a, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 9px",
                      borderRadius: 999,
                      background: "#F7F0E3",
                      color: "#1B2420",
                      border: "1px solid #E4E0D6",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {" "}
                    {I[ROLES[a.role]?.icon] || I.users} {a.name}{" "}
                  </span>
                ))}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
} // ── Nuovo intervento pianificato ──────────────────────────────────────────────
function NewPlanned({ user, tec, onClose, onSave }) {
  const [room, setRoom] = useState("");
  const [cat, setCat] = useState("varie");
  const [piano, setPiano] = useState(null);
  const [notes, setNotes] = useState("");
  const [dt, setDt] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    DB.loadUsers().then((u) => setUsers(u));
  }, []);
  const eligible = users.filter((u) => u.role === "manutentore");
  /* tecnici esterni dalla rubrica, con id prefissato "ext_" per distinguerli */ const extTec =
    (tec || []).map((t) => ({
      id: "ext_" + t.id,
      name: t.nome,
      role: "esterno",
      isExt: true,
      telefono: t.telefono || "",
    }));
  const toggleA = (u) => {
    setAssignees((prev) =>
      prev.some((a) => a.id === u.id)
        ? prev.filter((a) => a.id !== u.id)
        : [
            ...prev,
            { id: u.id, name: u.name, role: u.role, isExt: u.isExt || false },
          ],
    );
  };
  const roomTrim = room.trim();
  const camCheck = roomTrim ? resolveCamera(roomTrim) : null;
  const camInvalid = !!(camCheck && !camCheck.ok);
  const camResolved = camCheck && camCheck.ok ? camCheck.value : null;
  const isFiltri = cat === "filtri" || cat === "idromassaggio";
  const pianiDisponibili =
    cat === "idromassaggio" ? PIANI.filter((pi) => pi.id.startsWith("jazz")) : PIANI;
  useEffect(() => {
    // se il piano scelto non e' piu' valido per la categoria, azzera
    if (piano && !pianiDisponibili.some((pi) => pi.id === piano.id)) setPiano(null);
  }, [cat]);
  // l'idromassaggio e' solo nelle camere pari
  const camereDelPiano = piano
    ? cat === "idromassaggio"
      ? piano.rooms.filter((r) => Number(r) % 2 === 0)
      : piano.rooms
    : [];
  const canSave = isFiltri
    ? !!piano && dt && assignees.length > 0
    : roomTrim && notes.trim() && dt && assignees.length > 0 && !camInvalid;
  const AssigneeRow = ({ u, accent }) => {
    const sel = assignees.some((a) => a.id === u.id);
    return (
      <div
        onClick={() => toggleA(u)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 13px",
          borderRadius: 12,
          border: "1.5px solid " + (sel ? accent : "#E4E0D6"),
          background: sel ? accent + "11" : "#fff",
          cursor: "pointer",
        }}
      >
        {" "}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: sel ? accent + "22" : "#F7F0E3",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            color: sel ? accent : "#5C645E",
          }}
        >
          {" "}
          {u.isExt ? I.phone : I[ROLES[u.role]?.icon] || I.users}{" "}
        </div>{" "}
        <div style={{ flex: 1 }}>
          {" "}
          <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>{" "}
          <div style={{ fontSize: 12, color: "#5C645E" }}>
            {u.isExt ? "Tecnico esterno" : ROLES[u.role]?.label}
          </div>{" "}
        </div>{" "}
        {u.isExt && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 999,
              background: "#FEF3C7",
              color: "#92400E",
            }}
          >
            EXT
          </span>
        )}{" "}
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid " + (sel ? accent : "#D1CFC8"),
            background: sel ? accent : "transparent",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {" "}
          {sel && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}{" "}
        </div>{" "}
      </div>
    );
  };
  return (
    <Sheet onClose={onClose} title="Nuovo intervento pianificato">
      {" "}
      {isFiltri ? (
        <Field label="Piano *">
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {pianiDisponibili.map((pi) => {
              const sel = piano?.id === pi.id;
              return (
                <button
                  key={pi.id}
                  onClick={() => setPiano(pi)}
                  style={{
                    padding: "9px 13px",
                    borderRadius: 11,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1.5px solid " + (sel ? "#0891B2" : "#E4E0D6"),
                    background: sel ? "#0891B211" : "#fff",
                    color: sel ? "#0E7490" : "#5C645E",
                  }}
                >
                  {pi.label}
                </button>
              );
            })}
          </div>
          {piano && (
            <div style={{ fontSize: 12, color: "#0E7490", marginTop: 8 }}>
              {camereDelPiano.length} camere da spuntare · dalla{" "}
              {camereDelPiano[0]} alla{" "}
              {camereDelPiano[camereDelPiano.length - 1]}
              {cat === "idromassaggio" && " (solo camere pari)"}
            </div>
          )}
        </Field>
      ) : (
        <Field label="Numero camera *">
          {" "}
          <CameraZonaField value={room} onChange={setRoom} autoFocus />
          {camInvalid && (
            <div style={{ fontSize: 12, color: "#B23A2E", marginTop: 6 }}>
              Numero camera o zona non valida. Controlla il numero o scegli una
              zona nota (es. Hall Jazz, Reception...).
            </div>
          )}
          {camResolved && camResolved !== roomTrim && (
            <div style={{ fontSize: 12, color: "#2E7D5B", marginTop: 6 }}>
              Zona riconosciuta: {camResolved}
            </div>
          )}{" "}
        </Field>
      )}{" "}
      <Field label="Categoria *">
        {" "}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {" "}
          {Object.entries(CAT).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setCat(k)}
              style={{
                padding: "9px 12px",
                borderRadius: 11,
                border: "1.5px solid " + (cat === k ? v.color : "#E4E0D6"),
                background: cat === k ? v.color + "14" : "#fff",
                color: cat === k ? v.color : "#5C645E",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {I[v.icon]} {v.label}
            </button>
          ))}{" "}
        </div>{" "}
      </Field>{" "}
      <Field label="Descrizione *">
        {" "}
        <textarea
          style={{
            ...inputSt,
            resize: "vertical",
            minHeight: 70,
            lineHeight: 1.5,
          }}
          placeholder="Descrivi l'intervento..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />{" "}
      </Field>{" "}
      <Field label="Data e ora prevista *">
        {" "}
        <input
          style={inputSt}
          type="datetime-local"
          value={dt}
          onChange={(e) => setDt(e.target.value)}
        />{" "}
      </Field>{" "}
      <Field label="Assegna a *">
        {" "}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {" "}
          {eligible.length === 0 && extTec.length === 0 && (
            <div style={{ fontSize: 13, color: "#5C645E", padding: "10px 0" }}>
              Nessun utente o tecnico disponibile.
            </div>
          )}{" "}
          {eligible.length > 0 && (
            <>
              {" "}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5C645E",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 2,
                }}
              >
                Personale interno
              </div>{" "}
              {eligible.map((u) => (
                <AssigneeRow key={u.id} u={u} accent="#640A0A" />
              ))}{" "}
            </>
          )}{" "}
          {extTec.length > 0 && (
            <>
              {" "}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5C645E",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  margin: "8px 0 2px",
                }}
              >
                Tecnici esterni
              </div>{" "}
              {extTec.map((u) => (
                <AssigneeRow key={u.id} u={u} accent="#D97706" />
              ))}{" "}
            </>
          )}{" "}
        </div>{" "}
      </Field>{" "}
      {!canSave && (
        <div
          style={{
            fontSize: 12,
            color: "#92400E",
            background: "#FFFBEB",
            border: "1px solid #FCD34D",
            borderRadius: 9,
            padding: "8px 12px",
            marginBottom: 12,
          }}
        >
          Compila tutti i campi (*) per pianificare l'intervento.
        </div>
      )}{" "}
      <button
        onClick={() =>
          onSave({
            id: uid(),
            room: isFiltri ? piano.label : camResolved || roomTrim,
            category: cat,
            notes: isFiltri
              ? notes.trim() || CAT[cat].label + " " + piano.label
              : notes.trim(),
            scheduledAt: dt ? new Date(dt).getTime() : null,
            assignees,
            status: "pending",
            createdBy: user.name,
            createdAt: Date.now(),
            completedBy: null,
            completedAt: null,
            rooms: isFiltri ? camereDelPiano : null,
            roomsDone: {},
          })
        }
        disabled={!canSave}
        style={{ ...ctaSt, background: "#1D4ED8", opacity: canSave ? 1 : 0.5 }}
      >
        {" "}
        {I.cal} Pianifica intervento{" "}
      </button>{" "}
    </Sheet>
  );
}
// ── Dettaglio intervento pianificato ─────────────────────────────────────────
function PlannedDetail({
  user,
  p,
  onClose,
  onSave,
  onDelete,
  onFlash,
  onPhoto,
}) {
  const done = p.status === "done";
  const waiting = p.status === "waiting";
  const isAssigned = p.assignees?.some(
    (a) => a.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
  );
  const roomsDone = p.roomsDone || {};
  const hasRooms = Array.isArray(p.rooms) && p.rooms.length > 0;
  const doneCount = Object.keys(roomsDone).length;
  const pct = hasRooms ? Math.round((doneCount / p.rooms.length) * 100) : 0;
  const canTick =
    !done &&
    (isAssigned ||
      ["manutentore", "direzione", "reception", "direttore_congressi", "sviluppatore"].includes(
        user.role,
      ));
  const toggleRoom = (r) => {
    if (!canTick) return;
    const next = { ...roomsDone };
    if (next[r]) delete next[r];
    else next[r] = { by: user.name, at: Date.now() };
    onSave({ ...p, roomsDone: next });
  };
  const canComplete =
    (user.role === "direzione" ||
      user.role === "direttore_congressi" ||
      user.role === "reception" ||
      user.role === "sviluppatore" ||
      user.role === "manutentore" ||
      (isAssigned &&
        user.role !== "governante" &&
        user.role !== "portiere_notturno")) &&
    !done &&
    !waiting;
  const canDelete =
    user.role === "direzione" ||
    user.role === "direttore_congressi" ||
    user.role === "sviluppatore" ||
    user.role === "reception";
  const canOrderPiece =
    (user.role === "manutentore" ||
      user.role === "sviluppatore" ||
      (isAssigned &&
        user.role !== "governante" &&
        user.role !== "portiere_notturno")) &&
    !done &&
    !waiting;
  const canManageWait =
    (user.role === "direzione" ||
      user.role === "direttore_congressi" ||
      user.role === "sviluppatore" ||
      user.role === "reception") &&
    waiting;
  const [showPiece, setShowPiece] = useState(false);
  const [piece, setPiece] = useState(p.pieceName || "");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showRepl, setShowRepl] = useState(false);
  const [repl, setRepl] = useState(p.pieceReplaced || "");
  const fileRef = useRef();
  const mustPhoto = false;
  const pickPhoto = async (e) => {
    const fl = e.target.files?.[0];
    if (!fl) return;
    setBusy(true);
    try {
      setPhoto(await compress(fl));
    } catch {}
    setBusy(false);
  };
  const complete = () => {
    if (mustPhoto && !photo) {
      onFlash("Foto obbligatoria per confermare il lavoro", false);
      return;
    }
    onSave({
      ...p,
      status: "done",
      photoAfter: photo,
      completedBy: user.name,
      completedAt: Date.now(),
    });
    onClose();
    onFlash("Intervento completato ✓");
  };
  const orderPiece = () => {
    if (!piece.trim()) return;
    onSave({
      ...p,
      status: "waiting",
      pieceName: piece.trim(),
      waitingSince: Date.now(),
      waitingBy: user.name,
    });
    onClose();
    onFlash("Pezzo segnalato ✓");
  };
  const pieceArrived = () => {
    onSave({
      ...p,
      status: "pending",
      pieceName: null,
      waitingSince: null,
      waitingBy: null,
      pieceArrivedAt: Date.now(),
    });
    onClose();
    onFlash("Torna in Da fare ✓");
  };
  const saveReplaced = () => {
    if (!repl.trim()) return;
    onSave({
      ...p,
      pieceReplaced: repl.trim(),
      pieceReplacedBy: user.name,
      pieceReplacedAt: Date.now(),
    });
    setShowRepl(false);
    onFlash("Pezzo sostituito registrato ✓");
  };
  const blk = (bg, bc, ch) => (
    <div
      style={{
        background: bg || "#fff",
        border: "1px solid " + (bc || "#E4E0D6"),
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
      }}
    >
      {ch}
    </div>
  );
  const dlbl = (l, c) => (
    <div
      style={{
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: c || "#5C645E",
        fontWeight: 700,
        marginBottom: 6,
      }}
    >
      {l}
    </div>
  );
  return (
    <Sheet onClose={onClose} title={"Camera " + p.room + " · Intervento"}>
      {" "}
      {canDelete && (
        <button
          onClick={() => {
            if (confirm("Eliminare?")) onDelete(p.id);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
            marginBottom: 8,
            background: "#FBE9E6",
            border: "none",
            color: "#B23A2E",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {I.trash} Elimina
        </button>
      )}{" "}
      {blk(
        null,
        null,
        <>
          {" "}
          {dlbl("Dettagli intervento")}{" "}
          {CAT[p.category] && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
                background: CAT[p.category].color + "14",
                color: CAT[p.category].color,
                marginBottom: 8,
              }}
            >
              {I[CAT[p.category].icon]} {CAT[p.category].label}
            </div>
          )}{" "}
          <div style={{ fontSize: 14, lineHeight: 1.45, marginBottom: 8 }}>
            {p.notes || "—"}
          </div>{" "}
          {hasRooms && (
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0E7490" }}>
                  {doneCount} di {p.rooms.length} camere
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#0891B2" }}>
                  {pct}%
                </span>
              </div>
              <div
                style={{
                  height: 9,
                  borderRadius: 5,
                  background: "#E9F3F5",
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: pct + "%",
                    background: "#0891B2",
                    transition: "width .3s",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.rooms.map((r) => {
                  const d = roomsDone[r];
                  return (
                    <button
                      key={r}
                      onClick={() => toggleRoom(r)}
                      title={
                        d
                          ? "Fatta da " + d.by
                          : canTick
                            ? "Tocca per spuntare"
                            : "Solo chi esegue l'intervento puo' spuntare"
                      }
                      style={{
                        minWidth: 54,
                        padding: "9px 6px",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: canTick ? "pointer" : "default",
                        border: "1.5px solid " + (d ? "#0891B2" : "#E4E0D6"),
                        background: d ? "#0891B2" : "#fff",
                        color: d ? "#fff" : "#5C645E",
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              {canTick && doneCount > 0 && (
                <div style={{ fontSize: 11, color: "#5C645E", marginTop: 8 }}>
                  Tocca di nuovo una camera per togliere la spunta.
                </div>
              )}
              {!canTick && !done && (
                <div style={{ fontSize: 11, color: "#5C645E", marginTop: 8 }}>
                  Solo chi esegue l'intervento puo' spuntare le camere.
                </div>
              )}
            </div>
          )}
          <div style={{ fontSize: 11, color: "#5C645E" }}>
            Creato da {p.createdBy} · {fmt(p.createdAt)}
          </div>{" "}
        </>,
      )}{" "}
      {blk(
        "#EFF6FF",
        "#BFDBFE",
        <>
          {" "}
          {dlbl("Data prevista", "#1D4ED8")}{" "}
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1D4ED8",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {" "}
            {I.clock16}{" "}
            {p.scheduledAt ? fmtDate(p.scheduledAt) : "Non impostata"}{" "}
          </div>{" "}
        </>,
      )}{" "}
      {blk(
        null,
        null,
        <>
          {" "}
          {dlbl("Assegnato a")}{" "}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {" "}
            {p.assignees?.map((a, i) => {
              const aWa =
                a.isExt && (a.telefono || "").replace(/[^\d+]/g, "")
                  ? "https://wa.me/" +
                    (a.telefono || "").replace(/[^\d+]/g, "").replace(/^\+/, "")
                  : null;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 11,
                    background: a.isExt ? "#FFFBEB" : "#FBFAF7",
                    border: "1px solid " + (a.isExt ? "#FCD34D" : "#E4E0D6"),
                  }}
                >
                  {" "}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: a.isExt ? "#FEF3C7" : "#640A0A14",
                      display: "grid",
                      placeItems: "center",
                      color: a.isExt ? "#92400E" : "#640A0A",
                    }}
                  >
                    {" "}
                    {a.isExt ? I.phone : I[ROLES[a.role]?.icon] || I.users}{" "}
                  </div>{" "}
                  <div style={{ flex: 1 }}>
                    {" "}
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {a.name}
                    </div>{" "}
                    <div style={{ fontSize: 12, color: "#5C645E" }}>
                      {a.isExt ? "Tecnico esterno" : ROLES[a.role]?.label}
                    </div>{" "}
                  </div>{" "}
                  {aWa && (
                    <a
                      href={aWa}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#25D366",
                        color: "#fff",
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        textDecoration: "none",
                      }}
                    >
                      {" "}
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.21-1.1a7.93 7.93 0 0 0 3.8.97h0a7.95 7.95 0 0 0 5.59-13.55zm-5.55 12.2h0a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.6 6.6 0 1 1 12.27-3.5 6.56 6.56 0 0 1-6.68 6.6zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.45.1-.52.64-.64.78-.23.15-.43.05a5.42 5.42 0 0 1-1.6-.98 5.99 5.99 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4s.2-.23.3-.35a1.4 1.4 0 0 0 .2-.33.36.36 0 0 0 0-.35c0-.1-.45-1.08-.62-1.48s-.33-.33-.45-.33-.25 0-.38 0a.74.74 0 0 0-.53.25 2.23 2.23 0 0 0-.7 1.66 3.88 3.88 0 0 0 .82 2.05 8.86 8.86 0 0 0 3.39 3 11.5 11.5 0 0 0 1.13.42 2.7 2.7 0 0 0 1.25.08 2.04 2.04 0 0 0 1.34-.94 1.65 1.65 0 0 0 .12-.94c-.05-.1-.18-.15-.39-.25z" />
                      </svg>{" "}
                    </a>
                  )}{" "}
                  {a.isExt && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 999,
                        background: "#FEF3C7",
                        color: "#92400E",
                      }}
                    >
                      EXT
                    </span>
                  )}{" "}
                </div>
              );
            })}{" "}
          </div>{" "}
        </>,
      )}{" "}
      {/* Attesa pezzo */}{" "}
      {waiting &&
        blk(
          "#EDE9FE18",
          "#C4B5FD",
          <>
            {" "}
            {dlbl("In attesa del pezzo", "#7C3AED")}{" "}
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {p.pieceName}
            </div>{" "}
            <div style={{ fontSize: 11, color: "#5C645E", marginBottom: 10 }}>
              Da {p.waitingBy} · {fmt(p.waitingSince)}
            </div>{" "}
            {p.pieceDecision ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #C4B5FD",
                  borderRadius: 9,
                  padding: "8px 11px",
                  fontSize: 13,
                  color: "#7C3AED",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {" "}
                {I.pkg} <strong>{p.pieceDecisionBy}</strong>{" "}
                {p.pieceDecision === "ritiro"
                  ? "andrà a ritirarlo"
                  : "lo ordinerà"}{" "}
              </div>
            ) : (
              canManageWait && (
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  {" "}
                  <button
                    onClick={() =>
                      onSave({
                        ...p,
                        pieceDecision: "ritiro",
                        pieceDecisionBy: user.name,
                        pieceDecisionAt: Date.now(),
                      })
                    }
                    style={{
                      flex: 1,
                      background: "#7C3AED",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    🚗 Vado a prenderlo
                  </button>{" "}
                  <button
                    onClick={() =>
                      onSave({
                        ...p,
                        pieceDecision: "ordine",
                        pieceDecisionBy: user.name,
                        pieceDecisionAt: Date.now(),
                      })
                    }
                    style={{
                      flex: 1,
                      background: "#fff",
                      color: "#7C3AED",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: "1.5px solid #C4B5FD",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    {I.pkg} Lo ordino
                  </button>{" "}
                </div>
              )
            )}{" "}
            {canManageWait && (
              <button
                onClick={pieceArrived}
                style={{ ...ctaSt, background: "#7C3AED" }}
              >
                {I.pkg} Pezzo arrivato → Da fare
              </button>
            )}{" "}
            {!canManageWait && (
              <div style={{ fontSize: 13, color: "#7C3AED" }}>
                In attesa che la direzione gestisca il pezzo.
              </div>
            )}{" "}
          </>,
        )}{" "}
      {done &&
        blk(
          "#E6F2EB18",
          "#bfe2cf",
          <>
            {" "}
            {dlbl("Completato", "#2E7D5B")}{" "}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
              }}
            >
              {" "}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#2E7D5B22",
                  display: "grid",
                  placeItems: "center",
                  color: "#2E7D5B",
                  flexShrink: 0,
                }}
              >
                {I.check}
              </div>{" "}
              <div>
                {" "}
                <div style={{ fontWeight: 700 }}>{p.completedBy}</div>{" "}
                <div style={{ fontSize: 11, color: "#5C645E" }}>
                  {fmt(p.completedAt)}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {p.photoAfter && (
              <div
                style={{
                  marginTop: 10,
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <img
                  src={p.photoAfter}
                  alt=""
                  onClick={() => onPhoto && onPhoto(p.photoAfter)}
                  style={{
                    width: 110,
                    height: 110,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: "1px solid #E4E0D6",
                    display: "block",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: 10, color: "#5C645E", marginTop: 4 }}>
                  Foto di conferma
                </span>
              </div>
            )}{" "}
          </>,
        )}{" "}
      {p.pieceReplaced &&
        blk(
          "#F5F3FF",
          "#DDD6FE",
          <>
            {dlbl("Pezzo sostituito", "#6D28D9")}
            <div style={{ fontSize: 14, lineHeight: 1.4, marginBottom: 6 }}>
              {p.pieceReplaced}
            </div>
            <div style={{ fontSize: 11, color: "#5C645E" }}>
              Da {p.pieceReplacedBy} · {fmt(p.pieceReplacedAt)}
            </div>
          </>,
        )}{" "}
      {/* Azioni */}{" "}
      {canComplete && (
        <>
          {" "}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={pickPhoto}
          />{" "}
          {photo ? (
            <div
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #E4E0D6",
                marginBottom: 10,
              }}
            >
              <img
                src={photo}
                alt=""
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: 220,
                  objectFit: "cover",
                }}
              />
              <button
                onClick={() => setPhoto(null)}
                style={{
                  position: "absolute",
                  top: 7,
                  right: 7,
                  background: "rgba(0,0,0,.7)",
                  color: "#fff",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {I.x}
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border:
                  "1.5px dashed " +
                  (mustPhoto && !photo ? "#E0A03A" : "#E4E0D6"),
                borderRadius: 12,
                padding: 14,
                textAlign: "center",
                background: mustPhoto && !photo ? "#FFFBEB" : "#FBFAF7",
                cursor: "pointer",
                color: mustPhoto && !photo ? "#92400E" : "#5C645E",
                marginBottom: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              {I.image}
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {busy
                  ? "Elaborazione..."
                  : mustPhoto
                    ? "Foto obbligatoria *"
                    : "Foto (opzionale)"}
              </span>
            </div>
          )}{" "}
          <button
            onClick={complete}
            disabled={busy || (mustPhoto && !photo)}
            style={{
              ...ctaSt,
              background: "#2E7D5B",
              marginBottom: 10,
              opacity: busy || (mustPhoto && !photo) ? 0.5 : 1,
            }}
          >
            {I.check} Segna completato
          </button>{" "}
        </>
      )}{" "}
      {canOrderPiece && !showRepl && (
        <button
          onClick={() => setShowRepl(true)}
          style={{ ...ctaSt, background: "#640A0A", marginBottom: 10 }}
        >
          {I.pkg} Pezzo sostituito
        </button>
      )}{" "}
      {canOrderPiece && showRepl && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {" "}
          <input
            style={inputSt}
            placeholder="Cosa hai sostituito..."
            value={repl}
            onChange={(e) => setRepl(e.target.value)}
            autoFocus
          />{" "}
          <div style={{ display: "flex", gap: 8 }}>
            {" "}
            <button
              onClick={saveReplaced}
              disabled={!repl.trim()}
              style={{
                ...ctaSt,
                background: "#640A0A",
                flex: 1,
                opacity: repl.trim() ? 1 : 0.5,
              }}
            >
              {I.check} Conferma
            </button>{" "}
            <button
              onClick={() => setShowRepl(false)}
              style={{
                ...ctaSt,
                background: "#E4E0D6",
                color: "#1B2420",
                flex: "0 0 44px",
              }}
            >
              {I.x}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {canOrderPiece && !showPiece && (
        <button
          onClick={() => setShowPiece(true)}
          style={{ ...ctaSt, background: "#7C3AED" }}
        >
          {I.pkg} Serve un pezzo
        </button>
      )}{" "}
      {canOrderPiece && showPiece && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {" "}
          <input
            style={inputSt}
            placeholder="Nome del pezzo..."
            value={piece}
            onChange={(e) => setPiece(e.target.value)}
            autoFocus
          />{" "}
          <div style={{ display: "flex", gap: 8 }}>
            {" "}
            <button
              onClick={orderPiece}
              disabled={!piece.trim()}
              style={{
                ...ctaSt,
                background: "#7C3AED",
                flex: 1,
                opacity: piece.trim() ? 1 : 0.5,
              }}
            >
              {I.check} Conferma
            </button>{" "}
            <button
              onClick={() => setShowPiece(false)}
              style={{
                ...ctaSt,
                background: "#E4E0D6",
                color: "#1B2420",
                flex: "0 0 44px",
              }}
            >
              {I.x}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {!canComplete && !canOrderPiece && !done && !waiting && (
        <div
          style={{
            background: "#FBF0DC",
            border: "1px solid #efdcb4",
            borderRadius: 11,
            padding: "10px 13px",
            fontSize: 13,
            color: "#7a5212",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {I.clock16} In attesa di completamento.
        </div>
      )}{" "}
    </Sheet>
  );
} // ── NewForm segnalazione ──────────────────────────────────────────────────────
function NewForm({ user, onClose, onSave, zones }) {
  const [room, setRoom] = useState("");
  const [urg, setUrg] = useState("media");
  const [cat, setCat] = useState("varie");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [roomStatus, setRoomStatus] = useState(null);
  const canSetRoomStatus =
    user.role !== "manutentore" && user.role !== "responsabile_area";
  const [camMode, setCamMode] = useState("camera");
  useEffect(() => {
    if (zones && zones.length === 1 && !room) setRoom(zones[0]);
  }, []);
  const f = useRef();
  const pick = async (e) => {
    const fl = e.target.files?.[0];
    if (!fl) return;
    setBusy(true);
    try {
      setPhoto(await compress(fl));
    } catch {}
    setBusy(false);
  };
  const hasZones = zones && zones.length >= 1;
  const roomTrim = room.trim();
  const camCheck = !hasZones && roomTrim ? resolveCamera(roomTrim) : null;
  const camInvalid = !!(camCheck && !camCheck.ok);
  const camResolved = camCheck && camCheck.ok ? camCheck.value : null;
  return (
    <Sheet onClose={onClose} title="Nuova segnalazione">
      {" "}
      <Field label="Numero camera">
        {zones && zones.length === 1 ? (
          <input style={inputSt} value={zones[0]} disabled />
        ) : zones && zones.length > 1 ? (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {zones.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setRoom(z)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #E4E0D6",
                  background: room === z ? "#1B2420" : "#fff",
                  color: room === z ? "#fff" : "#1B2420",
                  fontWeight: 600,
                }}
              >
                {z}
              </button>
            ))}
          </div>
        ) : (
          <>
            <CameraZonaField
              value={room}
              onChange={setRoom}
              autoFocus
              onModeChange={setCamMode}
            />
            {camInvalid && (
              <div style={{ fontSize: 12, color: "#B23A2E", marginTop: 6 }}>
                Numero camera o zona non valida. Controlla il numero o scegli
                una zona nota (es. Hall Jazz, Reception...).
              </div>
            )}
            {camResolved && camResolved !== roomTrim && (
              <div style={{ fontSize: 12, color: "#2E7D5B", marginTop: 6 }}>
                Zona riconosciuta: {camResolved}
              </div>
            )}
          </>
        )}
      </Field>{" "}
      {canSetRoomStatus && camMode === "camera" && (
        <Field label="Stato camera">
          {" "}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}
          >
            {" "}
            {Object.entries(ROOM_ST).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setRoomStatus(roomStatus === k ? null : k)}
                style={{
                  padding: "10px 8px",
                  borderRadius: 11,
                  border:
                    "1.5px solid " + (roomStatus === k ? v.fg : "#E4E0D6"),
                  background: roomStatus === k ? v.bg : "#fff",
                  color: roomStatus === k ? v.fg : "#5C645E",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {v.label}
              </button>
            ))}{" "}
          </div>{" "}
        </Field>
      )}{" "}
      <Field label="Urgenza">
        {" "}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 7,
          }}
        >
          {" "}
          {Object.entries(URG).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setUrg(k)}
              style={{
                padding: "11px 6px",
                borderRadius: 11,
                border: "1.5px solid " + (urg === k ? v.fg : "#E4E0D6"),
                background: urg === k ? v.bg : "#fff",
                color: urg === k ? v.fg : "#5C645E",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {v.label}
            </button>
          ))}{" "}
        </div>{" "}
      </Field>{" "}
      <Field label="Categoria">
        {" "}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {" "}
          {Object.entries(CAT).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setCat(k)}
              style={{
                padding: "9px 12px",
                borderRadius: 11,
                border: "1.5px solid " + (cat === k ? v.color : "#E4E0D6"),
                background: cat === k ? v.color + "14" : "#fff",
                color: cat === k ? v.color : "#5C645E",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {I[v.icon]} {v.label}
            </button>
          ))}{" "}
        </div>{" "}
      </Field>{" "}
      <Field label="Descrizione">
        <textarea
          style={{
            ...inputSt,
            resize: "vertical",
            minHeight: 80,
            lineHeight: 1.5,
          }}
          placeholder="Descrivi il problema..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>{" "}
      <Field label="Foto">
        {" "}
        <input
          ref={f}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={pick}
        />{" "}
        {photo ? (
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #E4E0D6",
            }}
          >
            <img
              src={photo}
              alt=""
              style={{
                width: "100%",
                display: "block",
                maxHeight: 260,
                objectFit: "cover",
              }}
            />
            <button
              onClick={() => setPhoto(null)}
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                background: "rgba(0,0,0,.7)",
                color: "#fff",
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              {I.x}
            </button>
          </div>
        ) : (
          <div
            onClick={() => f.current?.click()}
            style={{
              border: "1.5px dashed #E4E0D6",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
              background: "#FBFAF7",
              cursor: "pointer",
              color: "#5C645E",
            }}
          >
            {busy ? (
              <span>Elaborazione...</span>
            ) : (
              <>
                {I.camera}
                <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600 }}>
                  Scatta o carica
                </div>
              </>
            )}
          </div>
        )}{" "}
      </Field>{" "}
      <button
        style={{
          ...ctaSt,
          background: "#B9842F",
          opacity: !roomTrim || busy || camInvalid ? 0.5 : 1,
        }}
        disabled={!roomTrim || busy || camInvalid}
        onClick={() =>
          onSave({
            id: uid(),
            room: camResolved || roomTrim,
            urgency: urg,
            category: cat,
            notes: notes.trim(),
            roomStatus,
            photoBefore: photo,
            photoAfter: null,
            status: "todo",
            createdBy: user.name,
            createdAt: Date.now(),
            completedBy: null,
            completedAt: null,
          })
        }
      >
        {I.plus} Invia segnalazione
      </button>{" "}
    </Sheet>
  );
} // ── Detail segnalazione ───────────────────────────────────────────────────────
function Detail({
  user,
  it,
  tec,
  onClose,
  onPhoto,
  onSave,
  onDelete,
  onFlash,
}) {
  const u = URG[it.urgency] || URG.media;
  const done = it.status === "done",
    wait = it.status === "waiting",
    needT = it.status === "tecnico",
    active = !done && !wait && !needT;
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [piece, setPiece] = useState(it.pieceName || "");
  const [showW, setShowW] = useState(false);
  const [showT, setShowT] = useState(false);
  const [showRepl, setShowRepl] = useState(false);
  const [repl, setRepl] = useState(it.pieceReplaced || "");
  const [lCalled, setLCalled] = useState(!!it.tecnicoCalledBy);
  const [lCalledAt] = useState(() => Date.now());
  const f = useRef();
  const calledBy = it.tecnicoCalledBy || (lCalled ? user.name : null);
  const calledAt = it.tecnicoCalledAt || (lCalled ? lCalledAt : null);
  const canFix =
    (user.role === "manutentore" ||
      user.role === "sviluppatore" ||
      user.role === "direzione" ||
      user.role === "direttore_congressi" ||
      user.role === "reception") &&
    active;
  const canMW =
    user.role === "direzione" ||
    user.role === "direttore_congressi" ||
    user.role === "sviluppatore" ||
    user.role === "reception";
  const canCall =
    (user.role === "direzione" ||
      user.role === "direttore_congressi" ||
      user.role === "sviluppatore" ||
      user.role === "reception") &&
    needT;
  const canReqT =
    (user.role === "sviluppatore" ||
      user.role === "direzione" ||
      user.role === "direttore_congressi" ||
      user.role === "reception") &&
    active;
  // Il manutentore non chiama piu' un tecnico direttamente: puo' chiedere a
  // chi puo' farlo (reception/direzione/direttore congressi) di occuparsene.
  const canAskTecnico =
    user.role === "manutentore" && active && !it.tecnicoAskedBy;
  const [askingTecnico, setAskingTecnico] = useState(false);
  const askTecnico = async () => {
    setAskingTecnico(true);
    try {
      onSave({
        ...it,
        tecnicoAskedBy: user.name,
        tecnicoAskedAt: Date.now(),
      });
      await fetch(
        "https://ooqlfldcrnkudhgjnied.supabase.co/functions/v1/send-push",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roles: ["reception", "direzione"],
            title: "🔔 Serve un tecnico",
            body:
              user.name +
              " chiede di contattare un tecnico — Camera " +
              it.room +
              (CAT[it.category] ? " · " + CAT[it.category].label : ""),
          }),
        },
      );
      onFlash("Richiesta inviata a reception/direzione ✓");
    } catch {
      onFlash("Errore nell'invio della richiesta", false);
    }
    setAskingTecnico(false);
  };
  const canOrdP =
    (user.role === "manutentore" || user.role === "sviluppatore") && active;
  const pick = async (e) => {
    const fl = e.target.files?.[0];
    if (!fl) return;
    setBusy(true);
    try {
      setPhoto(await compress(fl));
    } catch {}
    setBusy(false);
  };
  const mustPhoto = false;
  const complete = () => {
    if (mustPhoto && !photo) {
      onFlash("Foto obbligatoria per confermare il lavoro", false);
      return;
    }
    onSave({
      ...it,
      status: "done",
      photoAfter: photo,
      completedBy: user.name,
      completedAt: Date.now(),
    });
    onClose();
    onFlash("Completato ✓");
  };
  const setWait = () => {
    if (!piece.trim()) return;
    onSave({
      ...it,
      status: "waiting",
      pieceName: piece.trim(),
      waitingSince: Date.now(),
      waitingBy: user.name,
    });
    onClose();
    onFlash("Pezzo segnalato ✓");
  };
  const pieceArr = () => {
    onSave({ ...it, status: "todo", pieceArrivedAt: Date.now() });
    onClose();
    onFlash("Torna in Da fare ✓");
  };
  const saveReplaced = () => {
    if (!repl.trim()) return;
    onSave({
      ...it,
      pieceReplaced: repl.trim(),
      pieceReplacedBy: user.name,
      pieceReplacedAt: Date.now(),
    });
    setShowRepl(false);
    onFlash("Pezzo sostituito registrato ✓");
  };
  const reqTec = (t) => {
    onSave({
      ...it,
      status: "tecnico",
      tecnicoId: t.id,
      tecnicoNome: t.nome,
      tecnicoTelefono: t.telefono || "",
      tecnicoRequestedBy: user.name,
      tecnicoRequestedAt: Date.now(),
      tecnicoCalledBy: null,
      tecnicoCalledAt: null,
    });
    setShowT(false);
    onClose();
    onFlash("Tecnico richiesto ✓");
  };
  const waMsg = encodeURIComponent(
    "Ciao " +
      it.tecnicoNome +
      ", c'è un intervento da fare in camera " +
      it.room +
      (CAT[it.category] ? " (" + CAT[it.category].label + ")" : "") +
      ".\n\n" +
      (it.notes ? "Descrizione: " + it.notes + "\n\n" : "") +
      "Urgenza: " +
      (URG[it.urgency]?.label || "") +
      (it.photoBefore ? "\n\n📷 Ti mando subito la foto." : ""),
  );
  const waNum = (it.tecnicoTelefono || "").replace(/[^\d+]/g, "");
  const waLink = waNum
    ? "https://wa.me/" + waNum.replace(/^\+/, "") + "?text=" + waMsg
    : null;
  const markCalled = () => {
    setLCalled(true);
    onSave({ ...it, tecnicoCalledBy: user.name, tecnicoCalledAt: Date.now() });
    onFlash("Chiamata registrata ✓");
  };
  const techDone = () => {
    onSave({
      ...it,
      status: "done",
      completedBy: it.tecnicoNome,
      completedAt: Date.now(),
      tecnicoCompleted: true,
    });
    onClose();
    onFlash("Completato ✓");
  };
  const blk = (bg, bc, ch) => (
    <div
      style={{
        background: bg || "#fff",
        border: "1px solid " + (bc || "#E4E0D6"),
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
      }}
    >
      {ch}
    </div>
  );
  const dlbl = (l, c) => (
    <div
      style={{
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: c || "#5C645E",
        fontWeight: 700,
        marginBottom: 6,
      }}
    >
      {l}
    </div>
  );
  const savePieceDecision = (ans) => {
    onSave({
      ...it,
      pieceDecision: ans,
      pieceDecisionBy: user.name,
      pieceDecisionAt: Date.now(),
    });
    onFlash(ans === "ritiro" ? "Vai a ritirarlo 🚗" : "Verrà ordinato 📦");
  };
  return (
    <Sheet onClose={onClose} title={"Camera " + it.room}>
      {" "}
      {(user.role === "direzione" ||
        user.role === "direttore_congressi" ||
        user.role === "sviluppatore" ||
        user.role === "reception" ||
        ((user.role === "governante" || user.role === "sviluppatore") &&
          it.createdBy === user.name) ||
        ((user.role === "portiere_notturno" || user.role === "sviluppatore") &&
          it.createdBy === user.name) ||
        ((user.role === "responsabile_area" || user.role === "sviluppatore") &&
          it.createdBy === user.name)) && (
        <button
          onClick={() => {
            if (confirm("Eliminare?")) onDelete(it.id);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
            marginBottom: 8,
            background: "#FBE9E6",
            border: "none",
            color: "#B23A2E",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {I.trash} Elimina
        </button>
      )}{" "}
      {blk(
        null,
        null,
        <>
          {dlbl("Problema segnalato")}
          {it.roomStatus && ROOM_ST[it.roomStatus] && (
            <span
              style={{
                display: "inline-block",
                fontSize: 12,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 999,
                background: ROOM_ST[it.roomStatus].bg,
                color: ROOM_ST[it.roomStatus].fg,
                marginBottom: 8,
              }}
            >
              {ROOM_ST[it.roomStatus].label}
            </span>
          )}
          <div style={{ fontSize: 14, lineHeight: 1.45, marginBottom: 8 }}>
            {it.notes || "—"}
          </div>
          <div style={{ fontSize: 11, color: "#5C645E" }}>
            Da {it.createdBy} · {fmt(it.createdAt)}
          </div>
          {it.photoBefore && (
            <div
              style={{
                marginTop: 10,
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <img
                src={it.photoBefore}
                alt=""
                onClick={() => onPhoto(it.photoBefore)}
                style={{
                  width: 110,
                  height: 110,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid #E4E0D6",
                  display: "block",
                  cursor: "pointer",
                }}
              />
              <span style={{ fontSize: 10, color: "#5C645E", marginTop: 4 }}>
                Tocca per ingrandire
              </span>
            </div>
          )}
        </>,
      )}{" "}
      {it.tecnicoAskedBy &&
        it.status === "todo" &&
        blk(
          "#FFFBEB",
          "#FCD34D",
          <>
            {dlbl("Contattare tecnico", "#92400E")}
            <div
              style={{
                fontSize: 13,
                color: "#78350F",
                marginBottom: 6,
                lineHeight: 1.4,
              }}
            >
              {it.tecnicoAskedBy} chiede di contattare un tecnico.
            </div>
            <div style={{ fontSize: 11, color: "#92400E" }}>
              {fmt(it.tecnicoAskedAt)}
            </div>
          </>,
        )}
      {needT &&
        blk(
          "#FFFBEB",
          "#FCD34D",
          <>
            {dlbl("Tecnico contattato", "#92400E")}
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#78350F",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {I.phone} {it.tecnicoNome}
            </div>
            <div style={{ fontSize: 11, color: "#92400E", marginBottom: 10 }}>
              Da {it.tecnicoRequestedBy} · {fmt(it.tecnicoRequestedAt)}
            </div>
            {calledBy ? (
              <>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #FCD34D",
                    borderRadius: 9,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: "#92400E",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {I.check} Chiamato da <strong>{calledBy}</strong> ·{" "}
                  {fmt(calledAt)}
                </div>
                {canCall && (
                  <button
                    onClick={techDone}
                    style={{ ...ctaSt, background: "#2E7D5B" }}
                  >
                    {I.check} Intervento completato
                  </button>
                )}
              </>
            ) : (
              canCall && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {it.photoBefore && (
                    <button
                      onClick={() => onPhoto(it.photoBefore)}
                      style={{
                        ...ctaSt,
                        background: "#fff",
                        color: "#92400E",
                        border: "1.5px solid #FCD34D",
                        fontSize: 13,
                        padding: "10px 6px",
                      }}
                    >
                      {I.image} Apri foto (tieni premuto per salvarla)
                    </button>
                  )}
                  <div style={{ display: "flex", gap: 7 }}>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          background: "#25D366",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 14,
                          padding: 14,
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          textDecoration: "none",
                        }}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.21-1.1a7.93 7.93 0 0 0 3.8.97h0a7.95 7.95 0 0 0 5.59-13.55zm-5.55 12.2h0a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.6 6.6 0 1 1 12.27-3.5 6.56 6.56 0 0 1-6.68 6.6zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.45.1-.52.64-.64.78-.23.15-.43.05a5.42 5.42 0 0 1-1.6-.98 5.99 5.99 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4s.2-.23.3-.35a1.4 1.4 0 0 0 .2-.33.36.36 0 0 0 0-.35c0-.1-.45-1.08-.62-1.48s-.33-.33-.45-.33-.25 0-.38 0a.74.74 0 0 0-.53.25 2.23 2.23 0 0 0-.7 1.66 3.88 3.88 0 0 0 .82 2.05 8.86 8.86 0 0 0 3.39 3 11.5 11.5 0 0 0 1.13.42 2.7 2.7 0 0 0 1.25.08 2.04 2.04 0 0 0 1.34-.94 1.65 1.65 0 0 0 .12-.94c-.05-.1-.18-.15-.39-.25z" />
                        </svg>{" "}
                        Apri chat
                      </a>
                    )}
                    <button
                      onClick={markCalled}
                      style={{ ...ctaSt, background: "#D97706", flex: 1 }}
                    >
                      {I.phone} Ho chiamato
                    </button>
                  </div>
                </div>
              )
            )}
            {!canCall && !calledBy && (
              <div style={{ fontSize: 13, color: "#92400E" }}>
                In attesa che direzione/reception chiami {it.tecnicoNome}.
              </div>
            )}
          </>,
        )}{" "}
      {wait &&
        blk(
          "#EDE9FE18",
          "#C4B5FD",
          <>
            {dlbl("In attesa del pezzo", "#7C3AED")}
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {it.pieceName}
            </div>
            <div style={{ fontSize: 11, color: "#5C645E", marginBottom: 10 }}>
              Da {it.waitingBy} · {fmt(it.waitingSince)}
            </div>
            {it.pieceDecision ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #C4B5FD",
                  borderRadius: 9,
                  padding: "8px 11px",
                  fontSize: 13,
                  color: "#7C3AED",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {I.pkg} <strong>{it.pieceDecisionBy}</strong>{" "}
                {it.pieceDecision === "ritiro"
                  ? "andrà a ritirarlo"
                  : "lo ordinerà"}
              </div>
            ) : (
              canMW && (
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button
                    onClick={() => savePieceDecision("ritiro")}
                    style={{
                      flex: 1,
                      background: "#7C3AED",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    🚗 Vado a prenderlo
                  </button>
                  <button
                    onClick={() => savePieceDecision("ordine")}
                    style={{
                      flex: 1,
                      background: "#fff",
                      color: "#7C3AED",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: "1.5px solid #C4B5FD",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    {I.pkg} Lo ordino
                  </button>
                </div>
              )
            )}
            {canMW && (
              <button
                onClick={pieceArr}
                style={{ ...ctaSt, background: "#7C3AED" }}
              >
                {I.pkg} Pezzo arrivato → Da fare
              </button>
            )}
          </>,
        )}{" "}
      {done &&
        blk(
          "#E6F2EB18",
          "#bfe2cf",
          <>
            {dlbl("Completato", "#2E7D5B")}
            <div style={{ fontSize: 13, color: "#5C645E" }}>
              {it.tecnicoCompleted ? (
                <>
                  <strong>{it.tecnicoNome}</strong> (tecnico esterno) ·{" "}
                  {fmt(it.completedAt)}
                </>
              ) : (
                <>
                  Da <strong>{it.completedBy}</strong> · {fmt(it.completedAt)}
                </>
              )}
            </div>
            {it.photoAfter && (
              <div
                style={{
                  marginTop: 10,
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <img
                  src={it.photoAfter}
                  alt=""
                  onClick={() => onPhoto(it.photoAfter)}
                  style={{
                    width: 110,
                    height: 110,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: "1px solid #E4E0D6",
                    display: "block",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: 10, color: "#5C645E", marginTop: 4 }}>
                  Tocca per ingrandire
                </span>
              </div>
            )}
          </>,
        )}
      {it.pieceReplaced &&
        blk(
          "#F5F3FF",
          "#DDD6FE",
          <>
            {dlbl("Pezzo sostituito", "#6D28D9")}
            <div style={{ fontSize: 14, lineHeight: 1.4, marginBottom: 6 }}>
              {it.pieceReplaced}
            </div>
            <div style={{ fontSize: 11, color: "#5C645E" }}>
              Da {it.pieceReplacedBy} · {fmt(it.pieceReplacedAt)}
            </div>
          </>,
        )}{" "}
      {canFix &&
        blk(
          null,
          null,
          <>
            {dlbl("Azioni")}
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#5C645E",
                marginBottom: 8,
              }}
            >
              RIPARAZIONE COMPLETATA
            </div>
            <input
              ref={f}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={pick}
            />
            {photo ? (
              <div
                style={{
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #E4E0D6",
                  marginBottom: 10,
                }}
              >
                <img
                  src={photo}
                  alt=""
                  style={{
                    width: "100%",
                    display: "block",
                    maxHeight: 220,
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => setPhoto(null)}
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    background: "rgba(0,0,0,.7)",
                    color: "#fff",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {I.x}
                </button>
              </div>
            ) : (
              <div
                onClick={() => f.current?.click()}
                style={{
                  border:
                    "1.5px dashed " +
                    (mustPhoto && !photo ? "#E0A03A" : "#E4E0D6"),
                  borderRadius: 12,
                  padding: 14,
                  textAlign: "center",
                  background: mustPhoto && !photo ? "#FFFBEB" : "#FBFAF7",
                  cursor: "pointer",
                  color: mustPhoto && !photo ? "#92400E" : "#5C645E",
                  marginBottom: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {I.image}
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {busy
                    ? "Elaborazione..."
                    : mustPhoto
                      ? "Foto obbligatoria *"
                      : "Foto (opzionale)"}
                </span>
              </div>
            )}
            <button
              onClick={complete}
              disabled={busy || (mustPhoto && !photo)}
              style={{
                ...ctaSt,
                opacity: busy || (mustPhoto && !photo) ? 0.5 : 1,
                marginBottom: 12,
              }}
            >
              {I.check} Segna completata
            </button>
            {!showRepl ? (
              <button
                onClick={() => setShowRepl(true)}
                style={{
                  ...ctaSt,
                  background: "#640A0A",
                  fontSize: 13,
                  padding: "11px 6px",
                  marginBottom: 12,
                }}
              >
                {I.pkg} Pezzo sostituito
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  marginBottom: 12,
                }}
              >
                <input
                  style={inputSt}
                  placeholder="Cosa hai sostituito..."
                  value={repl}
                  onChange={(e) => setRepl(e.target.value)}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 7 }}>
                  <button
                    onClick={saveReplaced}
                    disabled={!repl.trim()}
                    style={{ ...ctaSt, background: "#640A0A", flex: 1 }}
                  >
                    {I.check} Salva
                  </button>
                  <button
                    onClick={() => setShowRepl(false)}
                    style={{
                      ...ctaSt,
                      background: "#E4E0D6",
                      color: "#1B2420",
                      flex: "0 0 44px",
                    }}
                  >
                    {I.x}
                  </button>
                </div>
              </div>
            )}
            <div
              style={{ borderTop: "1px solid #E4E0D6", margin: "4px 0 12px" }}
            />
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#5C645E",
                marginBottom: 8,
              }}
            >
              NON RIESCO A RISOLVERE
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 7,
              }}
            >
              {canOrdP &&
                !showT &&
                (!showW ? (
                  <button
                    onClick={() => setShowW(true)}
                    style={{
                      ...ctaSt,
                      background: "#7C3AED",
                      fontSize: 13,
                      padding: "11px 6px",
                    }}
                  >
                    {I.pkg} Serve pezzo
                  </button>
                ) : (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                    }}
                  >
                    <input
                      style={inputSt}
                      placeholder="Nome pezzo..."
                      value={piece}
                      onChange={(e) => setPiece(e.target.value)}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 7 }}>
                      <button
                        onClick={setWait}
                        disabled={!piece.trim()}
                        style={{ ...ctaSt, background: "#7C3AED", flex: 1 }}
                      >
                        {I.check} Conferma
                      </button>
                      <button
                        onClick={() => setShowW(false)}
                        style={{
                          ...ctaSt,
                          background: "#E4E0D6",
                          color: "#1B2420",
                          flex: "0 0 44px",
                        }}
                      >
                        {I.x}
                      </button>
                    </div>
                  </div>
                ))}
              {canAskTecnico && !showW && (
                <button
                  onClick={askTecnico}
                  disabled={askingTecnico}
                  style={{
                    ...ctaSt,
                    background: "#D97706",
                    fontSize: 13,
                    padding: "11px 6px",
                    opacity: askingTecnico ? 0.6 : 1,
                  }}
                >
                  {I.msg} Contatta tecnico
                </button>
              )}
              {canReqT &&
                !showW &&
                (!showT ? (
                  <button
                    onClick={() => setShowT(true)}
                    style={{
                      ...ctaSt,
                      background: "#D97706",
                      fontSize: 13,
                      padding: "11px 6px",
                    }}
                  >
                    {I.phone} Serve tecnico
                  </button>
                ) : (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#5C645E" }}>
                      Seleziona tecnico:
                    </div>
                    {tec.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => reqTec(t)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 13px",
                          borderRadius: 12,
                          border: "1.5px solid #E4E0D6",
                          background: "#fff",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {I.phone} {t.nome}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowT(false)}
                      style={{
                        ...ctaSt,
                        background: "#E4E0D6",
                        color: "#1B2420",
                      }}
                    >
                      {I.x} Annulla
                    </button>
                  </div>
                ))}
            </div>
          </>,
        )}{" "}
      {canMW &&
        !done &&
        !wait &&
        !needT &&
        blk(
          null,
          "#C4B5FD",
          <>
            {dlbl("Gestione pezzo", "#7C3AED")}
            {!showW ? (
              <button
                onClick={() => setShowW(true)}
                style={{ ...ctaSt, background: "#7C3AED" }}
              >
                {I.pkg} Ordina un pezzo
              </button>
            ) : (
              <>
                <input
                  style={{ ...inputSt, marginBottom: 9 }}
                  placeholder="Nome pezzo..."
                  value={piece}
                  onChange={(e) => setPiece(e.target.value)}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 7 }}>
                  <button
                    onClick={setWait}
                    disabled={!piece.trim()}
                    style={{ ...ctaSt, background: "#7C3AED", flex: 1 }}
                  >
                    {I.check} Conferma
                  </button>
                  <button
                    onClick={() => setShowW(false)}
                    style={{
                      ...ctaSt,
                      background: "#E4E0D6",
                      color: "#1B2420",
                      flex: "0 0 44px",
                    }}
                  >
                    {I.x}
                  </button>
                </div>
              </>
            )}
          </>,
        )}{" "}
      {!canFix &&
        !done &&
        !wait &&
        !needT &&
        (user.role === "governante" ||
          user.role === "portiere_notturno" ||
          user.role === "sviluppatore" ||
          user.role === "reception") && (
          <div
            style={{
              background: "#FBF0DC",
              border: "1px solid #efdcb4",
              borderRadius: 11,
              padding: "10px 13px",
              fontSize: 13,
              color: "#7a5212",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {I.wrench} In attesa del manutentore.
          </div>
        )}{" "}
    </Sheet>
  );
} // ── Tecnici ───────────────────────────────────────────────────────────────────
function Tecnici({ tec, onSave, onClose }) {
  const [list, setList] = useState(tec);
  const [n, setN] = useState("");
  const [ph, setPh] = useState("");
  const add = () => {
    if (!n.trim()) return;
    const l = [...list, { id: uid(), nome: n.trim(), telefono: ph.trim() }];
    setList(l);
    onSave(l);
    setN("");
    setPh("");
  };
  const rm = (id) => {
    const l = list.filter((t) => t.id !== id);
    setList(l);
    onSave(l);
  };
  const waLink = (t) => {
    const num = (t.telefono || "").replace(/[^\d+]/g, "");
    return num ? "https://wa.me/" + num.replace(/^\+/, "") : null;
  };
  return (
    <Sheet onClose={onClose} title="Rubrica tecnici">
      {" "}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {" "}
        {list.map((t) => {
          const link = waLink(t);
          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "1px solid #E4E0D6",
                borderRadius: 11,
                padding: "11px 13px",
              }}
            >
              {" "}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "#FEF3C7",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {I.phone}
              </div>{" "}
              <div style={{ flex: 1, minWidth: 0 }}>
                {" "}
                <div style={{ fontWeight: 600 }}>{t.nome}</div>{" "}
                {t.telefono && (
                  <div style={{ fontSize: 12, color: "#5C645E" }}>
                    {t.telefono}
                  </div>
                )}{" "}
              </div>{" "}
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#E6F2EB",
                    border: "none",
                    color: "#2E7D5B",
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  {" "}
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.21-1.1a7.93 7.93 0 0 0 3.8.97h0a7.95 7.95 0 0 0 5.59-13.55zm-5.55 12.2h0a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.6 6.6 0 1 1 12.27-3.5 6.56 6.56 0 0 1-6.68 6.6zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.45.1-.52.64-.64.78-.23.15-.43.05a5.42 5.42 0 0 1-1.6-.98 5.99 5.99 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4s.2-.23.3-.35a1.4 1.4 0 0 0 .2-.33.36.36 0 0 0 0-.35c0-.1-.45-1.08-.62-1.48s-.33-.33-.45-.33-.25 0-.38 0a.74.74 0 0 0-.53.25 2.23 2.23 0 0 0-.7 1.66 3.88 3.88 0 0 0 .82 2.05 8.86 8.86 0 0 0 3.39 3 11.5 11.5 0 0 0 1.13.42 2.7 2.7 0 0 0 1.25.08 2.04 2.04 0 0 0 1.34-.94 1.65 1.65 0 0 0 .12-.94c-.05-.1-.18-.15-.39-.25z" />
                  </svg>{" "}
                </a>
              )}{" "}
              <button
                onClick={() => rm(t.id)}
                style={{
                  background: "#FBE9E6",
                  border: "none",
                  color: "#B23A2E",
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {I.trash}
              </button>{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {" "}
        <input
          style={inputSt}
          placeholder="Nome tecnico"
          value={n}
          onChange={(e) => setN(e.target.value)}
        />{" "}
        <input
          style={inputSt}
          placeholder="Numero WhatsApp (es. 3331234567)"
          inputMode="tel"
          value={ph}
          onChange={(e) => setPh(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />{" "}
        <button
          onClick={add}
          disabled={!n.trim()}
          style={{
            ...ctaSt,
            background: "#640A0A",
            opacity: n.trim() ? 1 : 0.5,
          }}
        >
          {I.userplus} Aggiungi tecnico
        </button>{" "}
      </div>{" "}
    </Sheet>
  );
} // ── ChangePIN ─────────────────────────────────────────────────────────────────
function ChangePIN({ user, onClose, onFlash }) {
  const [old, setOld] = useState("");
  const [np, setNp] = useState("");
  const [np2, setNp2] = useState("");
  const [err, setErr] = useState("");
  const save = async () => {
    if (np !== np2) {
      setErr("I PIN non coincidono");
      return;
    }
    const users = await DB.loadUsers();
    const found = users.find(
      (u) =>
        u.name.trim().toLowerCase() === user.name.trim().toLowerCase() &&
        u.role === user.role,
    );
    if (!found) {
      setErr("Utente non trovato");
      return;
    }
    if (found.pin !== old) {
      setErr("PIN attuale errato");
      setOld("");
      return;
    }
    await DB.updateUserPin(user.name, user.role, np);
    onFlash("PIN aggiornato ✓");
    onClose();
  };
  const pIn = (val, set) => (
    <input
      style={{
        ...inputSt,
        textAlign: "center",
        fontSize: 20,
        letterSpacing: 8,
      }}
      type="password"
      inputMode="numeric"
      maxLength={4}
      placeholder="••••"
      value={val}
      onChange={(e) => set(e.target.value.replace(/\D/g, "").slice(0, 4))}
    />
  );
  return (
    <Sheet onClose={onClose} title="Cambia il tuo PIN">
      <Field label="PIN attuale">{pIn(old, setOld)}</Field>
      <Field label="Nuovo PIN">
        {pIn(np, (v) => {
          setNp(v);
          setErr("");
        })}
      </Field>
      <Field label="Conferma nuovo PIN">
        {pIn(np2, (v) => {
          setNp2(v);
          setErr("");
        })}
      </Field>
      {err && (
        <div style={{ color: "#B23A2E", fontSize: 13, marginBottom: 10 }}>
          {err}
        </div>
      )}
      <button
        onClick={save}
        disabled={old.length !== 4 || np.length !== 4 || np2.length !== 4}
        style={{
          ...ctaSt,
          opacity:
            old.length !== 4 || np.length !== 4 || np2.length !== 4 ? 0.5 : 1,
        }}
      >
        {I.check} Salva PIN
      </button>
    </Sheet>
  );
} // ── Feedback ─────────────────────────────────────────────────────────────────
function FeedbackForm({ user, onClose, onFlash }) {
  const FEEDBACK_URL =
    "https://script.google.com/macros/s/AKfycbxjJ1xmM72aDIdoqBk3nC2_Hz_g6YvCcu5uhUkb2hj9it8xr9k0gXKQ33AtEXQpoIrg/exec";
  const ruoloLabel = roleDisplayFor(user.role, user.zones)?.label || user.role;
  const [oggetto, setOggetto] = useState("");
  const [testo, setTesto] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const f = useRef();
  const pick = async (e) => {
    const fl = e.target.files?.[0];
    if (!fl) return;
    setBusy(true);
    try {
      setPhoto(await compress(fl));
    } catch {}
    setBusy(false);
  };
  const send = async () => {
    if (!oggetto.trim() || !testo.trim() || sending) return;
    setSending(true);
    try {
      await fetch(FEEDBACK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          tipo: "feedback",
          ruolo: ruoloLabel,
          utente: user.name,
          oggetto: oggetto.trim(),
          testo: testo.trim(),
          foto: photo || "",
        }),
      });
      onFlash("Feedback inviato, grazie! ✓");
      onClose();
    } catch {
      onFlash("Errore durante l'invio del feedback", false);
    }
    setSending(false);
  };
  return (
    <Sheet onClose={onClose} title="Invia un feedback">
      {" "}
      <Field label="Ruolo">
        <input style={inputSt} value={ruoloLabel} disabled />
      </Field>{" "}
      <Field label="Oggetto *">
        <input
          style={inputSt}
          maxLength={150}
          placeholder="Es. Problema con il filtro segnalazioni"
          value={oggetto}
          onChange={(e) => setOggetto(e.target.value)}
        />
      </Field>{" "}
      <Field label="Messaggio *">
        <textarea
          style={{
            ...inputSt,
            resize: "vertical",
            minHeight: 120,
            lineHeight: 1.5,
          }}
          maxLength={3000}
          placeholder="Descrivi il problema o il suggerimento..."
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
        />
      </Field>{" "}
      <Field label="Foto (opzionale)">
        {" "}
        <input
          ref={f}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={pick}
        />{" "}
        {photo ? (
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #E4E0D6",
            }}
          >
            <img
              src={photo}
              alt=""
              style={{
                width: "100%",
                display: "block",
                maxHeight: 260,
                objectFit: "cover",
              }}
            />
            <button
              onClick={() => setPhoto(null)}
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                background: "rgba(0,0,0,.7)",
                color: "#fff",
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              {I.x}
            </button>
          </div>
        ) : (
          <div
            onClick={() => f.current?.click()}
            style={{
              border: "1.5px dashed #E4E0D6",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
              background: "#FBFAF7",
              cursor: "pointer",
              color: "#5C645E",
            }}
          >
            {busy ? (
              <span>Elaborazione...</span>
            ) : (
              <>
                {I.camera}
                <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600 }}>
                  Scatta o carica
                </div>
              </>
            )}
          </div>
        )}{" "}
      </Field>{" "}
      <button
        onClick={send}
        disabled={!oggetto.trim() || !testo.trim() || sending || busy}
        style={{
          ...ctaSt,
          opacity:
            !oggetto.trim() || !testo.trim() || sending || busy ? 0.5 : 1,
        }}
      >
        {I.check} {sending ? "Invio..." : "Invia feedback"}
      </button>{" "}
    </Sheet>
  );
} // ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [matchedUser, setMatchedUser] = useState(null);
  const [adminPin, setAdminPin] = useState(
    () => ST.get("adminpin") || ADMIN_PIN_DEFAULT,
  );
  const [users, setUsers] = useState([]);
  const [step, setStep] = useState("login");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [sugg, setSugg] = useState([]);
  useEffect(() => {
    DB.loadUsers().then((u) => setUsers(u.length ? u : []));
  }, []);
  const onName = (v) => {
    setName(v);
    setMatchedUser(null);
    setSugg(
      v.trim()
        ? users.filter((u) => u.name.toLowerCase().startsWith(v.toLowerCase()))
        : [],
    );
  };
  const pickSugg = (u) => {
    setName(u.name);
    setMatchedUser(u);
    setSugg([]);
  };
  const goPin = () => {
    if (!name.trim()) return;
    const exact = users.find(
      (u) => u.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    if (!exact) {
      setErr("Utente non trovato. Contatta l'admin.");
      return;
    }
    setMatchedUser(exact);
    setSugg([]);
    setPin("");
    setErr("");
    setStep("pin");
  };
  const handlePin = () => {
    if (!matchedUser) {
      setErr("Utente non trovato. Contatta l'admin.");
      setPin("");
      return;
    }
    if (pin === matchedUser.pin)
      onLogin(matchedUser.role, matchedUser.name, matchedUser.mustChangePin);
    else {
      setErr("PIN errato");
      setPin("");
    }
  };
  const handleAdminPin = () => {
    if (pin === adminPin) {
      setStep("admin");
      setPin("");
      setErr("");
    } else {
      setErr("PIN errato");
      setPin("");
    }
  };
  const pinScreen = (title, sub, handler) => (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background:
          "radial-gradient(110% 80% at 50% -10%, #A01E1E 0%, #640A0A 35%, #4A0808 70%, #300505 100%)",
        fontFamily: "ui-sans-serif,system-ui,sans-serif",
        overflow: "hidden",
      }}
    >
      {" "}
      <div
        style={{
          position: "absolute",
          top: "-12%",
          left: "-18%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(94,213,178,.28), transparent 65%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "absolute",
          bottom: "-18%",
          right: "-15%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(14,92,73,.45), transparent 70%)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "8%",
          width: 140,
          height: 140,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          minHeight: 480,
          background: "#fff",
          borderRadius: 22,
          padding: "32px 22px",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,.5)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {" "}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 13,
              background: "#640A0A",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 12px",
              color: "#fff",
            }}
          >
            {I.lock}
          </div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{title}</div>
          <div style={{ fontSize: 13, color: "#5C645E", marginTop: 3 }}>
            {sub}
          </div>
        </div>{" "}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: pin.length > i ? "#640A0A" : "#E4E0D6",
                transition: "background .15s",
              }}
            />
          ))}
        </div>{" "}
        <input
          style={{
            ...inputSt,
            textAlign: "center",
            fontSize: 24,
            letterSpacing: 8,
            marginBottom: 8,
          }}
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
            setErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && handler()}
          autoFocus
        />{" "}
        {err && (
          <div
            style={{
              color: "#B23A2E",
              fontSize: 13,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            {err}
          </div>
        )}{" "}
        <button
          onClick={handler}
          disabled={pin.length !== 4}
          style={{
            ...ctaSt,
            opacity: pin.length !== 4 ? 0.5 : 1,
            marginBottom: 10,
          }}
        >
          {I.check} Entra
        </button>{" "}
        <button
          onClick={() => {
            setStep("login");
            setPin("");
            setErr("");
          }}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "#5C645E",
            fontSize: 13,
            cursor: "pointer",
            padding: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {I.back} Torna indietro
        </button>{" "}
      </div>{" "}
    </div>
  );
  if (step === "admin")
    return (
      <AdminPanel
        adminPin={adminPin}
        onSaveAdminPin={(p) => {
          setAdminPin(p);
          ST.set("adminpin", p);
        }}
        onSaveUsers={(u) => {
          // AdminPanel ha gia' scritto sul database (in modo mirato per
          // aggiunte/rimozioni, o con sostituzione completa per import/backup
          // dove e' l'operazione voluta): qui serve solo aggiornare la copia
          // locale, senza riscrivere di nuovo tutta la tabella.
          setUsers(u);
        }}
        onBack={() => setStep("login")}
      />
    );
  if (step === "pin")
    return pinScreen("Ciao, " + name, "Inserisci il tuo PIN", handlePin);
  if (step === "admin-pin")
    return pinScreen("Accesso Admin", "PIN admin", handleAdminPin);
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background:
          "radial-gradient(110% 80% at 50% -10%, #A01E1E 0%, #640A0A 35%, #4A0808 70%, #300505 100%)",
        fontFamily: "ui-sans-serif,system-ui,sans-serif",
        overflow: "hidden",
      }}
    >
      {" "}
      <div
        style={{
          position: "absolute",
          top: "-12%",
          left: "-18%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(94,213,178,.28), transparent 65%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "absolute",
          bottom: "-18%",
          right: "-15%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(14,92,73,.45), transparent 70%)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "8%",
          width: 140,
          height: 140,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          minHeight: 480,
          background: "#fff",
          borderRadius: 22,
          padding: "32px 22px",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,.5)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {" "}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 4,
          }}
        >
          {" "}
          <button
            onClick={() => {
              setPin("");
              setErr("");
              setStep("admin-pin");
            }}
            style={{
              background: "rgba(14,92,73,.08)",
              border: "none",
              color: "#640A0A",
              width: 34,
              height: 34,
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            {I.menu}
          </button>{" "}
        </div>{" "}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          {" "}
          <img
            src={HOTEL_LOGO}
            alt="Chocohotel"
            style={{
              width: 120,
              borderRadius: 14,
              boxShadow: "0 8px 24px -8px rgba(0,0,0,.25)",
            }}
          />{" "}
        </div>{" "}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {" "}
          <div style={{ fontWeight: 800, fontSize: 17 }}>
            Manutenzioni - Chocohotel
          </div>{" "}
        </div>{" "}
        <div style={{ marginBottom: 6, position: "relative" }}>
          {" "}
          <input
            style={inputSt}
            placeholder="Il tuo nome"
            value={name}
            onChange={(e) => onName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && goPin()}
            autoFocus
          />{" "}
          {sugg.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #E4E0D6",
                borderRadius: 11,
                marginTop: 4,
                zIndex: 10,
                overflow: "hidden",
                boxShadow: "0 8px 24px -8px rgba(0,0,0,.15)",
              }}
            >
              {" "}
              {sugg.map((u) => (
                <div
                  key={u.id}
                  onClick={() => pickSugg(u)}
                  style={{
                    padding: "11px 14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderBottom: "1px solid #E4E0D6",
                  }}
                >
                  {" "}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#640A0A14",
                      display: "grid",
                      placeItems: "center",
                      color: "#640A0A",
                    }}
                  >
                    {I[ROLES[u.role]?.icon]}
                  </div>{" "}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#5C645E" }}>
                      {ROLES[u.role]?.label}
                    </div>
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
        {err && (
          <div style={{ color: "#B23A2E", fontSize: 13, marginBottom: 10 }}>
            {err}
          </div>
        )}{" "}
        <button
          onClick={goPin}
          disabled={!name.trim()}
          style={{ ...ctaSt, opacity: !name.trim() ? 0.5 : 1, marginTop: 12 }}
        >
          Continua →
        </button>{" "}
      </div>{" "}
    </div>
  );
} // ── AdminPanel ────────────────────────────────────────────────────────────────
function AdminPanel({ adminPin, onSaveAdminPin, onSaveUsers, onBack }) {
  const [users, setUsers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("manutentore");
  const [newPin, setNewPin] = useState("");
  const [areaSubtype, setAreaSubtype] = useState(null);
  const [newAreaZones, setNewAreaZones] = useState("");
  const [newAPin, setNewAPin] = useState("");
  const [devPin, setDevPin] = useState("");
  const [devErr, setDevErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const fileRef = useRef();
  useEffect(() => {
    DB.loadUsers().then((u) => setUsers(u));
  }, []);
  const saveU = async (u) => {
    setUsers(u);
    await DB.saveUsers(u);
    onSaveUsers && onSaveUsers(u);
  };
  const add = () => {
    if (!newName.trim() || newPin.length !== 4) return;
    if (newRole === "sviluppatore" && devPin !== "1911") {
      setDevErr(
        "PIN di verifica errato. Assegnazione ruolo Sviluppatore bloccata.",
      );
      return;
    }
    const zonesArr =
      newRole === "responsabile_area"
        ? newAreaZones
            .split(",")
            .map((z) => z.trim())
            .filter(Boolean)
        : null;
    const nu = { id: uid(), name: newName.trim(), role: newRole, pin: newPin };
    if (zonesArr && zonesArr.length) nu.zones = zonesArr;
    // scrittura mirata: aggiunge solo questo utente, non riscrive tutta la
    // tabella (altrimenti si rischia di sovrascrivere PIN cambiati da altri
    // nel frattempo con la lista "vecchia" caricata all'apertura del pannello)
    DB.addUser(nu);
    const u = [...users, nu];
    setUsers(u);
    onSaveUsers && onSaveUsers(u);
    setShowForm(false);
    setNewName("");
    setNewPin("");
    setAreaSubtype(null);
    setNewAreaZones("");
    setDevPin("");
    setDevErr("");
  };
  const rm = (id) => {
    // scrittura mirata: elimina solo questo utente, stesso motivo di add()
    DB.deleteUser(id);
    const u = users.filter((x) => x.id !== id);
    setUsers(u);
    onSaveUsers && onSaveUsers(u);
  };
  const [syncMsg, setSyncMsg] = useState(null);
  const syncDefaults = () => {
    const missing = DEF_USERS.filter(
      (d) =>
        !users.some(
          (u) =>
            u.name.trim().toLowerCase() === d.name.trim().toLowerCase() &&
            u.role === d.role,
        ),
    );
    if (missing.length === 0) {
      setSyncMsg({ ok: true, m: "Già tutti presenti, nessuno aggiunto." });
    } else {
      // scrittura mirata: aggiunge solo gli utenti mancanti, senza toccare
      // gli altri (stesso motivo di add()/rm(): evita di sovrascrivere PIN
      // cambiati nel frattempo con la lista "vecchia" caricata all'apertura)
      missing.forEach((m) => DB.addUser(m));
      const u = [...users, ...missing];
      setUsers(u);
      onSaveUsers && onSaveUsers(u);
      setSyncMsg({
        ok: true,
        m: "Aggiunti: " + missing.map((m) => m.name).join(", "),
      });
    }
    setTimeout(() => setSyncMsg(null), 4000);
  };
  const exportBackup = async () => {
    const tecnici = await DB.loadTecnici();
    const data = {
      users,
      tecnici,
      adminpin: adminPin,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "backup_dipendenti_" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.users)) throw new Error("formato non valido");
        await saveU(data.users);
        if (Array.isArray(data.tecnici)) await DB.saveTecnici(data.tecnici);
        if (data.adminpin) onSaveAdminPin(data.adminpin);
        setImportMsg({
          ok: true,
          m:
            "Backup ripristinato: " +
            data.users.length +
            " utenti, " +
            (data.tecnici?.length || 0) +
            " tecnici.",
        });
      } catch (err) {
        setImportMsg({ ok: false, m: "File non valido." });
      }
      setTimeout(() => setImportMsg(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F0E3",
        fontFamily: "ui-sans-serif,system-ui,sans-serif",
      }}
    >
      {" "}
      <div
        style={{
          background: "#640A0A",
          color: "#fff",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "sticky",
          top: 0,
        }}
      >
        {" "}
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,.15)",
            border: "none",
            color: "#fff",
            width: 34,
            height: 34,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          {I.back}
        </button>{" "}
        <span style={{ fontWeight: 700, fontSize: 16 }}>
          Pannello Admin
        </span>{" "}
      </div>{" "}
      <div style={{ maxWidth: 460, margin: "0 auto", padding: 16 }}>
        {" "}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#5C645E",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 10,
          }}
        >
          Utenti
        </div>{" "}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {" "}
          {users.length === 0 && (
            <div
              style={{
                fontSize: 13,
                color: "#5C645E",
                textAlign: "center",
                padding: "16px 0",
              }}
            >
              Nessun utente ancora.
            </div>
          )}{" "}
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "1px solid #E4E0D6",
                borderRadius: 11,
                padding: "11px 13px",
              }}
            >
              {" "}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "#640A0A14",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  color: "#640A0A",
                }}
              >
                {I[roleDisplayFor(u.role, u.zones).icon]}
              </div>{" "}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: "#5C645E" }}>
                  {roleDisplayFor(u.role, u.zones).label}
                </div>
              </div>{" "}
              <button
                onClick={() => rm(u.id)}
                style={{
                  background: "#FBE9E6",
                  border: "none",
                  borderRadius: 7,
                  width: 30,
                  height: 30,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  color: "#B23A2E",
                }}
              >
                {I.trash}
              </button>{" "}
            </div>
          ))}{" "}
        </div>{" "}
        {showForm ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E4E0D6",
              borderRadius: 14,
              padding: 14,
              marginBottom: 14,
            }}
          >
            {" "}
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              Nuovo utente
            </div>{" "}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Nome
              </label>
              <input
                style={inputSt}
                placeholder="es. Marco"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>{" "}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Ruolo
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                }}
              >
                {[
                  ...Object.entries(ROLES).filter(
                    ([k]) => k !== "responsabile_area",
                  ),
                  ["ristorante", { label: "Ristorante", icon: "wine" }],
                  ["golosi", { label: "Isola dei Golosi", icon: "coffee" }],
                ].map(([k, r]) => {
                  const sel =
                    k === "ristorante"
                      ? areaSubtype === "ristorante"
                      : k === "golosi"
                        ? areaSubtype === "golosi"
                        : newRole === k;
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        if (k === "ristorante") {
                          setNewRole("responsabile_area");
                          setAreaSubtype("ristorante");
                          setNewAreaZones("Risto Wine, Risto Jazz");
                        } else if (k === "golosi") {
                          setNewRole("responsabile_area");
                          setAreaSubtype("golosi");
                          setNewAreaZones("Isola dei Golosi");
                        } else {
                          setNewRole(k);
                          setAreaSubtype(null);
                        }
                      }}
                      style={{
                        padding: "10px 6px",
                        borderRadius: 10,
                        border: "1.5px solid " + (sel ? "#640A0A" : "#E4E0D6"),
                        background: sel ? "#640A0A14" : "#fff",
                        fontWeight: 600,
                        fontSize: 12,
                        color: sel ? "#640A0A" : "#5C645E",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      {I[r.icon]} {r.label}
                    </button>
                  );
                })}
              </div>
            </div>{" "}
            {newRole === "sviluppatore" && (
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  PIN di verifica (Sviluppatore)
                </label>
                <input
                  style={{
                    ...inputSt,
                    textAlign: "center",
                    fontSize: 20,
                    letterSpacing: 8,
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="****"
                  value={devPin}
                  onChange={(e) => {
                    setDevPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                    setDevErr("");
                  }}
                />
                {devErr && (
                  <div style={{ color: "#B23A2E", fontSize: 12, marginTop: 6 }}>
                    {devErr}
                  </div>
                )}
              </div>
            )}
            {areaSubtype && (
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Zone consentite
                </label>
                <input
                  style={inputSt}
                  placeholder="es. Risto Wine, Risto Jazz"
                  value={newAreaZones}
                  onChange={(e) => setNewAreaZones(e.target.value)}
                />
              </div>
            )}{" "}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                PIN
              </label>
              <input
                style={{
                  ...inputSt,
                  textAlign: "center",
                  fontSize: 20,
                  letterSpacing: 8,
                }}
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={newPin}
                onChange={(e) =>
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
              />
            </div>{" "}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={add}
                disabled={
                  !newName.trim() ||
                  newPin.length !== 4 ||
                  (newRole === "sviluppatore" && devPin !== "1911")
                }
                style={{
                  ...ctaSt,
                  flex: 1,
                  opacity:
                    !newName.trim() ||
                    newPin.length !== 4 ||
                    (newRole === "sviluppatore" && devPin !== "1911")
                      ? 0.5
                      : 1,
                }}
              >
                {I.check} Crea
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  ...ctaSt,
                  flex: "0 0 44px",
                  background: "#E4E0D6",
                  color: "#1B2420",
                }}
              >
                {I.x}
              </button>
            </div>{" "}
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{ ...ctaSt, marginBottom: 14 }}
          >
            {I.plus} Aggiungi utente
          </button>
        )}{" "}
        <button
          onClick={syncDefaults}
          style={{
            ...ctaSt,
            background: "#fff",
            color: "#640A0A",
            border: "1.5px solid #640A0A",
            marginBottom: 8,
          }}
        >
          {I.refresh} Sincronizza utenti default
        </button>{" "}
        {syncMsg && (
          <div
            style={{
              marginBottom: 14,
              background: "#E6F2EB",
              border: "1px solid #bfe2cf",
              borderRadius: 9,
              padding: "9px 12px",
              fontSize: 13,
              color: "#2E7D5B",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {I.check} {syncMsg.m}
          </div>
        )}{" "}
        {!syncMsg && <div style={{ marginBottom: 14 }} />}{" "}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#5C645E",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 10,
          }}
        >
          PIN Admin
        </div>{" "}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E4E0D6",
            borderRadius: 14,
            padding: 14,
            marginBottom: 14,
          }}
        >
          {" "}
          <div style={{ fontSize: 13, color: "#5C645E", marginBottom: 10 }}>
            Modifica il PIN admin
          </div>{" "}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{
                ...inputSt,
                flex: 1,
                textAlign: "center",
                fontSize: 20,
                letterSpacing: 8,
              }}
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Nuovo PIN"
              value={newAPin}
              onChange={(e) =>
                setNewAPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
            />
            <button
              onClick={() => {
                if (newAPin.length !== 4) return;
                onSaveAdminPin(newAPin);
                setNewAPin("");
              }}
              disabled={newAPin.length !== 4}
              style={{
                ...ctaSt,
                flex: "0 0 54px",
                opacity: newAPin.length !== 4 ? 0.5 : 1,
              }}
            >
              {I.check}
            </button>
          </div>{" "}
        </div>{" "}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#5C645E",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 10,
          }}
        >
          Backup &amp; Ripristino
        </div>{" "}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E4E0D6",
            borderRadius: 14,
            padding: 14,
          }}
        >
          {" "}
          <div style={{ fontSize: 13, color: "#5C645E", marginBottom: 12 }}>
            Salva o ripristina dipendenti, PIN e tecnici (utile finché l'app
            gira in modalità anteprima).
          </div>{" "}
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={importBackup}
          />{" "}
          <div style={{ display: "flex", gap: 8 }}>
            {" "}
            <button
              onClick={exportBackup}
              style={{ ...ctaSt, flex: 1, background: "#640A0A" }}
            >
              {I.download} Esporta backup
            </button>{" "}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                ...ctaSt,
                flex: 1,
                background: "#fff",
                color: "#640A0A",
                border: "1.5px solid #640A0A",
              }}
            >
              {I.userplus} Ripristina
            </button>{" "}
          </div>{" "}
          {importMsg && (
            <div
              style={{
                marginTop: 10,
                background: importMsg.ok ? "#E6F2EB" : "#FBE9E6",
                border: "1px solid " + (importMsg.ok ? "#bfe2cf" : "#f0ccc6"),
                borderRadius: 9,
                padding: "9px 12px",
                fontSize: 13,
                color: importMsg.ok ? "#2E7D5B" : "#B23A2E",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {importMsg.ok ? I.check : I.x} {importMsg.m}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
} // ── Bottone I miei lavori nel menu ───────────────────────────────────────────
function MyWorkBtn({ user, items, planned, onOpen }) {
  const myDone = items.filter(
    (i) =>
      i.status === "done" &&
      (i.completedBy === user.name || i.tecnicoNome === user.name),
  );
  const myPlanned = planned.filter((p) =>
    p.assignees?.some(
      (a) => a.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
    ),
  );
  const tot = myDone.length + myPlanned.length;
  if (tot === 0) return null;
  return (
    <button
      onClick={onOpen}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 20px",
        background: "none",
        border: "none",
        borderTop: "1px solid #F7F0E3",
        borderBottom: "1px solid #F7F0E3",
        cursor: "pointer",
        color: "#1B2420",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {" "}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "#E6F2EB",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          color: "#2E7D5B",
        }}
      >
        {" "}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>{" "}
      </div>{" "}
      <span style={{ flex: 1, textAlign: "left" }}>I miei lavori</span>{" "}
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          background: "#E6F2EB",
          color: "#2E7D5B",
          borderRadius: 999,
          padding: "2px 8px",
        }}
      >
        {tot}
      </span>{" "}
    </button>
  );
} // ── I miei lavori (pagina dedicata) ──────────────────────────────────────────
function MyWorkPage({ user, items, planned, onClose, onOpen }) {
  const myDone = items
    .filter(
      (i) =>
        i.status === "done" &&
        (i.completedBy === user.name || i.tecnicoNome === user.name),
    )
    .sort((a, b) => b.completedAt - a.completedAt);
  const myPlanned = planned
    .filter((p) =>
      p.assignees?.some(
        (a) => a.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
      ),
    )
    .sort((a, b) => (b.scheduledAt || 0) - (a.scheduledAt || 0));
  const myPlannedDone = myPlanned.filter((p) => p.status === "done");
  const myPlannedPending = myPlanned.filter(
    (p) => p.status === "pending" || p.status === "waiting",
  );
  const [search, setSearch] = useState("");
  const q = search.toLowerCase();
  const filtDone = myDone.filter(
    (i) =>
      !q ||
      String(i.room).includes(q) ||
      (i.notes || "").toLowerCase().includes(q),
  );
  const filtPDone = myPlannedDone.filter(
    (p) =>
      !q ||
      String(p.room).includes(q) ||
      (p.notes || "").toLowerCase().includes(q),
  );
  const filtPPend = myPlannedPending.filter(
    (p) =>
      !q ||
      String(p.room).includes(q) ||
      (p.notes || "").toLowerCase().includes(q),
  );
  const fmt2 = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return (
      d.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " · " +
      d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
    );
  };
  const SectionLabel = ({ label, count }) => (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#5C645E",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        margin: "18px 0 8px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {" "}
      {label}{" "}
      <span
        style={{
          background: "#F7F0E3",
          borderRadius: 999,
          padding: "1px 8px",
          fontSize: 11,
        }}
      >
        {count}
      </span>{" "}
    </div>
  );
  const PlanCard = ({ p }) => (
    <div
      onClick={() => onOpen({ pd: p })}
      style={{
        background: "#fff",
        border: "1.5px solid " + (p.status === "done" ? "#bfe2cf" : "#BFDBFE"),
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      {" "}
      <div
        style={{
          width: 6,
          background: p.status === "done" ? "#2E7D5B" : "#1D4ED8",
          flexShrink: 0,
        }}
      />{" "}
      <div style={{ padding: "12px 14px", flex: 1 }}>
        {" "}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          {" "}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 11,
              background: p.status === "done" ? "#E6F2EB" : "#EFF6FF",
              border:
                "1px solid " + (p.status === "done" ? "#bfe2cf" : "#BFDBFE"),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {" "}
            <div
              style={{
                fontSize: 7,
                color: p.status === "done" ? "#2E7D5B" : "#1D4ED8",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Cam.
            </div>{" "}
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                lineHeight: 1,
                color: p.status === "done" ? "#2E7D5B" : "#1D4ED8",
              }}
            >
              {p.room}
            </div>{" "}
          </div>{" "}
          <div style={{ flex: 1, minWidth: 0 }}>
            {" "}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 4,
                flexWrap: "wrap",
              }}
            >
              {" "}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: p.status === "done" ? "#E6F2EB" : "#EFF6FF",
                  color: p.status === "done" ? "#2E7D5B" : "#1D4ED8",
                }}
              >
                {p.status === "done" ? "Completato" : "Da fare"}
              </span>{" "}
            </div>{" "}
            <div
              style={{ fontSize: 14, lineHeight: 1.4, wordBreak: "break-word" }}
            >
              {p.notes || <em style={{ color: "#5C645E" }}>Nessuna nota</em>}
            </div>{" "}
            <div style={{ fontSize: 11, color: "#5C645E", marginTop: 5 }}>
              {" "}
              {p.status === "done" ? (
                <>Completato · {fmt2(p.completedAt)}</>
              ) : (
                <>Previsto · {fmt2(p.scheduledAt)}</>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
  const DoneCard = ({ it }) => {
    const u = URG[it.urgency] || URG.media;
    return (
      <div
        onClick={() => onOpen({ d: it })}
        style={{
          background: "#fff",
          border: "1px solid #E4E0D6",
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          marginBottom: 10,
          cursor: "pointer",
        }}
      >
        {" "}
        <div style={{ width: 6, background: "#2E7D5B", flexShrink: 0 }} />{" "}
        <div style={{ padding: "12px 14px", flex: 1 }}>
          {" "}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            {" "}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 11,
                background: "#E6F2EB",
                border: "1px solid #bfe2cf",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {" "}
              <div
                style={{
                  fontSize: 7,
                  color: "#2E7D5B",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Cam.
              </div>{" "}
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: "#2E7D5B",
                }}
              >
                {it.room}
              </div>{" "}
            </div>{" "}
            <div style={{ flex: 1, minWidth: 0 }}>
              {" "}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 4,
                  flexWrap: "wrap",
                }}
              >
                {" "}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: u.bg,
                    color: u.fg,
                    textTransform: "uppercase",
                  }}
                >
                  {u.label}
                </span>{" "}
                {CAT[it.category] && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: CAT[it.category].color + "14",
                      color: CAT[it.category].color,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    {I[CAT[it.category].icon]} {CAT[it.category].label}
                  </span>
                )}{" "}
              </div>{" "}
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                }}
              >
                {it.notes || <em style={{ color: "#5C645E" }}>Nessuna nota</em>}
              </div>{" "}
              <div style={{ fontSize: 11, color: "#5C645E", marginTop: 5 }}>
                Completata · {fmt2(it.completedAt)}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  };
  const isEmpty =
    filtDone.length === 0 && filtPDone.length === 0 && filtPPend.length === 0;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        background: "#F7F0E3",
        display: "flex",
        flexDirection: "column",
        fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif",
      }}
    >
      {" "}
      {/* Header */}{" "}
      <div
        style={{
          background: "#640A0A",
          color: "#fff",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {" "}
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,.15)",
            border: "none",
            color: "#fff",
            width: 34,
            height: 34,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          {" "}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>{" "}
        </button>{" "}
        <div>
          {" "}
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            I miei lavori
          </div>{" "}
          <div style={{ fontSize: 11, opacity: 0.75 }}>
            {user.name} · {ROLES[user.role]?.label}
          </div>{" "}
        </div>{" "}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {" "}
          <div
            style={{
              background: "rgba(255,255,255,.15)",
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {" "}
            {myDone.length + myPlanned.length} totali{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Search */}{" "}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        {" "}
        <div style={{ position: "relative" }}>
          {" "}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>{" "}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca camera o descrizione..."
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #E4E0D6",
              borderRadius: 11,
              padding: "11px 36px",
              fontSize: 14,
              color: "#1B2420",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />{" "}
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9CA3AF",
                display: "grid",
                placeItems: "center",
              }}
            >
              {" "}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>{" "}
            </button>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* List */}{" "}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {" "}
        {isEmpty && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#5C645E",
            }}
          >
            {" "}
            <div style={{ fontSize: 13 }}>
              Nessun risultato per "{search}"
            </div>{" "}
          </div>
        )}{" "}
        {filtPPend.length > 0 && (
          <>
            <SectionLabel label="Interventi da fare" count={filtPPend.length} />
            {filtPPend.map((p) => (
              <PlanCard key={p.id} p={p} />
            ))}
          </>
        )}{" "}
        {filtPDone.length > 0 && (
          <>
            <SectionLabel
              label="Interventi completati"
              count={filtPDone.length}
            />
            {filtPDone.map((p) => (
              <PlanCard key={p.id} p={p} />
            ))}
          </>
        )}{" "}
        {filtDone.length > 0 && (
          <>
            <SectionLabel
              label="Segnalazioni risolte"
              count={filtDone.length}
            />
            {filtDone.map((it) => (
              <DoneCard key={it.id} it={it} />
            ))}
          </>
        )}{" "}
      </div>{" "}
    </div>
  );
} // ── WACenter ──────────────────────────────────────────────────────────────────
function WACenter({ user, items, onClose, onSave }) {
  const [text, setText] = useState("");
  const [sender, setSender] = useState("reception");
  const [who, setWho] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const exRoom = (t) => {
    const m = t.match(/(?:camera|stanza|cam\.?|n[°.]?)\s*0*(\d{1,4})/i);
    if (m) return m[1];
    const m2 = t.match(/\b(\d{1,4})\b/);
    return m2 ? m2[1] : "";
  };
  const process = async () => {
    const raw = text.trim();
    if (!raw) return;
    setBusy(true);
    setRes(null);
    try {
      if (sender === "reception") {
        let room = exRoom(raw),
          desc = raw,
          cat = "varie";
        try {
          const r = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 300,
              messages: [
                {
                  role: "user",
                  content:
                    'Assistente hotel. Estrai camera, descrizione, categoria (idraulico|elettrico|clima|arredo|edilizio|giardinaggio|varie). JSON: {"stanza":"","descrizione":"","categoria":""}. SOLO JSON.\n' +
                    raw,
                },
              ],
            }),
          });
          const d = await r.json();
          const t = (d.content || [])
            .filter((b) => b.type === "text")
            .map((b) => b.text)
            .join("")
            .trim();
          const p = JSON.parse(t.replace(/```json|```/g, "").trim());
          if (p.stanza) room = String(p.stanza);
          if (p.descrizione) desc = p.descrizione;
          if (CAT[p.categoria]) cat = p.categoria;
        } catch {}
        if (!room) {
          setRes({ ok: false, m: "Camera non riconosciuta." });
          setBusy(false);
          return;
        }
        onSave({
          id: uid(),
          room,
          urgency: "alta",
          category: cat,
          notes: desc,
          photoBefore: null,
          photoAfter: null,
          status: "todo",
          createdBy: who.trim() || "WhatsApp",
          createdAt: Date.now(),
          completedBy: null,
          completedAt: null,
        });
        setRes({ ok: true, m: "Manutenzione creata per camera " + room + "." });
      } else {
        const room = exRoom(raw);
        const open = items.filter(
          (i) => i.status === "todo" && String(i.room) === String(room),
        );
        if (!room || !open.length) {
          setRes({
            ok: false,
            m: room
              ? "Nessuna aperta per camera " + room + "."
              : "Camera non riconosciuta.",
          });
          setBusy(false);
          return;
        }
        onSave({
          ...open[0],
          status: "done",
          completedBy: who.trim() || "Manutentore",
          completedAt: Date.now(),
        });
        setRes({ ok: true, m: "Chiusa camera " + room + "." });
      }
      setText("");
    } catch {
      setRes({ ok: false, m: "Errore." });
    }
    setBusy(false);
  };
  return (
    <Sheet onClose={onClose} title="Centro WhatsApp">
      <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
        {["reception", "manutentore"].map((s) => (
          <button
            key={s}
            onClick={() => setSender(s)}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 11,
              border: "1.5px solid " + (sender === s ? "#640A0A" : "#E4E0D6"),
              background: sender === s ? "#FBFAF7" : "#fff",
              fontWeight: 700,
              fontSize: 13,
              color: sender === s ? "#640A0A" : "#5C645E",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {s === "reception" ? (
              <>{I.list} Reception</>
            ) : (
              <>{I.wrench} Manutentore</>
            )}
          </button>
        ))}
      </div>
      <Field label="Mittente">
        <input
          style={inputSt}
          placeholder="es. Luca"
          value={who}
          onChange={(e) => setWho(e.target.value)}
        />
      </Field>
      <Field label="Messaggio">
        <textarea
          style={{
            ...inputSt,
            resize: "vertical",
            minHeight: 100,
            lineHeight: 1.5,
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Field>
      <button
        onClick={process}
        disabled={!text.trim() || busy}
        style={{
          ...ctaSt,
          opacity: !text.trim() || busy ? 0.5 : 1,
          marginBottom: res ? 8 : 0,
        }}
      >
        {busy ? "Elaborazione..." : "Elabora"}
      </button>
      {res && (
        <div
          style={{
            background: res.ok ? "#E6F2EB" : "#FBE9E6",
            border: "1px solid " + (res.ok ? "#bfe2cf" : "#f0ccc6"),
            borderRadius: 11,
            padding: "10px 13px",
            fontSize: 13,
            color: res.ok ? "#2E7D5B" : "#B23A2E",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {res.ok ? I.check : I.x} {res.m}
        </div>
      )}
    </Sheet>
  );
}
