// Primitive UI condivise tra App.jsx e i moduli delle singole sezioni
// (es. Camere.jsx). Isolate qui, senza dipendere da App.jsx, per evitare
// import circolari (App.jsx -> sezione -> App.jsx), che con Vite/React
// possono rompere l'app in modo silenzioso (pagina bianca).

const IconBack = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const inputSt = {
  width: "100%",
  boxSizing: "border-box",
  background: "#fff",
  border: "1px solid #E4E0D6",
  borderRadius: 11,
  padding: "12px 13px",
  fontSize: 15,
  color: "#1B2420",
  outline: "none",
  fontFamily: "inherit",
};

export const ctaSt = {
  width: "100%",
  background: "#0E5C49",
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

export const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 7 }}>
      {label}
    </label>
    {children}
  </div>
);

export function Sheet({ onClose, title, children }) {
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
          background: "#F4F2ED",
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
            background: "#F4F2ED",
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
            {IconBack}
          </button>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h2>
        </div>
        <div style={{ padding: "4px 16px 28px" }}>{children}</div>
      </div>
    </div>
  );
}
