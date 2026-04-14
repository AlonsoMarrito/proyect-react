import React, { useEffect, useState } from "react";

import { getDataDamageOneVehicle } from "../../scripts/vehicle/damageAndBadFunctions/getDatasNotOrBadFunction";
import { getUserById } from "../../scripts/user/getUser";

type Props = {
  damageId: number;
  onClose: () => void;
};

export default function ModalEditDamageVehicle({ damageId, onClose }: Props) {
  const [dataDamage, setDataDamage] = useState<Record<string, unknown> | null>(null);
  const [whoRegister, setWhoRegister] = useState<{ first_name?: string; last_name?: string }>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await getDataDamageOneVehicle(damageId);
      if (cancelled) return;
      const d =
        raw && typeof raw === "object" && !Array.isArray(raw) && !(raw instanceof Error)
          ? (raw as Record<string, unknown>)
          : null;
      setDataDamage(d);
      const driverId = d?.driver_id;
      if (driverId != null) {
        const users = await getUserById(driverId);
        const u = Array.isArray(users) ? users[0] : users;
        if (!cancelled && u && typeof u === "object") {
          setWhoRegister(u as { first_name?: string; last_name?: string });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [damageId]);

  const w = String(dataDamage?.where_is_damage ?? "");
  const photo = typeof dataDamage?.photo_damage === "string" ? dataDamage.photo_damage : "";
  const typeDamage = String(dataDamage?.type_to_damage ?? "");
  const eventDesc = String(dataDamage?.damage_event ?? "");
  const desc = String(dataDamage?.damage_description ?? "");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
        background: "rgba(255, 255, 255, 0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "min(900px, 100%)",
          maxHeight: "85vh",
          overflow: "auto",
          background: "var(--secundary, #fff)",
          border: "2px solid #c62828",
          borderRadius: "20px",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#c62828",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>
        <h2 style={{ margin: "0 0 12px", textAlign: "center" }}>
          Información del daño: {w || "—"}
        </h2>
        {!dataDamage ? (
          <p style={{ textAlign: "center" }}>Cargando…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            {photo ? (
              <img
                src={photo}
                alt="Daño"
                style={{ maxWidth: "50%", maxHeight: "240px", objectFit: "contain" }}
              />
            ) : null}
            <select
              className="select-primary-medium"
              value={typeDamage}
              disabled
              style={{ minWidth: "200px", padding: "8px" }}
            >
              <option value="Rayon">Rayon</option>
              <option value="Golpe">Golpe</option>
              <option value="Raspadura">Raspadura</option>
              <option value="Ponchadura">Ponchadura</option>
              <option value="Otros">Otros</option>
            </select>
            <input
              type="text"
              readOnly
              value={`Registro: ${whoRegister.first_name ?? ""} ${whoRegister.last_name ?? ""}`.trim()}
              style={{
                width: "min(400px, 100%)",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
            <div style={{ width: "85%" }}>
              <h3 style={{ margin: "8px 0 4px" }}>Descripción del evento</h3>
              <textarea
                readOnly
                value={eventDesc}
                style={{ width: "100%", minHeight: "80px", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ width: "85%" }}>
              <h3 style={{ margin: "8px 0 4px" }}>Descripción del daño</h3>
              <textarea
                readOnly
                value={desc}
                style={{ width: "100%", minHeight: "80px", boxSizing: "border-box" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
