import { getApiBaseUrl } from "../../scripts/apiBase.js";

export type Point = { name: string; value: number };

/**
 * Fechas `YYYY-MM-DD` para el API. No intercambia fechas: si están invertidas,
 * devuelve `null` (evita consultar un rango “arreglado” amplio por error).
 */
export function normalizeStatsDateRange(range: {
  start: string;
  end: string;
}): { start: string; end: string } | null {
  const start = String(range.start ?? "").trim();
  const end = String(range.end ?? "").trim();
  if (!start || !end) return null;
  if (start > end) return null;
  return { start, end };
}

/** Fecha de hoy en zona Ciudad de México (mismo criterio que el rango por defecto). */
export function todayIsoMexico(): string {
  const s = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" })
  );
  const y = s.getFullYear();
  const m = s.getMonth();
  const day = s.getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m + 1)}-${pad(day)}`;
}

/** Rango por defecto: inicio de mes → hoy (zona Ciudad de México). */
export function defaultMexicoDateRange(): { start: string; end: string } {
  const s = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" })
  );
  const y = s.getFullYear();
  const m = s.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const end = todayIsoMexico();
  return {
    start: `${y}-${pad(m + 1)}-01`,
    end,
  };
}

/** Cuerpo esperado por el API RUS (POST /folio/group-by-date y status-group-by-date). */
export function buildStatsDateBody(
  startIsoDate: string,
  endIsoDate: string
): { date_from: string; date_to: string } {
  return {
    date_from: startIsoDate,
    date_to: endIsoDate,
  };
}

async function postFolio(path: string, body: Record<string, string>) {
  const base = getApiBaseUrl();
  return fetch(`${base}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function readErrorHint(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as Record<string, unknown>;
    const msg = j.message ?? j.error ?? j.statusMessage;
    if (msg != null) return String(msg);
    if (Array.isArray(j.message) && j.message.length)
      return JSON.stringify(j.message);
    return JSON.stringify(j);
  } catch {
    return (await res.text()) || `HTTP ${res.status}`;
  }
}

function numFrom(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return "—";
}

/**
 * Normaliza respuestas del backend: filas con `_count` + `status`, o fechas, o mapas.
 */
export function normalizeSeries(raw: unknown): Point[] {
  if (raw == null) return [];

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data)) {
      return normalizeSeries(r.data);
    }
    const entries = Object.entries(r).filter(
      ([key]) =>
        key !== "message" &&
        key !== "error" &&
        key !== "statusCode" &&
        key !== "status"
    );
    const allNumeric = entries.every(
      ([, v]) =>
        typeof v === "number" ||
        (typeof v === "string" &&
          v.trim() !== "" &&
          Number.isFinite(Number(v)))
    );
    if (entries.length > 0 && allNumeric) {
      return entries.map(([name, v]) => ({ name, value: numFrom(v) }));
    }
  }

  const arr = Array.isArray(raw) ? raw : [];
  const out: Point[] = [];
  for (const row of arr) {
    if (row == null || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    let name: string;
    if (
      o.id_type_service != null &&
      String(o.id_type_service).trim() !== ""
    ) {
      name = String(o.id_type_service);
    } else if (o.id_cologne != null && String(o.id_cologne).trim() !== "") {
      name = String(o.id_cologne);
    } else {
      name = pickString(o, [
        "date",
        "fecha",
        "day",
        "dia",
        "label",
        "name",
        "status",
        "estado",
        "cologne",
        "colonia",
        "nombre",
        "nombre_colonia",
        "cologne_name",
        "key",
      ]).slice(0, 80);
    }
    const value = numFrom(
      o._count ??
        o.value ??
        o.count ??
        o.total ??
        o.cantidad ??
        o.services ??
        o.servicios ??
        o.amount
    );
    if (name && name !== "—") out.push({ name, value });
  }
  return out;
}

export async function fetchStatisticsSeries(
  startIsoDate: string,
  endIsoDate: string
): Promise<{ byDate: Point[]; byStatus: Point[] }> {
  const body = buildStatsDateBody(startIsoDate, endIsoDate);

  const [r1, r2] = await Promise.all([
    postFolio("/folio/group-by-date", body),
    postFolio("/folio/status-group-by-date", body),
  ]);

  if (r1.ok && r2.ok) {
    const rawDate = await r1.json();
    const rawStatus = await r2.json();
    return {
      byDate: normalizeSeries(rawDate),
      byStatus: normalizeSeries(rawStatus),
    };
  }

  let lastHint = "";
  if (!r1.ok) lastHint = await readErrorHint(r1);
  else if (!r2.ok) lastHint = await readErrorHint(r2);

  throw new Error(
    lastHint
      ? `Estadísticas: ${lastHint}`
      : "No se pudo obtener estadísticas (error HTTP)."
  );
}

async function fetchJsonOrThrow(path: string, body: { date_from: string; date_to: string }) {
  const res = await postFolio(path, body);
  if (!res.ok) throw new Error(await readErrorHint(res));
  return res.json();
}

export async function fetchGroupByDatePoints(
  startIsoDate: string,
  endIsoDate: string
): Promise<Point[]> {
  const raw = await fetchJsonOrThrow(
    "/folio/group-by-date",
    buildStatsDateBody(startIsoDate, endIsoDate)
  );
  return normalizeSeries(raw);
}

export async function fetchStatusGroupByDatePoints(
  startIsoDate: string,
  endIsoDate: string
): Promise<Point[]> {
  const raw = await fetchJsonOrThrow(
    "/folio/status-group-by-date",
    buildStatsDateBody(startIsoDate, endIsoDate)
  );
  return normalizeSeries(raw);
}

export async function fetchCologneByStatusPoints(
  startIsoDate: string,
  endIsoDate: string,
  status: string
): Promise<Point[]> {
  const path =
    "/folio/cologne-group-by-date-status/" + encodeURIComponent(status.trim());
  const raw = await fetchJsonOrThrow(
    path,
    buildStatsDateBody(startIsoDate, endIsoDate)
  );
  return normalizeSeries(raw);
}

export async function fetchCologneSeriesPoints(
  startIsoDate: string,
  endIsoDate: string,
  cologneId: string | number
): Promise<Point[]> {
  const path =
    "/folio/cologne-group-by-date/" + encodeURIComponent(String(cologneId));
  const raw = await fetchJsonOrThrow(
    path,
    buildStatsDateBody(startIsoDate, endIsoDate)
  );
  return normalizeSeries(raw);
}

export async function fetchStatusOnColognePoints(
  startIsoDate: string,
  endIsoDate: string,
  cologneId: string | number
): Promise<Point[]> {
  const path =
    "/folio/status-on-cologne-group-by-date/" +
    encodeURIComponent(String(cologneId));
  const raw = await fetchJsonOrThrow(
    path,
    buildStatsDateBody(startIsoDate, endIsoDate)
  );
  return normalizeSeries(raw);
}

/** Sustituye etiquetas numéricas `id_type_service` por nombre desde `/type-services`. */
export function labelPointsWithTypeServiceNames(
  points: Point[],
  types: { id: number; name?: string }[]
): Point[] {
  const map = new Map<number, string>();
  for (const t of types) {
    const id = Number(t.id);
    if (!Number.isFinite(id)) continue;
    const nm = (t.name && String(t.name).trim()) || "";
    map.set(id, nm || `Tipo #${id}`);
  }
  return points.map((p) => {
    const id = Number(p.name);
    if (Number.isFinite(id)) {
      if (map.has(id)) return { name: map.get(id)!, value: p.value };
      return { name: `Tipo #${id}`, value: p.value };
    }
    return p;
  });
}

/** Sustituye etiquetas numéricas `id_cologne` por nombre desde `/colognes`. */
export function labelPointsWithCologneNames(
  points: Point[],
  colognes: { id: number; name?: string }[]
): Point[] {
  const map = new Map<number, string>();
  for (const c of colognes) {
    const id = Number(c.id);
    if (!Number.isFinite(id)) continue;
    const nm = (c.name && String(c.name).trim()) || "";
    map.set(id, nm || `Colonia #${id}`);
  }
  return points.map((p) => {
    const id = Number(p.name);
    if (Number.isFinite(id)) {
      if (map.has(id)) return { name: map.get(id)!, value: p.value };
      return { name: `Colonia #${id}`, value: p.value };
    }
    return p;
  });
}

export type ColonyIncidentRow = { id: number; name: string; value: number };

/**
 * Colonias con al menos un incidente en el periodo (suma por colonia vía
 * POST /folio/cologne-group-by-date/:id). Solo filas con value mayor que 0.
 */
export async function fetchIncidentTotalsByColoniaEnPeriodo(
  startIsoDate: string,
  endIsoDate: string,
  colognes: { id: number; name: string }[]
): Promise<ColonyIncidentRow[]> {
  if (colognes.length === 0) return [];
  const rows = await Promise.all(
    colognes.map(async (c) => {
      const pts = await fetchCologneSeriesPoints(
        startIsoDate,
        endIsoDate,
        c.id
      );
      const sum = pts.reduce((s, p) => s + p.value, 0);
      return {
        id: c.id,
        name: (c.name && c.name.trim()) || `Colonia ${c.id}`,
        value: sum,
      };
    })
  );
  return rows
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** Filas devueltas por POST /folio/cologne-group-by-date-status/:status (solo colonias con datos). */
export async function fetchCologneRowsByStatusInPeriodo(
  startIsoDate: string,
  endIsoDate: string,
  status: string,
  colognes: { id: number; name: string }[]
): Promise<ColonyIncidentRow[]> {
  const path =
    "/folio/cologne-group-by-date-status/" +
    encodeURIComponent(status.trim());
  const raw = await fetchJsonOrThrow(
    path,
    buildStatsDateBody(startIsoDate, endIsoDate)
  );
  const arr = Array.isArray(raw) ? raw : [];
  const nameById = new Map<number, string>();
  for (const c of colognes) {
    nameById.set(
      Number(c.id),
      (c.name && c.name.trim()) || `Colonia ${c.id}`
    );
  }
  const out: ColonyIncidentRow[] = [];
  for (const row of arr) {
    if (row == null || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const id = Number(o.id_cologne);
    if (!Number.isFinite(id)) continue;
    const value = numFrom(o._count);
    out.push({
      id,
      name: nameById.get(id) ?? `Colonia #${id}`,
      value,
    });
  }
  return out.sort((a, b) => b.value - a.value);
}

/** Suma por colonia en el periodo (solo colonias con incidentes mayores que 0). */
export async function fetchCantidadIncidentesPorColoniaTodas(
  startIsoDate: string,
  endIsoDate: string,
  colognes: { id: number; name: string }[]
): Promise<Point[]> {
  const rows = await fetchIncidentTotalsByColoniaEnPeriodo(
    startIsoDate,
    endIsoDate,
    colognes
  );
  return rows.map((r) => ({ name: r.name, value: r.value }));
}
