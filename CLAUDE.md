# App Apice Manutenzioni — Contesto Progetto

App React/Vite di gestione manutenzioni per **Hotel Giò (Jazz & Wine)**, gruppo Apicehotel.
Interfaccia in italiano. Sviluppo iterativo, mobile-first.

## Stack
- **Frontend**: React 18 + Vite (single file principale `src/App.jsx`)
- **Database**: Supabase (PostgreSQL) — client in `src/db.js`
- **Hosting**: Vercel (auto-deploy da questo repo GitHub `nuovo repo GitHub (account aggiornato)`)
- **Realtime**: Supabase subscriptions per dati condivisi tra dispositivi

## Struttura file
- `src/App.jsx` — tutta l'app (login, segnalazioni, interventi, admin)
- `src/db.js` — client Supabase + layer dati (mappatura camelCase↔snake_case)
- `src/main.jsx` — entry React
- `src/index.css` — reset globale
- `index.html`, `vite.config.js`, `package.json` — config progetto

## Credenziali Supabase (chiave publishable, sicura nel frontend)
- URL: https://jmhzmwyolxzacjunfwcq.supabase.co
- Project ID: jmhzmwyolxzacjunfwcq
- Region: eu-central-1 (Frankfurt)

## Tabelle Supabase
- `utenti` (id, nome, ruolo, pin) — 4 ruoli: direzione/governante/manutentore/reception
- `tecnici` (id, nome, telefono)
- `segnalazioni` (camera, urgenza, categoria, stato, foto, tecnico esterno, attesa pezzo...)
- `interventi` (interventi pianificati con assegnatari multipli)
- RLS attivo con policy permissive; realtime abilitato su segnalazioni/interventi/tecnici

## Funzionalità principali
- Login per nome (ruolo dedotto automaticamente) + PIN 4 cifre. Admin panel (PIN admin).
- Segnalazioni: camera, urgenza, categoria, foto, stato camera. Flusso: todo→tecnico→attesa pezzo→done.
- Interventi pianificati (solo direzione), assegnazione multipla interni + tecnici esterni.
- Rubrica tecnici con link WhatsApp pre-compilato.
- "I miei lavori", backup/ripristino JSON.

## Utenti default (PIN 0000)
Direzione: Alberto, Paolo, Michele, Giovanna. Manutentore: Domenico, Mario, Aly, Gianluca, Patricio.
Governante: Giulia. Reception: Reception.

## Convenzioni
- Codice conciso, stile esistente (no librerie extra non necessarie).
- Estetica: verde bosco (#0E5C49), beige (#F4F2ED), accento oro (#B9842F).
- Mobile-first. SVG icons (oggetto `I` in App.jsx), niente emoji nell'UI.
- Testi UI in italiano.

## Workflow deploy
Modifiche → commit + push su GitHub `main` → Vercel ricostruisce da solo (~1 min).
URL produzione: https://apice-project.vercel.app

## Note
- Login session e PIN admin restano in localStorage (locali al dispositivo).
- Dati condivisi (segnalazioni, utenti, tecnici, interventi) vivono su Supabase.

## Infrastruttura — piani a pagamento (dal 12/08/2026)
- **Organizzazione Supabase "Apicehotel"**: piano **Pro** attivo (~$25/mese base +
  ~$10/mese per ogni progetto oltre il primo — oggi 2 progetti, Hotel Giò +
  Chocohotel). Sblocca: backup giornalieri automatici, niente pausa per
  inattività, oltre il limite di 2 progetti del piano gratuito.
- **Team Vercel "apicehotel"**: piano **Pro** attivo ($20/mese, un solo
  abbonamento copre tutti i progetti del team). Sblocca: uso commerciale
  regolare (Hobby lo vieta nei termini di servizio), 1TB banda/mese, deploy
  protetti da password.
- Tracciamento importi/date fatture: tool dedicato (registro-costi.html,
  consegnato all'utente, salvato nel suo account Claude).
