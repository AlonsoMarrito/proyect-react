import React, { useEffect, useState, type CSSProperties } from "react";

import { getPreferences } from "../../scripts/preference/getPreference";
import { defaultMexicoDateRange, todayIsoMexico } from "./statisticsApiHelpers";
import StatisticsDashboardGrid from "./StatisticsDashboardGrid";
import StatisticsTablesGrid from "./StatisticsTablesGrid";

/** 1–3: tipo de gráfica; 4: solo tablas */
type ChartViewTab = 1 | 2 | 3 | 4;

type DashTheme = {
  textColorPrimary: string;
  panelBg: string;
  panelBorder: string;
  accent: string;
  accentMuted: string;
  tableHeadBg: string;
  mutedText: string;
};

const colorApss: DashTheme[] = [
  {
    textColorPrimary: "#1a1d21",
    panelBg: "#ffffff",
    panelBorder: "rgba(15, 23, 42, 0.09)",
    accent: "#D32F2F",
    accentMuted: "rgba(211, 47, 47, 0.1)",
    tableHeadBg: "#37474f",
    mutedText: "#546e7a",
  },
  {
    textColorPrimary: "#6d1f1f",
    panelBg: "#ffffff",
    panelBorder: "rgba(198, 40, 40, 0.18)",
    accent: "#c62828",
    accentMuted: "rgba(198, 40, 40, 0.12)",
    tableHeadBg: "#b71c1c",
    mutedText: "#8d4e4e",
  },
];

export default function StatisticsServicesLayout() {
  const [styleColor, setStyleColor] = useState(0);
  const theme = colorApss[styleColor] ?? colorApss[0];
  const [range, setRange] = useState(defaultMexicoDateRange);
  const [chartView, setChartView] = useState<ChartViewTab>(1);
  const todayMx = todayIsoMexico();

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
    })();
  }, []);

  return (
    <div
      style={{
        ...styles.shell,
        background:
          styleColor === 1
            ? "linear-gradient(165deg, #ffcdd2 0%, #ffebee 38%, #fffafa 100%)"
            : "linear-gradient(165deg, #e4e9f2 0%, #f0f3f8 42%, #fafbfc 100%)",
        color: theme.textColorPrimary,
      }}
    >
      <div
        style={{
          ...styles.topCard,
          background: theme.panelBg,
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: "0 4px 6px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            ...styles.accentBar,
            background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
          }}
        />
        <div style={styles.topInner}>
          <div>
            <p style={{ ...styles.kicker, color: theme.mutedText }}>Estadísticas</p>
            <h1 style={{ ...styles.title, color: theme.textColorPrimary }}>
              Panel de servicios
            </h1>
          </div>
          <div style={styles.tabsRow}>
            {(
              [
                { id: 1 as const, label: "Gráficas de Pastel" },
                {
                  id: 2 as const,
                  label: "Gráfica de Columnas en Vertical",
                },
                {
                  id: 3 as const,
                  label: "Gráfica de Columnas en Horizontal",
                },
                { id: 4 as const, label: "Tablas" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChartView(tab.id)}
                style={{
                  ...styles.tabBtn,
                  color: theme.textColorPrimary,
                  borderBottom:
                    chartView === tab.id
                      ? `2px solid ${theme.accent}`
                      : "2px solid transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={styles.dateRow}>
            <label style={{ ...styles.lbl, color: theme.mutedText }}>
              Desde
              <input
                type="date"
                value={range.start}
                min="2000-01-01"
                max={range.end <= todayMx ? range.end : todayMx}
                onChange={(e) => {
                  const start = e.target.value;
                  setRange((r) => {
                    let end = r.end;
                    if (start > end) end = start;
                    if (end > todayMx) end = todayMx;
                    if (start > todayMx) return { start: todayMx, end: todayMx };
                    return { start, end };
                  });
                }}
                style={{
                  ...styles.input,
                  borderColor: theme.panelBorder,
                  color: theme.textColorPrimary,
                }}
              />
            </label>
            <label style={{ ...styles.lbl, color: theme.mutedText }}>
              Hasta
              <input
                type="date"
                value={range.end}
                min={range.start}
                max={todayMx}
                onChange={(e) => {
                  const end = e.target.value;
                  setRange((r) => {
                    let start = r.start;
                    if (end < start) start = end;
                    if (end > todayMx) return { ...r, end: todayMx };
                    return { start, end };
                  });
                }}
                style={{
                  ...styles.input,
                  borderColor: theme.panelBorder,
                  color: theme.textColorPrimary,
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div
        style={{
          ...styles.scrollArea,
          background: theme.panelBg,
          border: `1px solid ${theme.panelBorder}`,
        }}
      >
        {chartView === 4 ? (
          <StatisticsTablesGrid theme={theme} range={range} />
        ) : (
          <StatisticsDashboardGrid
            theme={theme}
            range={range}
            viz={
              chartView === 1 ? "pie" : chartView === 2 ? "barV" : "barH"
            }
          />
        )}
      </div>
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
    gap: 8,
    overflow: "hidden",
    boxSizing: "border-box",
    padding: "0.35rem clamp(0.35rem, 1vw, 0.65rem)",
  },
  topCard: {
    display: "flex",
    alignItems: "stretch",
    gap: "0.4rem",
    maxWidth: "min(1680px, 100%)",
    width: "100%",
    margin: "0 auto",
    padding: "0.35rem 0.55rem",
    borderRadius: 12,
    boxSizing: "border-box",
    flexShrink: 0,
  },
  accentBar: {
    width: 3,
    borderRadius: 3,
    flexShrink: 0,
  },
  topInner: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  kicker: {
    margin: 0,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  title: {
    margin: "2px 0 0",
    fontSize: "clamp(0.88rem, 1.35vw, 1.05rem)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
  },
  tabsRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 2,
  },
  tabBtn: {
    padding: "5px 10px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    borderRadius: 0,
    lineHeight: 1.3,
  },
  dateRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 2,
  },
  lbl: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    fontSize: 9,
    fontWeight: 700,
  },
  input: {
    padding: "4px 8px",
    borderRadius: 8,
    border: "1px solid",
    fontSize: 11,
    fontWeight: 600,
    outline: "none",
    background: "#fff",
  },
  scrollArea: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    maxWidth: "min(1680px, 100%)",
    margin: "0 auto",
    borderRadius: 14,
    padding: "14px 14px 20px",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    boxSizing: "border-box",
  },
};
