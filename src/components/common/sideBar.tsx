import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getPreferences } from "../scripts/preference/getPreference";
import {
  canAccessPartesYEstadisticas,
  getCargoCode,
  isDevUser,
} from "../../utils/userNavPermissions";

const DEV_MENU_ICON =
  "https://static.thenounproject.com/png/5402474-200.png";

/** Por defecto, administración de datos en local (otra ventana con `window.open`). */
const DEFAULT_DATA_ADMIN_URL = "http://localhost:5320/";

/** URLs externas del menú dev (`.env`: VITE_DEV_DOCS_URL, VITE_DEV_DATA_ADMIN_URL). Soporte es ruta interna `/soporte`. */
function getDevExternalUrls() {
  const docs = String(import.meta.env.VITE_DEV_DOCS_URL ?? "").trim();
  const dataAdminRaw = String(import.meta.env.VITE_DEV_DATA_ADMIN_URL ?? "").trim();
  const dataAdmin = dataAdminRaw || DEFAULT_DATA_ADMIN_URL;
  return { docs, dataAdmin };
}

type RouteItem = {
  route: string;
  label: string;
  img: string;
  roles: string[];
  sensitive?: boolean;
};

export default function SideBar({ user }: { user?: Record<string, unknown> | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const devWrapRef = useRef<HTMLDivElement>(null);

  const [styleColor, setStyleColor] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [servicesActive] = useState(0);
  const [devMenuOpen, setDevMenuOpen] = useState(false);

  const colorApss = [
    {
      primary: "#FF6B6B",
      secondary: "#FFFFFF",
      borderBottomDecoration: "#D32F2F",
      textColorPrimary: "#333",
      buttonsborderSecundary: "#FFD166",
    },
    {
      primary: "#D32F2F",
      secondary: "#FFFFFF",
      borderBottomDecoration: "#B71C1C",
      textColorPrimary: "#333",
      buttonsborderSecundary: "#FF6B6B",
    },
  ];

  const routesLinks: RouteItem[] = [
    {
      route: "welcome",
      label: "Inicio",
      img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1760281867/wellcome_rurvrc.png",
      roles: ["04", "05", "06", "Oficial", "juridico"],
    },
    {
      route: "all-bases",
      label: "Bases",
      img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1770251383/base_qazbky.png",
      roles: ["04", "05", "06", "Oficial"],
    },
    {
      route: "typeToVehicles",
      label: "Vehículos",
      img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1760281867/typeToVehicles_ivmfy9.png",
      roles: ["04", "05", "06", "Oficial"],
    },
    {
      route: "sumarys",
      label: "Partes de Atención",
      img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1767669871/Folder_zbj1tg.png",
      roles: ["04", "05", "06", "juridico"],
      sensitive: true,
    },
    {
      route: "stadistics",
      label: "Estadísticas",
      img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1770947667/grafics_gf5vvu.png",
      roles: ["04", "05", "06", "juridico"],
      sensitive: true,
    },
    {
      route: "services",
      label: "Servicios",
      img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1771943326/service_icon_qwdfz3.png",
      roles: ["04", "05", "06", "Oficial"],
    },
  ];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!devMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (devWrapRef.current && !devWrapRef.current.contains(e.target as Node)) {
        setDevMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [devMenuOpen]);

  const filteredRoutes = useMemo(() => {
    if (!user) return [];
    if (isDevUser(user)) return routesLinks;

    const cargo = getCargoCode(user);
    if (!cargo) return routesLinks;

    return routesLinks.filter((r) => {
      if (!r.roles.includes(cargo)) return false;
      if (r.sensitive) return canAccessPartesYEstadisticas(user);
      return true;
    });
  }, [user]);

  const openDevLink = (url: string, envHint: string) => {
    setDevMenuOpen(false);
    if (!url) {
      void Swal.fire({
        icon: "info",
        title: "URL no configurada",
        text: `Añade ${envHint} en tu archivo .env (reinicia el servidor de desarrollo).`,
        confirmButtonColor: colorApss[styleColor]?.borderBottomDecoration ?? "#D32F2F",
      });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isReady) return null;

  const showDevButton = Boolean(user && isDevUser(user));
  const { docs: docsUrl, dataAdmin: dataAdminUrl } = getDevExternalUrls();
  const soporteInternoActive = location.pathname.startsWith("/soporte");

  return (
    <div
      style={{
        width: "100%",
        height: "10vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        background: "#fff",
        position: "relative",
        zIndex: 1,
      }}
    >
      {filteredRoutes.map((item) => {
        const navTo =
          item.route === "welcome"
            ? "/"
            : `/${item.route}`;
        const isActive =
          item.route === "welcome"
            ? location.pathname === "/" || location.pathname.startsWith("/welcome")
            : item.route === "sumarys"
              ? location.pathname.startsWith("/sumary")
              : item.route === "stadistics"
                ? location.pathname.startsWith("/stadistics")
                : location.pathname === navTo || location.pathname.startsWith(`${navTo}/`);

        const isServices = item.label === "Servicios" && servicesActive > 0;

        const isHovered = hovered === item.route;

        return (
          <NavLink
            key={item.route}
            to={navTo}
            onMouseEnter={() => setHovered(item.route)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textDecoration: "none",
              width: "70px",
              padding: "5px",
              borderBottom: isActive
                ? `2px solid ${colorApss[styleColor].borderBottomDecoration}`
                : "2px solid transparent",
              borderRadius: isServices ? "10px" : "0px",
              background: isServices
                ? colorApss[styleColor].buttonsborderSecundary
                : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <img
              src={item.img}
              alt={item.label}
              style={{
                maxHeight: "30px",
                marginBottom: "5px",
                transform: isHovered ? "scale(1.1)" : "scale(1)",
                transition: "0.2s",
                filter: styleColor === 1 ? "invert(1)" : "none",
              }}
            />

            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                textAlign: "center",
                color: colorApss[styleColor].textColorPrimary,
                display: isHovered ? "block" : "none",
              }}
            >
              {item.label}
            </p>
          </NavLink>
        );
      })}

      {showDevButton && (
        <div
          ref={devWrapRef}
          style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <button
            type="button"
            aria-expanded={devMenuOpen}
            aria-haspopup="listbox"
            onClick={() => setDevMenuOpen((o) => !o)}
            onMouseEnter={() => setHovered("dev-menu")}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "70px",
              padding: "5px",
              border: "none",
              borderBottom:
                devMenuOpen || soporteInternoActive
                  ? `2px solid ${colorApss[styleColor].borderBottomDecoration}`
                  : "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
              borderRadius: "0px",
            }}
          >
            <img
              src={DEV_MENU_ICON}
              alt="Dev"
              style={{
                maxHeight: "30px",
                marginBottom: "5px",
                transform: hovered === "dev-menu" ? "scale(1.1)" : "scale(1)",
                transition: "0.2s",
                filter: styleColor === 1 ? "invert(1)" : "none",
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                textAlign: "center",
                color: colorApss[styleColor].textColorPrimary,
                display:
                  hovered === "dev-menu" || devMenuOpen || soporteInternoActive ? "block" : "none",
              }}
            >
              Dev
            </p>
          </button>

          {devMenuOpen && (
            <div
              role="listbox"
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                marginTop: "6px",
                minWidth: "200px",
                padding: "6px 0",
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)",
                zIndex: 10200,
              }}
            >
              <button
                type="button"
                role="option"
                onClick={() => openDevLink(docsUrl, "VITE_DEV_DOCS_URL")}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  color: colorApss[styleColor].textColorPrimary,
                }}
              >
                Documentación
              </button>
              <button
                type="button"
                role="option"
                onClick={() => openDevLink(dataAdminUrl, "VITE_DEV_DATA_ADMIN_URL")}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  color: colorApss[styleColor].textColorPrimary,
                }}
              >
                Administración de datos
              </button>
              <button
                type="button"
                role="option"
                onClick={() => {
                  setDevMenuOpen(false);
                  navigate("/soporte");
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  color: colorApss[styleColor].textColorPrimary,
                }}
              >
                Soporte
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
