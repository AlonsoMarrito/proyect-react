import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

import {
  getDatasDamages,
  getDatasNotOrBadFunction,
} from "../../scripts/vehicle/damageAndBadFunctions/getDatasNotOrBadFunction";
import { getTypeVehicle } from "../../scripts/vehicle/generalInfoVehicle/getVehicles";
import ModalEditDamageVehicle from "./ModalEditDamageVehicle";
import ScheduleAppointmentModal from "./ScheduleAppointmentModal";

type PageTheme = {
  textColorPrimary: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  accent: string;
  mutedText: string;
  tableHeadBg: string;
  inputBorder: string;
};

type DamageRow = {
  id?: number;
  type_to_damage?: string;
  damage_description?: string;
  where_is_damage?: string;
};

type Props = {
  numberVehicle: string;
  theme: PageTheme;
};

export default function ServiceAndDangersVehicleSection({ numberVehicle, theme }: Props) {
  const [tableVisibility, setTableVisibility] = useState<1 | 2>(1);
  const [badConditions, setBadConditions] = useState<Record<string, string>>({});
  const [allDataToVehicle, setAllDataToVehicle] = useState<Record<string, unknown>>({});
  const [allDamage, setAllDamage] = useState<DamageRow[]>([]);
  const [modalDamageId, setModalDamageId] = useState<number | null>(null);
  const [modalCalendar, setModalCalendar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [badRaw, vehicle, damages] = await Promise.all([
        getDatasNotOrBadFunction(numberVehicle),
        getTypeVehicle(numberVehicle),
        getDatasDamages(numberVehicle),
      ]);
      if (cancelled) return;

      const bad =
        badRaw &&
        typeof badRaw === "object" &&
        !Array.isArray(badRaw) &&
        !(badRaw instanceof Error)
          ? (badRaw as Record<string, string>)
          : {};
      setBadConditions(bad);

      setAllDataToVehicle(
        vehicle && typeof vehicle === "object" ? (vehicle as Record<string, unknown>) : {}
      );

      const dmgList = Array.isArray(damages) ? damages : [];
      setAllDamage(dmgList);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [numberVehicle]);

  const km = Number(allDataToVehicle.kilometers ?? NaN);
  const kmToService = Number(allDataToVehicle.kilometers_to_service ?? NaN);
  const remaining =
    Number.isFinite(km) && Number.isFinite(kmToService) ? kmToService - km : "—";
  const dateReg = allDataToVehicle.date_register
    ? new Date(String(allDataToVehicle.date_register)).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  const editBadCondition = async (value: string, key: string) => {
    const label = key.replace(/_/g, " ").toUpperCase();
    const { value: status } = await Swal.fire({
      title: `Actualizar estado de:\n${label}`,
      input: "select",
      inputOptions: {
        Óptimo: "Óptimo",
        Bueno: "Bueno",
        Malo: "Malo",
        Sin: "Sin",
        "N/A": "N/A",
      },
      inputValue: value,
      showCancelButton: true,
      confirmButtonColor: theme.accent,
    });
    if (status) {
      await Swal.fire({ title: `Estado actualizado a: ${status}`, icon: "info" });
    }
  };

  return (
    <div
      style={{
        marginTop: "8px",
        padding: "16px",
        background: theme.panelBg,
        border: `1px solid ${theme.panelBorder}`,
        borderRadius: "16px",
        boxShadow: theme.panelShadow,
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "100%",
        marginLeft: 0,
        marginRight: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setTableVisibility(1)}
          style={{
            padding: "8px 16px",
            border: "3px solid transparent",
            borderBottom:
              tableVisibility === 1 ? `3px solid ${theme.accent}` : "3px solid transparent",
            background: "transparent",
            cursor: "pointer",
            fontWeight: tableVisibility === 1 ? 800 : 600,
            color: theme.textColorPrimary,
          }}
        >
          Malas condiciones
        </button>
        <button
          type="button"
          onClick={() => setTableVisibility(2)}
          style={{
            padding: "8px 16px",
            border: "3px solid transparent",
            borderBottom:
              tableVisibility === 2 ? `3px solid ${theme.accent}` : "3px solid transparent",
            background: "transparent",
            cursor: "pointer",
            fontWeight: tableVisibility === 2 ? 800 : 600,
            color: theme.textColorPrimary,
          }}
        >
          Daños
        </button>
      </div>

      {loading ? (
        <p style={{ color: theme.mutedText, textAlign: "center" }}>Cargando…</p>
      ) : (
        <>
          <div
            style={{
              maxHeight: "min(31vh, 288px)",
              overflowY: "auto",
              marginBottom: "12px",
            }}
          >
            {tableVisibility === 2 ? (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  color: theme.textColorPrimary,
                  fontSize: "14px",
                }}
                border={1}
              >
                <thead>
                  <tr style={{ background: theme.tableHeadBg, color: "#fff" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>Tipo de daño</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Descripción</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Sección</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Editar</th>
                  </tr>
                </thead>
                <tbody>
                  {allDamage.map((info, index) => (
                    <tr key={info.id ?? index}>
                      <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                        {info.type_to_damage ?? "—"}
                      </td>
                      <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                        {info.damage_description ?? "—"}
                      </td>
                      <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                        {info.where_is_damage ?? "—"}
                      </td>
                      <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                        <button
                          type="button"
                          onClick={() => info.id != null && setModalDamageId(info.id)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "none",
                            background: theme.accent,
                            color: "#fff",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  color: theme.textColorPrimary,
                  fontSize: "14px",
                }}
                border={1}
              >
                <thead>
                  <tr style={{ background: theme.tableHeadBg, color: "#fff" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>Estado</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Nombre</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Editar</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(badConditions).length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: "12px", textAlign: "center", color: theme.mutedText }}>
                        No hay registros en mal estado (según último registro de inspección).
                      </td>
                    </tr>
                  ) : (
                    Object.entries(badConditions).map(([key, value]) => (
                      <tr key={key}>
                        <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                          {value}
                        </td>
                        <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                          {key.replace(/_/g, " ").toUpperCase()}
                        </td>
                        <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                          <button
                            type="button"
                            onClick={() => editBadCondition(String(value), key)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              border: "none",
                              background: theme.accent,
                              color: "#fff",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                color: theme.textColorPrimary,
                fontSize: "14px",
                minWidth: "720px",
              }}
              border={1}
            >
              <thead>
                <tr style={{ background: theme.tableHeadBg, color: "#fff" }}>
                  <th style={{ padding: "8px", textAlign: "left" }}>Kilometraje actual</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Kilometraje para servicio</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Kilometraje restante</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Fecha último servicio</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Estatus de la unidad</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Programar servicio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                    {String(allDataToVehicle.kilometers ?? "—")}
                  </td>
                  <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                    {String(allDataToVehicle.kilometers_to_service ?? "—")}
                  </td>
                  <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                    {remaining}
                  </td>
                  <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>{dateReg}</td>
                  <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                    <select
                      value={String(allDataToVehicle.status ?? "operativa")}
                      onChange={(e) =>
                        setAllDataToVehicle((prev) => ({ ...prev, status: e.target.value }))
                      }
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.inputBorder}`,
                        maxWidth: "140px",
                      }}
                    >
                      <option value="operativa">Operativa</option>
                      <option value="in-operativa">In-operativa</option>
                      <option value="taller">Taller</option>
                    </select>
                  </td>
                  <td style={{ padding: "8px", borderTop: `1px solid ${theme.inputBorder}` }}>
                    <button
                      type="button"
                      onClick={() => setModalCalendar(true)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: `2px solid ${theme.accent}`,
                        background: "transparent",
                        color: theme.accent,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Programar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalDamageId != null && (
        <ModalEditDamageVehicle damageId={modalDamageId} onClose={() => setModalDamageId(null)} />
      )}
      {modalCalendar && <ScheduleAppointmentModal onClose={() => setModalCalendar(false)} />}
    </div>
  );
}
