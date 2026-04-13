import React, { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import { getPreferences } from "../scripts/preference/getPreference";
import {
  getAllTypeToVehicle,
  getTypeVehicle,
} from "../scripts/vehicle/generalInfoVehicle/getVehicles";
import dumieImg from "../../assets/vehiclesUnitImg/dumie.png";

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

type VehicleData = Record<string, unknown> | null;

const TABS = [
  { id: 1, label: "Información general" },
  { id: 2, label: "Bitácora de recepción" },
  { id: 3, label: "Mantenimiento e incidentes" },
] as const;

/** Panel de vistas del vehículo (+20% sobre la versión anterior) */
const vehiclePhotoPanelBase: CSSProperties = {
  flex: "2 1 432px",
  display: "flex",
  flexWrap: "nowrap",
  gap: "12px",
  justifyContent: "center",
  alignItems: "center",
  maxHeight: "min(432px, 62vh)",
  minHeight: 0,
  padding: "12px",
  boxSizing: "border-box",
  overflow: "hidden",
};

const imgTopView: CSSProperties = {
  flex: "0 0 auto",
  width: "28%",
  minWidth: "106px",
  maxWidth: "32%",
  maxHeight: "min(384px, 53vh)",
  height: "auto",
  objectFit: "contain",
};

const imgStackPair: CSSProperties = {
  width: "100%",
  maxHeight: "min(182px, 24vh)",
  height: "auto",
  objectFit: "contain",
};

const colStack: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  justifyContent: "center",
  minWidth: 0,
  flex: "1 1 0",
  maxHeight: "100%",
};

export default function VehicleMenuView(_props: { user?: unknown }) {
  const { numberVehicle: numberParam } = useParams();
  const numberVehicle = numberParam
    ? decodeURIComponent(String(numberParam))
    : "";

  const [styleColor, setStyleColor] = useState(0);
  const [tab, setTab] = useState(1);
  const [vehicle, setVehicle] = useState<VehicleData>(null);
  const [typeName, setTypeName] = useState("");
  const [loading, setLoading] = useState(true);

  const theme = colorApss[styleColor] ?? colorApss[0];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!numberVehicle) {
        setVehicle(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const v = await getTypeVehicle(numberVehicle);
      if (cancelled) return;
      if (!v || typeof v !== "object") {
        setVehicle(null);
        setLoading(false);
        return;
      }
      setVehicle(v);
      const types = await getAllTypeToVehicle();
      const idType = (v as { id_type?: number }).id_type;
      const t = Array.isArray(types)
        ? types.find((x: { id?: number }) => x.id === idType)
        : null;
      setTypeName(t?.type != null ? String(t.type) : "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [numberVehicle]);

  const img = (key: string) => {
    const u = vehicle?.[key];
    return typeof u === "string" && u.length > 0 ? u : dumieImg;
  };

  const damageSoon = (label: string) => {
    void Swal.fire({
      icon: "info",
      title: label,
      text: "Módulo de inspección: conectar con el backend (original Vue).",
      confirmButtonColor: theme.accent,
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
          background: theme.pageBg,
          color: theme.textColorPrimary,
        }}
      >
        Cargando unidad…
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
          background: theme.pageBg,
          color: theme.textColorPrimary,
        }}
      >
        <p>No se encontró la unidad.</p>
        <Link to="/typeToVehicles" style={{ color: theme.accent, fontWeight: 700 }}>
          Volver
        </Link>
      </div>
    );
  }

  const plates = String(
    (vehicle as { vehicle_license_plates?: string }).vehicle_license_plates ??
      ""
  );
  const km = String((vehicle as { kilometers?: unknown }).kilometers ?? "");

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "0.75rem clamp(0.75rem, 2vw, 1.25rem)",
        boxSizing: "border-box",
        background: theme.pageBg,
        color: theme.textColorPrimary,
      }}
    >
      <style>
        {`
          @media (max-width: 800px) {
            .veh-menu-tabs-desktop { display: none !important; }
            .veh-menu-tabs-mobile { display: flex !important; }
          }
          @media (min-width: 801px) {
            .veh-menu-tabs-mobile { display: none !important; }
          }
        `}
      </style>

      <div
        className="veh-menu-tabs-desktop"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          maxWidth: "min(1680px, 98vw)",
          margin: "0 auto 8px",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "2px solid transparent",
              borderBottom:
                tab === t.id ? `2px solid ${theme.accent}` : "2px solid transparent",
              background: theme.panelBg,
              color: theme.textColorPrimary,
              fontWeight: tab === t.id ? 800 : 600,
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            {t.label}
          </button>
        ))}
        {typeName && (
          <Link
            to={`/typeToVehicles/${encodeURIComponent(typeName)}`}
            style={{
              marginLeft: "12px",
              padding: "8px 14px",
              borderRadius: "10px",
              border: `2px solid ${theme.inputBorder}`,
              color: theme.accent,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Volver
          </Link>
        )}
      </div>

      <div
        className="veh-menu-tabs-mobile"
        style={{
          display: "none",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "min(1680px, 98vw)",
          margin: "0 auto 12px",
        }}
      >
        <Link
          to={
            typeName
              ? `/typeToVehicles/${encodeURIComponent(typeName)}`
              : "/typeToVehicles"
          }
          style={{
            padding: "10px",
            textAlign: "center",
            borderRadius: "10px",
            border: `2px solid ${theme.inputBorder}`,
            color: theme.accent,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Volver
        </Link>
        <select
          value={tab}
          onChange={(e) => setTab(Number(e.target.value))}
          style={{
            padding: "12px",
            fontSize: "16px",
            borderRadius: "10px",
            border: `2px solid ${theme.inputBorder}`,
            color: theme.textColorPrimary,
            background: theme.panelBg,
          }}
        >
          {TABS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          maxWidth: "min(1680px, 98vw)",
          margin: "0 auto 12px",
          padding: "12px 0",
          borderTop: `3px solid ${theme.accentMuted}`,
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>
          U-{numberVehicle}
        </h1>
        <h2
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: theme.mutedText,
          }}
        >
          Estatus:{" "}
          <span style={{ color: theme.textColorPrimary }}>
            {String((vehicle as { status?: string }).status ?? "—")}
          </span>
        </h2>
      </div>

      <div
        style={{
          maxWidth: "min(1680px, 98vw)",
          margin: "0 auto",
        }}
      >
        {tab === 1 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                ...vehiclePhotoPanelBase,
                background: theme.panelBg,
                border: `1px solid ${theme.panelBorder}`,
                borderRadius: "16px",
                boxShadow: theme.panelShadow,
              }}
            >
              <img
                src={img("up_img")}
                alt="Superior"
                style={imgTopView}
              />
              <div style={{ ...colStack, width: "34%", minWidth: "115px" }}>
                <img
                  src={img("cover_img")}
                  alt="Lateral"
                  style={imgStackPair}
                />
                <img
                  src={img("left_img")}
                  alt="Izquierda"
                  style={imgStackPair}
                />
              </div>
              <div style={{ ...colStack, width: "28%", minWidth: "96px" }}>
                <img
                  src={img("front_img")}
                  alt="Frente"
                  style={imgStackPair}
                />
                <img
                  src={img("back_img")}
                  alt="Trasera"
                  style={imgStackPair}
                />
              </div>
            </div>

            <div
              style={{
                flex: "1 1 260px",
                background: theme.panelBg,
                border: `1px solid ${theme.panelBorder}`,
                borderRadius: "16px",
                padding: "1rem",
                boxShadow: theme.panelShadow,
              }}
            >
              <p style={{ margin: "0 0 8px", color: theme.mutedText, fontSize: "13px" }}>
                {new Date().toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p style={{ margin: "8px 0", fontWeight: 700 }}>
                Placas: {plates || "—"}
              </p>
              <p style={{ margin: "8px 0 16px", fontWeight: 700 }}>
                Kilometraje: {km || "—"}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {[
                  "Luces",
                  "Carrocería",
                  "Tapones fluidos",
                  "Estado de llantas",
                  "Arranque de motor",
                  "Herramientas y equipos",
                ].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => damageSoon(label)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: `2px solid ${theme.inputBorder}`,
                      background: theme.accentMuted,
                      color: theme.textColorPrimary,
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 2 && (
          <PanelPlaceholder
            theme={theme}
            title="Bitácora de recepción"
            text="Aquí se listan los registros de recepción de la unidad (conecta la API como en el proyecto Vue)."
          />
        )}

        {tab === 3 && (
          <PanelPlaceholder
            theme={theme}
            title="Mantenimiento e incidentes"
            text="Bitácora de servicio, mantenimiento e incidentes (misma API que `serviceAndDangersVehicle.vue`)."
          />
        )}
      </div>
    </div>
  );
}

function PanelPlaceholder({
  theme,
  title,
  text,
}: {
  theme: PageTheme;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: theme.panelBg,
        border: `1px solid ${theme.panelBorder}`,
        borderRadius: "16px",
        padding: "1.5rem",
        boxShadow: theme.panelShadow,
        minHeight: "200px",
      }}
    >
      <h3 style={{ margin: "0 0 10px", color: theme.textColorPrimary }}>{title}</h3>
      <p style={{ margin: 0, color: theme.mutedText, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}
