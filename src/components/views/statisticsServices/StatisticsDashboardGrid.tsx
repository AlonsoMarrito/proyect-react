import React, { useEffect, useRef, useState, type CSSProperties } from "react";
import type { DependencyList } from "react";

import { getAllTypeToServices } from "../../scripts/typeToServices/getTypeToServices";
import { getAllColognes } from "../../scripts/colognes/getColognes";
import type { ColonyIncidentRow, Point } from "./statisticsApiHelpers";
import {
  fetchCantidadIncidentesPorColoniaTodas,
  fetchCologneRowsByStatusInPeriodo,
  fetchCologneSeriesPoints,
  fetchGroupByDatePoints,
  fetchIncidentTotalsByColoniaEnPeriodo,
  fetchStatusGroupByDatePoints,
  fetchStatusOnColognePoints,
  labelPointsWithTypeServiceNames,
  normalizeStatsDateRange,
} from "./statisticsApiHelpers";
import {
  ChartHorizontalBars,
  ChartPie,
  ChartVerticalBars,
} from "./statisticsCharts";
import ChartImageModal from "./ChartImageModal";

type DashTheme = {
  textColorPrimary: string;
  panelBg: string;
  panelBorder: string;
  accent: string;
  accentMuted: string;
  tableHeadBg: string;
  mutedText: string;
};

const chartTheme = (t: DashTheme) => ({
  accent: t.accent,
  tableHeadBg: t.tableHeadBg,
  mutedText: t.mutedText,
  textColorPrimary: t.textColorPrimary,
  panelBorder: t.panelBorder,
});

function formatPeriodLine(startIso: string, endIso: string): string {
  const fmt = (iso: string) => {
    const p = iso.split("-");
    if (p.length !== 3) return iso;
    const [y, m, d] = p;
    return `${d}/${m}/${y}`;
  };
  return `Del ${fmt(startIso)} al ${fmt(endIso)}`;
}

/** Máximo 2 columnas en pantallas anchas; 1 en móvil. */
function useStatsGridColumns(): number {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 720px)");
    const apply = () => setCols(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return cols;
}

function useAsyncPanel(
  load: () => Promise<Point[]>,
  deps: DependencyList
): { data: Point[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await loadRef.current();
        if (!cancelled) setData(p);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error };
}

function useAsyncColonyRows(
  load: () => Promise<ColonyIncidentRow[]>,
  deps: DependencyList
): { data: ColonyIncidentRow[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<ColonyIncidentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await loadRef.current();
        if (!cancelled) setData(p);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error };
}

const selStyle = (theme: DashTheme): CSSProperties => ({
  width: "100%",
  maxWidth: "100%",
  padding: "5px 8px",
  borderRadius: 8,
  border: `1px solid ${theme.panelBorder}`,
  fontSize: 11,
  fontWeight: 600,
  color: theme.textColorPrimary,
  background: "#fff",
  boxSizing: "border-box",
  lineHeight: 1.35,
});

const lblStyle = (theme: DashTheme): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: 3,
  fontSize: 9,
  fontWeight: 700,
  color: theme.mutedText,
  minWidth: 0,
  lineHeight: 1.35,
});

function PanelBody({
  loading,
  error,
  data,
  theme,
  viz,
  emptyMessage,
}: {
  loading: boolean;
  error: string | null;
  data: Point[];
  theme: DashTheme;
  viz: "barV" | "barH" | "pie";
  emptyMessage: string;
}) {
  const ct = chartTheme(theme);
  if (loading) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: theme.mutedText,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        Cargando…
      </p>
    );
  }
  if (error) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: theme.accent,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {error}
      </p>
    );
  }
  if (data.length === 0) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          color: theme.mutedText,
          textAlign: "center",
          lineHeight: 1.45,
          padding: "4px 2px",
        }}
      >
        {emptyMessage}
      </p>
    );
  }
  if (viz === "pie") {
    return <ChartPie data={data} theme={ct} />;
  }
  if (viz === "barH") {
    return <ChartHorizontalBars data={data} theme={ct} minHeight={220} />;
  }
  return <ChartVerticalBars data={data} theme={ct} height={236} />;
}

type PanelState = { data: Point[]; loading: boolean; error: string | null };

export type VizKind = "pie" | "barV" | "barH";

function StatisticChartCard({
  theme,
  range,
  sectionSlug,
  chartSlug,
  title,
  subtitle,
  viz,
  panel,
  filters,
  emptyMessage,
}: {
  theme: DashTheme;
  range: { start: string; end: string };
  sectionSlug: string;
  chartSlug: string;
  title: string;
  subtitle?: string;
  viz: VizKind;
  panel: PanelState;
  filters?: React.ReactNode;
  emptyMessage: string;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shot, setShot] = useState<string | null>(null);

  const drFile = normalizeStatsDateRange(range);
  const fileName = `grafica-${sectionSlug}-${chartSlug}_${
    drFile?.start ?? range.start
  }_${drFile?.end ?? range.end}.png`;

  const openShot = async () => {
    const el = captureRef.current;
    if (!el) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      setShot(canvas.toDataURL("image/png"));
      setModalOpen(true);
    } catch {
      setShot(null);
      setModalOpen(true);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          width: "100%",
          alignItems: "stretch",
          justifyContent: "flex-start",
          background: theme.panelBg,
          border: `2px solid ${theme.panelBorder}`,
          borderRadius: 16,
          padding: "10px 12px 12px",
          boxSizing: "border-box",
          gap: 8,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            fontWeight: 800,
            color: theme.textColorPrimary,
            textAlign: "center",
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            style={{
              margin: 0,
              fontSize: 9,
              color: theme.mutedText,
              textAlign: "center",
              lineHeight: 1.45,
              wordBreak: "break-word",
            }}
          >
            {subtitle}
          </p>
        ) : null}
        {filters ? (
          <div style={{ width: "100%", minWidth: 0 }}>{filters}</div>
        ) : null}
        <div
          ref={captureRef}
          style={{
            width: "100%",
            minWidth: 0,
            background: "#fff",
            borderRadius: 10,
            padding: "8px 8px",
            border: `1px solid ${theme.panelBorder}`,
            minHeight: 180,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 9,
              fontWeight: 700,
              color: theme.mutedText,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {drFile != null
              ? formatPeriodLine(drFile.start, drFile.end)
              : "Define fecha desde y hasta"}
          </p>
          <div style={{ flex: 1, minHeight: 0, width: "100%" }}>
            <PanelBody
              loading={panel.loading}
              error={panel.error}
              data={panel.data}
              theme={theme}
              viz={viz}
              emptyMessage={emptyMessage}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={openShot}
          disabled={panel.loading}
          style={{
            padding: "5px 10px",
            borderRadius: 8,
            border: `1px solid ${theme.panelBorder}`,
            fontSize: 10,
            fontWeight: 800,
            cursor: panel.loading ? "not-allowed" : "pointer",
            background: "#fff",
            color: theme.textColorPrimary,
            opacity: panel.loading ? 0.55 : 1,
            alignSelf: "center",
            lineHeight: 1.35,
            flexShrink: 0,
          }}
        >
          Ver imagen
        </button>
      </div>
      <ChartImageModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setShot(null);
        }}
        imageUrl={shot}
        title={title}
        fileName={fileName}
        theme={theme}
      />
    </div>
  );
}

type Props = {
  theme: DashTheme;
  range: { start: string; end: string };
  viz: VizKind;
};

export default function StatisticsDashboardGrid({ theme, range, viz }: Props) {
  const gridCols = useStatsGridColumns();
  const [colognes, setColognes] = useState<{ id: number; name: string }[]>([]);
  const [colognesReady, setColognesReady] = useState(false);
  const [typeServices, setTypeServices] = useState<{ id: number; name: string }[]>(
    []
  );
  const [cologneIncidentes, setCologneIncidentes] = useState("");
  const [cologneEstatus, setCologneEstatus] = useState("");
  /** Igual que pieCharts.vue: Todas | Cerrado | Cancelado | Abierto */
  const [statusForColonia, setStatusForColonia] = useState("todas");

  useEffect(() => {
    (async () => {
      const raw = await getAllTypeToServices();
      const arr = Array.isArray(raw) ? raw : [];
      setTypeServices(
        arr.map((x: { id?: number; name?: string }) => ({
          id: Number(x.id),
          name: String(x.name ?? ""),
        }))
      );
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const c = await getAllColognes();
        const arr = Array.isArray(c) ? c : [];
        setColognes(
          arr.map((x: { id?: number; name?: string }) => ({
            id: Number(x.id),
            name: String(x.name ?? ""),
          }))
        );
      } finally {
        setColognesReady(true);
      }
    })();
  }, []);

  const pTodos = useAsyncPanel(
    async () => {
      const dr = normalizeStatsDateRange(range);
      if (!dr) return [];
      const pts = await fetchGroupByDatePoints(dr.start, dr.end);
      return labelPointsWithTypeServiceNames(pts, typeServices);
    },
    [range.start, range.end, typeServices]
  );

  const pEstatusTodos = useAsyncPanel(
    async () => {
      const dr = normalizeStatsDateRange(range);
      if (!dr) return [];
      return fetchStatusGroupByDatePoints(dr.start, dr.end);
    },
    [range.start, range.end]
  );

  /** Colonias con al menos un incidente en el periodo (para selects y coherencia). */
  const pColoniasConDatosEnPeriodo = useAsyncColonyRows(
    async () => {
      const dr = normalizeStatsDateRange(range);
      if (!dr || !colognesReady || colognes.length === 0) return [];
      return fetchIncidentTotalsByColoniaEnPeriodo(dr.start, dr.end, colognes);
    },
    [range.start, range.end, colognes, colognesReady]
  );

  const pCantidadPorColonia = useAsyncPanel(
    async () => {
      const dr = normalizeStatsDateRange(range);
      if (!dr) return [];
      if (!colognesReady) return [];
      if (colognes.length === 0) return [];
      if (statusForColonia === "todas") {
        return fetchCantidadIncidentesPorColoniaTodas(
          dr.start,
          dr.end,
          colognes
        );
      }
      const rows = await fetchCologneRowsByStatusInPeriodo(
        dr.start,
        dr.end,
        statusForColonia,
        colognes
      );
      return rows.map((r) => ({ name: r.name, value: r.value }));
    },
    [range.start, range.end, statusForColonia, colognes, colognesReady]
  );

  const pIncidentesPorColonia = useAsyncPanel(
    async () => {
      const dr = normalizeStatsDateRange(range);
      if (!dr) return [];
      if (!cologneIncidentes) return [];
      const pts = await fetchCologneSeriesPoints(
        dr.start,
        dr.end,
        cologneIncidentes
      );
      return labelPointsWithTypeServiceNames(pts, typeServices);
    },
    [range.start, range.end, cologneIncidentes, typeServices]
  );

  const pEstatusPorColonias = useAsyncPanel(
    async () => {
      const dr = normalizeStatsDateRange(range);
      if (!dr) return [];
      if (!cologneEstatus) return [];
      return fetchStatusOnColognePoints(dr.start, dr.end, cologneEstatus);
    },
    [range.start, range.end, cologneEstatus]
  );

  useEffect(() => {
    const rows = pColoniasConDatosEnPeriodo.data;
    if (rows.length === 0) {
      setCologneIncidentes("");
      setCologneEstatus("");
      return;
    }
    const ids = new Set(rows.map((r) => String(r.id)));
    setCologneIncidentes((prev) =>
      ids.has(prev) ? prev : String(rows[0].id)
    );
    setCologneEstatus((prev) =>
      ids.has(prev) ? prev : String(rows[0].id)
    );
  }, [pColoniasConDatosEnPeriodo.data]);

  const waitColonias = (p: PanelState): PanelState => ({
    ...p,
    loading:
      !colognesReady ||
      pColoniasConDatosEnPeriodo.loading ||
      p.loading,
  });

  const filterCologne = (
    value: string,
    set: (v: string) => void,
    label: string
  ) => {
    const opts = pColoniasConDatosEnPeriodo.data;
    const loadingOpts = pColoniasConDatosEnPeriodo.loading;
    return (
      <label style={lblStyle(theme)}>
        {label}
        {loadingOpts && opts.length === 0 ? (
          <span style={{ fontSize: 10, color: theme.mutedText }}>
            Cargando colonias…
          </span>
        ) : opts.length === 0 ? (
          <span style={{ fontSize: 10, color: theme.mutedText }}>
            Sin colonias con incidentes en este periodo
          </span>
        ) : (
          <select
            value={
              opts.some((o) => String(o.id) === value)
                ? value
                : String(opts[0].id)
            }
            onChange={(e) => set(e.target.value)}
            style={selStyle(theme)}
          >
            {opts.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </label>
    );
  };

  const filterStatusColonia = (
    <label style={lblStyle(theme)}>
      Estado
      <select
        value={statusForColonia}
        onChange={(e) => setStatusForColonia(e.target.value)}
        style={selStyle(theme)}
      >
        <option value="todas">Todas</option>
        <option value="cerrado">Cerrado</option>
        <option value="cancelado">Cancelado</option>
        <option value="abierto">Abierto</option>
      </select>
    </label>
  );

  const emptyGeneral = "Sin datos en el periodo seleccionado.";
  const emptyColonia = "Sin Registros Localizados";

  const sectionSlug =
    viz === "pie" ? "pastel" : viz === "barV" ? "columnas-vertical" : "columnas-horizontal";

  const blocks: {
    slug: string;
    title: string;
    subtitle?: string;
    panel: PanelState;
    filters?: React.ReactNode;
    emptyMessage: string;
  }[] = [
    {
      slug: "todos-incidentes",
      title: "Todos los Incidentes",
      subtitle: "Por tipo de servicio · POST /folio/group-by-date",
      panel: pTodos,
      emptyMessage: emptyGeneral,
    },
    {
      slug: "estatus-todos-incidentes",
      title: "Estatus de Todos los Incidentes",
      subtitle: "POST /folio/status-group-by-date",
      panel: pEstatusTodos,
      emptyMessage: emptyGeneral,
    },
    {
      slug: "cantidad-por-colonia",
      title: "Cantidad de Incidentes por Colonia",
      subtitle:
        statusForColonia === "todas"
          ? "Solo colonias con al menos un incidente en el periodo"
          : `POST /folio/cologne-group-by-date-status/${statusForColonia} (colonias con ese estado)`,
      panel: waitColonias(pCantidadPorColonia),
      filters: filterStatusColonia,
      emptyMessage: emptyColonia,
    },
    {
      slug: "incidentes-por-colonia",
      title: "Incidentes por Colonia",
      subtitle:
        "Por tipo de servicio · colonias con datos en el periodo (selector)",
      panel: waitColonias(pIncidentesPorColonia),
      filters: filterCologne(
        cologneIncidentes,
        setCologneIncidentes,
        "Colonia"
      ),
      emptyMessage: emptyColonia,
    },
    {
      slug: "estatus-incidentes-colonias",
      title: "Estatus de Incidentes por Colonias",
      subtitle:
        "Colonias con incidentes en el periodo (selector) · POST /folio/status-on-cologne-group-by-date/:id",
      panel: waitColonias(pEstatusPorColonias),
      filters: filterCologne(cologneEstatus, setCologneEstatus, "Colonia"),
      emptyMessage: emptyColonia,
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns:
          gridCols === 2 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
        gap: 18,
        paddingBottom: 20,
        boxSizing: "border-box",
        alignItems: "stretch",
      }}
    >
      {blocks.map((b) => (
        <StatisticChartCard
          key={`${sectionSlug}-${b.slug}`}
          theme={theme}
          range={range}
          sectionSlug={sectionSlug}
          chartSlug={b.slug}
          title={b.title}
          subtitle={b.subtitle}
          viz={viz}
          panel={b.panel}
          filters={b.filters}
          emptyMessage={b.emptyMessage}
        />
      ))}
    </div>
  );
}
