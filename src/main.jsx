import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ── Banner "versione dismessa" ───────────────────────────────────────────────
// Chocohotel come app separata è stata sostituita dall'app unificata
// (Apicehotel-Manutenzione) e il suo database Supabase è stato cancellato.
// L'app resta apribile ma non è operativa: questo banner lo comunica chiaro.
function mostraBannerDismessa() {
  const banner = document.createElement("div");
  banner.setAttribute("role", "note");
  banner.style.cssText = [
    "position:fixed", "top:0", "left:0", "right:0", "z-index:99999",
    "background:#640A0A", "color:#fff", "padding:10px 16px",
    "font:600 13px/1.4 ui-sans-serif,system-ui,sans-serif",
    "text-align:center", "box-shadow:0 2px 8px rgba(0,0,0,.25)",
  ].join(";");
  banner.textContent =
    "Versione dismessa — questa app non è più operativa. Chocohotel è ora gestito dall'app unificata Apicehotel.";
  document.body.appendChild(banner);
  // lascia spazio in cima così il banner non copre i contenuti
  document.body.style.paddingTop = "42px";
}

// Service worker disattivato (app dismessa): niente cache offline, e rimuove
// eventuali registrazioni precedenti rimaste sul dispositivo.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations?.().then((regs) => {
    regs.forEach((r) => r.unregister());
  }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

mostraBannerDismessa();

