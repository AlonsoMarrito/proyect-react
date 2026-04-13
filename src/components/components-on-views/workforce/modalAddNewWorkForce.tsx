import React, { useEffect, useState, type CSSProperties } from "react";

import { getPreferences } from "../../scripts/preference/getPreference";
import { getTypeVehiclesOperatives } from "../../scripts/vehicle/generalInfoVehicle/getVehicles";
import { getAllBasesOperatives } from "../../scripts/bases/getBases";
import { getWorkShift } from "../../scripts/workshift/getWorkShift";
import { getAllUser } from "../../scripts/user/getUser";
import { createNewWorkForce } from "../../scripts/workforce/createWorkForce";

type ModalTheme = {
  primary: string;
  primaryDark: string;
  secondary: string;
  text: string;
  textMuted: string;
  border: string;
  accentSoft: string;
  shadow: string;
};

const colorApss: ModalTheme[] = [
  {
    primary: "#37474f",
    primaryDark: "#263238",
    secondary: "#ffffff",
    text: "#1a1d21",
    textMuted: "#546e7a",
    border: "rgba(15, 23, 42, 0.12)",
    accentSoft: "rgba(55, 71, 79, 0.08)",
    shadow: "0 8px 40px rgba(15, 23, 42, 0.15)",
  },
  {
    primary: "#c62828",
    primaryDark: "#b71c1c",
    secondary: "#fffafa",
    text: "#6d1f1f",
    textMuted: "#8d4e4e",
    border: "rgba(198, 40, 40, 0.22)",
    accentSoft: "rgba(198, 40, 40, 0.12)",
    shadow: "0 10px 44px rgba(183, 28, 28, 0.2)",
  },
];

type Props = {
  onClose: () => void;
  onRefresh?: () => void;
};

type WorkRow = {
  workShift: string;
  positionToday: string;
  fullName: string;
};

export default function ModalAddNewWorkForce({
  onClose,
  onRefresh,
}: Props) {
  const [styleColor, setStyleColor] = useState(0);

  const [basesData, setBasesData] = useState<any[]>([]);
  const [vehiclesData, setVehiclesData] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [workShifts, setWorkShifts] = useState<any[]>([]);

  const [baseModel, setBaseModel] = useState("Seleccionar");
  const [unidModel, setUnidModel] = useState("Seleccionar");

  const [newWorkForce, setNewWorkForce] = useState<WorkRow[]>([
    { workShift: "", positionToday: "Seleccionar", fullName: "Seleccionar" },
    { workShift: "", positionToday: "Seleccionar", fullName: "Seleccionar" },
  ]);

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color || 0);

      const bases = await getAllBasesOperatives();
      setBasesData(Array.isArray(bases) ? bases : []);

      const vehicles = await getTypeVehiclesOperatives();
      setVehiclesData(Array.isArray(vehicles) ? vehicles : []);

      const shifts = await getWorkShift();
      const safeShifts = Array.isArray(shifts) ? shifts : [];
      setWorkShifts(safeShifts);

      const users = await getAllUser();
      setAllUsers(Array.isArray(users) ? users : []);

      setNewWorkForce((prev) =>
        prev.map((p) => ({
          ...p,
          workShift: safeShifts[0]?.name ?? "",
        }))
      );
    })();
  }, []);

  const getPersonalByShift = (shiftName: string) => {
    const shift = workShifts.find((ws) => ws.name === shiftName);
    if (!shift) return [];

    return allUsers.filter(
      (u) => u.employees?.id_work_shift === shift.id
    );
  };

  const addNewElement = () => {
    const defaultShift = newWorkForce[0]?.workShift || "";

    setNewWorkForce((prev) => [
      ...prev,
      {
        workShift: defaultShift,
        positionToday: "Seleccionar",
        fullName: "Seleccionar",
      },
    ]);
  };

  const removeLastElement = () => {
    setNewWorkForce((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const handleSaveWorkForce = async () => {
    if (!newWorkForce.length) return;

    if (baseModel === "Seleccionar" || unidModel === "Seleccionar") {
      alert("Selecciona base y unidad.");
      return;
    }

    const personal = newWorkForce.filter(
      (p) =>
        p.fullName !== "Seleccionar" &&
        p.positionToday !== "Seleccionar" &&
        p.positionToday
    );

    if (!personal.length) {
      alert("Agrega al menos una persona con puesto y nombre.");
      return;
    }

    const firstShift = workShifts.find(
      (ws) => ws.name === newWorkForce[0].workShift
    );

    const today = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "America/Mexico_City",
      })
    );

    const payload = {
      id_work_shift: firstShift?.id ?? null,
      id_logistics_hubs: Number(baseModel),
      id_vehicle: Number(unidModel),
      date_work_shift: `${today.toISOString().split("T")[0]}T00:36:37.000Z`,
      notes: null,
      personal_on_work_force: personal.map((p) => ({
        id_user: Number(p.fullName),
        position_on_work_force: p.positionToday,
      })),
    };

    try {
      await createNewWorkForce(payload);
      onRefresh?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar. Revisa los datos o intenta de nuevo.");
    }
  };

  const t = colorApss[styleColor ?? 0];

  const inputStyle: CSSProperties = {
    flex: "1 1 140px",
    minWidth: 0,
    padding: "10px 12px",
    borderRadius: "10px",
    border: `2px solid ${t.border}`,
    fontSize: "14px",
    fontWeight: 600,
    color: t.text,
    background: t.secondary,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.modal,
          background: t.secondary,
          borderColor: t.primary,
          boxShadow: t.shadow,
        }}
      >
        <div style={styles.modalHead}>
          <div>
            <p style={{ ...styles.kicker, color: t.textMuted }}>
              Estado de fuerza
            </p>
            <h1 style={{ ...styles.title, color: t.text }}>Agregar unidad</h1>
          </div>
          <button
            type="button"
            style={{
              ...styles.closeBtn,
              borderColor: t.border,
              color: t.textMuted,
            }}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div
          style={{
            ...styles.section,
            background: t.accentSoft,
            borderColor: t.border,
          }}
        >
          <p style={{ ...styles.sectionLabel, color: t.textMuted }}>
            Ubicación
          </p>
          <div style={styles.row}>
            <label style={{ ...styles.field, color: t.textMuted }}>
              Base
              <select
                value={baseModel}
                onChange={(e) => setBaseModel(e.target.value)}
                style={inputStyle}
              >
                <option value="Seleccionar">Seleccionar</option>
                {basesData.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ ...styles.field, color: t.textMuted }}>
              Unidad
              <select
                value={unidModel}
                onChange={(e) => setUnidModel(e.target.value)}
                style={inputStyle}
              >
                <option value="Seleccionar">Seleccionar</option>
                {vehiclesData.map((v) => (
                  <option key={v.id} value={String(v.id)}>
                    {v.number_unit}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div style={styles.actionsRow}>
          <button
            type="button"
            style={{
              ...styles.btnSecondary,
              borderColor: t.border,
              color: t.text,
            }}
            onClick={addNewElement}
          >
            + Fila tripulación
          </button>
          <button
            type="button"
            style={{
              ...styles.btnSecondary,
              borderColor: t.border,
              color: t.textMuted,
            }}
            onClick={removeLastElement}
          >
            Quitar última fila
          </button>
        </div>

        <p style={{ ...styles.sectionLabel, color: t.textMuted, margin: "0 4px" }}>
          Tripulación
        </p>
        <div style={{ ...styles.scroll, borderColor: t.border }}>
          {newWorkForce.map((row, index) => (
            <div
              key={index}
              style={{
                ...styles.row,
                background:
                  index % 2 === 0 ? "transparent" : t.accentSoft,
                margin: 0,
                padding: "10px 8px",
                borderRadius: "10px",
              }}
            >
              <label style={{ ...styles.fieldSm, color: t.textMuted }}>
                Turno
                <select
                  value={row.workShift}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewWorkForce((prev) =>
                      prev.map((p, i) =>
                        i === index
                          ? { ...p, workShift: val, fullName: "Seleccionar" }
                          : p
                      )
                    );
                  }}
                  style={inputStyle}
                >
                  {workShifts.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ ...styles.fieldSm, color: t.textMuted }}>
                Puesto
                <select
                  value={row.positionToday}
                  onChange={(e) =>
                    setNewWorkForce((prev) =>
                      prev.map((p, i) =>
                        i === index
                          ? {
                              ...p,
                              positionToday: e.target.value,
                            }
                          : p
                      )
                    )
                  }
                  style={inputStyle}
                >
                  <option value="Seleccionar">Seleccionar</option>
                  <option value="conductor">Chofer</option>
                  <option value="apoyo">Apoyo</option>
                </select>
              </label>
              <label style={{ ...styles.fieldSm, color: t.textMuted }}>
                Persona
                <select
                  value={row.fullName}
                  onChange={(e) =>
                    setNewWorkForce((prev) =>
                      prev.map((p, i) =>
                        i === index
                          ? { ...p, fullName: e.target.value }
                          : p
                      )
                    )
                  }
                  style={inputStyle}
                >
                  <option value="Seleccionar">Seleccionar</option>
                  {getPersonalByShift(row.workShift).map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.first_name} {p.last_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>

        <button
          type="button"
          style={{
            ...styles.btnPrimary,
            background: `linear-gradient(180deg, ${t.primary} 0%, ${t.primaryDark} 100%)`,
            boxShadow: `0 6px 20px ${t.accentSoft}`,
          }}
          onClick={handleSaveWorkForce}
        >
          Guardar
        </button>
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
    zIndex: 1000,
    padding: "16px",
    boxSizing: "border-box",
  },

  modal: {
    width: "min(560px, 100%)",
    maxHeight: "92vh",
    overflowY: "auto",
    padding: "1.35rem 1.5rem",
    borderRadius: "18px",
    border: "3px solid",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxSizing: "border-box",
  },

  modalHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  kicker: {
    margin: 0,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },

  title: {
    margin: "6px 0 0",
    fontSize: "1.45rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },

  closeBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    border: "2px solid",
    background: "rgba(255,255,255,0.9)",
    fontSize: "22px",
    lineHeight: 1,
    cursor: "pointer",
    flexShrink: 0,
  },

  section: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid",
  },

  sectionLabel: {
    margin: "0 0 10px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },

  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "flex-end",
  },

  field: {
    flex: "1 1 200px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 600,
    minWidth: 0,
  },

  fieldSm: {
    flex: "1 1 140px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 600,
    minWidth: 0,
  },

  actionsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  btnSecondary: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "2px solid",
    background: "rgba(255,255,255,0.95)",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },

  btnPrimary: {
    marginTop: "4px",
    padding: "14px 20px",
    borderRadius: "12px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "15px",
    letterSpacing: "0.03em",
  },

  scroll: {
    maxHeight: "240px",
    overflowY: "auto",
    borderRadius: "12px",
    border: "1px solid",
    padding: "6px",
  },
};
