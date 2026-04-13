import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { Link, useParams } from "react-router-dom";

import {
  getUserByShift,
  getWorkForceByDay,
  puzzleForWorkForce,
} from "../scripts/workforce/getPersonal";

import { getWorkShift } from "../scripts/workshift/getWorkShift";
import { getPreferences } from "../scripts/preference/getPreference";

import ModalAddNewWorkForce from "../components-on-views/workforce/modalAddNewWorkForce";
import ModalCreateNewEmployeed from "../components-on-views/workforce/modalCreateNewEmployeed";

type PageTheme = {
  textColorPrimary: string;
  pageBg: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  accent: string;
  accentMuted: string;
  tableHeadBg: string;
  tableHeadColor: string;
  tableRowAlt: string;
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
    tableHeadColor: "#ffffff",
    tableRowAlt: "rgba(55, 71, 79, 0.04)",
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
    tableHeadColor: "#ffffff",
    tableRowAlt: "rgba(183, 28, 28, 0.06)",
    mutedText: "#8d4e4e",
    inputBorder: "#ef9a9a",
  },
];

export default function WorkForceByGroupView() {
  const { shift: shiftParam } = useParams();

  const [modalCreateNewEmployeedVisible, setModalCreateNewEmployeedVisible] =
    useState(0);
  const [modalAddNewWorkForce, setModalAddNewWorkForce] = useState(false);

  const [dataWorkForceUser, setDataWorkForceUser] = useState<any[]>([]);
  const [dataWorkForceView, setDataWorkForceView] = useState<any[]>([]);
  const [workForceToDay, setWorkForceToDay] = useState<any[]>([]);

  const [shiftOnList, setShiftOnList] = useState("");
  const [shiftWork, setShiftWork] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const [styleColor, setStyleColor] = useState(0);
  const [workShiftNow, setWorkShiftNow] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color || 0);

      const shifts = await getWorkShift();
      const list = Array.isArray(shifts) ? shifts : [];
      setDataWorkForceView(list);

      const routeShift = decodeURIComponent(shiftParam ?? "").trim();
      setShiftWork(routeShift);
      setShiftOnList(routeShift);

      const found = list.find((ws: any) => String(ws?.name ?? "") === routeShift);
      setWorkShiftNow(found != null && found.id != null ? Number(found.id) : null);

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setCurrentDate(`${yyyy}-${mm}-${dd}`);

      const users = routeShift ? await getUserByShift(routeShift) : [];
      setDataWorkForceUser(Array.isArray(users) ? users : []);
    };

    init();
  }, [shiftParam]);

  useEffect(() => {
    if (!currentDate || workShiftNow === null) return;

    const load = async () => {
      try {
        const data = await getWorkForceByDay(currentDate, workShiftNow);
        const parsed = await puzzleForWorkForce(data);
        setWorkForceToDay(parsed);
      } catch (e) {
        console.error(e);
        setWorkForceToDay([]);
      }
    };

    load();
  }, [currentDate, workShiftNow]);

  const changeShift = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShiftWork(value);

    const users = await getUserByShift(value);
    setDataWorkForceUser(Array.isArray(users) ? users : []);

    const found = dataWorkForceView.find((ws: any) => ws.name === value);
    setWorkShiftNow(found != null && found.id != null ? Number(found.id) : null);
  };

  const encryptId = (id: string | number) => {
    if (!id) return "";

    const rot = 5;
    const text = String(id);

    const encrypted = text
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);

        if (code >= 48 && code <= 57) {
          return String.fromCharCode(((code - 48 + rot) % 10) + 48);
        }

        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + rot) % 26) + 65);
        }

        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + rot) % 26) + 97);
        }

        return char;
      })
      .join("");

    return encodeURIComponent(encrypted);
  };

  const openCloseModal = (val: number) =>
    setModalCreateNewEmployeedVisible(val);

  const openCloseModalAddNewWorkForce = () =>
    setModalAddNewWorkForce((prev) => !prev);

  const theme = colorApss[styleColor] ?? colorApss[0];

  const thBase = (t: PageTheme): CSSProperties => ({
    padding: "12px 10px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    textAlign: "left",
    borderBottom: `2px solid ${t.accent}`,
    background: t.tableHeadBg,
    color: t.tableHeadColor,
  });

  const tdBase = (t: PageTheme, alt: boolean): CSSProperties => ({
    padding: "11px 10px",
    fontSize: "14px",
    color: t.textColorPrimary,
    borderBottom: `1px solid ${t.panelBorder}`,
    background: alt ? t.tableRowAlt : "transparent",
    verticalAlign: "middle",
  });

  return (
    <div
      style={{
        ...styles.container,
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
        <div style={styles.heroText}>
          <p style={{ ...styles.kicker, color: theme.mutedText }}>
            Estado de fuerza
          </p>
          <h1 style={{ ...styles.title, color: theme.textColorPrimary }}>
            Turno {shiftOnList || "—"}
          </h1>
        </div>
      </div>

      <div style={styles.grid}>
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
            <div>
              <p style={{ ...styles.kicker, color: theme.mutedText, margin: 0 }}>
                Calendario
              </p>
              <h3 style={{ ...styles.sectionTitle, color: theme.textColorPrimary }}>
                Unidades del día
              </h3>
            </div>
            <label style={{ ...styles.dateLabel, color: theme.mutedText }}>
              Fecha
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                style={{
                  ...styles.inputDate,
                  borderColor: theme.inputBorder,
                  color: theme.textColorPrimary,
                }}
              />
            </label>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={thBase(theme)}>Base</th>
                  <th style={thBase(theme)}>U-</th>
                  <th style={thBase(theme)}>Chofer</th>
                  <th style={thBase(theme)}>Tripulación</th>
                  <th style={{ ...thBase(theme), textAlign: "center" }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {workForceToDay.length > 0 ? (
                  workForceToDay.map((item, i) => (
                    <tr key={i}>
                      <td style={{ ...tdBase(theme, i % 2 === 1), textAlign: "center" }}>
                        {item.base}
                      </td>
                      <td style={{ ...tdBase(theme, i % 2 === 1), textAlign: "center" }}>
                        {item.vehicle}
                      </td>
                      <td style={tdBase(theme, i % 2 === 1)}>
                        {item.fullTripulation.find(
                          (m: any) => m.position === "conductor"
                        )?.name || "—"}
                      </td>
                      <td
                        style={tdBase(theme, i % 2 === 1)}
                        dangerouslySetInnerHTML={{
                          __html:
                            item.fullTripulation
                              .filter((m: any) => m.position === "apoyo")
                              .map((m: any) => m.name)
                              .join("<br>") || "—",
                        }}
                      />
                      <td
                        style={{
                          ...tdBase(theme, i % 2 === 1),
                          textAlign: "center",
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            ...styles.btnGhost,
                            borderColor: theme.inputBorder,
                            color: theme.textColorPrimary,
                          }}
                        >
                          Modificar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        ...tdBase(theme, false),
                        textAlign: "center",
                        padding: "28px 16px",
                        color: theme.mutedText,
                        fontStyle: "italic",
                      }}
                    >
                      No hay registros para esta fecha
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            style={{
              ...styles.btnPrimary,
              background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
              boxShadow: `0 4px 14px ${theme.accentMuted}`,
            }}
            onClick={openCloseModalAddNewWorkForce}
          >
            Activar nueva tripulación
          </button>
        </div>

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
            <div>
              <p style={{ ...styles.kicker, color: theme.mutedText, margin: 0 }}>
                Listado
              </p>
              <h3 style={{ ...styles.sectionTitle, color: theme.textColorPrimary }}>
                Personal del turno
              </h3>
            </div>
            <label style={{ ...styles.dateLabel, color: theme.mutedText }}>
              Cambiar turno
              <select
                value={shiftWork}
                onChange={changeShift}
                style={{
                  ...styles.select,
                  borderColor: theme.inputBorder,
                  color: theme.textColorPrimary,
                  background: theme.panelBg,
                  width: "100%",
                  minWidth: "min(220px, 100%)",
                }}
              >
                {dataWorkForceView.map((ws, i) => (
                  <option key={i} value={ws.name}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={thBase(theme)}>Nombre</th>
                  <th style={thBase(theme)}>Posición</th>
                  <th style={{ ...thBase(theme), textAlign: "center" }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataWorkForceUser.map((u, i) => (
                  <tr key={i}>
                    <td style={tdBase(theme, i % 2 === 1)}>
                      {u.first_name} {u.last_name}
                    </td>
                    <td style={tdBase(theme, i % 2 === 1)}>
                      {u.employees?.position ?? "—"}
                    </td>
                    <td
                      style={{
                        ...tdBase(theme, i % 2 === 1),
                        textAlign: "center",
                      }}
                    >
                      <Link
                        style={{
                          ...styles.linkPill,
                          background: theme.accentMuted,
                          color: theme.accent,
                          border: `1px solid ${theme.accent}`,
                        }}
                        to={`/persone-info/${encryptId(
                          u.employees.employee_number
                        )}/${encodeURIComponent(shiftOnList)}`}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalAddNewWorkForce && (
        <ModalAddNewWorkForce
          onClose={openCloseModalAddNewWorkForce}
          onRefresh={() => {
            if (workShiftNow == null) return;
            return getWorkForceByDay(currentDate, workShiftNow).then(
              async (data) =>
                setWorkForceToDay(await puzzleForWorkForce(data))
            );
          }}
        />
      )}

      {modalCreateNewEmployeedVisible === 1 && (
        <ModalCreateNewEmployeed onClose={() => openCloseModal(0)} />
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    width: "100%",
    padding: "1rem",
    boxSizing: "border-box",
  },
  hero: {
    display: "flex",
    alignItems: "stretch",
    gap: "1rem",
    maxWidth: "85vw",
    margin: "0 auto 1.25rem",
    padding: "1rem 1.25rem",
    borderRadius: "16px",
    boxSizing: "border-box",
  },
  heroAccent: {
    width: "6px",
    borderRadius: "6px",
    flexShrink: 0,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: 0,
  },
  title: {
    margin: "6px 0 0",
    fontSize: "1.75rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    gap: "1.15rem",
    width: "100%",
    maxWidth: "85vw",
    margin: "0 auto",
    alignItems: "stretch",
  },
  panel: {
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    height: "100%",
    minWidth: 0,
  },
  panelHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "1rem",
    padding: "1rem 1.25rem",
    flexShrink: 0,
    minHeight: "5.5rem",
    boxSizing: "border-box",
  },
  sectionTitle: {
    margin: "4px 0 0",
    fontSize: "1.1rem",
    fontWeight: 700,
  },
  dateLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 600,
  },
  inputDate: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "2px solid",
    fontSize: "14px",
    fontWeight: 600,
    outline: "none",
    cursor: "pointer",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "2px solid",
    fontSize: "14px",
    fontWeight: 600,
    outline: "none",
    cursor: "pointer",
    maxWidth: "100%",
    boxSizing: "border-box",
  },
  /**
   * Mismas dimensiones en ambas tablas; scroll independiente en cada una.
   * +30% respecto a min(260px, 39vh) → min(338px, 51vh).
   */
  tableWrap: {
    maxHeight: "min(338px, 51vh)",
    overflowX: "auto",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    padding: "0 1rem 0.75rem",
    minWidth: 0,
    flexShrink: 0,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "520px",
  },
  btnPrimary: {
    margin: "0 1.25rem 1rem",
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
  btnGhost: {
    padding: "6px 14px",
    borderRadius: "999px",
    border: "2px solid",
    background: "rgba(255,255,255,0.85)",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },
  linkPill: {
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    textDecoration: "none",
    transition: "filter 0.15s ease",
  },
};
