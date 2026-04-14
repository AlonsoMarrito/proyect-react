import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getPreferences } from "../scripts/preference/getPreference";

export default function SideBar({ user }: any) {
  const location = useLocation();

  const [styleColor, setStyleColor] = useState(0);
  const [userPosition, setUserPosition] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [servicesActive] = useState(0);

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

  const routesLinks = [
    { route: "welcome", label: "Inicio", img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1760281867/wellcome_rurvrc.png", roles: ["04", "05", "06", "Oficial", "juridico"] },
    { route: "all-bases", label: "Bases", img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1770251383/base_qazbky.png", roles: ["04", "05", "06", "Oficial"] },
    { route: "typeToVehicles", label: "Vehículos", img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1760281867/typeToVehicles_ivmfy9.png", roles: ["04", "05", "06", "Oficial"] },
    { route: "sumarys", label: "Partes de Atención", img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1767669871/Folder_zbj1tg.png", roles: ["04", "05", "06", "Oficial", "juridico"] },
    { route: "stadistics", label: "Estadísticas", img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1770947667/grafics_gf5vvu.png", roles: ["04", "05", "06", "juridico"] },
    { route: "services", label: "Servicios", img: "https://res.cloudinary.com/dytw0yx6j/image/upload/v1771943326/service_icon_qwdfz3.png", roles: ["04", "05", "06", "Oficial"] },
  ];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);

      if (user?.position) {
        setUserPosition(String(user.position));
      }

      setIsReady(true);
    })();
  }, [user]);

  const filteredRoutes = useMemo(() => {
    if (!userPosition) return routesLinks;
    return routesLinks.filter((r) => r.roles.includes(userPosition));
  }, [userPosition]);

  if (!isReady) return null;

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
            : location.pathname === navTo ||
              location.pathname.startsWith(`${navTo}/`);

        const isServices =
          item.label === "Servicios" && servicesActive > 0;

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
    </div>
  );
}

const styles = {
  bar: {
    width: "100%",
    height: "10vh",
    maxHeight: "80px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    background: "#fff",
  },

  link: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none",
    borderBottom: "2px solid transparent",
    width: "70px",
    transition: "0.3s",
    padding: "5px",
  },

  icon: {
    maxHeight: "30px",
    width: "auto",
    padding: "3px",
    marginBottom: "5px",
  },

  text: {
    margin: 0,
    fontSize: "0.75rem",
    display: "none", // igual que Vue
    textAlign: "center",
  },
};