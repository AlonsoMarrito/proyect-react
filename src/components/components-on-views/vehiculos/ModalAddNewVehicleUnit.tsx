import React, { useEffect, useState, type CSSProperties } from "react";
import Swal from "sweetalert2";
import { createNewVehicle } from "../../scripts/vehicle/generalInfoVehicle/getVehicles";
import type { VehicleTypeModalTheme } from "./ModalAddTypeVehicle";

const FALLBACK: VehicleTypeModalTheme = {
  textColorPrimary: "#1a1d21",
  panelBg: "#ffffff",
  panelBorder: "rgba(15, 23, 42, 0.09)",
  panelShadow:
    "0 4px 6px rgba(15, 23, 42, 0.04), 0 14px 36px rgba(15, 23, 42, 0.09)",
  accent: "#D32F2F",
  accentMuted: "rgba(211, 47, 47, 0.1)",
  tableHeadBg: "#37474f",
  mutedText: "#546e7a",
  inputBorder: "#cfd8dc",
};

const PHOTO_KEYS = ["front", "back", "right", "left", "top"] as const;
const PHOTO_LABELS: Record<(typeof PHOTO_KEYS)[number], string> = {
  front: "Frontal",
  back: "Trasero",
  right: "Derecha",
  left: "Izquierda",
  top: "Superior",
};

type Props = {
  onClose: () => void;
  theme?: VehicleTypeModalTheme;
  typeId: number;
  typeWord: string;
  onCreated?: () => void | Promise<void>;
};

export default function ModalAddNewVehicleUnit({
  onClose,
  theme: themeProp,
  typeId,
  typeWord,
  onCreated,
}: Props) {
  const theme = themeProp ?? FALLBACK;
  const [saving, setSaving] = useState(false);

  const [unit, setUnit] = useState("");
  const [plates, setPlates] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("");
  const [kmCurrent, setKmCurrent] = useState("");
  const [kmService, setKmService] = useState("");

  const [photos, setPhotos] = useState<
    Record<(typeof PHOTO_KEYS)[number], File | null>
  >({
    front: null,
    back: null,
    right: null,
    left: null,
    top: null,
  });
  const [previews, setPreviews] = useState<
    Record<(typeof PHOTO_KEYS)[number], string | null>
  >({
    front: null,
    back: null,
    right: null,
    left: null,
    top: null,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  useEffect(() => {
    return () => {
      PHOTO_KEYS.forEach((k) => {
        const u = previews[k];
        if (u) URL.revokeObjectURL(u);
      });
    };
  }, [previews]);

  const handlePhoto =
    (key: (typeof PHOTO_KEYS)[number]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setPhotos((p) => ({ ...p, [key]: f }));
      setPreviews((prev) => {
        const old = prev[key];
        if (old) URL.revokeObjectURL(old);
        return { ...prev, [key]: URL.createObjectURL(f) };
      });
    };

  const field: CSSProperties = {
    flex: "1 1 200px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: `1px solid ${theme.inputBorder}`,
    fontSize: "14px",
    color: theme.textColorPrimary,
    background: theme.panelBg,
    boxSizing: "border-box",
    minWidth: 0,
  };

  const handleBackdrop = (ev: React.MouseEvent) => {
    if (ev.target === ev.currentTarget && !saving) onClose();
  };

  const submit = async () => {
    if (!unit.trim() || !plates.trim() || !typeId) {
      void Swal.fire({
        icon: "warning",
        title: "Faltan datos",
        text: "Unidad, placas y tipo son obligatorios.",
        confirmButtonColor: theme.accent,
      });
      return;
    }
    if (!status) {
      void Swal.fire({
        icon: "warning",
        title: "Selecciona estatus",
        confirmButtonColor: theme.accent,
      });
      return;
    }

    const formData = new FormData();
    formData.append("unit", unit.trim());
    formData.append("plates", plates.trim());
    formData.append("brand", brand.trim());
    formData.append("model", model.trim());
    formData.append("status", status);
    formData.append("kmCurrent", kmCurrent.trim());
    formData.append("kmService", kmService.trim());
    formData.append("type_id", String(typeId));
    formData.append("type_word", typeWord);
    formData.append("date_register", new Date().toISOString());

    Object.values(photos).forEach((file) => {
      if (file) formData.append("files", file);
    });

    setSaving(true);
    try {
      await createNewVehicle(formData);
      await onCreated?.();
      onClose();
    } catch (e) {
      console.error(e);
      void Swal.fire({
        icon: "error",
        title: "No se pudo registrar el vehículo",
        confirmButtonColor: theme.accent,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(6px)",
        zIndex: 1200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
      onMouseDown={handleBackdrop}
      role="presentation"
    >
      <div
        style={{
          width: "min(820px, 100%)",
          maxHeight: "92vh",
          overflow: "auto",
          borderRadius: "18px",
          padding: "1.25rem",
          background: theme.panelBg,
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: theme.panelShadow,
          color: theme.textColorPrimary,
          boxSizing: "border-box",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-new-unit-title"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <h2
            id="modal-new-unit-title"
            style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}
          >
            Registrar vehículo
          </h2>
          <button
            type="button"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              border: `2px solid ${theme.inputBorder}`,
              background: "rgba(255,255,255,0.96)",
              fontSize: "22px",
              lineHeight: 1,
              cursor: "pointer",
              color: theme.mutedText,
            }}
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <p style={{ margin: "0 0 12px", fontSize: "13px", color: theme.mutedText }}>
          Tipo: <strong style={{ color: theme.textColorPrimary }}>{typeWord}</strong>
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <input
            style={field}
            placeholder="Número de unidad"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            disabled={saving}
          />
          <input
            style={field}
            placeholder="Placas"
            value={plates}
            onChange={(e) => setPlates(e.target.value)}
            disabled={saving}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <input
            style={field}
            placeholder="Marca"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            disabled={saving}
          />
          <input
            style={field}
            placeholder="Modelo"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={saving}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <select
            style={{ ...field, cursor: "pointer" }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
          >
            <option value="">Estatus</option>
            <option value="operativa">Operativa</option>
            <option value="taller">Taller</option>
            <option value="in-operativa">In-operativa</option>
          </select>
          <input
            style={field}
            placeholder="Kilometraje actual"
            value={kmCurrent}
            onChange={(e) => setKmCurrent(e.target.value)}
            disabled={saving}
          />
          <input
            style={field}
            placeholder="Km para servicio"
            value={kmService}
            onChange={(e) => setKmService(e.target.value)}
            disabled={saving}
          />
        </div>

        <p
          style={{
            margin: "12px 0 8px",
            fontSize: "12px",
            fontWeight: 700,
            color: theme.mutedText,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Imágenes (opcional)
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            justifyContent: "center",
            marginBottom: "12px",
          }}
        >
          {PHOTO_KEYS.map((key) => (
            <div
              key={key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                width: "140px",
              }}
            >
              <input
                type="file"
                accept="image/*"
                id={`veh-photo-${key}`}
                style={{ display: "none" }}
                onChange={handlePhoto(key)}
                disabled={saving}
              />
              <label
                htmlFor={`veh-photo-${key}`}
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: theme.accent,
                  cursor: saving ? "not-allowed" : "pointer",
                  textAlign: "center",
                }}
              >
                {PHOTO_LABELS[key]}
              </label>
              <div
                style={{
                  width: "100%",
                  height: "100px",
                  borderRadius: "10px",
                  border: `1px dashed ${theme.inputBorder}`,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.accentMuted,
                }}
              >
                {previews[key] ? (
                  <img
                    src={previews[key]!}
                    alt=""
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "11px", color: theme.mutedText }}>
                    —
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "8px",
            paddingTop: "12px",
            borderTop: `1px solid ${theme.panelBorder}`,
          }}
        >
          <button
            type="button"
            style={{
              padding: "11px 18px",
              borderRadius: "12px",
              border: `2px solid ${theme.inputBorder}`,
              background: theme.panelBg,
              color: theme.textColorPrimary,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
            }}
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            style={{
              padding: "11px 22px",
              borderRadius: "12px",
              border: "none",
              color: "#fff",
              fontWeight: 700,
              cursor: saving ? "wait" : "pointer",
              background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.tableHeadBg} 100%)`,
              boxShadow: `0 4px 14px ${theme.accentMuted}`,
              opacity: saving ? 0.85 : 1,
            }}
            onClick={() => void submit()}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar vehículo"}
          </button>
        </div>
      </div>
    </div>
  );
}
