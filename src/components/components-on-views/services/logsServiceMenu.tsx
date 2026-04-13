import { useEffect, useRef, useState } from "react";
import modalReportDamage from "../vehiculos/modalReportDamage";
import modalChangeDatasToService from "../vehiculos/modalChangeDatasToService";

import {
  getAllTypeServices,
  getLastOnServicesHistory,
  getOneServicesHistory,
} from "../../scripts/history/getAllHistory";

import {
  getKilometerTypeVehicle,
  getVehicleById,
} from "../../scripts/vehicle/generalInfoVehicle/getVehicles";

import {
  getWorkForceByDayForService,
  getWorkForceByDayAndUser,
  puzzleForWorkForce,
} from "../../scripts/workforce/getPersonal";

import { getAllTypeToServices } from "../../scripts/typeToServices/getTypeToServices";
import { authUser } from "../../scripts/user/logIn";
import { getServiceActiveByUnid } from "../../scripts/history/getServiceByUnid";
import {
  addedSumaryService,
  closeDataNewService,
  createNewService,
  updateDataNewService,
} from "../../scripts/history/addNewService";

import { getAllColognes } from "../../scripts/colognes/getColognes";
import { createSummaryService } from "../../scripts/history/summaryService";
import { getUserById } from "../../scripts/user/getUser";

export default function LogsServiceVehicle() {
  const [serviceStatus, setServiceStatus] = useState("Close");
  const [modalReportDamage, setModalReportDamage] = useState(0);
  const [modalReportChangeValue, setModalReportChangeValue] = useState(0);

  const [selectEstatus, setSelectEstatus] = useState("nulo");

  const [NoConsecutive, setNoConsecutive] = useState(0);
  const [dataVehicle, setDataVehicle] = useState({});
  const [workForceOnService, setWorkForceOnService] = useState({
    fullTripulation: [],
  });

  const [typeServices, setTypeServices] = useState([]);
  const [filteredTypeServices, setFilteredTypeServices] = useState([]);

  const [allColognes, setAllColognes] = useState([]);
  const [filteredColognes, setFilteredColognes] = useState([]);

  const [searchTypeService, setSearchTypeService] = useState("");
  const [searchCologne, setSearchCologne] = useState("");

  const [typeServiceSelected, setTypeServiceSelected] = useState(null);
  const [cologneSelected, setCologneSelected] = useState(null);

  const [folioWrite, setFolioWrite] = useState("");
  const [streetAndNumber, setStreetAndNumber] = useState("");
  const [crossWrite, setCrossWrite] = useState("");
  const [reporterWrite, setReporterWrite] = useState("");
  const [phoneWrite, setPhoneWrite] = useState("");

  const [typeClose, setTypeClose] = useState("");
  const [generalConclusion, setGeneralConclusion] = useState("");
  const [closeKilometers, setCloseKilometers] = useState("");

  const [nullService, setNullService] = useState(false);

  const typeRef = useRef();
  const cologneRef = useRef();

  // ===== INIT =====
  useEffect(() => {
    const init = async () => {
      const types = await getAllTypeToServices();
      setTypeServices(types);
      setFilteredTypeServices(types);

      const colognes = await getAllColognes();
      setAllColognes(colognes);
      setFilteredColognes(colognes);

      const token = getCookie("access_token");
      const user = await authUser(token);

      const today = new Date().toISOString().split("T")[0];

      const workforce = await getWorkForceByDayForService(
        today,
        user.employees.id_work_shift,
        user.id
      );

      if (!workforce) {
        setNullService(false);
        return;
      }

      setNullService(true);

      const vehicle = await getVehicleById(workforce.id_vehicle);
      const serviceActive = await getServiceActiveByUnid(workforce.id_vehicle);

      if (serviceActive) {
        setNoConsecutive(await getLastOnServicesHistory());
      } else {
        setNoConsecutive((await getLastOnServicesHistory()) + 1);
      }

      const kmData = await getKilometerTypeVehicle(vehicle.number_unit);
      setDataVehicle(kmData);

      const puzzle = await getWorkForceByDayAndUser(today, kmData.idUnit);
      const result = await puzzleForWorkForce(puzzle);

      if (result?.length) {
        setWorkForceOnService(result[0]);
      }
    };

    init();
  }, []);

  // ===== TYPE SERVICE FILTER =====
  const filterTypeServices = (value) => {
    setSearchTypeService(value);
    setFilteredTypeServices(
      typeServices.filter((t) =>
        t.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const selectTypeService = (item) => {
    setSearchTypeService(item.name);
    setTypeServiceSelected(item.id);
  };

  // ===== COLOGNE FILTER =====
  const filterColognes = (value) => {
    setSearchCologne(value);
    setFilteredColognes(
      allColognes.filter((c) =>
        c.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const selectCologne = (item) => {
    setSearchCologne(item.name);
    setCologneSelected(item.id);
  };

  // ===== STATUS FLOW =====
  const changeStatusService = async (status) => {
    switch (status) {
      case 1:
        setServiceStatus("Open");
        setSelectEstatus("EN CURSO");

        if (!typeServiceSelected) {
          const tripulation = workForceOnService.fullTripulation.map((m) => ({
            id_user: Number(m.id),
            position_on_service:
              m.position === "CONDUCTOR" ? "chofer" : "apoyo",
          }));

          await createNewService({
            status: "en curso",
            vehicle_id: dataVehicle.idUnit,
            personal_on_a_service: tripulation,
          });
        }
        break;

      case 2:
        setServiceStatus("Start");
        break;

      case 3:
        await closeDataNewService(NoConsecutive, {
          close_type: typeClose,
          general_and_conclusion: generalConclusion,
          close_kilometers: Number(closeKilometers),
          status: selectEstatus.toLowerCase(),
        });

        setServiceStatus("Close");
        break;

      case 4:
        setServiceStatus("Close");
        setSelectEstatus("Pendiente a Reasignacion");
        break;
    }
  };

  if (!nullService) {
    return (
      <div className="null-state-force">
        <h1>NO ESTAS ASIGNADO EN EL ESTADO DE FUERZA</h1>
      </div>
    );
  }

  return (
    <div className="body-logs-service">
      {/* MODALES */}
      {modalReportDamage === 1 && <modalReportDamage />}
      {modalReportChangeValue === 1 && <modalChangeDatasToService />}

      {/* FORM */}
      <div className="open-new-service">
        <button onClick={() => changeStatusService(4)}>
          Cancelar Servicio
        </button>

        <input
          value={dataVehicle.number_unit || ""}
          onChange={(e) =>
            setDataVehicle({ ...dataVehicle, number_unit: e.target.value })
          }
        />

        {workForceOnService.fullTripulation.map((m, i) => (
          <input
            key={i}
            value={m.name || ""}
            onChange={() => {}}
          />
        ))}

        <button onClick={() => changeStatusService(1)}>
          Abrir Servicio
        </button>
      </div>

      {/* TYPE SERVICE */}
      <input
        value={searchTypeService}
        onChange={(e) => filterTypeServices(e.target.value)}
      />
      {filteredTypeServices.map((item) => (
        <div key={item.id} onClick={() => selectTypeService(item)}>
          {item.name}
        </div>
      ))}

      {/* COLOGNE */}
      <input
        value={searchCologne}
        onChange={(e) => filterColognes(e.target.value)}
      />
      {filteredColognes.map((item) => (
        <div key={item.id} onClick={() => selectCologne(item)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}

// ===== COOKIE =====
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}