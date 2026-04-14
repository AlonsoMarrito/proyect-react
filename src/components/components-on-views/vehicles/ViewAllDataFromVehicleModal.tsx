import React, { useEffect, useState } from "react";

import { getColums } from "../../scripts/vehicle/checkList/checkList";
import {
  RECEPTION_SECTION_LABELS,
  type ReceptionCategoryKey,
} from "./vehicleReceptionCategories";

type PageTheme = {
  textColorPrimary: string;
  panelBg: string;
  panelBorder: string;
  accent: string;
  mutedText: string;
};

type Row = { name: string; state: string };

type Props = {
  numberVehicle: string;
  showAt: ReceptionCategoryKey;
  onClose: () => void;
  theme: PageTheme;
};

export default function ViewAllDataFromVehicleModal({
  numberVehicle,
  showAt,
  onClose,
  theme,
}: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await getColums(showAt, numberVehicle);
      if (cancelled) return;
      setRows(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [showAt, numberVehicle]);

  const title = RECEPTION_SECTION_LABELS[showAt] ?? showAt;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
        background: "rgba(255, 255, 255, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "min(560px, 100%)",
          maxHeight: "85vh",
          overflow: "auto",
          background: theme.panelBg,
          border: `2px solid ${theme.accent}`,
          borderRadius: "20px",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#c62828",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>
        <h2 style={{ margin: "0 0 16px", color: theme.textColorPrimary, textAlign: "center" }}>
          Resumen de {title}
        </h2>
        {loading ? (
          <p style={{ color: theme.mutedText, textAlign: "center" }}>Cargando…</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: theme.textColorPrimary,
              fontSize: "14px",
            }}
            border={1}
            cellPadding={8}
          >
            <thead>
              <tr style={{ background: "rgba(55, 71, 79, 0.12)" }}>
                <th style={{ textAlign: "left", padding: "8px" }}>Nombre</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "8px", borderTop: `1px solid ${theme.panelBorder}` }}>
                    {item.name}
                  </td>
                  <td style={{ padding: "8px", borderTop: `1px solid ${theme.panelBorder}` }}>
                    {item.state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "none",
              background: theme.accent,
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
