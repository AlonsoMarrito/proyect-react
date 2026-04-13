import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getPreferences } from "../scripts/preference/getPreference";
import { getAllTypeToVehicle } from "../scripts/vehicle/generalInfoVehicle/getVehicles";

import TopSearchDataOnComponents from "../common/TopSearchDataOnComponents";
import ModalAddTypeVehicle from "../components-on-views/vehiculos/ModalAddTypeVehicle";

type VehicleType = {
  type: string;
  image: string;
  operative: number;
  in_operative: number;
};

export default function TypeToVehicles() {
  const [modalAddVehicle, setModalAddVehicle] = useState(0);
  const [stockVehicle, setStockVehicle] = useState<VehicleType[]>([]);
  const [styleColor, setStyleColor] = useState(0);
  const [search, setSearch] = useState("");

  const colorApss = [
    {
      primary: "#FF6B6B",
      secondary: "#FFFFFF",
      textColorPrimary: "#2c2c2c",
      bg: "#ffffff",
      hover: "#f5f5f5",
    },
    {
      primary: "#D32F2F",
      secondary: "#FFFFFF",
      textColorPrimary: "#D32F2F",
      bg: "#fff5f5",
      hover: "#ffe5e5",
    },
  ];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);

      const data = await getAllTypeToVehicle();
      setStockVehicle(data || []);
    })();
  }, []);

  const filteredVehicles = useMemo(() => {
    return stockVehicle.filter((v) =>
      v.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [stockVehicle, search]);

  return (
    <div style={styles.container}>
      {/* TOP */}
      <TopSearchDataOnComponents
        buttonText="Agregar Tipo de Vehículo"
        inputText="Buscar Tipo de Vehículo"
        onOpen={() => setModalAddVehicle(1)}
        onSearchChange={setSearch}
      />

      {/* GRID */}
      <div style={styles.grid}>
        {filteredVehicles.map((value, index) => (
          <Link
            key={index}
            to={`/type-vehicle/${value.type}`}
            style={{
              ...styles.card,
              background: colorApss[styleColor].bg,
              color: colorApss[styleColor].textColorPrimary,
            }}
          >
            <h3 style={styles.title}>{value.type}</h3>

            <img src={value.image} style={styles.image} />

            <p style={styles.text}>
              Operativas: {value.operative}
            </p>

            <p style={styles.text}>
              In-Operativas: {value.in_operative}
            </p>
          </Link>
        ))}
      </div>

      {/* MODAL */}
      {modalAddVehicle === 1 && (
        <ModalAddTypeVehicle onClose={() => setModalAddVehicle(0)} />
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "75vh",
    display: "flex",
    flexDirection: "column",
    background: "#f7f7f7",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    padding: "1rem",
    overflowY: "auto",
    flex: 1,
  },

  card: {
    borderRadius: "18px",
    padding: "1rem",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },

  image: {
    width: "70%",
    objectFit: "cover",
    margin: "10px 0",
  },

  title: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "bold",
  },

  text: {
    margin: 0,
    fontSize: "1rem",
  },
};