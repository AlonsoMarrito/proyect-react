import React from "react";

type Props = {
  onClose: () => void;
};

/** Equivalente ligero a `modalScheduleAppointment.vue` (calendario demo en Vue). */
export default function ScheduleAppointmentModal({ onClose }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
        background: "rgba(255, 255, 255, 0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "min(640px, 100%)",
          maxHeight: "80vh",
          overflow: "auto",
          background: "#fff",
          border: "2px solid #4e8bed",
          borderRadius: "20px",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "#4e8bed",
            }}
          >
            ✖
          </button>
        </div>
        <h2 style={{ margin: "0 0 12px", textAlign: "center" }}>Agendar cita</h2>
        <p style={{ margin: 0, color: "#546e7a", lineHeight: 1.5, textAlign: "center" }}>
          Vista de calendario para programar servicio (misma idea que en la app Vue). Puedes conectar
          aquí tu flujo de citas cuando esté disponible en API.
        </p>
      </div>
    </div>
  );
}
