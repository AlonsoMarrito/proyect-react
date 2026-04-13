import React, { useEffect, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getPreferences } from "../../scripts/preference/getPreference";
import { getWorkShift } from "../../scripts/workshift/getWorkShift";

import takePicture from "../../../assets/icons-app/takePicture.png";

export type EmployeedModalTheme = {
  textColorPrimary: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  accent: string;
  accentMuted: string;
  tableHeadBg: string;
  mutedText: string;
  inputBorder: string;
};

const FALLBACK_THEME: EmployeedModalTheme = {
  textColorPrimary: "#1a1d21",
  panelBg: "#ffffff",
  panelBorder: "rgba(15, 23, 42, 0.09)",
  panelShadow:
    "0 4px 6px rgba(15, 23, 42, 0.04), 0 14px 36px rgba(15, 23, 42, 0.09)",
  accent: "#D32F2F",
  accentMuted: "rgba(211, 47, 47, 0.1)",
  tableHeadBg: "#37474f",
  mutedText: "#546e7a",
  inputBorder: "#cfd8dc",
};

const STEP_LABELS = ["Personales", "Corporativos", "Contacto"];

type Props = {
  onClose: () => void;
  theme?: EmployeedModalTheme;
  onCreated?: () => void | Promise<void>;
};

export default function ModalCreateNewEmployeed({
  onClose,
  theme: themeProp,
  onCreated,
}: Props) {
  const { shift } = useParams();
  const theme = themeProp ?? FALLBACK_THEME;

  const [boxVisility, setBoxVisility] = useState(0);
  const [shiftWork, setShiftWork] = useState("");
  const [dataWorkForceView, setDataWorkForceView] = useState<any[]>([]);
  const [styleColor, setStyleColor] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color || 0);

      const shifts = await getWorkShift();
      setDataWorkForceView(Array.isArray(shifts) ? shifts : []);

      if (shift) setShiftWork(decodeURIComponent(String(shift)));
    })();
  }, [shift]);

  const changeGroupData = (action: "plus" | "minus") => {
    setBoxVisility((prev) =>
      action === "plus" ? Math.min(prev + 1, 2) : Math.max(prev - 1, 0)
    );
  };

  const createNewEmployee = async () => {
    setSaving(true);
    try {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      await Toast.fire({
        icon: "success",
        title: "Empleado registrado (demo; falta API)",
      });

      await onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "No se pudo completar el registro",
        confirmButtonColor: theme.accent,
      });
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle: CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: `1px solid ${theme.inputBorder}`,
    fontSize: "14px",
    color: theme.textColorPrimary,
    background: theme.panelBg,
    boxSizing: "border-box",
    outline: "none",
  };

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !saving) onClose();
  };

  const btnPrimary: CSSProperties = {
    padding: "11px 22px",
    borderRadius: "12px",
    border: "none",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    cursor: saving ? "wait" : "pointer",
    background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
    boxShadow: `0 4px 14px ${theme.accentMuted}`,
    opacity: saving ? 0.85 : 1,
    minWidth: "120px",
  };

  const btnGhost: CSSProperties = {
    padding: "11px 22px",
    borderRadius: "12px",
    border: `2px solid ${theme.inputBorder}`,
    background: theme.panelBg,
    color: theme.textColorPrimary,
    fontWeight: 600,
    fontSize: "14px",
    cursor: saving ? "not-allowed" : "pointer",
    minWidth: "120px",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: theme.mutedText,
    marginBottom: "6px",
  };

  const groupBox = (t: EmployeedModalTheme): CSSProperties => ({
    background: t.accentMuted,
    border: `1px solid ${t.panelBorder}`,
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "4px",
  });

  return (
    <div
      style={{
        ...styles.overlay,
        background: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(6px)",
        zIndex: 1200,
      }}
      onMouseDown={handleBackdropMouseDown}
      role="presentation"
    >
      <div
        style={{
          ...styles.modalShell,
          background: theme.panelBg,
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: theme.panelShadow,
          color: theme.textColorPrimary,
        }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-new-employee-title"
      >
        {/* Cabecera */}
        <div style={styles.topBar}>
          <div
            style={{
              ...styles.accentStripe,
              background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
            }}
          />
          <div style={styles.topBarMain}>
            <div style={styles.topBarText}>
              <p
                style={{
                  ...styles.kicker,
                  color: theme.mutedText,
                }}
              >
                Alta de personal
              </p>
              <h1
                id="modal-new-employee-title"
                style={{ ...styles.mainTitle, color: theme.textColorPrimary }}
              >
                Agregar empleado
              </h1>
              <p style={{ ...styles.subtitle, color: theme.mutedText }}>
                Completa los tres bloques. Podrás volver atrás con{" "}
                <strong style={{ color: theme.textColorPrimary }}>Anterior</strong>.
              </p>
            </div>
            <button
              type="button"
              style={{
                ...styles.closeBtn,
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
        </div>

        {/* Pasos */}
        <div style={styles.stepper}>
          {STEP_LABELS.map((label, i) => {
            const active = boxVisility === i;
            const done = boxVisility > i;
            return (
              <React.Fragment key={label}>
                {i > 0 && (
                  <div
                    style={{
                      ...styles.stepLine,
                      background: done || active ? theme.accent : theme.inputBorder,
                      opacity: done || active ? 0.45 : 0.35,
                    }}
                  />
                )}
                <div style={styles.stepItem}>
                  <div
                    style={{
                      ...styles.stepCircle,
                      background: active || done ? theme.accent : theme.panelBg,
                      color: active || done ? "#fff" : theme.mutedText,
                      border: `2px solid ${
                        active || done ? theme.accent : theme.inputBorder
                      }`,
                      boxShadow:
                        active && !done
                          ? `0 0 0 4px ${theme.accentMuted}`
                          : "none",
                    }}
                  >
                    {done && !active ? "✓" : i + 1}
                  </div>
                  <span
                    style={{
                      ...styles.stepLabel,
                      color: active ? theme.textColorPrimary : theme.mutedText,
                      fontWeight: active ? 700 : 600,
                    }}
                  >
                    {label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Contenido con scroll */}
        <div style={styles.scrollBody}>
          {boxVisility === 0 && (
            <>
              <div style={groupBox(theme)}>
                <p style={{ ...styles.groupHeading, color: theme.textColorPrimary }}>
                  Nombre completo
                </p>
                <div style={styles.formGrid2}>
                  <div>
                    <label style={labelStyle}>Nombre</label>
                    <input style={fieldStyle} placeholder="Nombre" />
                  </div>
                  <div>
                    <label style={labelStyle}>Segundo nombre</label>
                    <input style={fieldStyle} placeholder="Opcional" />
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido paterno</label>
                    <input style={fieldStyle} placeholder="Apellido paterno" />
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido materno</label>
                    <input style={fieldStyle} placeholder="Apellido materno" />
                  </div>
                </div>
              </div>

              <div style={groupBox(theme)}>
                <p style={{ ...styles.groupHeading, color: theme.textColorPrimary }}>
                  NSS y fecha de nacimiento
                </p>
                <div style={styles.formGrid2}>
                  <div>
                    <label style={labelStyle}>NSS</label>
                    <input style={fieldStyle} placeholder="Seguro social" />
                  </div>
                  <div>
                    <label style={labelStyle}>Fecha de nacimiento</label>
                    <input style={fieldStyle} type="date" />
                  </div>
                </div>
              </div>

              <div style={groupBox(theme)}>
                <p style={{ ...styles.groupHeading, color: theme.textColorPrimary }}>
                  Tipo de sangre
                </p>
                <div style={styles.bloodRow}>
                  <div style={{ flex: "1 1 100px" }}>
                    <label style={labelStyle}>Grupo</label>
                    <select style={{ ...fieldStyle, cursor: "pointer" }}>
                      <option>A</option>
                      <option>AB</option>
                      <option>B</option>
                      <option>O</option>
                    </select>
                  </div>
                  <div style={{ flex: "1 1 80px" }}>
                    <label style={labelStyle}>Rh</label>
                    <select style={{ ...fieldStyle, cursor: "pointer" }}>
                      <option>+</option>
                      <option>-</option>
                    </select>
                  </div>
                  <div style={styles.photoZone}>
                    <label style={{ ...labelStyle, textAlign: "center" }}>
                      Foto
                    </label>
                    <button
                      type="button"
                      style={{
                        ...styles.photoBtn,
                        borderColor: theme.inputBorder,
                        color: theme.mutedText,
                      }}
                    >
                      <img
                        src={takePicture}
                        alt=""
                        style={{
                          width: 28,
                          height: 28,
                          objectFit: "contain",
                          filter: styleColor === 1 ? "invert(1)" : "none",
                          opacity: 0.85,
                        }}
                      />
                      <span style={{ fontSize: "12px", fontWeight: 600 }}>
                        Subir foto
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {boxVisility === 1 && (
            <>
              <div style={groupBox(theme)}>
                <p style={{ ...styles.groupHeading, color: theme.textColorPrimary }}>
                  Identificación laboral
                </p>
                <div style={styles.formGrid2}>
                  <div>
                    <label style={labelStyle}>Número de empleado</label>
                    <input style={fieldStyle} placeholder="Ej. 1013" />
                  </div>
                  <div>
                    <label style={labelStyle}>Fecha de ingreso</label>
                    <input style={fieldStyle} type="date" />
                  </div>
                </div>
              </div>

              <div style={groupBox(theme)}>
                <p style={{ ...styles.groupHeading, color: theme.textColorPrimary }}>
                  Turno y puesto
                </p>
                <div style={styles.formGrid2}>
                  <div>
                    <label style={labelStyle}>Turno asignado</label>
                    <select
                      style={{ ...fieldStyle, cursor: "pointer" }}
                      value={shiftWork}
                      onChange={(e) => setShiftWork(e.target.value)}
                    >
                      {dataWorkForceView.map((ws, i) => (
                        <option key={ws?.id ?? i} value={ws.name}>
                          {ws.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Código / posición</label>
                    <select style={{ ...fieldStyle, cursor: "pointer" }}>
                      <option>01</option>
                      <option>02</option>
                      <option>Chofer</option>
                      <option>Oficial</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={groupBox(theme)}>
                <p style={{ ...styles.groupHeading, color: theme.textColorPrimary }}>
                  Estado y tipo
                </p>
                <div style={styles.formGrid2}>
                  <div>
                    <label style={labelStyle}>Estatus</label>
                    <select style={{ ...fieldStyle, cursor: "pointer" }}>
                      <option>Activo</option>
                      <option>Inactivo</option>
                      <option>Permiso</option>
                      <option>Incapacidad</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Tipo de puesto</label>
                    <select style={{ ...fieldStyle, cursor: "pointer" }}>
                      <option>Operativo</option>
                      <option>Administrativo</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {boxVisility === 2 && (
            <div style={groupBox(theme)}>
              <p style={{ ...styles.groupHeading, color: theme.textColorPrimary }}>
                Contacto
              </p>
              <div style={styles.formGrid2}>
                <div>
                  <label style={labelStyle}>Correo personal</label>
                  <input style={fieldStyle} type="email" placeholder="correo@ejemplo.com" />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono personal</label>
                  <input style={fieldStyle} placeholder="10 dígitos" />
                </div>
                <div>
                  <label style={labelStyle}>Contacto de emergencia</label>
                  <input style={fieldStyle} placeholder="Nombre completo" />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono emergencia</label>
                  <input style={fieldStyle} placeholder="Teléfono" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Teléfono alterno</label>
                  <input style={fieldStyle} placeholder="Opcional" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div
          style={{
            ...styles.footerBar,
            borderTop: `1px solid ${theme.panelBorder}`,
          }}
        >
          {boxVisility > 0 && (
            <button
              type="button"
              style={btnGhost}
              onClick={() => changeGroupData("minus")}
              disabled={saving}
            >
              ← Anterior
            </button>
          )}
          <div style={{ flex: 1 }} />
          {boxVisility < 2 && (
            <button
              type="button"
              style={btnPrimary}
              onClick={() => changeGroupData("plus")}
              disabled={saving}
            >
              Siguiente →
            </button>
          )}
          {boxVisility === 2 && (
            <button
              type="button"
              style={btnPrimary}
              onClick={() => void createNewEmployee()}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar empleado"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "clamp(12px, 3vw, 24px)",
    boxSizing: "border-box",
  },

  modalShell: {
    width: "min(720px, 100%)",
    maxHeight: "min(92vh, 880px)",
    display: "flex",
    flexDirection: "column",
    borderRadius: "18px",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  topBar: {
    display: "flex",
    alignItems: "stretch",
    gap: 0,
    flexShrink: 0,
  },

  accentStripe: {
    width: "5px",
    flexShrink: 0,
    borderRadius: "0 2px 2px 0",
  },

  topBarMain: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 18px 12px 14px",
    minWidth: 0,
  },

  topBarText: {
    flex: 1,
    minWidth: 0,
  },

  kicker: {
    margin: 0,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },

  mainTitle: {
    margin: "6px 0 0",
    fontSize: "clamp(1.2rem, 2.5vw, 1.45rem)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },

  subtitle: {
    margin: "8px 0 0",
    fontSize: "13px",
    lineHeight: 1.45,
    maxWidth: "42ch",
  },

  closeBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    border: "2px solid",
    background: "rgba(255,255,255,0.96)",
    fontSize: "22px",
    lineHeight: 1,
    cursor: "pointer",
    flexShrink: 0,
  },

  stepper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "4px",
    padding: "12px 20px 16px",
    flexShrink: 0,
  },

  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    minWidth: "72px",
  },

  stepCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 800,
    transition: "box-shadow 0.2s ease",
  },

  stepLabel: {
    fontSize: "11px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    textAlign: "center",
    maxWidth: "88px",
    lineHeight: 1.2,
  },

  stepLine: {
    width: "24px",
    height: "3px",
    borderRadius: "2px",
    alignSelf: "center",
    marginBottom: "22px",
  },

  scrollBody: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "8px 20px 16px",
    WebkitOverflowScrolling: "touch",
  },

  groupHeading: {
    margin: "0 0 14px",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },

  formGrid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "14px 16px",
  },

  bloodRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: "16px",
  },

  photoZone: {
    flex: "1 1 140px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "120px",
  },

  photoBtn: {
    width: "100%",
    maxWidth: "160px",
    minHeight: "88px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "12px",
    border: "2px dashed",
    background: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    padding: "12px",
    boxSizing: "border-box",
  },

  footerBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 20px 18px",
    flexShrink: 0,
    background: "rgba(0,0,0,0.02)",
  },
};
