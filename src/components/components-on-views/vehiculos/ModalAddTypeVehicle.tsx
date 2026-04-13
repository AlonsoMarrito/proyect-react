import React, { useEffect, useState, type CSSProperties } from "react";
import Swal from "sweetalert2";
import { createNewVehicle as createNewVehicleType } from "../../scripts/vehicle/typeToVehicle/typeToVehicle";

export type VehicleTypeModalTheme = {
  textColorPrimary: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  accent: string;
  accentMuted: string;
  tableHeadBg: string;
  mutedText: string;
  inputBorder: string;
};

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

type Props = {
  onClose: () => void;
  theme?: VehicleTypeModalTheme;
  onCreated?: () => void | Promise<void>;
};

export default function ModalAddTypeVehicle({
  onClose,
  theme: themeProp,
  onCreated,
}: Props) {
  const theme = themeProp ?? FALLBACK;
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const handleBackdrop = (ev: React.MouseEvent) => {
    if (ev.target === ev.currentTarget && !saving) onClose();
  };

  const submit = async () => {
    const n = name.trim();
    if (!n) {
      void Swal.fire({
        icon: "warning",
        title: "Nombre requerido",
        confirmButtonColor: theme.accent,
      });
      return;
    }
    if (!file) {
      void Swal.fire({
        icon: "warning",
        title: "Selecciona una imagen",
        confirmButtonColor: theme.accent,
      });
      return;
    }

    setSaving(true);
    try {
      await createNewVehicleType(n, file);
      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Tipo de vehículo creado",
        showConfirmButton: false,
        timer: 2000,
      });
      await onCreated?.();
      onClose();
    } catch (e) {
      console.error(e);
      void Swal.fire({
        icon: "error",
        title: "No se pudo crear el tipo",
        confirmButtonColor: theme.accent,
      });
    } finally {
      setSaving(false);
    }
  };

  const field: CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: `1px solid ${theme.inputBorder}`,
    fontSize: "14px",
    color: theme.textColorPrimary,
    background: theme.panelBg,
    boxSizing: "border-box",
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
          width: "min(480px, 100%)",
          maxHeight: "90vh",
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
        aria-modal="true"
        aria-labelledby="modal-new-vehicle-type-title"
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
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: theme.mutedText,
              }}
            >
              Catálogo
            </p>
            <h2
              id="modal-new-vehicle-type-title"
              style={{ margin: "6px 0 0", fontSize: "1.2rem", fontWeight: 800 }}
            >
              Nuevo tipo de vehículo
            </h2>
          </div>
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

        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            color: theme.mutedText,
            marginBottom: "6px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Nombre del tipo
        </label>
        <input
          style={{ ...field, marginBottom: "14px" }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Ambulancia, Pipa…"
          disabled={saving}
        />

        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="vehicle-type-file"
          onChange={handleFile}
          disabled={saving}
        />
        <label
          htmlFor="vehicle-type-file"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: "12px",
            border: `2px solid ${theme.accent}`,
            color: theme.accent,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            marginBottom: "12px",
          }}
        >
          Seleccionar imagen
        </label>

        {preview && (
          <img
            src={preview}
            alt="Vista previa"
            style={{
              width: "100%",
              maxHeight: "200px",
              objectFit: "contain",
              borderRadius: "12px",
              marginBottom: "12px",
            }}
          />
        )}

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
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
