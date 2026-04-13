import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";

import dumieImg from "../../assets/vehiclesUnitImg/dumie.png";
import { getPreferences } from "../scripts/preference/getPreference";
import { getAllTypeToVehicle } from "../scripts/vehicle/generalInfoVehicle/getVehicles";
import ModalAddTypeVehicle from "../components-on-views/vehiculos/ModalAddTypeVehicle";

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

type VehicleType = {
  type: string;
  /** API puede enviar cover_image (Vue) o image */
  image?: string;
  cover_image?: string;
  operative: number;
  in_operative: number;
};

function coverUrlForType(v: VehicleType): string {
  const raw = v.cover_image ?? v.image ?? "";
  return typeof raw === "string" && raw.trim() !== "" ? raw : dumieImg;
}

export default function TypeToVehicles(_props: { user?: unknown }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [stockVehicle, setStockVehicle] = useState<VehicleType[]>([]);
  const [styleColor, setStyleColor] = useState(0);
  const [search, setSearch] = useState("");

  const theme = colorApss[styleColor] ?? colorApss[0];

  const loadTypes = useCallback(async () => {
    const data = await getAllTypeToVehicle();
    setStockVehicle(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
      await loadTypes();
    })();
  }, [loadTypes]);

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stockVehicle.filter((v) =>
      String(v.type ?? "")
        .toLowerCase()
        .includes(q)
    );
  }, [stockVehicle, search]);

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
          .type-veh-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
          }
          .type-veh-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1.15rem;
            width: 100%;
          }
          @media (max-width: 1000px) {
            .type-veh-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          @media (max-width: 500px) {
            .type-veh-grid {
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
          <div style={styles.heroTopRow}>
            <div style={styles.heroText}>
              <p style={{ ...styles.kicker, color: theme.mutedText }}>
                Flota
              </p>
              <h1 style={{ ...styles.heroTitle, color: theme.textColorPrimary }}>
                Tipos de vehículo
              </h1>
            </div>
            <button
              type="button"
              style={{
                ...styles.btnHero,
                background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
                boxShadow: `0 4px 14px ${theme.accentMuted}`,
              }}
              onClick={() => setModalOpen(true)}
            >
              Agregar tipo
            </button>
          </div>
          <label style={{ ...styles.searchLabel, color: theme.mutedText }}>
            Buscar tipo
            <input
              type="search"
              placeholder="Nombre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...styles.input,
                borderColor: theme.inputBorder,
                color: theme.textColorPrimary,
                background: theme.panelBg,
              }}
            />
          </label>
        </div>
      </div>

      <div style={styles.contentWrap}>
        <div style={styles.cardsScroll}>
          <div className="type-veh-grid">
            {filteredVehicles.map((value, index) => (
              <Link
                key={`${value.type}-${index}`}
                className="type-veh-card"
                to={`/typeToVehicles/${encodeURIComponent(String(value.type ?? ""))}`}
                style={{
                  ...styles.card,
                  background: theme.panelBg,
                  border: `1px solid ${theme.panelBorder}`,
                  boxShadow: theme.panelShadow,
                  color: theme.textColorPrimary,
                }}
              >
                <h3 style={{ ...styles.cardTitle, color: theme.textColorPrimary }}>
                  {value.type}
                </h3>
                <img
                  src={coverUrlForType(value)}
                  alt=""
                  style={styles.cardImage}
                />
                <p style={{ ...styles.line, color: theme.mutedText }}>
                  Operativas:{" "}
                  <span style={{ color: theme.textColorPrimary, fontWeight: 800 }}>
                    {value.operative}
                  </span>
                </p>
                <p style={{ ...styles.line, color: theme.mutedText }}>
                  Inoperativas:{" "}
                  <span style={{ color: theme.textColorPrimary, fontWeight: 800 }}>
                    {value.in_operative}
                  </span>
                </p>
              </Link>
            ))}
          </div>
          {filteredVehicles.length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: theme.mutedText,
                fontStyle: "italic",
                padding: "2rem",
                margin: 0,
              }}
            >
              {stockVehicle.length === 0
                ? "No hay tipos registrados."
                : "Ningún tipo coincide con la búsqueda."}
            </p>
          )}
        </div>
      </div>

      {modalOpen && (
        <ModalAddTypeVehicle
          theme={theme}
          onClose={() => setModalOpen(false)}
          onCreated={loadTypes}
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
  heroTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
    width: "100%",
  },
  heroText: {
    flex: "1 1 200px",
    minWidth: 0,
  },
  kicker: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: 0,
  },
  heroTitle: {
    margin: "6px 0 0",
    fontSize: "clamp(1.35rem, 2.2vw, 1.75rem)",
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
  searchLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 600,
    maxWidth: "min(100%, 360px)",
  },
  input: {
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
    width: "100%",
    maxWidth: "min(1680px, 98vw)",
    margin: "0 auto",
  },
  cardsScroll: {
    maxHeight: "min(338px, 51vh)",
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
    padding: "0 0 0.5rem",
    minWidth: 0,
  },
  card: {
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: "16px",
    padding: "1.1rem 1rem",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    minHeight: "240px",
    boxSizing: "border-box",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.15rem",
    fontWeight: 800,
    textAlign: "center",
  },
  cardImage: {
    width: "min(200px, 80%)",
    maxHeight: "160px",
    objectFit: "cover",
    margin: "10px 0",
    borderRadius: "12px",
  },
  line: {
    margin: "4px 0 0",
    fontSize: "0.98rem",
    textAlign: "center",
  },
};
