import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";

import { getPreferences } from "../scripts/preference/getPreference";
import { getAllBases } from "../scripts/bases/getBases";
import ModalAddNewBase from "../components-on-views/bases/ModalAddNewBase";
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

type BaseRow = {
  id?: number;
  name: string;
  status: string;
  type_hub: string;
};

export default function Bases(_props: { user?: unknown }) {
  const [allBases, setAllBases] = useState<BaseRow[]>([]);
  const [styleColor, setStyleColor] = useState(0);
  const [search, setSearch] = useState("");
  const [statusModal, setStatusModal] = useState(false);

  const theme = colorApss[styleColor] ?? colorApss[0];

  const loadBases = useCallback(async () => {
    const list = await getAllBases();
    setAllBases(Array.isArray(list) ? list : []);
  }, []);

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
      await loadBases();
    })();
  }, [loadBases]);

  const filteredBases = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allBases.filter((b) => {
      const matchType = String(b.type_hub ?? "").toLowerCase() === "base";
      const matchSearch =
        !q || String(b.name ?? "").toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [allBases, search]);

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
          .bases-cards-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 1.15rem;
            align-items: stretch;
            width: 100%;
          }
          @media (max-width: 1000px) {
            .bases-cards-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          @media (max-width: 500px) {
            .bases-cards-grid {
              grid-template-columns: minmax(0, 1fr);
            }
          }
          .bases-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
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
                Catálogo
              </p>
              <h1 style={{ ...styles.heroTitle, color: theme.textColorPrimary }}>
                Bases
              </h1>
            </div>
            <button
              type="button"
              style={{
                ...styles.btnHero,
                background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
                boxShadow: `0 4px 14px ${theme.accentMuted}`,
              }}
              onClick={() => setStatusModal(true)}
            >
              Agregar base
            </button>
          </div>
          <label style={{ ...styles.searchLabel, color: theme.mutedText }}>
            Buscar base
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
          <div className="bases-cards-grid">
            {filteredBases.map((value, index) => (
              <Link
                className="bases-card"
                key={value.id ?? `${value.name}-${index}`}
                to={`/base-information/${encodeURIComponent(String(value.name ?? ""))}`}
                style={{
                  ...styles.card,
                  background: theme.panelBg,
                  border: `1px solid ${theme.panelBorder}`,
                  boxShadow: theme.panelShadow,
                  color: theme.textColorPrimary,
                }}
              >
                <img
                  src={basePrincipal}
                  alt=""
                  style={styles.cardImage}
                />
                <p
                  style={{
                    ...styles.cardTitle,
                    color: theme.textColorPrimary,
                  }}
                >
                  Base: {String(value.name ?? "").toUpperCase()}
                </p>
                <p
                  style={{
                    ...styles.cardMeta,
                    color: theme.mutedText,
                  }}
                >
                  Estatus:{" "}
                  <span style={{ color: theme.textColorPrimary, fontWeight: 700 }}>
                    {value.status ?? "—"}
                  </span>
                </p>
              </Link>
            ))}
          </div>
          {filteredBases.length === 0 && (
            <p
              style={{
                textAlign: "center",
                fontStyle: "italic",
                color: theme.mutedText,
                padding: "2rem",
                margin: 0,
              }}
            >
              {allBases.length === 0
                ? "No hay bases registradas."
                : "Ninguna base coincide con la búsqueda."}
            </p>
          )}
        </div>
      </div>

      {statusModal && (
        <ModalAddNewBase
          theme={theme}
          onClose={() => setStatusModal(false)}
          onCreated={loadBases}
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
    overflowX: "auto",
    overflowY: "auto",
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
    minHeight: "220px",
    boxSizing: "border-box",
  },
  cardImage: {
    width: "min(120px, 45%)",
    maxHeight: "140px",
    objectFit: "contain",
    marginBottom: "10px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 800,
    textAlign: "center",
    lineHeight: 1.25,
  },
  cardMeta: {
    margin: "8px 0 0",
    fontSize: "0.95rem",
    textAlign: "center",
  },
};
