import React, { useEffect, useState } from "react";
import { authUser } from "../scripts/user/authUser";
import { getPreferences } from "../scripts/preference/getPreference";
import { logoutFromApp } from "../scripts/user/logIn";
import logoApp from "../../assets/logoApp.png";
import menuIcon from "../../assets/others/menuOptions.png";
import UserMenuDrawer from "./UserMenuDrawer";
import { getCargoCode, isDevUser } from "../../utils/userNavPermissions";

type BarNavProps = {
  /** Usuario de la sesión actual (misma fuente que el resto de la app; mezcla con authUser para nombres). */
  sessionUser?: Record<string, unknown> | null;
  /** Tras cerrar sesión (antes de recargar). */
  onLogoutSuccess?: () => void;
};

const drawerThemes = [
  {
    primary: "#D32F2F",
    secondary: "#ffffff",
    borderBottomDecoration: "#b71c1c",
    panelBg: "#ffffff",
    mutedText: "#546e7a",
    overlay: "rgba(15, 23, 42, 0.45)",
  },
  {
    primary: "#FF6B6B",
    secondary: "#ffffff",
    borderBottomDecoration: "#ff3b3b",
    panelBg: "#fffafa",
    mutedText: "#8d4e4e",
    overlay: "rgba(99, 17, 17, 0.38)",
  },
];

function mergeUserRecords(
  a: Record<string, unknown> | null | undefined,
  b: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!a && !b) return null;
  if (!a) return b ?? null;
  if (!b) return a ?? null;
  return { ...a, ...b };
}

export default function BarNav({ sessionUser, onLogoutSuccess }: BarNavProps) {
  const [userData, setUserData] = useState<Record<string, unknown> | null>(() =>
    sessionUser && typeof sessionUser === "object" ? sessionUser : null
  );
  const [styleColor, setStyleColor] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const colorApss = [
    {
      primary: "#D32F2F",
      secundary: "#ffffff",
      borderBottomDecoration: "#b71c1c",
    },
    {
      primary: "#FF6B6B",
      secundary: "#ffffff",
      borderBottomDecoration: "#ff3b3b",
    },
  ];

  useEffect(() => {
    const load = async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);

      const remote = await authUser();
      const session =
        sessionUser && typeof sessionUser === "object" ? sessionUser : null;
      const remoteObj = remote && typeof remote === "object" ? remote : null;
      setUserData(mergeUserRecords(session, remoteObj));
    };

    load();
  }, [sessionUser]);

  const handleMenu = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutFromApp();
      onLogoutSuccess?.();
      setDrawerOpen(false);
      window.location.assign("/");
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = (u: Record<string, unknown> | null): string => {
    if (!u) return "";
    const fn = String(u.first_name ?? "").trim();
    const ln = String(u.last_name ?? "").trim();
    if (fn || ln) return `${ln} ${fn}`.trim();
    const fallback = String(u.username ?? u.user_name ?? u.email ?? "").trim();
    return fallback;
  };

  const roleLabel =
    userData && isDevUser(userData)
      ? "dev"
      : getCargoCode(userData) || "—";

  const nameLine = displayName(userData);
  const userLabel = [roleLabel, nameLine].filter(Boolean).join(" · ");

  const drawerTheme = drawerThemes[styleColor] ?? drawerThemes[0];

  return (
    <>
      <div
        style={{
          ...styles.barNav,
          background: colorApss[styleColor]?.primary,
          borderBottom: `2px solid ${colorApss[styleColor]?.borderBottomDecoration}`,
        }}
      >
        <div style={styles.bodyBarNav}>
          <img
            src={logoApp}
            alt="RUSO-IT"
            style={{
              ...styles.logo,
              background: colorApss[styleColor]?.secundary,
            }}
          />

          <div style={styles.nameMenu}>
            {userData ? (
              <h2
                style={{
                  ...styles.positionHead,
                  color: colorApss[styleColor]?.secundary,
                }}
              >
                {roleLabel}: <br />
                {nameLine || "—"}
              </h2>
            ) : (
              <h2 style={{ color: "#fff", margin: 0 }}>Cargando usuario...</h2>
            )}

            <button
              type="button"
              onClick={handleMenu}
              aria-expanded={drawerOpen}
              aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú de cuenta"}
              style={{
                ...styles.buttonMenu,
                borderRadius: "12px",
                border: drawerOpen ? `2px solid rgba(255,255,255,0.45)` : "2px solid transparent",
                background: drawerOpen ? "rgba(255,255,255,0.12)" : "transparent",
              }}
            >
              <img src={menuIcon} alt="" style={styles.menuImage} />
            </button>
          </div>
        </div>
      </div>

      <UserMenuDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
        theme={drawerTheme}
        userLabel={userLabel}
        styleColor={styleColor}
        logoutBusy={loggingOut}
      />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  barNav: {
    width: "100vw",
    height: "11vh",
    display: "flex",
    justifyContent: "center",
  },

  bodyBarNav: {
    width: "90vw",
    maxWidth: "1350px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    height: "60px",
    padding: "8px",
    borderRadius: "50%",
  },

  nameMenu: {
    display: "flex",
    alignItems: "center",
  },

  positionHead: {
    textAlign: "right",
    margin: 0,
    fontWeight: "bold",
  },

  menuImage: {
    maxHeight: "40px",
    display: "block",
  },

  buttonMenu: {
    marginLeft: "1rem",
    cursor: "pointer",
    transition: "background 0.2s ease, border-color 0.2s ease",
  },
};
