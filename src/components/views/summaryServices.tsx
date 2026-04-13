import { useCallback, useEffect, useState } from "react";

import { getPreferences } from "../scripts/preference/getPreference";
import { getServicesHistory } from "../scripts/history/getAllHistory";
import { getTypeVehicle } from "../scripts/vehicle/generalInfoVehicle/getVehicles";
import { getAllTypeToServices } from "../scripts/typeToServices/getTypeToServices";
import { getAllUser } from "../scripts/user/getUser";

import TopSearchDataOnInputs, {
  type HistorySearchFilters,
} from "../common/TopSearchDataOnInputs";
import RowHistory from "../components-on-views/history/RowComponentsHistory";
import SumaryToDay from "../components-on-views/history/SumaryToDay";

type Service = {
  id: number;
  type_service?: string;
  id_type_service?: number;
  vehicle_id: number;
  date_to_open?: string;
  time_to_open?: string;
  phone_reporter?: string;
  personal_on_a_service?: { id_user: number; position_on_service?: string }[];
};

export default function SumarysServicesView() {
  const [componentView, setComponentView] = useState(1);

  const [styleColor, setStyleColor] = useState(0);

  const [servicesHistory, setServicesHistory] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [typeNameById, setTypeNameById] = useState<Record<number, string>>({});
  const [usersMap, setUsersMap] = useState<Record<number, string>>({});

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

      const [data, types, users] = await Promise.all([
        getServicesHistory(),
        getAllTypeToServices(),
        getAllUser(),
      ]);

      const safe = Array.isArray(data) ? data : [];
      setServicesHistory(safe);
      setFilteredServices(safe);

      const tm: Record<number, string> = {};
      if (Array.isArray(types)) {
        types.forEach((t: { id?: number; name?: string }) => {
          if (t?.id != null) tm[Number(t.id)] = String(t.name ?? "");
        });
      }
      setTypeNameById(tm);

      const um: Record<number, string> = {};
      if (Array.isArray(users)) {
        users.forEach((u: { id?: number; first_name?: string; last_name?: string }) => {
          if (u?.id != null) {
            um[Number(u.id)] =
              `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
          }
        });
      }
      setUsersMap(um);
    })();
  }, []);

  const changeComponent = (value: number) => {
    setComponentView(value);
    setShowPreview(false);
  };

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

  const applyFilters = useCallback(
    async (filters: HistorySearchFilters) => {
      let vehicleId: number | null = null;
      if (filters.unidad.trim()) {
        const vehicle = await getTypeVehicle(Number(filters.unidad));
        vehicleId = vehicle?.id ?? null;
      }

      const tipoQ = filters.tipoServicio.trim().toLowerCase();
      const telQ = filters.telefono.replace(/\s/g, "");
      const fechaQ = filters.fecha.trim().toLowerCase();
      const horaQ = filters.hora.trim();
      const tripQ = filters.tripulante.trim().toLowerCase();

      const filtered = servicesHistory.filter((service) => {
        const matchId = filters.id
          ? filters.id.startsWith("0")
            ? Number(service.id) === Number(filters.id)
            : String(service.id).startsWith(filters.id)
          : true;

        const typeName =
          typeNameById[Number(service.id_type_service)] ??
          String(service.type_service ?? "");
        const matchTipo = tipoQ
          ? typeName.toLowerCase().includes(tipoQ)
          : true;

        const matchUnidad = filters.unidad.trim()
          ? service.vehicle_id === vehicleId
          : true;

        const phone = String(service.phone_reporter ?? "").replace(/\s/g, "");
        const matchTel = telQ ? phone.includes(telQ) : true;

        const datePart = service.date_to_open?.slice(0, 10) ?? "";
        const matchFecha = fechaQ
          ? datePart.toLowerCase().includes(fechaQ)
          : true;

        const timePart = service.time_to_open?.slice(11, 19) ?? "";
        const matchHora = horaQ
          ? timePart.includes(horaQ) ||
            String(service.time_to_open ?? "").includes(horaQ)
          : true;

        const matchTrip = tripQ
          ? (service.personal_on_a_service || []).some((p) => {
              const name = usersMap[p.id_user];
              return (
                name &&
                String(name).toLowerCase().includes(tripQ)
              );
            })
          : true;

        return (
          matchId &&
          matchTipo &&
          matchUnidad &&
          matchTel &&
          matchFecha &&
          matchHora &&
          matchTrip
        );
      });

      setFilteredServices(filtered);
    },
    [servicesHistory, typeNameById, usersMap]
  );

  return (
    <div style={styles.root}>
      <div style={styles.rowOrDocument}>
        <button
          style={{
            ...styles.tabButton,
            borderBottom:
              componentView === 1
                ? `2px solid ${colorApss[styleColor].borderBottomDecoration}`
                : "none",
          }}
          type="button"
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
          type="button"
          onClick={() => changeComponent(2)}
        >
          Generar Documento por Fecha
        </button>
      </div>

      <div
        style={{
          ...styles.historyBody,
          background: colorApss[styleColor].primaryCardsBackground,
        }}
      >
        {componentView === 1 && (
          <div style={styles.historySplit}>
            <aside style={styles.filtersColumn}>
              <h3 style={styles.filtersHeading}>Filtros</h3>
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
            </aside>
            <div style={styles.tableContainer}>
              <RowHistory servicesHistory={filteredServices} />
            </div>
          </div>
        )}

        {componentView === 2 && (
          <div style={styles.historySplit}>
            <aside style={styles.docFiltersColumn}>
              <h3 style={styles.filtersHeading}>Rango de fechas</h3>
              <label style={styles.docLabel}>Desde</label>
              <input
                type="date"
                value={dateToStart}
                onChange={(e) => setDateToStart(e.target.value)}
                style={styles.inputWide}
              />
              <label style={styles.docLabel}>Hasta</label>
              <input
                type="date"
                value={dateToEnd}
                onChange={(e) => setDateToEnd(e.target.value)}
                style={styles.inputWide}
              />
              <button
                type="button"
                style={{ ...styles.button, ...styles.docGenerateBtn }}
                onClick={generateDocument}
              >
                Generar
              </button>
            </aside>
            <div style={styles.tableContainer}>
              {showPreview && (
                <SumaryToDay
                  servicesHistory={servicesRange}
                  selectedDate={`${dateToStart} al ${dateToEnd}`}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    flex: 1,
  },
  rowOrDocument: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexShrink: 0,
  },

  tabButton: {
    padding: "0.8rem 1.2rem",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "bold",
  },

  inputWide: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.55rem",
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
    fontWeight: 600,
  },

  historyBody: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "stretch",
    padding: "2vh 2vw",
    borderRadius: "10px",
    flex: 1,
    minHeight: 0,
    width: "100%",
    boxSizing: "border-box",
  },

  historySplit: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: "1.25rem",
    width: "100%",
    flex: 1,
    minHeight: "min(68vh, calc(100vh - 200px))",
  },

  filtersColumn: {
    flex: "1 1 260px",
    maxWidth: "min(320px, 100%)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e8e8e8",
    background: "#f7f7f7",
    alignSelf: "stretch",
    overflowY: "auto",
    boxSizing: "border-box",
  },

  docFiltersColumn: {
    flex: "1 1 260px",
    maxWidth: "min(320px, 100%)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e8e8e8",
    background: "#f7f7f7",
    alignSelf: "stretch",
    boxSizing: "border-box",
  },

  docLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#444",
  },

  docGenerateBtn: {
    marginTop: "8px",
    width: "100%",
  },

  filtersHeading: {
    margin: "0 0 4px 0",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#2c2c2c",
  },

  tableContainer: {
    flex: "3 1 360px",
    minWidth: 0,
    overflowY: "auto",
    maxHeight: "min(68vh, calc(100vh - 200px))",
    display: "flex",
    flexDirection: "column",
  },
};
