import React, { useEffect, useState } from "react";

import ModalReportDamage from "../vehiculos/modalReportDamage";
import { getColums } from "../../scripts/vehicle/checkList/checkList";
import { getTypeVehicle } from "../../scripts/vehicle/generalInfoVehicle/getVehicles";
import { authUser } from "../../scripts/user/authUser";
import {
  RECEPTION_CATEGORY_KEYS,
  RECEPTION_SECTION_LABELS,
  type ReceptionCategoryKey,
} from "./vehicleReceptionCategories";

type PageTheme = {
  textColorPrimary: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  accent: string;
  mutedText: string;
  tableHeadBg: string;
  inputBorder: string;
};

type Row = { name: string; state: string };

type Props = {
  numberVehicle: string;
  theme: PageTheme;
};

export default function ReceptionLogsVehicleSection({ numberVehicle, theme }: Props) {
  const [systemsByCategory, setSystemsByCategory] = useState<
    Record<ReceptionCategoryKey, Row[]>
  >({
    light: [],
    bodywork: [],
    tools: [],
    liquids: [],
    tires: [],
    engine: [],
  });
  const [dataToVehicle, setDataToVehicle] = useState<Record<string, unknown>>({});
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [modalReportDamage, setModalReportDamage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const user = await authUser();
      if (!cancelled) setUserData(user);

      const v = await getTypeVehicle(numberVehicle);
      if (!cancelled) setDataToVehicle(v && typeof v === "object" ? (v as Record<string, unknown>) : {});

      const next: Record<ReceptionCategoryKey, Row[]> = {
        light: [],
        bodywork: [],
        tools: [],
        liquids: [],
        tires: [],
        engine: [],
      };
      for (const key of RECEPTION_CATEGORY_KEYS) {
        const data = await getColums(key, numberVehicle);
        next[key] = Array.isArray(data) ? data.map((r: Row) => ({ ...r })) : [];
      }
      if (!cancelled) {
        setSystemsByCategory(next);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numberVehicle]);

  const updateRowState = (cat: ReceptionCategoryKey, index: number, state: string) => {
    setSystemsByCategory((prev) => {
      const copy = { ...prev };
      const rows = [...copy[cat]];
      if (rows[index]) rows[index] = { ...rows[index], state };
      copy[cat] = rows;
      return copy;
    });
  };

  const workShift =
    (userData?.work_shift as string | undefined) ??
    (userData?.employees as { work_shift?: string } | undefined)?.work_shift ??
    "—";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "flex-start",
        background: theme.panelBg,
        border: `1px solid ${theme.panelBorder}`,
        borderRadius: "16px",
        boxShadow: theme.panelShadow,
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: "1 1 320px",
          minWidth: 0,
          maxHeight: "min(53vh, 504px)",
          overflowY: "auto",
          paddingRight: "8px",
        }}
      >
        {loading ? (
          <p style={{ color: theme.mutedText }}>Cargando bitácora…</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            }}
          >
            {RECEPTION_CATEGORY_KEYS.map((key) => (
              <div key={key}>
                <h3
                  style={{
                    margin: "0 0 8px",
                    textAlign: "center",
                    fontSize: "15px",
                    color: theme.textColorPrimary,
                    background: "rgba(55, 71, 79, 0.08)",
                    padding: "8px",
                    borderRadius: "8px",
                  }}
                >
                  {RECEPTION_SECTION_LABELS[key]}
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                    color: theme.textColorPrimary,
                  }}
                  border={1}
                >
                  <thead>
                    <tr style={{ background: theme.tableHeadBg, color: "#fff" }}>
                      <th style={{ padding: "6px", textAlign: "left" }}>Nombre</th>
                      <th style={{ padding: "6px", textAlign: "left" }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemsByCategory[key].map((item, idx) => (
                      <tr key={`${key}-${idx}`}>
                        <td style={{ padding: "6px", borderTop: `1px solid ${theme.inputBorder}` }}>
                          {item.name}
                        </td>
                        <td style={{ padding: "6px", borderTop: `1px solid ${theme.inputBorder}` }}>
                          <select
                            className="select-primary-bigger"
                            value={item.state}
                            onChange={(e) => updateRowState(key, idx, e.target.value)}
                            style={{
                              width: "100%",
                              padding: "4px",
                              borderRadius: "6px",
                              border: `1px solid ${theme.inputBorder}`,
                            }}
                          >
                            <option>Bueno</option>
                            <option>Malo</option>
                            <option>N/A</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          flex: "0 1 280px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "8px 0",
        }}
      >
        <h3 style={{ margin: 0, color: theme.mutedText, fontSize: "14px", fontWeight: 600 }}>
          Kilometraje:
        </h3>
        <p style={{ margin: 0, fontWeight: 700 }}>{String(dataToVehicle.kilometers ?? "—")}</p>
        <h3 style={{ margin: 0, color: theme.mutedText, fontSize: "14px", fontWeight: 600 }}>
          Placas:
        </h3>
        <p style={{ margin: 0, fontWeight: 700 }}>
          {String(dataToVehicle.vehicle_license_plates ?? "—")}
        </p>
        <h3 style={{ margin: 0, color: theme.mutedText, fontSize: "14px", fontWeight: 600 }}>
          Tipo de unidad:
        </h3>
        <p style={{ margin: 0, fontWeight: 700 }}>{String(dataToVehicle.type ?? "—")}</p>
        <h3 style={{ margin: 0, color: theme.mutedText, fontSize: "14px", fontWeight: 600 }}>
          Guardia:
        </h3>
        <select
          className="select-primary-pretty-meidum"
          defaultValue={workShift !== "—" ? workShift : ""}
          disabled
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: `1px solid ${theme.inputBorder}`,
            background: theme.panelBg,
            color: theme.textColorPrimary,
          }}
        >
          <option value="">{workShift}</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        <button
          type="button"
          onClick={() => setModalReportDamage(1)}
          style={{
            marginTop: "8px",
            padding: "12px",
            borderRadius: "10px",
            border: `2px solid ${theme.accent}`,
            background: "rgba(211, 47, 47, 0.08)",
            color: theme.textColorPrimary,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Reportar daño o avería
        </button>
        <button
          type="button"
          onClick={() => {
            /* Misma idea que Vue: botón sin persistencia aún */
          }}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: theme.accent,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Aceptar y guardar
        </button>
      </div>

      {modalReportDamage === 1 && <ModalReportDamage onClose={() => setModalReportDamage(0)} />}
    </div>
  );
}
