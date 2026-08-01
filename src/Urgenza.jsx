// Urgenza.jsx — richieste urgenti (allarme broadcast a tutti i manutentori)
//
// Chi puo' inviarle: direzione, direttore_congressi, reception, sviluppatore.
// Chi le riceve: manutentore (tutti quelli attivi, non solo chi e' di turno,
// per non rischiare che l'allarme non arrivi a nessuno).
//
// Il suono forte parte solo se l'app e' aperta (Web Audio non puo' suonare a
// app chiusa). Ad app chiusa arriva comunque la notifica push, resa
// persistente (requireInteraction) e con vibrazione piu' insistente dal
// service worker — vedi sw.js.

import { useState } from "react";

// Sirena continua e assordante: onda dentata che sale/scende senza pause,
// doppio oscillatore leggermente stonato per renderla piu' dura.
export function playUrgentSiren() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
  "direttore_congressi",
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
