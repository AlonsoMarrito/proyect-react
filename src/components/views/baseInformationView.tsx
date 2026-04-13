import React, { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getPreferences } from "../scripts/preference/getPreference";
import { getBaseByName } from "../scripts/bases/getBases";
import basePrincipal from "../../assets/icons-app/base_principal.png";

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

type BaseDetail = {
  name?: string;
  cologne?: string;
  street_and_number?: string;
  crosse?: string;
  status?: string;
  coordinates?: string;
};

function parseCoords(text: unknown): [number, number] | null {
  if (text == null || typeof text !== "string") return null;
  const clean = text.replace(/\s/g, "");
  const i = clean.indexOf(",");
  if (i <= 0) return null;
  const lat = parseFloat(clean.slice(0, i));
  const lng = parseFloat(clean.slice(i + 1));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function fmtCoord(text: unknown, part: 0 | 1): string {
  if (text == null || typeof text !== "string") return "—";
  const clean = text.replace(/\s/g, "");
  const i = clean.indexOf(",");
  if (i <= 0) return "—";
  const n = parseFloat(part === 0 ? clean.slice(0, i) : clean.slice(i + 1));
  return Number.isFinite(n) ? n.toFixed(6) : "—";
}

export default function BaseInformationView() {
  const { name: nameParam } = useParams();
  const mapRef = useRef<L.Map | null>(null);
  const mapElRef = useRef<HTMLDivElement | null>(null);

  const [styleColor, setStyleColor] = useState(0);
  const [base, setBase] = useState<BaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const theme = colorApss[styleColor] ?? colorApss[0];

  const decodedName = nameParam
    ? decodeURIComponent(String(nameParam))
    : "";

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!decodedName) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setNotFound(false);
      try {
        const raw = await getBaseByName(decodedName);
        const row = Array.isArray(raw) ? raw[0] : raw;
        if (cancelled) return;
        if (!row || typeof row !== "object") {
          setBase(null);
          setNotFound(true);
        } else {
          setBase(row as BaseDetail);
          setNotFound(false);
        }
      } catch {
        if (!cancelled) {
          setBase(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [decodedName]);

  useEffect(() => {
    mapRef.current?.remove();
    mapRef.current = null;

    const el = mapElRef.current;
    if (!el || !base) return;
    el.innerHTML = "";

    const coords = parseCoords(base.coordinates);
    if (!coords) return;

    const map = L.map(el).setView(coords, 15);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const icon = L.icon({
      iconUrl: basePrincipal,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

    L.marker(coords, { icon })
      .addTo(map)
      .bindPopup(`Base ${base.name ?? ""}`);

    const t = window.setTimeout(() => map.invalidateSize(), 120);

    return () => {
      window.clearTimeout(t);
      map.remove();
      mapRef.current = null;
    };
  }, [base]);

  const infoRow = (label: string, value: string) => (
    <div style={styles.infoRow}>
      <span style={{ ...styles.infoLabel, color: theme.mutedText }}>{label}</span>
      <span style={{ ...styles.infoValue, color: theme.textColorPrimary }}>
        {value || "—"}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div
        style={{
          ...styles.page,
          background: theme.pageBg,
          color: theme.textColorPrimary,
        }}
      >
        <p style={{ textAlign: "center", padding: "3rem" }}>Cargando base…</p>
      </div>
    );
  }

  if (notFound || !base) {
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
            ...styles.hero,
            background: theme.panelBg,
            border: `1px solid ${theme.panelBorder}`,
            boxShadow: theme.panelShadow,
            maxWidth: "480px",
            margin: "3rem auto",
            padding: "1.5rem",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontWeight: 700 }}>No se encontró la base.</p>
          <Link
            to="/all-bases"
            style={{
              display: "inline-block",
              marginTop: "1rem",
              color: theme.accent,
              fontWeight: 700,
            }}
          >
            ← Volver a bases
          </Link>
        </div>
      </div>
    );
  }

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
          ...styles.hero,
          background: theme.panelBg,
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: theme.panelShadow,
        }}
      >
        <div
          style={{
            ...styles.heroAccent,
            background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
          }}
        />
        <div style={styles.heroMain}>
          <Link
            to="/all-bases"
            style={{
              fontWeight: 700,
              fontSize: "14px",
              color: theme.accent,
              textDecoration: "none",
              marginBottom: "4px",
              display: "inline-block",
            }}
          >
            ← Bases
          </Link>
          <p style={{ ...styles.kicker, color: theme.mutedText, margin: 0 }}>
            Detalle
          </p>
          <h1 style={{ ...styles.heroTitle, color: theme.textColorPrimary }}>
            {base.name ?? decodedName}
          </h1>
        </div>
      </div>

      <div style={styles.split}>
        <div
          style={{
            ...styles.panel,
            background: theme.panelBg,
            border: `1px solid ${theme.panelBorder}`,
            boxShadow: theme.panelShadow,
          }}
        >
          <div
            style={{
              ...styles.panelHead,
              background: theme.accentMuted,
              borderBottom: `1px solid ${theme.panelBorder}`,
            }}
          >
            <p style={{ ...styles.kicker, color: theme.mutedText, margin: 0 }}>
              Datos
            </p>
            <h2
              style={{
                margin: "6px 0 0",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: theme.textColorPrimary,
              }}
            >
              Información de la base
            </h2>
          </div>
          <div style={styles.panelBody}>
            {infoRow("Base", String(base.name ?? ""))}
            {infoRow("Colonia", String(base.cologne ?? ""))}
            {infoRow("Calle", String(base.street_and_number ?? ""))}
            {infoRow("Cruce", String(base.crosse ?? ""))}
            {infoRow("Estatus", String(base.status ?? ""))}
            {infoRow("Latitud", fmtCoord(base.coordinates, 0))}
            {infoRow("Longitud", fmtCoord(base.coordinates, 1))}
          </div>
        </div>

        <div
          style={{
            ...styles.panel,
            background: theme.panelBg,
            border: `1px solid ${theme.panelBorder}`,
            boxShadow: theme.panelShadow,
            minHeight: "min(420px, 55vh)",
          }}
        >
          <div
            style={{
              ...styles.panelHead,
              background: theme.accentMuted,
              borderBottom: `1px solid ${theme.panelBorder}`,
            }}
          >
            <p style={{ ...styles.kicker, color: theme.mutedText, margin: 0 }}>
              Mapa
            </p>
            <h2
              style={{
                margin: "6px 0 0",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: theme.textColorPrimary,
              }}
            >
              Ubicación
            </h2>
          </div>
          <div style={{ ...styles.mapWrap, position: "relative" }}>
            <div ref={mapElRef} style={styles.mapEl} />
            {!parseCoords(base.coordinates) && (
              <div
                style={{
                  position: "absolute",
                  inset: 12,
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.92)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1rem",
                  textAlign: "center",
                  color: theme.mutedText,
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Sin coordenadas para mostrar el mapa.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    padding: "0.75rem clamp(0.75rem, 2vw, 1.25rem)",
    boxSizing: "border-box",
  },
  hero: {
    display: "flex",
    alignItems: "stretch",
    gap: "1rem",
    maxWidth: "min(1680px, 98vw)",
    margin: "0 auto 1rem",
    padding: "0.9rem 1.15rem",
    borderRadius: "16px",
    boxSizing: "border-box",
  },
  heroAccent: {
    width: "6px",
    borderRadius: "6px",
    flexShrink: 0,
  },
  heroMain: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: "6px 0 0",
    fontSize: "clamp(1.35rem, 2.2vw, 1.65rem)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  split: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.15rem",
    maxWidth: "min(1680px, 98vw)",
    margin: "0 auto",
    alignItems: "stretch",
  },
  panel: {
    flex: "1 1 340px",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  panelHead: {
    padding: "0.85rem 1rem",
    flexShrink: 0,
  },
  panelBody: {
    padding: "1rem 1.15rem 1.2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0",
    overflowY: "auto",
    maxHeight: "min(380px, 50vh)",
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "minmax(100px, 32%) 1fr",
    gap: "8px 14px",
    padding: "10px 0",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    alignItems: "baseline",
  },
  infoLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: "15px",
    fontWeight: 600,
    wordBreak: "break-word",
  },
  mapWrap: {
    flex: 1,
    minHeight: "min(380px, 48vh)",
    padding: "12px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "stretch",
  },
  mapEl: {
    width: "100%",
    height: "100%",
    minHeight: "min(360px, 45vh)",
    borderRadius: "12px",
    overflow: "hidden",
  },
};
