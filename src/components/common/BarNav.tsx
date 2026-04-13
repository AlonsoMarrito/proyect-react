import { useEffect, useState } from "react";
import { authUser } from "../scripts/user/authUser";
import { getPreferences } from "../scripts/preference/getPreference";
import logoApp from "../../assets/logoApp.png";
import menuIcon from "../../assets/others/menuOptions.png";

export default function BarNav({ onToggleMenu }: any) {
  const [userData, setUserData] = useState<any>(null);
  const [styleColor, setStyleColor] = useState(0);

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
      setStyleColor(pref?.color || 0);

      const user = await authUser(); // 🔥 SIN TOKEN
      setUserData(user);
    };

    load();
  }, []);

  const handleMenu = () => {
    onToggleMenu?.((prev: boolean) => !prev);
  };

  return (
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
          style={{
            ...styles.logo,
            background: colorApss[styleColor]?.secundary,
          }}
        />

        <div style={styles.nameMenu}>
          {userData?.employees ? (
            <h2
              style={{
                ...styles.positionHead,
                color: colorApss[styleColor]?.secundary,
              }}
            >
              {userData.employees.position}: <br />
              {userData.last_name} {userData.first_name}
            </h2>
          ) : (
            <h2 style={{ color: "#fff", margin: 0 }}>
              Cargando usuario...
            </h2>
          )}

          <button onClick={handleMenu} style={styles.buttonMenu}>
            <img src={menuIcon} style={styles.menuImage} />
          </button>
        </div>
      </div>
    </div>
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
  },

  buttonMenu: {
    marginLeft: "1rem",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
};