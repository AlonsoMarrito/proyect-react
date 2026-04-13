import React, { useCallback, useEffect, useState, type CSSProperties } from "react";
import Swal from "sweetalert2";
import { createNewWorkShift } from "../../scripts/workshift/createNewWorkShift";

export type WorkShiftModalTheme = {
  textColorPrimary: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  accent: string;
  tableHeadBg: string;
  mutedText: string;
  inputBorder: string;
};

type Props = {
  theme: WorkShiftModalTheme;
  onClose: () => void;
  /** Tras crear correctamente (p. ej. volver a cargar turnos) */
  onCreated?: () => void | Promise<void>;
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES_TEN = ["00", "10", "20", "30", "40", "50"];

export default function ModalCreateNewWorkShift({
  theme,
  onClose,
  onCreated,
}: Props) {
  const [nameShift, setNameShift] = useState("");
  const [typeShift, setTypeShift] = useState("operativo");
  const [hourStartShift, setHourStartShift] = useState("06");
  const [minutesStartShift, setMinutesStartShift] = useState("00");
  const [hourWorksShift, setHourWorksShift] = useState("06");
  const [minutesWorkShift, setMinutesWorkShift] = useState("00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !saving) onClose();
  };

  const createNewShift = useCallback(async () => {
    const trimmed = nameShift.trim();
    if (!trimmed) {
      void Swal.fire({
        icon: "warning",
        title: "Faltan datos",
        text: "Indica el nombre del turno.",
        confirmButtonColor: theme.accent,
      });
      return;
    }

    const startTime = `${hourStartShift}:${minutesStartShift}:00`;
    const workTime = `${hourWorksShift}:${minutesWorkShift}:00`;

    setSaving(true);
    try {
      await createNewWorkShift(trimmed, typeShift, startTime, workTime);

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });
      await Toast.fire({
        icon: "success",
        title: "Turno registrado con éxito",
      });

      await onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
      });
      await Toast.fire({
        icon: "error",
        title: "No se pudo crear el turno",
      });
    } finally {
      setSaving(false);
    }
  }, [
    nameShift,
    typeShift,
    hourStartShift,
    minutesStartShift,
    hourWorksShift,
    minutesWorkShift,
    onClose,
    onCreated,
    theme.accent,
  ]);

  const selectStyle: CSSProperties = {
    padding: "8px 6px",
    borderRadius: "8px",
    border: `2px solid ${theme.inputBorder}`,
    background: theme.panelBg,
    color: theme.textColorPrimary,
    fontSize: "14px",
    fontWeight: 600,
    minWidth: "52px",
    cursor: "pointer",
  };

  const labelStyle: CSSProperties = {
    margin: "0 0 6px",
    fontSize: "12px",
    fontWeight: 700,
    color: theme.mutedText,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    width: "100%",
    maxWidth: "360px",
  };

  const inputTextStyle: CSSProperties = {
    width: "100%",
    maxWidth: "360px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: `2px solid ${theme.inputBorder}`,
    fontSize: "14px",
    fontWeight: 600,
    color: theme.textColorPrimary,
    background: theme.panelBg,
    boxSizing: "border-box",
    textAlign: "center",
  };

  return (
    <div
      style={styles.overlay}
      onMouseDown={handleOverlayMouseDown}
      role="presentation"
    >
      <div
        style={{
          ...styles.modalBox,
          background: theme.panelBg,
          borderColor: theme.panelBorder,
          boxShadow: theme.panelShadow,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-new-shift-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHead}>
          <h2
            id="modal-new-shift-title"
            style={{ margin: 0, color: theme.textColorPrimary, fontSize: "1.15rem" }}
          >
            Crear un nuevo turno de trabajo
          </h2>
          <button
            type="button"
            style={{
              ...styles.modalClose,
              borderColor: theme.inputBorder,
              color: theme.mutedText,
            }}
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div style={styles.formCol}>
          <label htmlFor="new-shift-name" style={labelStyle}>
            Nombre del turno
          </label>
          <input
            id="new-shift-name"
            type="text"
            placeholder="Ejemplo: Matutino"
            value={nameShift}
            onChange={(e) => setNameShift(e.target.value)}
            style={inputTextStyle}
            disabled={saving}
            autoComplete="off"
          />

          <label htmlFor="new-shift-type" style={{ ...labelStyle, marginTop: "14px" }}>
            Tipo de turno
          </label>
          <select
            id="new-shift-type"
            value={typeShift}
            onChange={(e) => setTypeShift(e.target.value)}
            style={{ ...selectStyle, maxWidth: "360px", width: "100%", padding: "10px 12px" }}
            disabled={saving}
          >
            <option value="operativo">Operativo</option>
            <option value="administrativo">Administrativo</option>
            <option value="otro">Otro</option>
          </select>

          <p style={{ ...labelStyle, marginTop: "14px" }}>Hora de inicio</p>
          <div style={styles.timeRow}>
            <select
              aria-label="Hora inicio"
              value={hourStartShift}
              onChange={(e) => setHourStartShift(e.target.value)}
              style={selectStyle}
              disabled={saving}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span style={{ color: theme.mutedText, fontWeight: 700 }}>:</span>
            <select
              aria-label="Minutos inicio"
              value={minutesStartShift}
              onChange={(e) => setMinutesStartShift(e.target.value)}
              style={selectStyle}
              disabled={saving}
            >
              {MINUTES_TEN.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <p style={{ ...labelStyle, marginTop: "14px" }}>Horas de jornada</p>
          <div style={styles.timeRow}>
            <select
              aria-label="Horas jornada"
              value={hourWorksShift}
              onChange={(e) => setHourWorksShift(e.target.value)}
              style={selectStyle}
              disabled={saving}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span style={{ color: theme.mutedText, fontWeight: 700 }}>:</span>
            <select
              aria-label="Minutos jornada"
              value={minutesWorkShift}
              onChange={(e) => setMinutesWorkShift(e.target.value)}
              style={selectStyle}
              disabled={saving}
            >
              {MINUTES_TEN.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            style={{
              ...styles.btnSave,
              background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
              opacity: saving ? 0.75 : 1,
              cursor: saving ? "wait" : "pointer",
            }}
            onClick={() => void createNewShift()}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1200,
    padding: "16px",
    boxSizing: "border-box",
  },
  modalBox: {
    width: "min(520px, 100%)",
    maxHeight: "90vh",
    overflow: "auto",
    borderRadius: "16px",
    border: "1px solid",
    padding: "1.25rem",
    boxSizing: "border-box",
  },
  modalHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "1rem",
  },
  modalClose: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border: "2px solid",
    background: "rgba(255,255,255,0.95)",
    fontSize: "22px",
    lineHeight: 1,
    cursor: "pointer",
    flexShrink: 0,
  },
  formCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  timeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "4px",
  },
  footer: {
    marginTop: "1.25rem",
    display: "flex",
    justifyContent: "center",
  },
  btnSave: {
    padding: "12px 28px",
    borderRadius: "12px",
    border: "none",
    color: "#fff",
    fontWeight: 700,
    fontSize: "15px",
    letterSpacing: "0.02em",
    minWidth: "200px",
  },
};
