import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { Link, useParams } from "react-router-dom";

import { getPreferences } from "../scripts/preference/getPreference";
import {
  getTypeVehicles,
  getVehicleByTypeVehicle,
} from "../scripts/vehicle/generalInfoVehicle/getVehicles";
import ModalAddNewVehicleUnit from "../components-on-views/vehiculos/ModalAddNewVehicleUnit";
import dumieImg from "../../assets/vehiclesUnitImg/dumie.png";

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

type VehicleRow = {
  id?: number;
  number_unit?: string | number;
  car_brand?: string;
  model?: string;
  cover_img?: string;
  status?: string;
};

type StatusFilter = "todas" | "operativa" | "taller" | "in-operativa";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "todas", label: "Todos" },
  { value: "operativa", label: "Operativos" },
  { value: "taller", label: "Taller" },
  { value: "in-operativa", label: "In-operativos" },
];

export default function VehiclesByTypeView(_props: { user?: unknown }) {
  const { type: typeParam } = useParams();
  const decodedType = typeParam ? decodeURIComponent(typeParam) : "";

  const [styleColor, setStyleColor] = useState(0);
  const [typeId, setTypeId] = useState<number | null>(null);
  const [stock, setStock] = useState<VehicleRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [modalOpen, setModalOpen] = useState(false);

  const theme = colorApss[styleColor] ?? colorApss[0];

  const load = useCallback(async () => {
    if (!decodedType) {
      setTypeId(null);
      setStock([]);
      return;
    }
    const id = await getVehicleByTypeVehicle(decodedType);
    if (id == null || typeof id !== "number") {
      setTypeId(null);
      setStock([]);
      return;
    }
    setTypeId(id);
    const list = await getTypeVehicles(id, statusFilter);
    setStock(Array.isArray(list) ? list : []);
  }, [decodedType, statusFilter]);

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
    })();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stock;
    return stock.filter((v) => {
      const unit = String(v.number_unit ?? "");
      const brand = (v.car_brand ?? "").toLowerCase();
      const model = (v.model ?? "").toLowerCase();
      return (
        unit.toLowerCase().includes(q) ||
        brand.includes(q) ||
        model.includes(q)
      );
    });
  }, [stock, search]);

  return (
    <div
      style={{
        ...styles.container,
        background: theme.pageBg,
        color: theme.textColorPrimary,
      }}
    >
      <style>
        {`
          .veh-by-type-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
          }
          .veh-by-type-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 1.15rem;
            width: 100%;
          }
          @media (max-width: 1000px) {
            .veh-by-type-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          @media (max-width: 500px) {
            .veh-by-type-grid {
              grid-template-columns: minmax(0, 1fr);
            }
          }
        `}
      </style>

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
          <div style={styles.heroTop}>
            <div>
              <Link
                to="/typeToVehicles"
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                  color: theme.accent,
                  textDecoration: "none",
                  display: "inline-block",
                  marginBottom: "6px",
                }}
              >
                ← Tipos de vehículo
              </Link>
              <p style={{ ...styles.kicker, color: theme.mutedText, margin: 0 }}>
                Unidades
              </p>
              <h1 style={{ ...styles.heroTitle, color: theme.textColorPrimary }}>
                {decodedType || "—"}
              </h1>
            </div>
            <button
              type="button"
              style={{
                ...styles.btnHero,
                background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
                boxShadow: `0 4px 14px ${theme.accentMuted}`,
                opacity: typeId == null ? 0.5 : 1,
              }}
              onClick={() => setModalOpen(true)}
              disabled={typeId == null}
            >
              Agregar vehículo
            </button>
          </div>

          <div style={styles.toolbar}>
            <label style={{ ...styles.lab, color: theme.mutedText }}>
              Buscar
              <input
                type="search"
                placeholder="Nº unidad, marca, modelo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  ...styles.inp,
                  borderColor: theme.inputBorder,
                  color: theme.textColorPrimary,
                  background: theme.panelBg,
                }}
              />
            </label>
            <label style={{ ...styles.lab, color: theme.mutedText }}>
              Estatus
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                style={{
                  ...styles.inp,
                  borderColor: theme.inputBorder,
                  color: theme.textColorPrimary,
                  background: theme.panelBg,
                  cursor: "pointer",
                }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div style={styles.contentWrap}>
        <div style={styles.scrollArea}>
          {typeId == null ? (
            <p
              style={{
                textAlign: "center",
                color: theme.mutedText,
                padding: "2rem",
              }}
            >
              No se encontró el tipo de vehículo.
            </p>
          ) : filtered.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: theme.mutedText,
                padding: "2rem",
                fontStyle: "italic",
              }}
            >
              Sin unidades registradas con este criterio.
            </p>
          ) : (
            <div className="veh-by-type-grid">
              {filtered.map((value, index) => (
                <Link
                  key={value.id ?? index}
                  className="veh-by-type-card"
                  to={`/typeToVehicles/description-u/${encodeURIComponent(String(value.number_unit ?? ""))}`}
                  style={{
                    ...styles.card,
                    background: theme.panelBg,
                    border: `1px solid ${theme.panelBorder}`,
                    boxShadow: theme.panelShadow,
                    color: theme.textColorPrimary,
                  }}
                >
                  <h3 style={{ ...styles.cardH, color: theme.textColorPrimary }}>
                    U - {value.number_unit}
                  </h3>
                  <img
                    src={value.cover_img || dumieImg}
                    alt=""
                    style={styles.cardImg}
                  />
                  <p
                    style={{
                      ...styles.cardSub,
                      color: theme.mutedText,
                    }}
                  >
                    <span style={{ color: theme.textColorPrimary, fontWeight: 700 }}>
                      {value.car_brand} {value.model}
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && typeId != null && (
        <ModalAddNewVehicleUnit
          theme={theme}
          typeId={typeId}
          typeWord={decodedType}
          onClose={() => setModalOpen(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
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
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  kicker: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: "6px 0 0",
    fontSize: "clamp(1.25rem, 2.2vw, 1.65rem)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  btnHero: {
    flexShrink: 0,
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    alignItems: "flex-end",
  },
  lab: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 600,
    flex: "1 1 200px",
    minWidth: "min(100%, 260px)",
  },
  inp: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "2px solid",
    fontSize: "14px",
    fontWeight: 600,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  contentWrap: {
    maxWidth: "min(1680px, 98vw)",
    margin: "0 auto",
    width: "100%",
  },
  scrollArea: {
    maxHeight: "min(338px, 51vh)",
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
    paddingBottom: "0.5rem",
  },
  card: {
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: "16px",
    padding: "1rem",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    minHeight: "260px",
    boxSizing: "border-box",
  },
  cardH: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: 800,
  },
  cardImg: {
    width: "70%",
    minWidth: "120px",
    maxHeight: "160px",
    objectFit: "contain",
    margin: "10px 0",
    borderRadius: "12px",
    padding: "8px",
    boxSizing: "border-box",
  },
  cardSub: {
    margin: 0,
    fontSize: "1rem",
    textAlign: "center",
    lineHeight: 1.35,
  },
};
