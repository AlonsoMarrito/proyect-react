import React, { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

import LogsServiceVehicle from "../components-on-views/services/logsServiceMenu";
import { getPreferences } from "../scripts/preference/getPreference";
import { getServicesHistory } from "../scripts/history/getAllHistory";
import { getAllTypeToServices } from "../scripts/typeToServices/getTypeToServices";
import { authUser } from "../scripts/user/authUser";

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

function mexicoTodayIsoDate(): string {
  const d = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" })
  );
  return d.toISOString().slice(0, 10);
}

function isPendingUnitOrReassignment(s: Record<string, unknown>): boolean {
  const st = String(s.status ?? "").toLowerCase();
  if (st.includes("pendiente") && st.includes("reasign")) return true;
  if (st.includes("pendiente a reasign")) return true;
  if (st.includes("en curso") && (s.id_type_service == null || s.id_type_service === ""))
    return true;
  return false;
}

type FolioRow = {
  id: number;
  status?: string;
  id_type_service?: number | null;
  vehicle_id?: number;
  date_to_open?: string;
  user_id?: number;
  summary?: string;
};

export default function MenuServicesView() {
  const [componentView, setComponentView] = useState(1);
  const [styleColor, setStyleColor] = useState(0);
  const theme = colorApss[styleColor] ?? colorApss[0];

  useEffect(() => {
    (async () => {
      try {
        const generalPreferences = await getPreferences();
        setStyleColor(generalPreferences?.color ?? 0);
      } catch {
        setStyleColor(0);
      }
    })();
  }, []);

  const tabs: { id: number; label: string; hint: string }[] = [
    { id: 1, label: "Servicio activo", hint: "Unidad en turno" },
    { id: 2, label: "Sin asignar unidad", hint: "Pendientes / en curso sin tipo" },
    { id: 3, label: "Mis servicios hoy", hint: "Partes del día" },
  ];

  return (
    <div
      style={{
        ...styles.shell,
        background: theme.pageBg,
        color: theme.textColorPrimary,
      }}
    >
      <div
        style={{
          ...styles.topBar,
          background: theme.panelBg,
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: theme.panelShadow,
        }}
      >
        <div
          style={{
            ...styles.topAccent,
            background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
          }}
        />
        <div style={styles.topInner}>
          <div style={styles.topTitles}>
            <p style={{ ...styles.kicker, color: theme.mutedText }}>Servicios</p>
            <h1 style={{ ...styles.title, color: theme.textColorPrimary }}>
              Operación en turno
            </h1>
            <p style={{ ...styles.subtitle, color: theme.mutedText }}>
              {tabs.find((t) => t.id === componentView)?.hint}
            </p>
          </div>
          <div
            style={{
              ...styles.segment,
              background: theme.accentMuted,
              border: `1px solid ${theme.panelBorder}`,
            }}
          >
            {tabs.map((t) => {
              const active = componentView === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  style={{
                    ...styles.segmentBtn,
                    color: active ? theme.textColorPrimary : theme.mutedText,
                    background: active ? theme.panelBg : "transparent",
                    boxShadow: active ? theme.panelShadow : "none",
                    border: active ? `1px solid ${theme.panelBorder}` : "1px solid transparent",
                  }}
                  onClick={() => setComponentView(t.id)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={styles.contentScroll}>
        {componentView === 1 && (
          <div style={styles.activePane}>
            <LogsServiceVehicle />
          </div>
        )}
        {componentView === 2 && (
          <ServiceFolioListPanel
            theme={theme}
            mode="pending"
            emptyMessage="No hay partes pendientes de asignación."
          />
        )}
        {componentView === 3 && (
          <ServiceFolioListPanel
            theme={theme}
            mode="today"
            emptyMessage="No tienes partes registrados hoy."
          />
        )}
      </div>
    </div>
  );
}

function ServiceFolioListPanel({
  theme,
  mode,
  emptyMessage,
}: {
  theme: PageTheme;
  mode: "pending" | "today";
  emptyMessage: string;
}) {
  const [rows, setRows] = useState<FolioRow[]>([]);
  const [types, setTypes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, t, user] = await Promise.all([
      getServicesHistory(),
      getAllTypeToServices(),
      mode === "today" ? authUser() : Promise.resolve(null),
    ]);
    const safe = Array.isArray(list) ? list : [];
    const tm: Record<number, string> = {};
    const ts = Array.isArray(t) ? t : [];
    ts.forEach((x: { id?: number; name?: string }) => {
      if (x?.id != null) tm[Number(x.id)] = String(x.name ?? "");
    });
    setTypes(tm);

    const uid = user?.id != null ? Number(user.id) : null;
    const today = mexicoTodayIsoDate();

    const filtered = safe.filter((s: FolioRow) => {
      if (mode === "pending") return isPendingUnitOrReassignment(s);
      const d = s.date_to_open?.slice(0, 10);
      if (d !== today) return false;
      if (uid != null && s.user_id != null) {
        return Number(s.user_id) === uid;
      }
      return true;
    });
    setRows(filtered);
    setLoading(false);
  }, [mode]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div style={styles.listCenter}>
        <p style={{ fontWeight: 700, color: theme.mutedText }}>Cargando partes…</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        style={{
          ...styles.emptyCard,
          background: theme.panelBg,
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: theme.panelShadow,
        }}
      >
        <p style={{ margin: 0, fontWeight: 800, color: theme.textColorPrimary }}>
          Sin resultados
        </p>
        <p style={{ margin: "8px 0 0", color: theme.mutedText, lineHeight: 1.5 }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div style={styles.listStack}>
      {rows.map((item) => (
        <Link
          key={item.id}
          to={`/sumary-service/${item.id}`}
          style={{
            ...styles.listCard,
            background: theme.panelBg,
            border: `1px solid ${theme.panelBorder}`,
            boxShadow: theme.panelShadow,
            color: theme.textColorPrimary,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              ...styles.listCardStripe,
              background: `linear-gradient(180deg, ${theme.accent}, ${theme.tableHeadBg})`,
            }}
          />
          <div style={styles.listCardBody}>
            <div style={styles.listCardTop}>
              <span
                style={{
                  ...styles.badge,
                  background: theme.accentMuted,
                  color: theme.accent,
                  border: `1px solid ${theme.inputBorder}`,
                }}
              >
                #{item.id}
              </span>
              <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                {types[Number(item.id_type_service)] ?? "Tipo —"}
              </span>
              <span style={{ color: theme.mutedText, fontSize: 14 }}>
                {item.date_to_open?.slice(0, 10) ?? "—"}
              </span>
            </div>
            <span
              style={{
                display: "inline-block",
                marginTop: 8,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: theme.mutedText,
              }}
            >
              {String(item.status ?? "—")}
            </span>
            {item.summary ? (
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 14,
                  lineHeight: 1.45,
                  color: theme.textColorPrimary,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.summary}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    flex: 1,
    minHeight: 0,
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
    padding: "0.35rem clamp(0.45rem, 1.2vw, 0.85rem)",
  },
  topBar: {
    display: "flex",
    alignItems: "stretch",
    gap: "0.5rem",
    maxWidth: "min(1680px, 100%)",
    width: "100%",
    margin: "0 auto",
    padding: "0.45rem 0.65rem 0.5rem",
    borderRadius: 12,
    boxSizing: "border-box",
    flexShrink: 0,
  },
  topAccent: {
    width: 4,
    borderRadius: 4,
    flexShrink: 0,
    alignSelf: "stretch",
  },
  topInner: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  topTitles: { minWidth: 0 },
  kicker: {
    margin: 0,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  title: {
    margin: "3px 0 0",
    fontSize: "clamp(1rem, 1.65vw, 1.25rem)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  subtitle: {
    margin: "3px 0 0",
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.3,
  },
  segment: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
    padding: 4,
    borderRadius: 10,
    boxSizing: "border-box",
  },
  segmentBtn: {
    flex: "1 1 auto",
    minWidth: "min(128px, 100%)",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 11,
    transition: "background 0.15s ease, box-shadow 0.15s ease",
  },
  contentScroll: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    maxWidth: "min(1680px, 100%)",
    margin: "6px auto 0",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    boxSizing: "border-box",
  },
  activePane: {
    width: "100%",
    minHeight: "100%",
    display: "flex",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  listStack: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingBottom: 16,
  },
  listCard: {
    position: "relative",
    display: "block",
    borderRadius: 14,
    paddingLeft: 12,
    overflow: "hidden",
  },
  listCardStripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    borderRadius: "14px 0 0 14px",
  },
  listCardBody: {
    padding: "16px 18px 16px 12px",
  },
  listCardTop: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px 14px",
  },
  badge: {
    fontSize: 14,
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: 8,
  },
  listCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    padding: 24,
  },
  emptyCard: {
    borderRadius: 16,
    padding: "2rem 1.5rem",
    maxWidth: 480,
    margin: "2rem auto",
    textAlign: "center",
  },
};
