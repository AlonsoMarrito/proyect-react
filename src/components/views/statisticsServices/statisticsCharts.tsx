import type { CSSProperties } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Point } from "./statisticsApiHelpers";

type Theme = {
  accent: string;
  tableHeadBg: string;
  mutedText: string;
  textColorPrimary: string;
  panelBorder: string;
};

const PIE_COLORS = [
  "#D32F2F",
  "#37474f",
  "#1565c0",
  "#2e7d32",
  "#e65100",
  "#6a1b9a",
  "#00838f",
  "#c62828",
];

const CHART_H_GRID = 260;

export function ChartVerticalBars({
  data,
  theme,
  height = CHART_H_GRID,
}: {
  data: Point[];
  theme: Theme;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.12)" />
        <XAxis
          dataKey="name"
          tick={{ fill: theme.mutedText, fontSize: 9 }}
          interval={0}
          angle={-40}
          textAnchor="end"
          height={68}
        />
        <YAxis tick={{ fill: theme.mutedText, fontSize: 9 }} allowDecimals={false} width={36} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: `1px solid ${theme.panelBorder}`,
            fontSize: 11,
          }}
        />
        <Bar
          dataKey="value"
          name="Servicios"
          fill={theme.accent}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ChartHorizontalBars({
  data,
  theme,
  minHeight = 260,
}: {
  data: Point[];
  theme: Theme;
  minHeight?: number;
}) {
  const labelMax = data.reduce(
    (m, d) => Math.max(m, String(d.name ?? "").length),
    0
  );
  const yWidth = Math.min(280, Math.max(100, 7 * labelMax + 24));
  const rowH = 30;
  return (
    <ResponsiveContainer
      width="100%"
      height={Math.max(minHeight, data.length * rowH)}
    >
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 8, right: 16, left: 4, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.12)" />
        <XAxis type="number" tick={{ fill: theme.mutedText, fontSize: 9 }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={yWidth}
          tick={{ fill: theme.mutedText, fontSize: 9 }}
          interval={0}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: `1px solid ${theme.panelBorder}`,
            fontSize: 11,
          }}
        />
        <Bar
          dataKey="value"
          name="Servicios"
          fill={theme.tableHeadBg}
          radius={[0, 6, 6, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

const PIE_CHART_BLOCK_H = 200;

/** Pastel arriba; lista completa debajo (sin leyenda comprimida a la derecha). */
export function ChartPie({
  data,
  theme,
}: {
  data: Point[];
  theme: Theme;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
        minWidth: 0,
      }}
    >
      <div style={{ width: "100%", height: PIE_CHART_BLOCK_H, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={76}
              labelLine={false}
              label={false}
            >
              {data.map((_, i) => (
                <Cell key={String(i)} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${theme.panelBorder}`,
                fontSize: 11,
                maxWidth: 280,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul
        style={{
          margin: 0,
          padding: "2px 0 0",
          listStyle: "none",
          fontSize: 10,
          lineHeight: 1.45,
          color: theme.textColorPrimary,
        }}
      >
        {data.map((row, i) => (
          <li
            key={`${row.name}-${i}`}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              marginBottom: 6,
              wordBreak: "break-word",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: PIE_COLORS[i % PIE_COLORS.length],
                flexShrink: 0,
                marginTop: 3,
              }}
              aria-hidden
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ color: theme.mutedText }}>{row.name}</span>
              {" · "}
              <strong>{row.value}</strong>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatisticsTableSingle({
  rows,
  theme,
  columnLabel = "Etiqueta",
}: {
  rows: Point[];
  theme: Theme;
  columnLabel?: string;
}) {
  const th: CSSProperties = {
    textAlign: "left",
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: theme.mutedText,
    borderBottom: `2px solid ${theme.panelBorder}`,
  };
  const td: CSSProperties = {
    padding: "8px 10px",
    fontSize: 13,
    borderBottom: `1px solid ${theme.panelBorder}`,
    color: theme.textColorPrimary,
  };
  return (
    <div style={{ overflowX: "auto", borderRadius: 10, maxHeight: 280, overflowY: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 260 }}>
        <thead>
          <tr style={{ background: "rgba(15,23,42,0.04)" }}>
            <th style={th}>{columnLabel}</th>
            <th style={{ ...th, textAlign: "right" }}>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ ...td, color: theme.mutedText }}>
                Sin filas
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.name}>
                <td style={td}>{row.name}</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                  {row.value}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function StatisticsTable({
  byDate,
  byStatus,
  theme,
}: {
  byDate: Point[];
  byStatus: Point[];
  theme: Theme;
}) {
  const th: CSSProperties = {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: theme.mutedText,
    borderBottom: `2px solid ${theme.panelBorder}`,
  };
  const td: CSSProperties = {
    padding: "10px 12px",
    fontSize: 14,
    borderBottom: `1px solid ${theme.panelBorder}`,
    color: theme.textColorPrimary,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h3 style={{ margin: "0 0 10px", fontSize: "0.95rem", fontWeight: 800 }}>
          Por fecha
        </h3>
        <div style={{ overflowX: "auto", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 360 }}>
            <thead>
              <tr style={{ background: "rgba(15,23,42,0.04)" }}>
                <th style={th}>Etiqueta</th>
                <th style={{ ...th, textAlign: "right" }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {byDate.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ ...td, color: theme.mutedText }}>
                    Sin filas
                  </td>
                </tr>
              ) : (
                byDate.map((row) => (
                  <tr key={`d-${row.name}`}>
                    <td style={td}>{row.name}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                      {row.value}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 style={{ margin: "0 0 10px", fontSize: "0.95rem", fontWeight: 800 }}>
          Por estado
        </h3>
        <div style={{ overflowX: "auto", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 360 }}>
            <thead>
              <tr style={{ background: "rgba(15,23,42,0.04)" }}>
                <th style={th}>Estado</th>
                <th style={{ ...th, textAlign: "right" }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {byStatus.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ ...td, color: theme.mutedText }}>
                    Sin filas
                  </td>
                </tr>
              ) : (
                byStatus.map((row) => (
                  <tr key={`s-${row.name}`}>
                    <td style={td}>{row.name}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                      {row.value}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
