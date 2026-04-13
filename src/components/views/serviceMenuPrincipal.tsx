import React, { useEffect, useState } from "react";
import LogsServiceVehicle from "../components-on-views/services/logsServiceMenu";
import { getPreferences } from "../scripts/preference/getPreference";

const colorApss = [
  { borderBottomDecoration: "#D32F2F" },
  { borderBottomDecoration: "#ff3b3b" },
];

export default function MenuServicesView() {
  const [componentView, setComponentView] = useState<number>(1);
  const [styleColor, setStyleColor] = useState<number>(0);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const generalPreferences = await getPreferences();
        setStyleColor(generalPreferences?.color ?? 0);
      } catch (error) {
        console.error(error);
        setStyleColor(0);
      }
    };

    loadPreferences();
  }, []);

  const changeComponent = (param: number) => {
    setComponentView(param);
  };

  const borderColor =
    colorApss?.[styleColor ?? 0]?.borderBottomDecoration ?? "#D32F2F";

  return (
    <div style={styles.container}>
      {/* BUTTONS */}
      <div style={styles.buttonsWrapper}>
        <button
          style={{
            ...styles.button,
            borderBottom:
              componentView === 1 ? `3px solid ${borderColor}` : "3px solid transparent",
          }}
          onClick={() => changeComponent(1)}
        >
          Servicio Activo
        </button>

        <button
          style={{
            ...styles.button,
            borderBottom:
              componentView === 2 ? `3px solid ${borderColor}` : "3px solid transparent",
          }}
          onClick={() => changeComponent(2)}
        >
          Servicio por Asignar unidad
        </button>

        <button
          style={{
            ...styles.button,
            borderBottom:
              componentView === 3 ? `3px solid ${borderColor}` : "3px solid transparent",
          }}
          onClick={() => changeComponent(3)}
        >
          Mis Servicio de Hoy
        </button>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        {componentView === 1 && <LogsServiceVehicle />}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    width: "100%",
    padding: "1rem",
    background: "#ffffff",
  },

  buttonsWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "10px",
  },

  button: {
    padding: "10px 18px",
    background: "transparent",
    border: "none",
    fontSize: "16px",
    fontWeight: 600,
    color: "#1f1f1f",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },

  content: {
    width: "100%",
    marginTop: "1rem",
    display: "flex",
    justifyContent: "center",
  },
};