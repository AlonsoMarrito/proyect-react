import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkShift } from "../scripts/workshift/getWorkShift";
import { getPreferences } from "../scripts/preference/getPreference";
import workImg from "../../assets/icons-app/workIn.png";

export default function Welcome({ user }: any) {
  const [dataWorkForceView, setDataWorkForceView] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(0);
  const [styleColor, setStyleColor] = useState(0);

  const colorApss = [
    {
      textColorPrimary: "#2c2c2c",
      bgNormal: "#ffffff",
      bgHover: "#f5f5f5",
    },
    {
      textColorPrimary: "#D32F2F",
      bgNormal: "#fff5f5",
      bgHover: "#ffe5e5",
    },
  ];

  useEffect(() => {
    (async () => {
      const data = await getWorkShift();
      setDataWorkForceView(data);

      const pref = await getPreferences();
      setStyleColor(pref?.color || 0);
    })();
  }, []);

  const openCloseModalAdd = (value: number) => {
    setModalOpen(value);
  };

  return (
    <div style={styles.container}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <button
          style={styles.button}
          onClick={() => openCloseModalAdd(1)}
        >
          Agregar Turno de Trabajo
        </button>

        <input
          placeholder="Buscar Turno de Trabajo"
          style={styles.input}
        />
      </div>

      {/* GRID */}
      <div style={styles.stateforce}>
        {dataWorkForceView.map((value, index) => (
          <Link
            key={index}
            to={`/work-force-shift/${encodeURIComponent(String(value.name ?? ""))}`}
            style={{
              ...styles.card,
              background: colorApss[styleColor]?.bgNormal,
              color: colorApss[styleColor]?.textColorPrimary,
            }}
          >
            <h3 style={styles.title}>
              Turno {value.name}
            </h3>

            <h3 style={styles.title}>
              {value.workday?.charAt(0).toUpperCase() +
                value.workday?.slice(1)}
            </h3>

            <img src={workImg} style={styles.image} />

            <p style={styles.text}>
              Personal Operativo: {value.operative_personal}
            </p>

            <p style={styles.text}>
              Personal In-Operativo: {value.in_operative_personal}
            </p>
          </Link>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen === 1 && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>Crear nuevo turno</h2>

            <button onClick={() => openCloseModalAdd(0)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#ffffff",
    minHeight: "100vh",
    padding: "1rem",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
    flexWrap: "wrap",
    gap: "1rem",
  },

  button: {
    padding: "0.7rem 1.2rem",
    borderRadius: "10px",
    border: "none",
    background: "#D32F2F",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  input: {
    padding: "0.7rem",
    borderRadius: "10px",
    border: "1px solid #ccc",
    width: "250px",
  },

  stateforce: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    margin: "0 auto",
    overflowY: "auto",
    height: "65vh",
    width: "85vw",
  },

  card: {
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: "20px",
    maxHeight: "350px",
    justifyContent: "space-around",
    padding: "1rem",
    transition: "0.3s",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },

  image: {
    width: "60%",
  },

  title: {
    margin: 0,
  },

  text: {
    margin: 0,
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "15px",
  },
};