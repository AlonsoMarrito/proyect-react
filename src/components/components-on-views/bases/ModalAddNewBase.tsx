import { useEffect, useState } from "react";
import { getPreferences } from "../../scripts/preference/getPreference";

type Props = {
  onClose: () => void;
};

export default function ModalAddNewBase({ onClose }: Props) {
  const [styleColor, setStyleColor] = useState(0);

  const colorApss = [
    {
      primary: "#FF6B6B",
      secundary: "#FFFFFF",
      textColorTertiary: "#333",
    },
    {
      primary: "#D32F2F",
      secundary: "#FFFFFF",
      textColorTertiary: "#333",
    },
  ];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
    })();
  }, []);

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.modal,
          background: colorApss[styleColor].secundary,
          border: `3px solid ${colorApss[styleColor].primary}`,
        }}
      >
        {/* CLOSE */}
        <div style={styles.closeZone}>
          <button style={styles.closeBtn} onClick={onClose}>
            X
          </button>
        </div>

        {/* TITLE */}
        <div
          style={{
            ...styles.title,
            color: colorApss[styleColor].textColorTertiary,
          }}
        >
          <h1 style={{ margin: 0 }}>Agregar Base</h1>
        </div>

        {/* FORM */}
        <div style={styles.form}>
          <div style={styles.row}>
            <input style={styles.input} placeholder="Nombre" />
            <select style={styles.select}>
              <option disabled>Seleccionar Tipo</option>
              <option value="Base">Base</option>
              <option value="Garza">Garza</option>
            </select>
          </div>

          <div style={styles.row}>
            <input style={styles.input} placeholder="Colonia" />
            <input style={styles.input} placeholder="Calle y Numero" />
            <input style={styles.input} placeholder="Cruce" />
          </div>

          <input style={styles.inputFull} placeholder="Coordenadas" />
        </div>

        {/* SAVE */}
        <button style={styles.saveBtn} onClick={onClose}>
          Guardar
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    background: "rgba(164,164,164,0.27)",
    width: "100vw",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    width: "50vw",
    maxWidth: "700px",
    height: "60vh",
    maxHeight: "800px",
    borderRadius: "20px",
    padding: "1vh 1vw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    overflowY: "auto",
    transform: "scale(0.98)",
    transition: "0.3s ease",
  },

  closeZone: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },

  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
  },

  title: {
    width: "100%",
    textAlign: "center",
  },

  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  row: {
    display: "flex",
    justifyContent: "space-around",
    width: "100%",
    gap: "10px",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },

  inputFull: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },

  select: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  saveBtn: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#D32F2F",
    color: "#fff",
    fontWeight: "bold",
  },
};