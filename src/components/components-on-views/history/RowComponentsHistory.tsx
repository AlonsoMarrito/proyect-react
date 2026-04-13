import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getPreferences } from "../../scripts/preference/getPreference.js";
import { getAllInformationToVehicle } from "../../scripts/vehicle/generalInfoVehicle/getVehicles";
import { getAllUser } from "../../scripts/user/getUser";
import { getAllTypeToServices } from "../../scripts/typeToServices/getTypeToServices";
import { getAllColognes } from "../../scripts/colognes/getColognes";

type Props = {
  servicesHistory: any[];
};

export default function RowHistory({ servicesHistory }: Props) {
  const [styleColor, setStyleColor] = useState(0);
  const [vehicles, setVehicles] = useState<any>({});
  const [typeService, setTypeService] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});
  const [colognes, setColognes] = useState<any[]>([]);

  const colorApss = [
    {
      primaryCardsBackground: "#fff",
      secondary: "#f5f5f5",
      borderBottomDecoration: "#D32F2F",
      textColorPrimary: "#2c2c2c",
    },
  ];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);

      setTypeService(await getAllTypeToServices());
      setColognes(await getAllColognes());

      const users = await getAllUser();
      const map: any = {};
      users.forEach((u: any) => {
        map[u.id] = `${u.first_name} ${u.last_name}`;
      });
      setUsersMap(map);
    })();

    (async () => {
      const v = await getAllInformationToVehicle();
      const map: any = {};
      v.forEach((x: any) => (map[x.id] = x));
      setVehicles(map);
    })();
  }, []);

  const getTypeServiceName = (id: number) =>
    typeService.find((t) => t.id === id)?.name ?? "Sin tipo";

  const getCologneName = (id: number) =>
    colognes.find((c) => Number(c.id) === Number(id))?.name ?? "Sin colonia";

  const getOperator = (arr: any[]) => {
    if (!arr?.length) return "Sin unidad";
    const chofer = arr.find((p) => p.position_on_service === "chofer");
    return usersMap[chofer?.id_user] ?? "Sin unidad";
  };

  const filtered = useMemo(() => {
    return servicesHistory.filter(
      (s) => s.status?.toLowerCase() !== "en curso"
    );
  }, [servicesHistory]);

  return (
    <>
      {filtered.map((item, index) => (
        <Link
          key={item.id + index}
          to={`/sumary-service/${item.id}`}
          style={{
            ...styles.card,
            background: colorApss[styleColor].primaryCardsBackground,
            borderColor: colorApss[styleColor].borderBottomDecoration,
          }}
        >
          <div style={styles.rowTop}>
            <div>
              <h5>Folio: {item.id}</h5>
            </div>

            <div>
              <h6>Tipo:</h6>
              <p>{getTypeServiceName(item.id_type_service)}</p>
            </div>

            <div>
              <h6>Unidad:</h6>
              <p>{vehicles[item.vehicle_id]?.number_unit ?? "Sin unidad"}</p>
            </div>

            <div>
              <h6>Colonia:</h6>
              <p>{getCologneName(item.id_cologne)}</p>
            </div>

            <div>
              <h6>Fecha:</h6>
              <p>{item.date_to_open?.slice(0, 10)}</p>
            </div>
          </div>

          <div style={styles.rowBottom}>
            <div>Operador: {getOperator(item.personal_on_a_service)}</div>
            <div>Hora: {item.time_to_open?.slice(11, 19)}</div>
            <div>
              Estado: {item.status?.toUpperCase()}
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "80%",
    display: "flex",
    flexDirection: "column",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "10px",
    padding: "10px",
    textDecoration: "none",
  },
  rowTop: {
    display: "flex",
    justifyContent: "space-between",
  },
  rowBottom: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
};