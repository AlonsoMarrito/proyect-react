import React, { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";

import { getPreferences } from "../scripts/preference/getPreference";
import { getWorkShift } from "../scripts/workshift/getWorkShift";
import {
  getUserByEmployeeNumber,
  getUserById,
} from "../scripts/user/getUser";
import { decryptEmployeeToken } from "../utils/workforceCipher";

const isDev =
  typeof import.meta !== "undefined" &&
  Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);

function isUserRecord(d: unknown): d is Record<string, unknown> {
  return (
    d !== null &&
    typeof d === "object" &&
    !Array.isArray(d) &&
    "id" in d &&
    (d as { id?: unknown }).id != null
  );
}

/** El backend a veces devuelve solo la fila de empleado (id_user, position…) sin first_name. */
function isEmployeeRowOnly(d: unknown): d is Record<string, unknown> {
  if (!isUserRecord(d)) return false;
  const hasUserName =
    d.first_name != null ||
    d.email != null ||
    d.type_user != null ||
    d.last_name != null;
  const looksLikeEmployee =
    d.id_user != null &&
    (d.employee_number != null ||
      d.type_position != null ||
      d.position != null ||
      d.id_work_shift != null);
  return looksLikeEmployee && !hasUserName;
}

/** Tras descifrar: employee-number → si viene solo empleado, GET /users/:id_user y fusionar. */
async function fetchUserByPlainToken(plain: string) {
  const key = String(plain).trim();
  if (!key) return null;

  const byEmpNum = await getUserByEmployeeNumber(key);
  if (isDev) {
    console.log("[WorkForcePerson] GET employee-number/" + key, byEmpNum);
  }

  if (byEmpNum && isEmployeeRowOnly(byEmpNum)) {
    const empRow = byEmpNum as Record<string, unknown>;
    const uid = Number(empRow.id_user);
    if (!Number.isFinite(uid)) return null;

    let user = await getUserById(uid);
    if (isDev) {
      console.log("[WorkForcePerson] GET users/" + uid + " (fusionar con empleado)", user);
    }
    if (Array.isArray(user)) user = user[0];
    if (!isUserRecord(user)) return null;

    const u = user as Record<string, unknown>;
    const prevEmp =
      u.employees && typeof u.employees === "object"
        ? (u.employees as Record<string, unknown>)
        : {};

    return {
      ...u,
      employees: {
        ...prevEmp,
        ...empRow,
        work_shift:
          (empRow as { work_shift?: unknown }).work_shift ??
          (prevEmp as { work_shift?: unknown }).work_shift,
      },
    };
  }

  if (byEmpNum && isUserRecord(byEmpNum)) {
    const u = byEmpNum as Record<string, unknown>;
    if (u.first_name != null || u.email != null || u.employees) {
      return u;
    }
  }

  if (/^\d+$/.test(key)) {
    const byId = await getUserById(Number(key));
    if (isDev) {
      console.log("[WorkForcePerson] GET users/" + key, byId);
    }
    if (isUserRecord(byId)) return byId as Record<string, unknown>;
  }

  return null;
}

function formatIsoDate(v: unknown): string {
  if (v == null || v === "") return "—";
  const s = String(v);
  const d = s.includes("T") ? s.slice(0, 10) : s.slice(0, 10);
  return d || "—";
}

function formatTime(v: unknown): string {
  if (v == null || v === "") return "—";
  const s = String(v);
  const t = s.includes("T") ? s.slice(11, 19) : s;
  return t || "—";
}

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

function safe(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s.length ? s : "—";
}

export default function WorkForcePersonView() {
  const { employeeToken, shiftName: shiftNameParam } = useParams();

  const [styleColor, setStyleColor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [person, setPerson] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [modalTurno, setModalTurno] = useState(false);

  const shiftLabel = decodeURIComponent(shiftNameParam ?? "").trim();

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      setPerson(null);

      const pref = await getPreferences();
      setStyleColor(pref?.color || 0);

      const token = employeeToken ?? "";
      const raw = (() => {
        try {
          return decodeURIComponent(String(token).trim());
        } catch {
          return String(token).trim();
        }
      })();

      let plain = decryptEmployeeToken(raw);
      if (!plain && /^\d+$/.test(raw)) {
        plain = raw;
      }
      if (!plain) {
        setError("El enlace no es válido o el identificador está corrupto.");
        setLoading(false);
        return;
      }

      if (isDev) {
        console.log("[WorkForcePersonView] token URL → descifrado", {
          employeeToken,
          shiftNameParam,
          raw,
          plain,
          "hint": "Si plain es número de empleado, debe existir en /users/employee-number/{plain}. Si falla, se prueba /users/{plain}",
        });
      }

      try {
        const list = await getWorkShift();
        setShifts(Array.isArray(list) ? list : []);
      } catch {
        setShifts([]);
      }

      try {
        const data = await fetchUserByPlainToken(plain);
        if (!data) {
          setError(
            "No se encontró la persona. Verifica el enlace o que exista en el servidor (número de empleado o id)."
          );
          setLoading(false);
          return;
        }
        setPerson(data);
        if (isDev) {
          console.log("[WorkForcePersonView] persona OK", data);
        }
      } catch {
        setError("No se pudo cargar la información del empleado.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [employeeToken]);

  const theme = colorApss[styleColor] ?? colorApss[0];
  const emp = person?.employees;

  const embeddedShift = emp?.work_shift;

  /** Turno real del empleado primero; el segmento de URL puede ser una letra ("A") y no coincidir con el nombre del turno en API */
  const shiftByEmployeeId = shifts.find(
    (s) => Number(s?.id) === Number(emp?.id_work_shift)
  );
  const shiftFromUrlLabel = shifts.find(
    (s) => String(s?.name ?? "") === shiftLabel
  );
  const resolvedShift =
    (embeddedShift && typeof embeddedShift === "object"
      ? embeddedShift
      : null) ??
    shiftByEmployeeId ??
    shiftFromUrlLabel;

  const fullName = [
    person?.first_name,
    person?.second_name,
    person?.last_name,
    person?.second_last_name ?? person?.mother_last_name,
  ]
    .filter((x) => x != null && String(x).trim() !== "")
    .join(" ")
    .trim();

  const backHref = `/work-force-shift/${encodeURIComponent(shiftLabel || "—")}`;

  const infoRow = (
    label: string,
    value: unknown,
    t: PageTheme
  ): React.ReactElement => (
    <div style={styles.infoRow}>
      <span style={{ ...styles.infoLabel, color: t.mutedText }}>{label}</span>
      <span style={{ ...styles.infoValue, color: t.textColorPrimary }}>
        {safe(value)}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div
        style={{
          ...styles.container,
          background: theme.pageBg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ color: theme.mutedText, fontWeight: 700 }}>
          Cargando ficha…
        </p>
      </div>
    );
  }

  if (error || !person) {
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
            maxWidth: "560px",
            margin: "3rem auto",
          }}
        >
          <p style={{ margin: 0, fontWeight: 700 }}>{error ?? "Sin datos"}</p>
          <Link
            to="/welcome"
            style={{
              ...styles.linkBtn,
              color: theme.accent,
              borderColor: theme.accent,
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

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
          .wfPersonMainGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1.15rem;
            width: 100%;
            max-width: min(1680px, 98vw);
            margin: 0 auto;
            align-items: stretch;
          }
          @media (max-width: 900px) {
            .wfPersonMainGrid {
              grid-template-columns: 1fr;
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
            <Link
              to={backHref}
              style={{
                ...styles.backLink,
                color: theme.accent,
              }}
            >
              ← Volver al turno {shiftLabel || "—"}
            </Link>
            <button
              type="button"
              style={{
                ...styles.btnOutline,
                borderColor: theme.inputBorder,
                color: theme.textColorPrimary,
              }}
              onClick={() => setModalTurno(true)}
            >
              Detalle del turno
            </button>
          </div>
          <p style={{ ...styles.kicker, color: theme.mutedText }}>
            Ficha de personal
          </p>
          <h1 style={{ ...styles.title, color: theme.textColorPrimary }}>
            {fullName.trim() || "Sin nombre registrado"}
          </h1>
          <div style={styles.badges}>
            <span
              style={{
                ...styles.badge,
                background: theme.accentMuted,
                color: theme.accent,
                border: `1px solid ${theme.accent}`,
              }}
            >
              No. empleado {safe(emp?.employee_number)}
            </span>
            <span
              style={{
                ...styles.badge,
                background: theme.panelBg,
                color: theme.mutedText,
                border: `1px solid ${theme.inputBorder}`,
              }}
            >
              Turno contextual: {shiftLabel || "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="wfPersonMainGrid">
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
              Identificación
            </p>
            <h2 style={{ ...styles.sectionTitle, color: theme.textColorPrimary }}>
              Datos personales
            </h2>
          </div>
          <div style={{ ...styles.panelBody, ...styles.panelScroll }}>
            {infoRow("Nombre(s)", person?.first_name, theme)}
            {infoRow("Segundo nombre", person?.second_name, theme)}
            {infoRow("Apellido paterno", person?.last_name, theme)}
            {infoRow(
              "Apellido materno",
              person?.second_last_name ?? person?.mother_last_name,
              theme
            )}
            {infoRow("Estado", person?.status_now, theme)}
            {infoRow(
              "Tipo de sangre",
              [person?.blood_group, person?.blood_rh_factor]
                .filter(Boolean)
                .join(" ") || null,
              theme
            )}
            {infoRow(
              "NSS / Seguro social",
              person?.social_security_number,
              theme
            )}
            {infoRow("Correo", person?.email, theme)}
            {infoRow("Teléfono", person?.phone ?? person?.phone_number, theme)}
            {infoRow(
              "Contacto de emergencia",
              person?.emergency_contact_name,
              theme
            )}
            {infoRow(
              "Teléfono emergencia",
              person?.emergency_contact_phone,
              theme
            )}
            {infoRow(
              "Fecha de nacimiento",
              formatIsoDate(person?.birthdate),
              theme
            )}
          </div>
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
            <p style={{ ...styles.kicker, color: theme.mutedText, margin: 0 }}>
              Laboral
            </p>
            <h2 style={{ ...styles.sectionTitle, color: theme.textColorPrimary }}>
              Empleo
            </h2>
          </div>
          <div style={{ ...styles.panelBody, ...styles.panelScroll }}>
            {infoRow("No. empleado", emp?.employee_number, theme)}
            {infoRow("Tipo de puesto", emp?.type_position, theme)}
            {infoRow("Código / posición", emp?.position, theme)}
            {infoRow(
              "Turno (empleado)",
              embeddedShift?.name ??
                shiftByEmployeeId?.name ??
                resolvedShift?.name,
              theme
            )}
            {infoRow(
              "Jornada",
              resolvedShift?.workday
                ? String(resolvedShift.workday).charAt(0).toUpperCase() +
                  String(resolvedShift.workday).slice(1)
                : embeddedShift?.workday
                  ? String(embeddedShift.workday).charAt(0).toUpperCase() +
                    String(embeddedShift.workday).slice(1)
                  : null,
              theme
            )}
            {infoRow(
              "Entrada",
              formatTime(
                embeddedShift?.time_start ?? resolvedShift?.time_start
              ),
              theme
            )}
            {infoRow(
              "Salida",
              formatTime(
                embeddedShift?.working_time ?? resolvedShift?.working_time
              ),
              theme
            )}
            {infoRow(
              "Fecha de inicio",
              formatIsoDate(emp?.start_date),
              theme
            )}
          </div>
        </div>

        <div
          style={{
            ...styles.panel,
            gridColumn: "1 / -1",
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
              Sistema
            </p>
            <h2 style={{ ...styles.sectionTitle, color: theme.textColorPrimary }}>
              Cuenta y permisos
            </h2>
          </div>
          <div style={{ ...styles.panelBody, ...styles.panelScroll }}>
            {infoRow("ID usuario", person?.id, theme)}
            {infoRow("Tipo de usuario", person?.type_user, theme)}
            {infoRow("Usuario / login", person?.username ?? person?.user_name, theme)}
          </div>
        </div>
      </div>

      {modalTurno && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modalBox,
              background: theme.panelBg,
              borderColor: theme.panelBorder,
              boxShadow: theme.panelShadow,
            }}
          >
            <div style={styles.modalHead}>
              <h3 style={{ margin: 0, color: theme.textColorPrimary }}>
                Turno:{" "}
                {shiftByEmployeeId?.name ??
                  resolvedShift?.name ??
                  shiftLabel}
              </h3>
              <button
                type="button"
                style={{
                  ...styles.modalClose,
                  borderColor: theme.inputBorder,
                  color: theme.mutedText,
                }}
                onClick={() => setModalTurno(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div style={{ ...styles.panelBody, paddingTop: 0 }}>
              {infoRow(
                "Jornada",
                resolvedShift?.workday
                  ? String(resolvedShift.workday).charAt(0).toUpperCase() +
                    String(resolvedShift.workday).slice(1)
                  : "—",
                theme
              )}
              {infoRow(
                "Entrada",
                formatTime(resolvedShift?.time_start),
                theme
              )}
              {infoRow(
                "Salida",
                formatTime(resolvedShift?.working_time),
                theme
              )}
              {infoRow(
                "Personal operativo (lista)",
                resolvedShift?.operative_personal,
                theme
              )}
              {infoRow(
                "Personal no operativo",
                resolvedShift?.in_operative_personal,
                theme
              )}
              {infoRow("ID turno", resolvedShift?.id, theme)}
            </div>
            <button
              type="button"
              style={{
                ...styles.btnPrimary,
                background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
              }}
              onClick={() => setModalTurno(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
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
    gap: "0.35rem",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  backLink: {
    fontWeight: 700,
    fontSize: "14px",
    textDecoration: "none",
  },
  btnOutline: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "2px solid",
    background: "rgba(255,255,255,0.9)",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },
  kicker: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: 0,
  },
  title: {
    margin: "4px 0 0",
    fontSize: "clamp(1.35rem, 2.2vw, 1.55rem)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  badge: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  panel: {
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    minHeight: 0,
  },
  panelScroll: {
    flex: 1,
    minHeight: 0,
    /* Misma lógica que tableWrap en workForceByGroup (estado de fuerza) */
    maxHeight: "min(338px, 51vh)",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
  },
  panelHead: {
    padding: "0.85rem 1rem",
    flexShrink: 0,
  },
  sectionTitle: {
    margin: "4px 0 0",
    fontSize: "1rem",
    fontWeight: 700,
  },
  panelBody: {
    padding: "0.65rem 1rem 0.85rem",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "minmax(108px, 36%) 1fr",
    gap: "6px 12px",
    alignItems: "baseline",
    paddingBottom: "7px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  infoLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: 600,
    wordBreak: "break-word",
  },
  linkBtn: {
    display: "inline-block",
    marginTop: "12px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "2px solid",
    fontWeight: 700,
    textDecoration: "none",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1200,
    padding: "16px",
    boxSizing: "border-box",
  },
  modalBox: {
    width: "min(480px, 100%)",
    maxHeight: "90vh",
    overflow: "auto",
    borderRadius: "16px",
    border: "1px solid",
    padding: "1.25rem",
    boxSizing: "border-box",
  },
  modalHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "8px",
  },
  modalClose: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border: "2px solid",
    background: "rgba(255,255,255,0.95)",
    fontSize: "22px",
    lineHeight: 1,
    cursor: "pointer",
    flexShrink: 0,
  },
  btnPrimary: {
    marginTop: "12px",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "14px",
  },
};
