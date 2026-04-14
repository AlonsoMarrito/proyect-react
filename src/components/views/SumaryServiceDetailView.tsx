import React, { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";

import { getPreferences } from "../scripts/preference/getPreference";
import { getOneServicesHistory } from "../scripts/history/getAllHistory";
import { getAllTypeToServices } from "../scripts/typeToServices/getTypeToServices";
import { getAllColognes } from "../scripts/colognes/getColognes";
import { getVehicleById } from "../scripts/vehicle/generalInfoVehicle/getVehicles";
import { getAllUser } from "../scripts/user/getUser";
import { stripResumenHeading } from "../../helpers/stripResumenHeading";

type PageTheme = {
  textColorPrimary: string;
  pageBg: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  accent: string;
  accentMuted: string;
  tableHeadBg: string;
  mutedText: string;
  inputBorder: string;
};

const colorApss: PageTheme[] = [
  {
    textColorPrimary: "#1a1d21",
    pageBg:
      "linear-gradient(165deg, #e4e9f2 0%, #f0f3f8 42%, #fafbfc 100%)",
    panelBg: "#ffffff",
    panelBorder: "rgba(15, 23, 42, 0.09)",
    panelShadow:
      "0 4px 6px rgba(15, 23, 42, 0.04), 0 14px 36px rgba(15, 23, 42, 0.09)",
    accent: "#D32F2F",
    accentMuted: "rgba(211, 47, 47, 0.1)",
    tableHeadBg: "#37474f",
    mutedText: "#546e7a",
    inputBorder: "#cfd8dc",
  },
  {
    textColorPrimary: "#6d1f1f",
    pageBg:
      "linear-gradient(165deg, #ffcdd2 0%, #ffebee 38%, #fffafa 100%)",
    panelBg: "#ffffff",
    panelBorder: "rgba(198, 40, 40, 0.18)",
    panelShadow:
      "0 4px 8px rgba(183, 28, 28, 0.07), 0 16px 44px rgba(183, 28, 28, 0.12)",
    accent: "#c62828",
    accentMuted: "rgba(198, 40, 40, 0.12)",
    tableHeadBg: "#b71c1c",
    mutedText: "#8d4e4e",
    inputBorder: "#ef9a9a",
  },
];

function formatTime(raw: unknown): string {
  if (raw == null) return "—";
  const s = String(raw);
  if (s.includes("T")) return s.slice(11, 19);
  return s.slice(0, 8);
}

export default function SumaryServiceDetailView(_props: { user?: unknown }) {
  const { folioId } = useParams();
  const id = folioId ? Number(folioId) : NaN;

  const [styleColor, setStyleColor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [typeName, setTypeName] = useState("—");
  const [cologneName, setCologneName] = useState("—");
  const [unitLabel, setUnitLabel] = useState("—");
  const [usersMap, setUsersMap] = useState<Record<number, string>>({});
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const theme = colorApss[styleColor] ?? colorApss[0];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!Number.isFinite(id)) {
        setRow(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const [data, types, colognes, users] = await Promise.all([
        getOneServicesHistory(id),
        getAllTypeToServices(),
        getAllColognes(),
        getAllUser(),
      ]);
      if (cancelled) return;

      const um: Record<number, string> = {};
      if (Array.isArray(users)) {
        users.forEach((u: { id?: number; first_name?: string; last_name?: string }) => {
          if (u?.id != null) {
            um[Number(u.id)] =
              `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
          }
        });
      }
      setUsersMap(um);

      if (!data || typeof data !== "object") {
        setRow(null);
        setLoading(false);
        return;
      }

      setRow(data as Record<string, unknown>);

      const idType = data.id_type_service as number | undefined;
      if (idType != null && Array.isArray(types)) {
        const t = types.find((x: { id?: number }) => x.id === idType);
        setTypeName(t?.name != null ? String(t.name) : "—");
      }

      const idCol = data.id_cologne as number | undefined;
      if (idCol != null && Array.isArray(colognes)) {
        const c = colognes.find((x: { id?: number }) => Number(x.id) === Number(idCol));
        setCologneName(c?.name != null ? String(c.name) : "—");
      }

      const vid = data.vehicle_id as number | undefined;
      if (vid != null) {
        const v = await getVehicleById(vid);
        if (!cancelled) {
          setUnitLabel(
            v?.number_unit != null ? String(v.number_unit) : `ID ${vid}`
          );
        }
      } else {
        setUnitLabel("—");
      }

      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!detailModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [detailModalOpen]);

  const crew =
    (row?.personal_on_a_service as {
      id_user?: number;
      position_on_service?: string;
    }[]) || [];

  if (loading) {
    return (
      <div
        style={{
          ...styles.page,
          background: theme.pageBg,
          color: theme.textColorPrimary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ fontWeight: 700 }}>Cargando parte…</p>
      </div>
    );
  }

  if (!row) {
    return (
      <div
        style={{
          ...styles.page,
          background: theme.pageBg,
          color: theme.textColorPrimary,
        }}
      >
        <div
          style={{
            ...styles.panel,
            background: theme.panelBg,
            border: `1px solid ${theme.panelBorder}`,
            boxShadow: theme.panelShadow,
            maxWidth: 560,
            margin: "0 auto",
            padding: "2rem",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <p style={{ fontWeight: 800, marginTop: 0 }}>No se encontró el folio</p>
          <Link
            to="/sumarys"
            style={{ color: theme.accent, fontWeight: 700 }}
          >
            Volver a partes de atención
          </Link>
        </div>
      </div>
    );
  }

  const summaryText =
    stripResumenHeading(row.summary) || "Sin texto registrado.";

  return (
    <div
      style={{
        ...styles.page,
        background: theme.pageBg,
        color: theme.textColorPrimary,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          ...styles.compactHeader,
          background: theme.panelBg,
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: theme.panelShadow,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>
            Folio {String(row.id ?? "—")}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 16, color: theme.mutedText }}>
            {typeName} · Unidad {unitLabel}
          </p>
        </div>
        <Link
          to="/sumarys"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: `2px solid ${theme.inputBorder}`,
            color: theme.accent,
            fontWeight: 700,
            textDecoration: "none",
            fontSize: 15,
            whiteSpace: "nowrap",
          }}
        >
          ← Listado
        </Link>
      </div>

      <div style={styles.contentWrap}>
        <div
          style={{
            ...styles.panel,
            background: theme.panelBg,
            border: `1px solid ${theme.panelBorder}`,
            boxShadow: theme.panelShadow,
          }}
        >
          <div style={styles.grid}>
            <Field label="Tipo de servicio" value={typeName} theme={theme} />
            <Field label="Unidad" value={unitLabel} theme={theme} />
            <Field label="Colonia" value={cologneName} theme={theme} />
            <Field
              label="Estado"
              value={String(row.status ?? "—").toUpperCase()}
              theme={theme}
            />
            <Field
              label="Fecha apertura"
              value={String(row.date_to_open ?? "").slice(0, 10) || "—"}
              theme={theme}
            />
            <Field
              label="Hora"
              value={formatTime(row.time_to_open)}
              theme={theme}
            />
            <Field
              label="Folio interno"
              value={row.folio != null ? String(row.folio) : "—"}
              theme={theme}
            />
            <Field
              label="Tel. reportante"
              value={String(row.phone_reporter ?? "—")}
              theme={theme}
            />
          </div>

          <h3 style={{ ...styles.sectionTitle, color: theme.mutedText }}>
            Ubicación
          </h3>
          <p style={{ margin: "0 0 8px", lineHeight: 1.55, fontSize: "1.02rem" }}>
            <strong>Calle y número:</strong> {String(row.stret ?? "—")}
          </p>
          <p style={{ margin: "0 0 16px", lineHeight: 1.55, fontSize: "1.02rem" }}>
            <strong>Cruces:</strong> {String(row.crossing ?? "—")}
          </p>

          <h3 style={{ ...styles.sectionTitle, color: theme.mutedText }}>
            Reportante
          </h3>
          <p style={{ margin: "0 0 16px", lineHeight: 1.55, fontSize: "1.02rem" }}>
            {String(row.reporter ?? "—")}
          </p>

          {crew.length > 0 && (
            <>
              <h3 style={{ ...styles.sectionTitle, color: theme.mutedText }}>
                Tripulación
              </h3>
              <ul style={{ margin: "0 0 16px", paddingLeft: "1.2rem", fontSize: "1.02rem" }}>
                {crew.map((p, i) => (
                  <li key={`${p.id_user}-${i}`} style={{ marginBottom: 4 }}>
                    {usersMap[Number(p.id_user)] ?? `Usuario ${p.id_user}`}
                    {p.position_on_service ? ` — ${p.position_on_service}` : ""}
                  </li>
                ))}
              </ul>
            </>
          )}

          <button
            type="button"
            style={{
              ...styles.openModalBtn,
              marginTop: 4,
              background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
              boxShadow: `0 4px 14px ${theme.accentMuted}`,
            }}
            onClick={() => setDetailModalOpen(true)}
          >
            Ver resumen completo
          </button>

          {(row.close_type != null ||
            row.general_and_conclusion != null ||
            row.date_to_close != null) && (
            <>
              <h3
                style={{
                  ...styles.sectionTitle,
                  color: theme.mutedText,
                  marginTop: 20,
                }}
              >
                Cierre
              </h3>
              <div style={styles.grid}>
                <Field
                  label="Tipo de cierre"
                  value={String(row.close_type ?? "—")}
                  theme={theme}
                />
                <Field
                  label="Km cierre / recorridos"
                  value={`${row.close_kilometers ?? "—"} / ${row.kilometers_traveled ?? "—"}`}
                  theme={theme}
                />
                <Field
                  label="Fecha cierre"
                  value={String(row.date_to_close ?? "").slice(0, 10) || "—"}
                  theme={theme}
                />
                <Field
                  label="Hora cierre"
                  value={formatTime(row.time_to_close)}
                  theme={theme}
                />
              </div>
              <p
                style={{
                  margin: "10px 0 0",
                  lineHeight: 1.55,
                  fontSize: "1.02rem",
                }}
              >
                <strong>Conclusión:</strong>{" "}
                {String(row.general_and_conclusion ?? "—")}
              </p>
            </>
          )}
        </div>
      </div>

      {detailModalOpen && (
        <div
          role="presentation"
          style={styles.modalBackdrop}
          onClick={() => setDetailModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Resumen del parte"
            style={{
              ...styles.modalPanel,
              border: `1px solid ${theme.panelBorder}`,
              background: theme.panelBg,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              style={{
                ...styles.modalClose,
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 2,
                border: `1px solid ${theme.inputBorder}`,
                color: theme.mutedText,
                background: theme.panelBg,
              }}
              onClick={() => setDetailModalOpen(false)}
              aria-label="Cerrar"
            >
              ×
            </button>

            <div style={styles.modalScrollOnly}>
              <pre
                style={{
                  ...styles.summaryBlock,
                  color: theme.textColorPrimary,
                  border: "none",
                  background: "transparent",
                }}
              >
                {summaryText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: PageTheme;
}) {
  return (
    <div>
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: theme.mutedText,
        }}
      >
        {label}
      </p>
      <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{value}</p>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100%",
    width: "100%",
    padding: "0.65rem clamp(0.6rem, 1.6vw, 1.1rem)",
    boxSizing: "border-box",
  },
  compactHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    maxWidth: "min(1680px, 98vw)",
    margin: "0 auto 14px",
    padding: "18px 22px",
    borderRadius: 14,
    boxSizing: "border-box",
  },
  contentWrap: {
    width: "100%",
    maxWidth: "min(1680px, 98vw)",
    margin: "0 auto",
    paddingBottom: 24,
  },
  panel: {
    borderRadius: 16,
    padding: "1.35rem 1.45rem",
    boxSizing: "border-box",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "1.1rem 1.25rem",
    marginBottom: "1.2rem",
  },
  sectionTitle: {
    fontSize: "0.88rem",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    margin: "0 0 12px",
  },
  openModalBtn: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: 14,
    border: "none",
    color: "#fff",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 10040,
    background: "rgba(15, 23, 42, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    boxSizing: "border-box",
  },
  modalPanel: {
    width: "100%",
    maxWidth: 800,
    maxHeight: "min(92vh, 920px)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 24px 56px rgba(15, 23, 42, 0.22)",
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 10,
    fontSize: 24,
    lineHeight: 1,
    cursor: "pointer",
  },
  modalScrollOnly: {
    padding: "48px 28px 32px",
    overflowY: "auto",
    flex: 1,
    minHeight: 0,
    boxSizing: "border-box",
  },
  summaryBlock: {
    margin: 0,
    padding: 0,
    borderRadius: 0,
    fontSize: "1.2rem",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: "inherit",
    minHeight: "min(40vh, 360px)",
    maxHeight: "min(78vh, 720px)",
    overflowY: "auto",
  },
};
