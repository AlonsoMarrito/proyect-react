import React, { useEffect, useRef, useState } from "react";
import ModalReportDamage from "../vehiculos/modalReportDamage";
import ModalChangeDatasToService from "../vehiculos/modalChangeDatasToService";
import {
  getAllTypeServices,
  getLastOnServicesHistory,
  getOneServicesHistory,
} from "../../scripts/history/getAllHistory";
import { getKilometerTypeVehicle, getVehicleById } from "../../scripts/vehicle/generalInfoVehicle/getVehicles";
import { getWorkForceByDayForService, getWorkForceByDayAndUser, puzzleForWorkForce } from "../../scripts/workforce/getPersonal";
import { getAllTypeToServices } from "../../scripts/typeToServices/getTypeToServices";
import { authUser } from "../../scripts/user/authUser";
import { getServiceActiveByUnid } from "../../scripts/history/getServiceByUnid";
import {
  addedSumaryService,
  closeDataNewService,
  createNewService,
  updateDataNewService,
} from "../../scripts/history/addNewService";
import { createSummaryService } from "../../scripts/history/summaryService";
import { getUserById } from "../../scripts/user/getUser";
import { getAllColognes } from "../../scripts/colognes/getColognes";

export default function LogsServiceVehicle() {
  const [serviceStatus, setServiceStatus] = useState("Close");
  const [modalReportDamage, setModalReportDamage] = useState(0);
  const [modalChangeData, setModalChangeData] = useState(0);
  const [nullService, setNullService] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectEstatus, setSelectEstatus] = useState("nulo");
  const [noConsecutive, setNoConsecutive] = useState(0);
  const [statusServiceActive, setStatusServiceActive] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  const [dataVehicle, setDataVehicle] = useState<any>({});
  const [workForceOnService, setWorkForceOnService] = useState<any>({ fullTripulation: [] });

  const [typeServices, setTypeServices] = useState<any[]>([]);
  const [filteredTypeServices, setFilteredTypeServices] = useState<any[]>([]);
  const [allColognes, setAllColognes] = useState<any[]>([]);
  const [filteredColognes, setFilteredColognes] = useState<any[]>([]);

  const [searchTypeService, setSearchTypeService] = useState("");
  const [typeServiceSelected, setTypeServiceSelected] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);

  const [searchCologne, setSearchCologne] = useState("");
  const [cologneSelected, setCologneSelected] = useState<any>(null);
  const [showCologneOptions, setShowCologneOptions] = useState(false);

  const [folioWrite, setFolioWrite] = useState("");
  const [streetAndNumberWrite, setStreetAndNumberWrite] = useState("");
  const [crossWrite, setCrossWrite] = useState("");
  const [reporterWrite, setReporterWrite] = useState("");
  const [phoneWrite, setPhoneWrite] = useState("");

  const [typeClose, setTypeClose] = useState("");
  const [generalConclusion, setGeneralConclusion] = useState("");
  const [closeKilometers, setCloseKilometers] = useState("");

  const typeServiceBox = useRef<any>(null);
  const cologneBox = useRef<any>(null);

  const typeServicesRef = useRef<any[]>([]);
  const allColognesRef = useRef<any[]>([]);
  const searchTypeRef = useRef("");
  const searchCologneRef = useRef("");
  const typeServiceSelectedRef = useRef<any>(null);
  const cologneSelectedRef = useRef<any>(null);

  typeServicesRef.current = typeServices;
  allColognesRef.current = allColognes;
  searchTypeRef.current = searchTypeService;
  searchCologneRef.current = searchCologne;
  typeServiceSelectedRef.current = typeServiceSelected;
  cologneSelectedRef.current = cologneSelected;

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (typeServiceBox.current && !typeServiceBox.current.contains(event.target)) {
        setShowOptions(false);
      }
      if (cologneBox.current && !cologneBox.current.contains(event.target)) {
        setShowCologneOptions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const types = await getAllTypeToServices();
        const safeTypes = Array.isArray(types) ? types : [];
        setTypeServices(safeTypes);
        setFilteredTypeServices(safeTypes);

        const colognes = await getAllColognes();
        const safeColognes = Array.isArray(colognes) ? colognes : [];
        setAllColognes(safeColognes);
        setFilteredColognes(safeColognes);

        const user = await authUser();
        if (!user?.id || !user?.employees?.id_work_shift) {
          setNullService(false);
          return;
        }
        setUserData(user);

        const todayMx = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
        const today = todayMx.toISOString().split("T")[0];
        const yesterdayMx = new Date(todayMx);
        yesterdayMx.setDate(todayMx.getDate() - 1);
        const yesterday = yesterdayMx.toISOString().split("T")[0];

        let workstate = await getWorkForceByDayForService(today, user.employees.id_work_shift, user.id);
        let dateForState = today;
        if (!workstate) {
          workstate = await getWorkForceByDayForService(yesterday, user.employees.id_work_shift, user.id);
          dateForState = yesterday;
        }
        if (!workstate) {
          setNullService(false);
          return;
        }
        setNullService(true);

        const vehicle = await getVehicleById(workstate.id_vehicle);
        const activeService = await getServiceActiveByUnid(workstate.id_vehicle);
        setStatusServiceActive(activeService);

        const last = Number(await getLastOnServicesHistory()) || 0;
        const consecutive = activeService ? last : last + 1;
        setNoConsecutive(consecutive);

        if (activeService?.status === "en curso" && activeService?.id_type_service == null) {
          setServiceStatus("Open");
          setSelectEstatus("EN CURSO");
        } else if (activeService?.status === "en curso" && activeService?.id_type_service != null) {
          setServiceStatus("Start");
          setSelectEstatus("EN CURSO");
        }

        const kmData = await getKilometerTypeVehicle(vehicle.number_unit);
        setDataVehicle(kmData);
        if (kmData == null) {
          return;
        }

        let puzzle = await getWorkForceByDayAndUser(dateForState, kmData.idUnit);
        if (!Array.isArray(puzzle) || puzzle.length === 0) {
          puzzle = await getWorkForceByDayAndUser(yesterday, kmData.idUnit);
        }
        const result = await puzzleForWorkForce(puzzle);
        if (Array.isArray(result) && result.length > 0) {
          result[0].fullTripulation = (result[0].fullTripulation || []).map((p: any) => ({
            ...p,
            position: p.position ? String(p.position).toUpperCase() : "",
          }));
          setWorkForceOnService(result[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const filterTypeServices = (value: string) => {
    setSearchTypeService(value);
    const safe = Array.isArray(typeServices) ? typeServices : [];
    const search = value.toLowerCase();
    setFilteredTypeServices(
      safe.filter((item: any) =>
        String(item?.name || "").toLowerCase().includes(search) ||
        String(item?.national_code || "").includes(search)
      )
    );
  };

  const selectTypeService = (item: any) => {
    setSearchTypeService(item.name || "");
    setTypeServiceSelected(item.id ?? null);
    setShowOptions(false);
  };

  const validateTypeService = () => {
    setTimeout(() => {
      const text = String(searchTypeRef.current ?? "").trim();
      const types = typeServicesRef.current || [];
      const selId = typeServiceSelectedRef.current;

      if (!text) {
        setSearchTypeService("");
        setTypeServiceSelected(null);
        return;
      }

      if (selId != null && selId !== "") {
        const byId = types.find((item: any) => Number(item?.id) === Number(selId));
        if (
          byId &&
          String(byId.name ?? "").trim().toLowerCase() === text.toLowerCase()
        ) {
          return;
        }
      }

      const match = types.find(
        (item: any) =>
          String(item?.name ?? "").trim().toLowerCase() === text.toLowerCase()
      );
      if (match) {
        setTypeServiceSelected(match.id ?? null);
        setSearchTypeService(String(match.name ?? ""));
        return;
      }

      setSearchTypeService("");
      setTypeServiceSelected(null);
    }, 0);
  };

  const filterColognes = (value: string) => {
    setSearchCologne(value);
    const safe = Array.isArray(allColognes) ? allColognes : [];
    const search = value.toLowerCase();
    setFilteredColognes(safe.filter((item: any) => String(item?.name || "").toLowerCase().includes(search)));
  };

  const selectCologne = (item: any) => {
    setSearchCologne(item.name || "");
    setCologneSelected(item.id ?? null);
    setShowCologneOptions(false);
  };

  const validateCologne = () => {
    setTimeout(() => {
      const text = String(searchCologneRef.current ?? "").trim();
      const cols = allColognesRef.current || [];
      const selId = cologneSelectedRef.current;

      if (!text) {
        setSearchCologne("");
        setCologneSelected(null);
        return;
      }

      if (selId != null && selId !== "") {
        const byId = cols.find((item: any) => Number(item?.id) === Number(selId));
        if (
          byId &&
          String(byId.name ?? "").trim().toLowerCase() === text.toLowerCase()
        ) {
          return;
        }
      }

      const match = cols.find(
        (item: any) =>
          String(item?.name ?? "").trim().toLowerCase() === text.toLowerCase()
      );
      if (match) {
        setCologneSelected(match.id ?? null);
        setSearchCologne(String(match.name ?? ""));
        return;
      }

      setSearchCologne("");
      setCologneSelected(null);
    }, 0);
  };

  const changeStatusService = async (status: number) => {
    switch (status) {
      case 1: {
        setServiceStatus("Open");
        setSelectEstatus("EN CURSO");
        if (!statusServiceActive || statusServiceActive.status == null) {
          const tripulation = (workForceOnService.fullTripulation || []).map((member: any) => ({
            id_user: Number(member.id),
            position_on_service: String(member.position || "").toLowerCase() === "conductor" ? "chofer" : "apoyo",
          }));
          const nowMx = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
          const dateToOpen = new Date(nowMx);
          dateToOpen.setHours(0, 0, 0, 0);
          await createNewService({
            user_id: Number(userData.id),
            vehicle_id: Number(dataVehicle.idUnit),
            kilometers: Number(dataVehicle.kilometers),
            status: "en curso",
            date_to_open: dateToOpen.toISOString(),
            time_to_open: nowMx.toISOString(),
            personal_on_a_service: tripulation,
          });
        }
        break;
      }
      case 2: {
        const data = await getOneServicesHistory(noConsecutive);

        let tid: number | null | undefined = typeServiceSelected;
        let cid: number | null | undefined = cologneSelected;
        let folio = folioWrite;
        let stret = streetAndNumberWrite;
        let crossing = crossWrite;
        let reporter = reporterWrite;
        let phone = phoneWrite;
        let colLabel = searchCologne;

        if (data?.folio !== undefined && data?.folio !== null) {
          tid = data.id_type_service ?? null;
          cid = data.id_cologne ?? null;
          setTypeServiceSelected(tid);
          const typeMatch = (typeServices || []).find(
            (item: any) => Number(item?.id) === Number(data.id_type_service)
          );
          if (typeMatch) setSearchTypeService(typeMatch.name);
          setFolioWrite(data.folio || "");
          setCologneSelected(cid);
          const cologneMatch = (allColognes || []).find(
            (item: any) => Number(item?.id) === Number(data.id_cologne)
          );
          if (cologneMatch) setSearchCologne(cologneMatch.name);
          setStreetAndNumberWrite(data.stret || "");
          setCrossWrite(data.crossing || "");
          setReporterWrite(data.reporter || "");
          setPhoneWrite(data.phone_reporter || "");

          folio = String(data.folio ?? "");
          stret = String(data.stret ?? "");
          crossing = String(data.crossing ?? "");
          reporter = String(data.reporter ?? "");
          phone = String(data.phone_reporter ?? "");
          colLabel = cologneMatch?.name
            ? String(cologneMatch.name)
            : searchCologne;
        }

        if (
          tid != null &&
          cid != null &&
          String(colLabel ?? "").trim() &&
          String(stret ?? "").trim() &&
          String(crossing ?? "").trim() &&
          String(reporter ?? "").trim()
        ) {
          setServiceStatus("Start");
          setSelectEstatus("EN CURSO");
          await updateDataNewService(noConsecutive, {
            id_type_service: tid,
            folio,
            id_cologne: cid,
            stret,
            crossing,
            reporter,
            phone_reporter: phone,
          });
        }
        break;
      }
      case 3: {
        const closeKm = Number(closeKilometers);
        const openKm = Number(dataVehicle.kilometers);
        const canClose =
          (typeClose &&
            generalConclusion &&
            closeKilometers &&
            selectEstatus !== "EN CURSO" &&
            closeKm > openKm) ||
          selectEstatus === "FALSA ALARMA" ||
          selectEstatus === "CANCELADO";

        if (!canClose) {
          break;
        }

        const now = new Date();
        const dateToClose = now.toLocaleDateString("sv-SE", {
          timeZone: "America/Mexico_City",
        });
        const timeToClose = now.toLocaleTimeString("sv-SE", {
          timeZone: "America/Mexico_City",
          hour12: false,
        });

        const closed = await closeDataNewService(noConsecutive, {
          close_type: typeClose,
          general_and_conclusion: generalConclusion,
          close_kilometers: closeKm,
          kilometers_traveled: closeKm - openKm,
          status: String(selectEstatus).toLowerCase(),
          date_to_close: `${dateToClose}T00:00:00.000Z`,
          time_to_close: `1900-01-01T${timeToClose}.000Z`,
        });

        if (closed == null) {
          console.error("No se pudo cerrar el servicio");
          break;
        }

        try {
          const serviceRow = await getOneServicesHistory(noConsecutive);
          if (serviceRow && typeof serviceRow === "object") {
            let typeList = await getAllTypeServices();
            if (!Array.isArray(typeList)) typeList = [];
            const typeRow = typeList.find(
              (ts: { id?: unknown }) =>
                Number(ts?.id) ===
                Number((serviceRow as { id_type_service?: unknown }).id_type_service)
            );
            const nameService =
              typeRow?.name != null ? String(typeRow.name) : "Servicio";

            const personal = (
              (serviceRow as { personal_on_a_service?: Array<{ id_user?: number; position_on_service?: string }> })
                .personal_on_a_service || []
            );

            const choferEntry = personal.find(
              (ps) =>
                String(ps.position_on_service ?? "").toLowerCase() === "chofer"
            );
            let choferName = "";
            if (choferEntry?.id_user != null) {
              const chofer = await getUserById(choferEntry.id_user);
              const c = Array.isArray(chofer) ? chofer[0] : chofer;
              if (c && typeof c === "object") {
                choferName =
                  `${(c as { first_name?: string }).first_name ?? ""} ${(c as { last_name?: string }).last_name ?? ""}`.trim();
              }
            }

            const tripulantesIds = personal
              .filter(
                (p) =>
                  String(p.position_on_service ?? "").toLowerCase() !== "chofer"
              )
              .map((p) => p.id_user)
              .filter((id): id is number => id != null);

            const tripulantesData = await Promise.all(
              tripulantesIds.map((id) => getUserById(id))
            );

            const tripulacionResumida = tripulantesData
              .map((u) => {
                const row = Array.isArray(u) ? u[0] : u;
                if (!row || typeof row !== "object") return "";
                return `${(row as { first_name?: string }).first_name ?? ""} ${(row as { last_name?: string }).last_name ?? ""}`.trim();
              })
              .filter(Boolean);

            const summaryText = await createSummaryService(
              serviceRow,
              dataVehicle.number_unit,
              nameService,
              choferName,
              tripulacionResumida
            );

            if (summaryText && String(summaryText).trim()) {
              await addedSumaryService(noConsecutive, { summary: summaryText });
            }
          }
        } catch (e) {
          console.error("Error al generar o guardar el resumen del servicio:", e);
        }

        setServiceStatus("Close");
        setSearchTypeService("");
        setFolioWrite("");
        setSearchCologne("");
        setStreetAndNumberWrite("");
        setCrossWrite("");
        setReporterWrite("");
        setPhoneWrite("");
        setTypeClose("");
        setGeneralConclusion("");
        setCloseKilometers("");
        setSelectEstatus("nulo");
        setTypeServiceSelected(null);
        setCologneSelected(null);
        break;
      }
      case 4:
        setServiceStatus("Close");
        setSelectEstatus("Pendiente a Reasignacion");
        setSearchTypeService("");
        setSearchCologne("");
        setStreetAndNumberWrite("");
        setCrossWrite("");
        setReporterWrite("");
        setPhoneWrite("");
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="null-state-force">
        <h1>CARGANDO DATOS...</h1>
        <style>{css}</style>
      </div>
    );
  }

  if (!nullService) {
    return (
      <div className="null-state-force">
        <h1>NO ESTAS ASIGNADO EN EL ESTADO DE FUERZA</h1>
        <style>{css}</style>
      </div>
    );
  }

  return (
    <div className="body-logs-service">
      <div className="open-new-service text-style-color-and-family-0-margin">
        <div>
          {(serviceStatus === "Start" || serviceStatus === "Open") && (
            <button className="cancel-button" onClick={() => changeStatusService(4)}>
              Cancelar Servicio Por Re-Asignación
            </button>
          )}
          <div className="info-defect-service">
            <h2 className="title-text-new-service">No. Consecutivo:</h2>
            <h2 className="title-text-new-service">{noConsecutive}</h2>
          </div>
          <div className="info-defect-service">
            <h2 className="title-text-new-service">Unidad No.:</h2>
            <input value={dataVehicle.number_unit || ""} onChange={(e) => setDataVehicle({ ...dataVehicle, number_unit: e.target.value })} disabled={serviceStatus === "Start" || serviceStatus === "Open"} className="input-search-medium-width" />
          </div>
          <div className="info-defect-service">
            <h2 className="title-text-new-service">Kilometraje:</h2>
            <input value={dataVehicle.kilometers || ""} onChange={(e) => setDataVehicle({ ...dataVehicle, kilometers: e.target.value })} disabled={serviceStatus === "Start" || serviceStatus === "Open"} className="input-search-medium-width" />
          </div>
          {(workForceOnService.fullTripulation || []).map((value: any, index: number) => (
            <div className="info-defect-service" key={index}>
              <h2 className="title-text-new-service">{value.position === "APOYO" ? `${value.position} ${index}` : value.position}:</h2>
              <input type="text" value={value.name || ""} disabled={serviceStatus === "Start" || serviceStatus === "Open"} className="input-search-medium-width" readOnly />
            </div>
          ))}
        </div>
        {serviceStatus === "Close" && (
          <button className="button-secundary-big" onClick={() => changeStatusService(1)}>
            Abrir Nuevo Incidente
          </button>
        )}
      </div>

      <div className="open-close-service text-style-color-and-family-0-margin">
        <div className="info-defect-service" ref={typeServiceBox}>
          <h2 className="title-text-new-service">Tipo de Servicio:</h2>
          <input type="text" value={searchTypeService} className="input-search-medium-width" disabled={serviceStatus === "Start"} onFocus={() => setShowOptions(true)} onInput={(e: any) => filterTypeServices(e.target.value)} onBlur={validateTypeService} placeholder="Buscar tipo de servicio..." />
          {showOptions && filteredTypeServices.length > 0 && (
            <div className="autocomplete-dropdown">
              {filteredTypeServices.map((item: any) => (
                <div
                  key={item.id}
                  className="autocomplete-item"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectTypeService(item)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="info-defect-service">
          <h2 className="title-text-new-service">Folio:</h2>
          <input value={folioWrite} onChange={(e) => setFolioWrite(e.target.value)} disabled={serviceStatus === "Start"} className="input-search-medium-width" />
        </div>

        <div className="info-defect-service" ref={cologneBox}>
          <h2 className="title-text-new-service">Colonia:</h2>
          <input type="text" value={searchCologne} className="input-search-medium-width" disabled={serviceStatus === "Start"} onFocus={() => setShowCologneOptions(true)} onInput={(e: any) => filterColognes(e.target.value)} onBlur={validateCologne} placeholder="Buscar colonia..." />
          {showCologneOptions && filteredColognes.length > 0 && (
            <div className="autocomplete-dropdown">
              {filteredColognes.map((item: any) => (
                <div
                  key={item.id}
                  className="autocomplete-item"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectCologne(item)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="info-defect-service">
          <h2 className="title-text-new-service">Calle:</h2>
          <input value={streetAndNumberWrite} onChange={(e) => setStreetAndNumberWrite(e.target.value)} disabled={serviceStatus === "Start"} className="input-search-medium-width" />
        </div>
        <div className="info-defect-service">
          <h2 className="title-text-new-service">Cruce:</h2>
          <input value={crossWrite} onChange={(e) => setCrossWrite(e.target.value)} disabled={serviceStatus === "Start"} className="input-search-medium-width" />
        </div>
        <div className="info-defect-service">
          <h2 className="title-text-new-service">Reportante:</h2>
          <input value={reporterWrite} onChange={(e) => setReporterWrite(e.target.value)} disabled={serviceStatus === "Start"} className="input-search-medium-width" />
        </div>
        <div className="info-defect-service">
          <h2 className="title-text-new-service">Telefono:</h2>
          <input value={phoneWrite} onChange={(e) => setPhoneWrite(e.target.value)} disabled={serviceStatus === "Start"} className="input-search-medium-width" />
        </div>
        {serviceStatus === "Open" && (
          <button className="button-secundary-big" onClick={() => changeStatusService(2)}>
            Dirigirse al Servicio
          </button>
        )}
      </div>

      <div className="open-close-service text-style-color-and-family-0-margin">
        <div>
          <div className="info-defect-service">
            <h2 className="title-text-new-service">Estado del Servicio:</h2>
            <select value={selectEstatus} onChange={(e) => setSelectEstatus(e.target.value)} className="input-search-medium-width">
              <option value="nulo" disabled>In-Activo</option>
              <option value="EN CURSO">En Curso</option>
              <option value="CERRADO">Cerrado</option>
              <option value="FALSA ALARMA">Falsa Alarma</option>
              <option value="CANCELADO">Cancelado Por Usuario</option>
            </select>
          </div>
          <div className="info-defect-service">
            <h2 className="title-text-new-service">Tipo de Cierre:</h2>
            <input value={typeClose} onChange={(e) => setTypeClose(e.target.value)} className="input-search-medium-width" />
          </div>
          <div className="info-defect-service-conclution">
            <h2 className="title-text-new-service">Generales y Conclusiones del Servicio:</h2>
            <textarea value={generalConclusion} onChange={(e) => setGeneralConclusion(e.target.value)} className="text-area-close-service" />
          </div>
          <div className="info-defect-service">
            <h2 className="title-text-new-service">Kilometraje de Cierre:</h2>
            <input value={closeKilometers} onChange={(e) => setCloseKilometers(e.target.value)} className="input-search-medium-width" />
          </div>
          {serviceStatus === "Start" && (
            <>
              <button className="button-tertiary-fat-with-margin" onClick={() => setModalChangeData(1)}>Cambiar Datos de Servicio</button>
              <button className="button-tertiary-fat-with-margin" onClick={() => setModalReportDamage(1)}>Reportar Daño o Averia en Unidad</button>
              <button className="button-primary-big-width-margin" onClick={() => changeStatusService(3)}>Cerrar Atención del Incidente</button>
            </>
          )}
        </div>
      </div>

      {modalReportDamage === 1 && <ModalReportDamage onClose={() => setModalReportDamage(0)} />}
      {modalChangeData === 1 && <ModalChangeDatasToService onClose={() => setModalChangeData(0)} />}
      <style>{css}</style>
    </div>
  );
}

const css = `
.body-logs-service {
  margin-top: 3vh;
  overflow-y: auto;
  max-width: 1350px;
  width: 82vw;
  height: 55vh;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  grid-auto-rows: auto;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 20px;
}
.open-new-service {
  height: 100%;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
}
.open-close-service {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.title-text-new-service {
  margin: 0;
}
.info-defect-service {
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  position: relative;
  gap: 12px;
}
.info-defect-service-conclution {
  flex-direction: column;
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
}
.text-area-close-service {
  max-width: 98%;
  min-width: 98%;
  max-height: 80px;
  min-height: 80px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d7d7d7;
  color: #1f1f1f;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.text-area-close-service:focus {
  outline: none;
  border-color: #d32f2f;
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.15);
}
.input-search-medium-width {
  width: 240px;
  max-width: 240px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d7d7d7;
  color: #1f1f1f;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input-search-medium-width:focus {
  outline: none;
  border-color: #d32f2f;
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.15);
}
.input-search-medium-width:disabled {
  background: #f3f3f3;
  color: #7b7b7b;
  cursor: not-allowed;
}
.cancel-button,
.button-secundary-big,
.button-tertiary-fat-with-margin,
.button-primary-big-width-margin {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.2s ease;
}
.cancel-button {
  background: #bdbdbd;
  color: #1f1f1f;
}
.button-secundary-big {
  background: #d32f2f;
  color: #ffffff;
}
.button-tertiary-fat-with-margin {
  margin-top: 8px;
  background: #f4f4f4;
  color: #1f1f1f;
  border: 1px solid #d7d7d7;
}
.button-primary-big-width-margin {
  margin-top: 8px;
  background: #d32f2f;
  color: #ffffff;
}
.cancel-button:hover,
.button-secundary-big:hover,
.button-tertiary-fat-with-margin:hover,
.button-primary-big-width-margin:hover {
  filter: brightness(0.95);
}
.cancel-button:active,
.button-secundary-big:active,
.button-tertiary-fat-with-margin:active,
.button-primary-big-width-margin:active {
  transform: translateY(1px);
}
.null-state-force {
  width: 100vw;
  margin-top: 30vh;
  height: 60vh;
  justify-content: center;
  align-items: center;
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
}
.autocomplete-dropdown {
  position: absolute;
  width: 30vw;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  z-index: 15;
  margin-top: 4vh;
}
.autocomplete-item {
  padding: 8px;
  cursor: pointer;
}
.autocomplete-item:hover {
  background-color: #f2f2f2;
}
`;