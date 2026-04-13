import { useEffect, useState } from "react";

import { getPreferences } from "../scripts/preference/getPreference";
import { getServicesHistory } from "../scripts/history/getAllHistory";
import { getTypeVehicle } from "../scripts/vehicle/generalInfoVehicle/getVehicles";

import TopSearchDataOnInputs from "../common/TopSearchDataOnInputs";
import RowHistory from "../components-on-views/history/RowComponentsHistory";
import SumaryToDay from "../components-on-views/history/SumaryToDay";

type Service = {
  id: number;
  type_service: string;
  vehicle_id: number;
  date_to_open: string;
};

export default function SumarysServicesView() {
  const [componentView, setComponentView] = useState(1);

  const [styleColor, setStyleColor] = useState(0);

  const [servicesHistory, setServicesHistory] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  const [dateToStart, setDateToStart] = useState("");
  const [dateToEnd, setDateToEnd] = useState("");

  const [servicesRange, setServicesRange] = useState<Service[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const colorApss = [
    {
      primaryCardsBackground: "#ffffff",
      textColorPrimary: "#2c2c2c",
      borderBottomDecoration: "#D32F2F",
    },
    {
      primaryCardsBackground: "#fff5f5",
      textColorPrimary: "#D32F2F",
      borderBottomDecoration: "#D32F2F",
    },
  ];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);

      const data = await getServicesHistory();
      setServicesHistory(data || []);
      setFilteredServices(data || []);
    })();
  }, []);

  const changeComponent = (value: number) => {
    setComponentView(value);
    setShowPreview(false);
  };

  // 🔥 GENERAR DOCUMENTO POR RANGO
  const generateDocument = () => {
    if (!dateToStart || !dateToEnd) {
      alert("Selecciona fecha inicio y fecha fin");
      return;
    }

    if (dateToStart > dateToEnd) {
      alert("La fecha inicial no puede ser mayor a la final");
      return;
    }

    const filtered = servicesHistory.filter((service) => {
      const serviceDate = service.date_to_open?.slice(0, 10);
      return serviceDate >= dateToStart && serviceDate <= dateToEnd;
    });

    setServicesRange(filtered);
    setShowPreview(true);
  };

  // 🔥 FILTROS HISTORIAL
  const applyFilters = async (filters: any) => {
    let vehicleId = null;

    if (filters.unidad) {
      const vehicle = await getTypeVehicle(Number(filters.unidad));
      vehicleId = vehicle?.id ?? null;
    }

    const filtered = servicesHistory.filter((service) => {
      const matchId = filters.id
        ? filters.id.startsWith("0")
          ? Number(service.id) === Number(filters.id)
          : String(service.id).startsWith(filters.id)
        : true;

      const matchTipo = filters.tipoServicio
        ? service.type_service
            ?.toLowerCase()
            .includes(filters.tipoServicio.toLowerCase())
        : true;

      const matchUnidad = filters.unidad
        ? service.vehicle_id === vehicleId
        : true;

      return matchId && matchTipo && matchUnidad;
    });

    setFilteredServices(filtered);
  };

  return (
    <div>
      {/* TABS */}
      <div style={styles.rowOrDocument}>
        <button
          style={{
            ...styles.tabButton,
            borderBottom:
              componentView === 1
                ? `2px solid ${colorApss[styleColor].borderBottomDecoration}`
                : "none",
          }}
          onClick={() => changeComponent(1)}
        >
          Historial de Partes de Atención
        </button>

        <button
          style={{
            ...styles.tabButton,
            borderBottom:
              componentView === 2
                ? `2px solid ${colorApss[styleColor].borderBottomDecoration}`
                : "none",
          }}
          onClick={() => changeComponent(2)}
        >
          Generar Documento por Fecha
        </button>
      </div>

      {/* FILTROS FECHA */}
      {componentView === 2 && (
        <div style={styles.sectionFilters}>
          <input
            type="date"
            value={dateToStart}
            onChange={(e) => setDateToStart(e.target.value)}
            style={styles.input}
          />

          <input
            type="date"
            value={dateToEnd}
            onChange={(e) => setDateToEnd(e.target.value)}
            style={styles.input}
          />

          <button style={styles.button} onClick={generateDocument}>
            Generar
          </button>
        </div>
      )}

      {/* BODY */}
      <div
        style={{
          ...styles.historyBody,
          background:
            colorApss[styleColor].primaryCardsBackground,
        }}
      >
        {/* HISTORIAL */}
        {componentView === 1 && (
          <>
            <TopSearchDataOnInputs
              busqueda1="Folio"
              busqueda2="Tipo de Servicio"
              busqueda3="Telefono reportante"
              busqueda4="Fecha"
              busqueda5="Hora"
              busqueda6="Unidad"
              busqueda7="Tripulante"
              onFilterChange={applyFilters}
            />

            <div style={styles.tableContainer}>
              <RowHistory servicesHistory={filteredServices} />
            </div>
          </>
        )}

        {/* DOCUMENTO POR RANGO */}
        {componentView === 2 && (
          <div style={styles.tableContainer}>
            {showPreview && (
              <SumaryToDay
                servicesHistory={servicesRange}
                selectedDate={`${dateToStart} al ${dateToEnd}`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  rowOrDocument: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
  },

  tabButton: {
    padding: "0.8rem 1.2rem",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "bold",
  },

  sectionFilters: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    padding: "1rem",
  },

  input: {
    padding: "0.5rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  button: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    border: "none",
    background: "#D32F2F",
    color: "#fff",
    cursor: "pointer",
  },

  historyBody: {
    display: "flex",
    justifyContent: "center",
    padding: "2vh 2vw",
    borderRadius: "10px",
    flexDirection: "column",
  },

  tableContainer: {
    width: "100%",
    overflowY: "auto",
    height: "63vh",
    display: "flex",
    flexDirection: "column",
  },
};