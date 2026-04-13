import { useState } from "react";
import { createNewVehicle } from "../../scripts/vehicle/typeToVehicle/typeToVehicle";
import Swal from "sweetalert2";

export default function ModalAddTypeVehicle({ onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!name || !file) return;

    await createNewVehicle(name, file);

    Swal.fire({
      icon: "success",
      title: "Vehículo creado",
      timer: 2000,
      showConfirmButton: false,
    });

    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Nuevo Tipo de Vehículo</h2>

        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <input type="file" onChange={handleFile} />

        {preview && (
          <img src={preview} style={{ width: "100%", borderRadius: "10px" }} />
        )}

        <button onClick={submit} style={styles.button}>
          Guardar
        </button>

        <button onClick={onClose} style={styles.close}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "420px",
    background: "#fff",
    borderRadius: "15px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  input: {
    padding: "0.7rem",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },

  button: {
    padding: "0.7rem",
    borderRadius: "10px",
    border: "none",
    background: "#D32F2F",
    color: "#fff",
    cursor: "pointer",
  },

  close: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
};