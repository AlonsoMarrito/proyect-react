import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
          }}
        >
          <div style={styles.rowTop}>
            <div style={styles.cell}>
              <h5 style={styles.folio}>Folio: {item.id}</h5>
            </div>

            <div style={styles.cell}>
              <h6 style={styles.label}>Tipo:</h6>
              <p style={styles.value}>{getTypeServiceName(item.id_type_service)}</p>
            </div>

            <div style={styles.cell}>
              <h6 style={styles.label}>Unidad:</h6>
              <p style={styles.value}>{vehicles[item.vehicle_id]?.number_unit ?? "Sin unidad"}</p>
            </div>

            <div style={styles.cell}>
              <h6 style={styles.label}>Colonia:</h6>
              <p style={styles.value}>{getCologneName(item.id_cologne)}</p>
            </div>

            <div style={styles.cell}>
              <h6 style={styles.label}>Fecha:</h6>
              <p style={styles.value}>{item.date_to_open?.slice(0, 10)}</p>
            </div>
          </div>

          <div style={styles.rowBottom}>
            <div style={styles.meta}>Operador: {getOperator(item.personal_on_a_service)}</div>
            <div style={styles.meta}>Hora: {item.time_to_open?.slice(11, 19)}</div>
            <div style={styles.meta}>Estado: {item.status?.toUpperCase()}</div>
          </div>
        </Link>
      ))}
    </>
  );
}

const textBlack = "#000000";

const styles: Record<string, CSSProperties> = {
  card: {
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    borderRadius: "12px",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    marginBottom: "14px",
    padding: "14px 16px",
    textDecoration: "none",
    color: textBlack,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  rowTop: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
  },
  cell: {
    minWidth: "min(120px, 100%)",
  },
  folio: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 700,
    color: textBlack,
  },
  label: {
    margin: "0 0 4px 0",
    fontSize: "0.7rem",
    fontWeight: 700,
    color: textBlack,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  value: {
    margin: 0,
    fontSize: "0.9rem",
    fontWeight: 500,
    color: textBlack,
    lineHeight: 1.35,
  },
  rowBottom: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
  },
  meta: {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: textBlack,
  },
};