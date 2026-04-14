import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Swal from "sweetalert2";

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

type PageTheme = {
  textColorPrimary: string;
  pageBg: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  accent: string;
  accentMuted: string;
  tableHeadBg: string;
  mutedText: string;
  inputBorder: string;
};

const colorApss: PageTheme[] = [
  {
    textColorPrimary: "#1a1d21",
    pageBg:
      "linear-gradient(165deg, #e4e9f2 0%, #f0f3f8 42%, #fafbfc 100%)",
    panelBg: "#ffffff",
    panelBorder: "rgba(15, 23, 42, 0.09)",
    panelShadow:
      "0 4px 6px rgba(15, 23, 42, 0.04), 0 14px 36px rgba(15, 23, 42, 0.09)",
    accent: "#D32F2F",
    accentMuted: "rgba(211, 47, 47, 0.1)",
    tableHeadBg: "#37474f",
    mutedText: "#546e7a",
    inputBorder: "#cfd8dc",
  },
  {
    textColorPrimary: "#6d1f1f",
    pageBg:
      "linear-gradient(165deg, #ffcdd2 0%, #ffebee 38%, #fffafa 100%)",
    panelBg: "#ffffff",
    panelBorder: "rgba(198, 40, 40, 0.18)",
    panelShadow:
      "0 4px 8px rgba(183, 28, 28, 0.07), 0 16px 44px rgba(183, 28, 28, 0.12)",
    accent: "#c62828",
    accentMuted: "rgba(198, 40, 40, 0.12)",
    tableHeadBg: "#b71c1c",
    mutedText: "#8d4e4e",
    inputBorder: "#ef9a9a",
  },
];

type Service = {
  id: number;
  type_service?: string;
  id_type_service?: number;
  vehicle_id: number;
  date_to_open?: string;
  time_to_open?: string;
  phone_reporter?: string;
  summary?: string;
  personal_on_a_service?: { id_user: number; position_on_service?: string }[];
};

export default function SumarysServicesView(_props: { user?: unknown }) {
  const [componentView, setComponentView] = useState(1);
  const [styleColor, setStyleColor] = useState(0);
  const theme = colorApss[styleColor] ?? colorApss[0];

  const [servicesHistory, setServicesHistory] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [typeNameById, setTypeNameById] = useState<Record<number, string>>({});
  const [usersMap, setUsersMap] = useState<Record<number, string>>({});

  const servicesHistoryRef = useRef<Service[]>([]);
  const typeNameByIdRef = useRef<Record<number, string>>({});
  const usersMapRef = useRef<Record<number, string>>({});
  const filterGenRef = useRef(0);

  const [dateToStart, setDateToStart] = useState("");
  const [dateToEnd, setDateToEnd] = useState("");
  const [servicesRange, setServicesRange] = useState<Service[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const [filterKey, setFilterKey] = useState(0);

  useEffect(() => {
    servicesHistoryRef.current = servicesHistory;
  }, [servicesHistory]);
  useEffect(() => {
    typeNameByIdRef.current = typeNameById;
  }, [typeNameById]);
  useEffect(() => {
    usersMapRef.current = usersMap;
  }, [usersMap]);

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
      const typesSafe = Array.isArray(types) ? types : [];
      setServicesHistory(safe);
      setFilteredServices(safe);

      const tm: Record<number, string> = {};
      typesSafe.forEach((t: { id?: number; name?: string }) => {
        if (t?.id != null) tm[Number(t.id)] = String(t.name ?? "");
      });
      setTypeNameById(tm);

      const um: Record<number, string> = {};
      const usersSafe = Array.isArray(users) ? users : [];
      usersSafe.forEach((u: { id?: number; first_name?: string; last_name?: string }) => {
        if (u?.id != null) {
          um[Number(u.id)] =
            `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
        }
      });
      setUsersMap(um);
    })();
  }, []);

  const changeComponent = (value: number) => {
    setComponentView(value);
    setShowPreview(false);
  };

  const generateDocument = async () => {
    if (!dateToStart || !dateToEnd) {
      await Swal.fire({
        icon: "warning",
        title: "Fechas",
        text: "Selecciona fecha de inicio y fecha fin.",
      });
      return;
    }

    if (dateToStart > dateToEnd) {
      await Swal.fire({
        icon: "error",
        title: "Rango inválido",
        text: "La fecha inicial no puede ser mayor que la final.",
      });
      return;
    }

    const filtered = servicesHistory.filter((service) => {
      const serviceDate = service.date_to_open?.slice(0, 10);
      return (
        serviceDate != null &&
        serviceDate >= dateToStart &&
        serviceDate <= dateToEnd
      );
    });

    setServicesRange(filtered);
    setShowPreview(true);
  };

  const applyFilters = useCallback(async (filters: HistorySearchFilters) => {
    const gen = ++filterGenRef.current;

    let vehicleId: number | null = null;
    const unidadTrim = filters.unidad.trim();
    if (unidadTrim) {
      const n = Number(unidadTrim);
      if (Number.isFinite(n)) {
        const vehicle = await getTypeVehicle(n);
        if (gen !== filterGenRef.current) return;
        vehicleId = vehicle?.id ?? null;
      }
    }

    if (gen !== filterGenRef.current) return;

    const sh = servicesHistoryRef.current;
    const tm = typeNameByIdRef.current;
    const um = usersMapRef.current;

    const tipoQ = filters.tipoServicio.trim().toLowerCase();
    const telQ = filters.telefono.replace(/\s/g, "");
    const fechaQ = filters.fecha.trim().toLowerCase();
    const horaQ = filters.hora.trim();
    const tripQ = filters.tripulante.trim().toLowerCase();

    const filtered = sh.filter((service) => {
      const matchId = filters.id
        ? filters.id.startsWith("0")
          ? Number(service.id) === Number(filters.id)
          : String(service.id).startsWith(filters.id)
        : true;

      const typeName =
        tm[Number(service.id_type_service)] ??
        String(service.type_service ?? "");
      const matchTipo = tipoQ ? typeName.toLowerCase().includes(tipoQ) : true;

      const matchUnidad = unidadTrim
        ? vehicleId != null && service.vehicle_id === vehicleId
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
            const name = um[p.id_user];
            return name && String(name).toLowerCase().includes(tripQ);
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
  }, []);

  const clearFilters = () => {
    filterGenRef.current += 1;
    setFilteredServices(servicesHistoryRef.current);
    setFilterKey((k) => k + 1);
  };

  const searchTheme = {
    panelBg: theme.panelBg,
    inputBorder: theme.inputBorder,
    labelColor: theme.mutedText,
    inputText: theme.textColorPrimary,
  };

  return (
    <div
      style={{
        ...styles.container,
        background: theme.pageBg,
        color: theme.textColorPrimary,
      }}
    >
      <div style={styles.contentWrap}>
        {componentView === 1 && (
          <div style={styles.split}>
            <aside
              style={{
                ...styles.filtersAside,
                background: theme.panelBg,
                border: `1px solid ${theme.panelBorder}`,
                boxShadow: theme.panelShadow,
              }}
            >
              <div style={styles.filtersHeader}>
                <h3 style={{ ...styles.h3, color: theme.textColorPrimary }}>
                  Filtros
                </h3>
                <div style={styles.filtersHeaderActions}>
                  <button
                    type="button"
                    onClick={() => changeComponent(2)}
                    style={{
                      ...styles.btnCompactLink,
                      color: theme.accent,
                    }}
                  >
                    PDF por fechas
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    style={{
                      ...styles.btnGhost,
                      borderColor: theme.inputBorder,
                      color: theme.accent,
                    }}
                  >
                    Limpiar
                  </button>
                </div>
              </div>
              <TopSearchDataOnInputs
                key={filterKey}
                busqueda1="Folio"
                busqueda2="Tipo de Servicio"
                busqueda3="Teléfono reportante"
                busqueda4="Fecha"
                busqueda5="Hora"
                busqueda6="Unidad"
                busqueda7="Tripulante"
                onFilterChange={applyFilters}
                theme={searchTheme}
              />
            </aside>
            <div
              style={{
                ...styles.listArea,
                background: theme.panelBg,
                border: `1px solid ${theme.panelBorder}`,
                boxShadow: theme.panelShadow,
              }}
            >
              <RowHistory servicesHistory={filteredServices} theme={theme} />
            </div>
          </div>
        )}

        {componentView === 2 && (
          <div style={styles.split}>
            <aside
              style={{
                ...styles.docAside,
                background: theme.panelBg,
                border: `1px solid ${theme.panelBorder}`,
                boxShadow: theme.panelShadow,
              }}
            >
              <button
                type="button"
                onClick={() => changeComponent(1)}
                style={{
                  ...styles.btnCompactLink,
                  color: theme.accent,
                  alignSelf: "flex-start",
                  marginBottom: 4,
                }}
              >
                ← Listado
              </button>
              <h3 style={{ ...styles.h3, color: theme.textColorPrimary }}>
                Rango de fechas
              </h3>
              <label style={{ ...styles.lbl, color: theme.mutedText }}>
                Desde
              </label>
              <input
                type="date"
                value={dateToStart}
                onChange={(e) => setDateToStart(e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: theme.inputBorder,
                  color: theme.textColorPrimary,
                  background: theme.panelBg,
                }}
              />
              <label style={{ ...styles.lbl, color: theme.mutedText }}>
                Hasta
              </label>
              <input
                type="date"
                value={dateToEnd}
                onChange={(e) => setDateToEnd(e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: theme.inputBorder,
                  color: theme.textColorPrimary,
                  background: theme.panelBg,
                }}
              />
              <button
                type="button"
                style={{
                  ...styles.btnPrimary,
                  background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
                  boxShadow: `0 4px 14px ${theme.accentMuted}`,
                }}
                onClick={() => void generateDocument()}
              >
                Generar vista previa
              </button>
            </aside>
            <div
              style={{
                ...styles.previewArea,
                background: theme.panelBg,
                border: `1px solid ${theme.panelBorder}`,
                boxShadow: theme.panelShadow,
              }}
            >
              {showPreview && (
                <SumaryToDay
                  servicesHistory={servicesRange}
                  selectedDate={`${dateToStart} al ${dateToEnd}`}
                  theme={theme}
                />
              )}
              {!showPreview && (
                <p
                  style={{
                    textAlign: "center",
                    color: theme.mutedText,
                    padding: "2rem",
                    margin: 0,
                  }}
                >
                  Elige fechas y pulsa &quot;Generar vista previa&quot;.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    flex: 1,
    minHeight: 0,
    height: "100%",
    width: "100%",
    padding: "0.5rem clamp(0.5rem, 1.5vw, 1rem)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    overflow: "hidden",
  },
  contentWrap: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    maxWidth: "min(1680px, 98vw)",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },
  split: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    alignContent: "stretch",
    gap: "10px",
    flex: "1 1 0",
    minHeight: 0,
    maxHeight: "calc(100vh - 100px)",
    overflow: "hidden",
  },
  filtersAside: {
    flex: "1 1 260px",
    maxWidth: "min(340px, 100%)",
    borderRadius: 12,
    padding: "10px 12px",
    boxSizing: "border-box",
    alignSelf: "stretch",
    overflowY: "auto",
    maxHeight: "100%",
    minHeight: 0,
  },
  filtersHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 10,
  },
  filtersHeaderActions: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  btnCompactLink: {
    padding: "4px 8px",
    border: "none",
    borderRadius: 8,
    background: "transparent",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    textDecoration: "underline",
    textUnderlineOffset: 2,
  },
  h3: { margin: 0, fontSize: "1.05rem", fontWeight: 800 },
  btnGhost: {
    padding: "6px 12px",
    borderRadius: 10,
    border: "2px solid",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
  },
  listArea: {
    flex: "3 1 280px",
    minWidth: 0,
    minHeight: 0,
    height: "100%",
    maxHeight: "calc(100vh - 100px)",
    borderRadius: 12,
    padding: "10px 12px",
    overflowY: "scroll",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    boxSizing: "border-box",
  },
  docAside: {
    flex: "1 1 260px",
    maxWidth: "min(340px, 100%)",
    borderRadius: 16,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxSizing: "border-box",
    overflowY: "auto",
    minHeight: 0,
    maxHeight: "100%",
  },
  lbl: { fontSize: 12, fontWeight: 700 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 10,
    border: "2px solid",
    fontSize: 14,
    fontWeight: 600,
    outline: "none",
  },
  btnPrimary: {
    marginTop: 8,
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
  },
  previewArea: {
    flex: "3 1 400px",
    minWidth: 0,
    minHeight: 0,
    maxHeight: "calc(100vh - 100px)",
    borderRadius: 12,
    padding: "10px 12px",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    boxSizing: "border-box",
  },
};
