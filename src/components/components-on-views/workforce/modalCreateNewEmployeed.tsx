import { useEffect, useState } from "react";
import { getPreferences } from "../../scripts/preference/getPreference";
import { getWorkShift } from "../../scripts/workshift/getWorkShift";
import { useParams } from "react-router-dom";

import takePicture from "../../../assets/icons-app/takePicture.png";

const colorApss = [
  {
    primary: "#2c2c2c",
    secondary: "#ffffff",
  },
  {
    primary: "#D32F2F",
    secondary: "#fff5f5",
  },
];

type Props = {
  onClose: () => void;
};

export default function ModalCreateNewEmployeed({ onClose }: Props) {
  const { shift } = useParams();

  const [boxVisility, setBoxVisility] = useState(0);
  const [shiftWork, setShiftWork] = useState("");
  const [dataWorkForceView, setDataWorkForceView] = useState<any[]>([]);

  const [styleColor, setStyleColor] = useState(0);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color || 0);

      const shifts = await getWorkShift();
      setDataWorkForceView(shifts);

      if (shift) setShiftWork(shift);
    })();
  }, [shift]);

  /* ---------------- NAV STEPS ---------------- */
  const changeGroupData = (action: "plus" | "minus") => {
    setBoxVisility((prev) =>
      action === "plus" ? prev + 1 : prev - 1
    );
  };

  /* ---------------- SAVE (placeholder) ---------------- */
  const createNewShift = async () => {
    try {
      // Aquí conectarías tu API real
      alert("Empleado registrado correctamente");

      onClose();
    } catch (err) {
      console.error(err);
      alert("Algo salió mal");
    }
  };

  const color = colorApss[styleColor ?? 0];

  /* ---------------- UI ---------------- */
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* HEADER */}
        <div style={styles.header}>
          <button onClick={onClose}>✖</button>
        </div>

        {/* TITLE */}
        <h1 style={styles.title}>
          Agregar Un Nuevo Empleado
        </h1>

        {/* STEP 1 */}
        {boxVisility === 0 && (
          <div style={styles.section}>
            <h2>Datos Personales</h2>

            <div style={styles.row}>
              <input placeholder="Nombre" />
              <input placeholder="2do Nombre" />
              <input placeholder="Apellido Paterno" />
              <input placeholder="Apellido Materno" />
            </div>

            <div style={styles.row}>
              <input placeholder="NSS" />
              <input type="date" />
            </div>

            <div style={styles.row}>
              <select>
                <option>A</option>
                <option>AB</option>
                <option>B</option>
                <option>O</option>
              </select>

              <select>
                <option>+</option>
                <option>-</option>
              </select>

              <button>
                <img
                  src={takePicture}
                  style={{
                    width: 25,
                    filter:
                      styleColor === 1 ? "invert(1)" : "none",
                  }}
                />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {boxVisility === 1 && (
          <div style={styles.section}>
            <h2>Datos Corporativos</h2>

            <div style={styles.row}>
              <input placeholder="Número Empleado" />
              <input type="date" />
            </div>

            <div style={styles.row}>
              <select
                value={shiftWork}
                onChange={(e) => setShiftWork(e.target.value)}
              >
                {dataWorkForceView.map((ws, i) => (
                  <option key={i} value={ws.name}>
                    {ws.name}
                  </option>
                ))}
              </select>

              <select>
                <option>01</option>
                <option>02</option>
                <option>Chofer</option>
                <option>Oficial</option>
              </select>
            </div>

            <div style={styles.row}>
              <select>
                <option>Activo</option>
                <option>Inactivo</option>
                <option>Permiso</option>
                <option>Incapacidad</option>
              </select>

              <select>
                <option>Operativo</option>
                <option>Administrativo</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {boxVisility === 2 && (
          <div style={styles.section}>
            <h2>Datos de Contacto</h2>

            <div style={styles.row}>
              <input placeholder="Correo Personal" />
              <input placeholder="Teléfono Personal" />
            </div>

            <div style={styles.row}>
              <input placeholder="Contacto Emergencia" />
              <input placeholder="Teléfono Emergencia" />
            </div>

            <div style={styles.row}>
              <input placeholder="Teléfono Alterno" />
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={styles.footer}>
          {boxVisility > 0 && (
            <button onClick={() => changeGroupData("minus")}>
              Anterior
            </button>
          )}

          {boxVisility < 2 && (
            <button onClick={() => changeGroupData("plus")}>
              Siguiente
            </button>
          )}

          {boxVisility === 2 && (
            <button onClick={createNewShift}>
              Guardar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "40%",
    background: "#fff",
    borderRadius: 20,
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },

  header: {
    display: "flex",
    justifyContent: "flex-end",
  },

  title: {
    textAlign: "center",
    marginBottom: 20,
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
  },

  row: {
    display: "flex",
    justifyContent: "space-around",
    gap: 10,
    flexWrap: "wrap",
  },

  footer: {
    display: "flex",
    justifyContent: "space-around",
  },
};