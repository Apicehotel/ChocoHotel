// NotificheSettings.jsx — pannello "Notifiche" per il menu hamburger
// Toggle push + scelta suono con anteprima. Stile allineato all'app (verde #0E5C49).

import { useState, useRef } from "react";
import { enablePush, disablePush, pushSupported } from "./push";

const SOUNDS = [
  { id: "classico", label: "Classico", file: "/sounds/classico.mp3" },
  { id: "jazz", label: "Jazz", file: "/sounds/jazz.mp3" },
  { id: "melodia", label: "Melodia", file: "/sounds/melodia.mp3" },
  { id: "miao", label: "Miao", file: "/sounds/miao.mp3" },
  { id: "nessuno", label: "Nessuno", file: null },
];

export function getNotifSound() {
  const id = localStorage.getItem("notifSound") || "classico";
  return SOUNDS.find((s) => s.id === id) || SOUNDS[0];
}

// Da chiamare quando arriva una nuova segnalazione con l'app aperta
export function playNotifSound() {
  const s = getNotifSound();
  if (!s.file) return;
  try {
    new Audio(s.file).play().catch(() => {});
  } catch (e) {}
}

export default function NotificheSettings({ user, onClose, flash }) {
  const [pushOn, setPushOn] = useState(
    typeof Notification !== "undefined" &&
      Notification.permission === "granted",
  );
  const [busy, setBusy] = useState(false);
  const [sound, setSound] = useState(
    localStorage.getItem("notifSound") || "classico",
  );
  const audioRef = useRef(null);

  const togglePush = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!pushOn) {
        const r = await enablePush(user);
        if (r.ok) {
          setPushOn(true);
          flash?.("Notifiche attive");
        } else if (r.reason === "unsupported")
          flash?.("Su iPhone aggiungi prima l'app alla schermata Home", false);
        else if (r.reason === "denied")
          flash?.(
            "Permesso negato: attivalo dalle impostazioni del telefono",
            false,
          );
        else flash?.("Errore attivazione notifiche", false);
      } else {
        await disablePush();
        setPushOn(false);
        flash?.("Notifiche disattivate");
      }
    } finally {
      setBusy(false);
    }
  };

  const chooseSound = (s) => {
    setSound(s.id);
    localStorage.setItem("notifSound", s.id);
    if (audioRef.current) audioRef.current.pause();
    if (s.file) {
      audioRef.current = new Audio(s.file);
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 80,
          background: "rgba(0,0,0,.35)",
        }}
      />
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 90,
          background: "#fff",
          borderRadius: "16px 16px 0 0",
          maxWidth: 760,
          margin: "0 auto",
          boxShadow: "0 -8px 30px rgba(0,0,0,.18)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "#0E5C49",
            color: "#fff",
            padding: "16px 18px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 15 }}>Notifiche</div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.15)",
              border: "none",
              color: "#fff",
              width: 30,
              height: 30,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "6px 18px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom: "1px solid #F4F2ED",
            }}
          >
            <div>
              <div
                style={{ fontSize: 14.5, fontWeight: 700, color: "#1B2420" }}
              >
                Notifiche push
              </div>
              <div style={{ fontSize: 12, color: "#7A8580", marginTop: 2 }}>
                Avviso a ogni nuova segnalazione
              </div>
            </div>
            <button
              onClick={togglePush}
              disabled={busy}
              aria-label="Attiva o disattiva notifiche"
              style={{
                width: 50,
                height: 29,
                borderRadius: 15,
                border: "none",
                cursor: busy ? "default" : "pointer",
                flexShrink: 0,
                background: pushOn ? "#0E5C49" : "#D8D8D2",
                position: "relative",
                transition: "background .2s",
                opacity: busy ? 0.6 : 1,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: pushOn ? 24 : 3,
                  width: 23,
                  height: 23,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left .2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,.25)",
                }}
              />
            </button>
          </div>

          <div
            style={{
              fontSize: 14.5,
              fontWeight: 700,
              color: "#1B2420",
              margin: "16px 0 4px",
            }}
          >
            Suono notifica
          </div>
          <div style={{ fontSize: 12, color: "#7A8580", marginBottom: 10 }}>
            Tocca per ascoltare l'anteprima
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SOUNDS.map((s) => (
              <button
                key={s.id}
                onClick={() => chooseSound(s)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 20,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  border:
                    sound === s.id
                      ? "1.5px solid #0E5C49"
                      : "1.5px solid #E4E4DE",
                  background: sound === s.id ? "#E6F0EC" : "#FBFBF9",
                  color: sound === s.id ? "#0E5C49" : "#5C645E",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div
            style={{
              fontSize: 11.5,
              color: "#8A9490",
              lineHeight: 1.45,
              marginTop: 16,
              background: "#F7F7F4",
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            Il suono scelto si sente quando arriva una segnalazione con l'app
            aperta. Ad app chiusa la notifica arriva con il suono di sistema del
            telefono.
            {!pushSupported() &&
              " Su iPhone le notifiche funzionano solo dopo aver aggiunto l'app alla schermata Home (Condividi → Aggiungi a Home)."}
          </div>
        </div>
      </div>
    </>
  );
}
