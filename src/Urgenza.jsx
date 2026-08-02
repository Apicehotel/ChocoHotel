// Urgenza.jsx — richieste urgenti (allarme broadcast a tutti i manutentori)
//
// Chi puo' inviarle: direzione, reception, sviluppatore.
// Chi le riceve: manutentore (tutti quelli attivi, non solo chi e' di turno,
// per non rischiare che l'allarme non arrivi a nessuno).
//
// Il suono forte parte solo se l'app e' aperta (Web Audio non puo' suonare a
// app chiusa). Ad app chiusa arriva comunque la notifica push, resa
// persistente (requireInteraction) e con vibrazione piu' insistente dal
// service worker — vedi sw.js.

import { useState, useEffect } from "react";
import { DB } from "./db.js";

// Sirena continua e assordante: onda dentata che sale/scende senza pause,
// doppio oscillatore leggermente stonato per renderla piu' dura.
//
// BUG RISOLTO: prima si creava un nuovo AudioContext ad ogni chiamata. I
// browser (soprattutto su mobile) avviano l'AudioContext "sospeso" finche'
// non viene sbloccato da un tocco dell'utente — e la sirena parte da un
// evento del database (realtime), non da un tocco, quindi restava muta.
// Ora si usa un unico AudioContext condiviso, sbloccato al primo tocco
// dopo il login (vedi useUnlockUrgentAudio), e ripreso (resume) prima di
// ogni riproduzione per sicurezza.
let sharedCtx = null;
function getSharedCtx() {
  if (!sharedCtx) {
    sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return sharedCtx;
}

// Da chiamare durante un vero tocco/click dell'utente (unico modo per
// sbloccare l'audio su iOS/Safari e sui browser con autoplay bloccato).
export function unlockUrgentAudio() {
  try {
    const ctx = getSharedCtx();
    if (ctx.state === "suspended") ctx.resume();
    // Un buffer silenzioso, riprodotto durante il tocco, sblocca
    // definitivamente l'audio su iOS anche per riproduzioni future.
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (e) {
    /* niente da fare se il browser non supporta Web Audio */
  }
}

// Sblocca l'audio al primo tocco dell'utente dopo il login (una volta sola).
export function useUnlockUrgentAudio(user) {
  useEffect(() => {
    if (!user) return;
    const onFirstTouch = () => {
      unlockUrgentAudio();
      window.removeEventListener("pointerdown", onFirstTouch);
    };
    window.addEventListener("pointerdown", onFirstTouch, { once: true });
    return () => window.removeEventListener("pointerdown", onFirstTouch);
  }, [user]);
}

export async function playUrgentSiren() {
  try {
    const ctx = getSharedCtx();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    const now = ctx.currentTime;
    const duration = 5;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, now);
    masterGain.connect(ctx.destination);

    const makeSweep = (startFreq, gainVal) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainVal, now);
      osc.connect(gain);
      gain.connect(masterGain);
      let t = now;
      osc.frequency.setValueAtTime(startFreq, t);
      while (t < now + duration) {
        t += 0.18;
        osc.frequency.linearRampToValueAtTime(startFreq + 600, t);
        t += 0.18;
        osc.frequency.linearRampToValueAtTime(startFreq, t);
      }
      osc.start(now);
      osc.stop(t);
    };
    makeSweep(650, 1);
    makeSweep(660, 0.6);

    if (navigator.vibrate)
      navigator.vibrate([400, 80, 400, 80, 400, 80, 400, 80, 400]);
  } catch (e) {}
}

const CAN_INVIA_URGENZA = [
  "direzione",
  "reception",
  "sviluppatore",
];
export function canInviaUrgenza(role) {
  return CAN_INVIA_URGENZA.includes(role);
}

const wrapSt = {
  position: "fixed",
  inset: 0,
  zIndex: 95,
  background: "rgba(27,36,32,.45)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};
const sheetSt = {
  background: "#fff",
  width: "100%",
  maxWidth: 480,
  borderRadius: "18px 18px 0 0",
  padding: "20px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)",
};

// ── Bottone + modulo di invio (direzione / direttore congressi / reception) ──
export function UrgenzaSendButton({ user, onSend, onFlash }) {
  const [open, setOpen] = useState(false);
  const [nota, setNota] = useState("");
  const [busy, setBusy] = useState(false);
  const [presenza, setPresenza] = useState(null); // null = non ancora caricata

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    DB.loadManutentoriPresenza().then((rows) => {
      if (!cancelled) setPresenza(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const invia = async () => {
    const testo = nota.trim();
    if (!testo) {
      onFlash?.("Scrivi prima una nota", false);
      return;
    }
    setBusy(true);
    try {
      await onSend(testo);
      setNota("");
      setOpen(false);
      onFlash?.("Richiesta urgente inviata ✓");
    } catch {
      onFlash?.("Errore nell'invio della richiesta", false);
    }
    setBusy(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Invia richiesta urgente"
        style={{
          position: "fixed",
          right: 16,
          bottom: 90,
          zIndex: 60,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: "#C81E1E",
          color: "#fff",
          border: "none",
          fontSize: 24,
          boxShadow: "0 6px 18px rgba(200,30,30,.4)",
          cursor: "pointer",
        }}
      >
        🚨
      </button>
      {open && (
        <div style={wrapSt} onClick={() => !busy && setOpen(false)}>
          <div style={sheetSt} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
              🚨 Richiesta urgente
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "#7A8580",
                marginBottom: 14,
                lineHeight: 1.4,
              }}
            >
              Va subito a tutti i manutentori attivi, con suono forte e
              notifica che resta finché non viene gestita.
            </div>
            {presenza && presenza.length > 0 && (
              <div
                style={{
                  background: "#F4F6F5",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: 12,
                  fontSize: 12.5,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: "#5C645E",
                    marginBottom: 6,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  In struttura ora
                </div>
                {presenza.filter((m) => m.in_struttura).length === 0 ? (
                  <div style={{ color: "#8A9490" }}>
                    Nessuno risulta in struttura al momento — la richiesta
                    arriva comunque a tutti.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    {presenza
                      .filter((m) => m.in_struttura)
                      .map((m) => (
                        <span
                          key={m.nome}
                          style={{
                            background: "#E3F1EE",
                            color: "#0A4A40",
                            padding: "3px 9px",
                            borderRadius: 20,
                            fontWeight: 600,
                          }}
                        >
                          🟢 {m.nome}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )}
            <textarea
              value={nota}
              maxLength={255}
              onChange={(e) => setNota(e.target.value)}
              placeholder="es. Allagamento bagno camera 214, acqua che esce da sotto la porta"
              style={{
                width: "100%",
                minHeight: 90,
                padding: "10px 12px",
                border: "1px solid #E4E4DE",
                borderRadius: 10,
                fontSize: 14.5,
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: 11.5,
                color: nota.length >= 255 ? "#C81E1E" : "#8A9490",
                marginTop: 4,
                marginBottom: 12,
              }}
            >
              {nota.length} / 255
            </div>
            <button
              onClick={invia}
              disabled={busy}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: "none",
                background: "#C81E1E",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: busy ? "default" : "pointer",
                opacity: busy ? 0.7 : 1,
                marginBottom: 8,
              }}
            >
              {busy ? "Invio…" : "Invia richiesta urgente"}
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={busy}
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
    </>
  );
}

// ── Banner di ricezione (manutentore) ────────────────────────────────────────
export function UrgenzaBanner({ urgenze, user, onTake }) {
  const aperte = (urgenze || []).filter((u) => u.status !== "presa_in_carico");
  if (!aperte.length) return null;
  return (
    <div style={{ padding: "10px 14px 0" }}>
      {aperte.map((u) => (
        <div
          key={u.id}
          style={{
            background: "#C81E1E",
            color: "#fff",
            borderRadius: 14,
            padding: "16px 16px",
            marginBottom: 10,
            animation: "urgPulse 1s infinite",
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              fontWeight: 800,
              background: "rgba(255,255,255,.2)",
              display: "inline-block",
              padding: "3px 9px",
              borderRadius: 20,
              marginBottom: 8,
            }}
          >
            🚨 Richiesta urgente
          </div>
          <div
            style={{
              fontSize: 12.5,
              opacity: 0.9,
              marginBottom: 8,
            }}
          >
            Da {u.createdBy}
          </div>
          <div
            style={{
              background: "rgba(255,255,255,.15)",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 14,
              lineHeight: 1.4,
              marginBottom: 12,
            }}
          >
            {u.note}
          </div>
          <button
            onClick={() => onTake(u.id)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "none",
              background: "#fff",
              color: "#8A0F0F",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Preso in carico
          </button>
        </div>
      ))}
      <style>{`@keyframes urgPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,30,30,.6)}50%{box-shadow:0 0 0 10px rgba(200,30,30,0)}}`}</style>
    </div>
  );
}

// ── Linguetta "Urgenze": lista persistente (non sparisce quando presa in
// carico, resta consultabile finche' la pulizia automatica a 72h non la
// toglie dal DB). Complementa il banner in cima, che invece serve per
// l'allarme immediato con suono.
export function UrgenzeLog({ urgenze, onTake, canTake = true }) {
  if (!urgenze || urgenze.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#5C645E",
        }}
      >
        <div style={{ fontWeight: 600, color: "#1B2420" }}>
          Nessuna richiesta urgente
        </div>
        <div style={{ fontSize: 12.5, marginTop: 6, color: "#8A9490" }}>
          Le richieste restano qui per 72 ore, poi vengono rimosse in
          automatico.
        </div>
      </div>
    );
  }
  return (
    <div style={{ paddingTop: 4 }}>
      {urgenze.map((u) => {
        const presa = u.status === "presa_in_carico";
        return (
          <div
            key={u.id}
            style={{
              background: presa ? "#E3F1EE" : "#C81E1E",
              color: presa ? "#0A4A40" : "#fff",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                fontWeight: 800,
                background: presa
                  ? "rgba(10,74,64,.12)"
                  : "rgba(255,255,255,.2)",
                display: "inline-block",
                padding: "3px 9px",
                borderRadius: 20,
                marginBottom: 8,
              }}
            >
              {presa ? "✅ Gestita" : "🚨 Richiesta urgente"}
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.9, marginBottom: 8 }}>
              Da {u.createdBy}
              {" · "}
              {new Date(u.createdAt).toLocaleString("it-IT", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div
              style={{
                background: presa ? "rgba(10,74,64,.08)" : "rgba(255,255,255,.15)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 14,
                lineHeight: 1.4,
                marginBottom: presa ? 0 : 12,
              }}
            >
              {u.note}
            </div>
            {presa ? (
              <div style={{ fontSize: 12, marginTop: 8, fontWeight: 600 }}>
                Presa in carico da {u.takenBy}
                {u.takenAt
                  ? " · " +
                    new Date(u.takenAt).toLocaleString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            ) : canTake ? (
              <button
                onClick={() => onTake(u.id)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: "none",
                  background: "#fff",
                  color: "#8A0F0F",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Preso in carico
              </button>
            ) : (
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>
                In attesa che un manutentore la prenda in carico
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Check-in manuale "Sono in struttura" (solo manutentore) ─────────────────
// E' la base sempre affidabile: funziona anche ad app chiusa perche' e'
// solo un flag nel DB. Il rilevamento GPS (vedi useAutoCheckInGPS in App.jsx)
// puo' accendere questo stato in automatico, ma non lo spegne mai se e'
// stato acceso a mano: il manuale ha sempre l'ultima parola.
export function InStrutturaToggle({ user }) {
  const [dentro, setDentro] = useState(null); // null = non ancora caricato
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    DB.loadMiaPresenza(user.name).then((r) => {
      if (!cancelled) setDentro(!!r?.in_struttura);
    });
    return () => {
      cancelled = true;
    };
  }, [user.name]);

  if (dentro === null) return null;

  const toggle = async () => {
    setBusy(true);
    const nuovo = !dentro;
    await DB.setInStrutturaManuale(user.name, nuovo);
    setDentro(nuovo);
    setBusy(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        margin: "8px 14px 0",
        padding: "8px 14px",
        borderRadius: 20,
        border: "1px solid #E4E4DE",
        background: dentro ? "#E3F1EE" : "#fff",
        color: dentro ? "#0A4A40" : "#5C645E",
        fontSize: 12.5,
        fontWeight: 700,
        cursor: busy ? "default" : "pointer",
        opacity: busy ? 0.7 : 1,
      }}
    >
      {dentro ? "🟢 Sono in struttura" : "⚪️ Non sono in struttura"}
    </button>
  );
}

// ── Rilevamento GPS automatico (solo manutentore) ───────────────────────────
// Chiede il permesso di posizione una sola volta (il browser lo ricorda da
// solo). Se l'app e' aperta ed entro 200m da Hotel Giò, segna "in struttura"
// in automatico — ma solo se lo stato attuale non e' stato impostato a mano
// (vedi autoSetInStrutturaGPS in db.js). Non fa nulla se il permesso viene
// negato o se il browser non supporta la geolocalizzazione.
const HOTEL_LAT = 43.0992677;
const HOTEL_LNG = 12.3847294;
const RAGGIO_METRI = 200;

function distanzaMetri(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function useAutoCheckInGPS(user) {
  useEffect(() => {
    if (!user || user.role !== "manutentore") return;
    if (!("geolocation" in navigator)) return;
    let cancelled = false;

    const controlla = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const dist = distanzaMetri(
            pos.coords.latitude,
            pos.coords.longitude,
            HOTEL_LAT,
            HOTEL_LNG,
          );
          DB.autoSetInStrutturaGPS(user.name, dist <= RAGGIO_METRI);
        },
        () => {
          // Permesso negato o posizione non disponibile: ignora in
          // silenzio, resta valido solo il check-in manuale.
        },
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 },
      );
    };

    controlla();
    const id = setInterval(controlla, 2 * 60 * 1000); // ogni 2 minuti
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user]);
}
