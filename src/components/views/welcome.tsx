import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";
import { getWorkShift } from "../scripts/workshift/getWorkShift";
import { getPreferences } from "../scripts/preference/getPreference";
import ModalCreateNewWorkShift from "../components-on-views/workforce/modalCreateNewWorkShift";
import workImg from "../../assets/icons-app/workIn.png";

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

export default function Welcome(_props: { user?: unknown }) {
  const [dataWorkForceView, setDataWorkForceView] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(0);
  const [styleColor, setStyleColor] = useState(0);
  const [search, setSearch] = useState("");

  const theme = colorApss[styleColor] ?? colorApss[0];

  const loadShifts = useCallback(async () => {
    try {
      const data = await getWorkShift();
      setDataWorkForceView(Array.isArray(data) ? data : []);
    } catch {
      setDataWorkForceView([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadShifts();
      const pref = await getPreferences();
      setStyleColor(pref?.color || 0);
    })();
  }, [loadShifts]);

  const filteredShifts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return dataWorkForceView;
    return dataWorkForceView.filter((v) =>
      String(v?.name ?? "")
        .toLowerCase()
        .includes(q)
    );
  }, [dataWorkForceView, search]);

  const openCloseModalAdd = (value: number) => {
    setModalOpen(value);
  };

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
          .welcome-shift-card:hover {
            transform: translateY(-2px);
            filter: brightness(1.02);
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
          <div style={styles.heroTextBlock}>
            <p style={{ ...styles.kicker, color: theme.mutedText }}>
              Estado de fuerza
            </p>
            <h1 style={{ ...styles.heroTitle, color: theme.textColorPrimary }}>
              Turnos de trabajo
            </h1>
          </div>
          <div style={styles.heroToolbar}>
            <button
              type="button"
              style={{
                ...styles.btnPrimary,
                background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
                boxShadow: `0 4px 14px ${theme.accentMuted}`,
              }}
              onClick={() => openCloseModalAdd(1)}
            >
              Agregar turno
            </button>
            <label style={{ ...styles.searchLabel, color: theme.mutedText }}>
              Buscar turno
              <input
                type="search"
                placeholder="Nombre del turno…"
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
      </div>

      <div style={styles.contentWrap}>
        <div style={styles.cardsScroll}>
          <div style={styles.cardsGrid}>
            {filteredShifts.map((value, index) => {
              const workdayLabel =
                value.workday != null && String(value.workday).length > 0
                  ? String(value.workday).charAt(0).toUpperCase() +
                    String(value.workday).slice(1)
                  : "—";
              return (
                <Link
                  className="welcome-shift-card"
                  key={value?.id ?? index}
                  to={`/work-force-shift/${encodeURIComponent(String(value.name ?? ""))}`}
                  style={{
                    ...styles.card,
                    background: theme.panelBg,
                    border: `1px solid ${theme.panelBorder}`,
                    boxShadow: theme.panelShadow,
                    color: theme.textColorPrimary,
                  }}
                >
                  <p
                    style={{
                      ...styles.cardKicker,
                      color: theme.mutedText,
                    }}
                  >
                    Turno
                  </p>
                  <h2 style={{ ...styles.cardTitle, color: theme.textColorPrimary }}>
                    {value.name ?? "—"}
                  </h2>
                  <p
                    style={{
                      ...styles.cardSubtitle,
                      color: theme.accent,
                    }}
                  >
                    {workdayLabel}
                  </p>
                  <img src={workImg} alt="" style={styles.cardImage} />
                  <div style={styles.cardMeta}>
                    <p style={{ ...styles.cardLine, color: theme.textColorPrimary }}>
                      <span style={{ color: theme.mutedText }}>
                        Personal operativo:{" "}
                      </span>
                      {value.operative_personal ?? "—"}
                    </p>
                    <p style={{ ...styles.cardLine, color: theme.textColorPrimary }}>
                      <span style={{ color: theme.mutedText }}>
                        Personal no operativo:{" "}
                      </span>
                      {value.in_operative_personal ?? "—"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          {filteredShifts.length === 0 && (
            <p
              style={{
                ...styles.emptyHint,
                color: theme.mutedText,
              }}
            >
              {dataWorkForceView.length === 0
                ? "No hay turnos registrados."
                : "Ningún turno coincide con la búsqueda."}
            </p>
          )}
        </div>
      </div>

      {modalOpen === 1 && (
        <ModalCreateNewWorkShift
          theme={theme}
          onClose={() => openCloseModalAdd(0)}
          onCreated={loadShifts}
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
  heroTextBlock: {
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
  heroToolbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: "1rem",
  },
  searchLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 600,
    flex: "1 1 220px",
    minWidth: "min(100%, 280px)",
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
  btnPrimary: {
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    letterSpacing: "0.02em",
    alignSelf: "flex-start",
  },
  contentWrap: {
    width: "100%",
    maxWidth: "min(1680px, 98vw)",
    margin: "0 auto",
  },
  /** Misma lógica que tableWrap en workForceByGroup */
  cardsScroll: {
    maxHeight: "min(338px, 51vh)",
    overflowX: "auto",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    padding: "0 0 0.5rem",
    minWidth: 0,
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
    gap: "1.15rem",
    alignItems: "stretch",
  },
  card: {
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: "16px",
    padding: "1rem 1rem 1.1rem",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    minHeight: "260px",
    boxSizing: "border-box",
  },
  cardKicker: {
    margin: 0,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
  cardTitle: {
    margin: "6px 0 0",
    fontSize: "1.15rem",
    fontWeight: 800,
    textAlign: "center",
  },
  cardSubtitle: {
    margin: "4px 0 0",
    fontSize: "0.95rem",
    fontWeight: 700,
    textAlign: "center",
  },
  cardImage: {
    width: "min(120px, 52%)",
    marginTop: "10px",
    marginBottom: "8px",
    objectFit: "contain",
  },
  cardMeta: {
    width: "100%",
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  cardLine: {
    margin: 0,
    fontSize: "12px",
    lineHeight: 1.35,
    textAlign: "center",
  },
  emptyHint: {
    textAlign: "center",
    fontStyle: "italic",
    padding: "2rem 1rem",
    margin: 0,
    fontSize: "14px",
  },
};
