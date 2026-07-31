// push.js — gestione lato client delle notifiche Web Push
// Importa questo modulo nell'app e chiama enablePush(user) da un bottone.

const VAPID_PUBLIC_KEY =
  "BG14aL8DKKY-bNfg4TbtBhonzx3ithFHA38HXP7qISrYu2gnw5Rzwr1rV_GPLqVZtFowThX3TDSqaZ013KKq1UM";

// URL della Edge Function che salva l'iscrizione (Supabase)
const SUBSCRIBE_URL =
  "https://CHOCOHOTEL-DA-CONFIGURARE.supabase.co/functions/v1/push-subscribe";
// Chiave anon del progetto (la stessa gia' usata dall'app in db.js)
const SUPABASE_ANON_KEY = "sb_publishable_XTYCLV5jSdk3ztG7PNuL_Q_1zu3tDwJ";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// True se il dispositivo puo' ricevere push. Su iPhone richiede l'app aggiunta alla Home.
export function pushSupported() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Attiva le notifiche per l'utente indicato. Va chiamata da un gesto (tap sul bottone).
export async function enablePush(user) {
  if (!pushSupported()) {
    return { ok: false, reason: "unsupported" };
  }
  // Registra il service worker
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  // Chiede il permesso
  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    return { ok: false, reason: "denied" };
  }

  // Crea o recupera l'iscrizione push
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  // Salva l'iscrizione su Supabase
  const res = await fetch(SUBSCRIBE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      subscription: sub.toJSON(),
      user_name: user?.name || null,
      role: user?.role || null,
    }),
  });
  if (!res.ok) return { ok: false, reason: "save_failed" };
  return { ok: true };
}

// Disattiva le notifiche su questo dispositivo
export async function disablePush() {
  if (!pushSupported()) return { ok: false };
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return { ok: true };
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await fetch(SUBSCRIBE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        action: "unsubscribe",
        subscription: sub.toJSON(),
      }),
    });
    await sub.unsubscribe();
  }
  return { ok: true };
}
