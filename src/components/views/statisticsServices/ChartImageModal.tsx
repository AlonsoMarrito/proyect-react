import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title: string;
  fileName: string;
  theme: {
    textColorPrimary: string;
    panelBorder: string;
    accent: string;
    mutedText: string;
  };
};

export default function ChartImageModal({
  open,
  onClose,
  imageUrl,
  title,
  fileName,
  theme,
}: Props) {
  if (!open) return null;

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = fileName.replace(/[/\\?%*:|"<>]/g, "-");
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chart-image-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10050,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        boxSizing: "border-box",
      }}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "min(680px, 100%)",
          maxHeight: "min(92vh, 900px)",
          overflow: "hidden",
          background: "#fff",
          borderRadius: 12,
          padding: "12px 14px 14px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          border: `1px solid ${theme.panelBorder}`,
          boxSizing: "border-box",
        }}
      >
        <h3
          id="chart-image-modal-title"
          style={{
            margin: "0 0 10px",
            fontSize: "0.8125rem",
            fontWeight: 800,
            color: theme.textColorPrimary,
            lineHeight: 1.35,
            flexShrink: 0,
            paddingRight: 8,
            wordBreak: "break-word",
          }}
        >
          {title}
        </h3>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px 0 8px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              style={{
                display: "block",
                maxWidth: "100%",
                width: "auto",
                height: "auto",
                maxHeight: "min(68vh, 720px)",
                objectFit: "contain",
                borderRadius: 8,
                border: `1px solid ${theme.panelBorder}`,
              }}
            />
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: theme.mutedText,
                lineHeight: 1.45,
              }}
            >
              Sin vista previa.
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
            flexShrink: 0,
            paddingTop: 4,
            borderTop: `1px solid ${theme.panelBorder}`,
            marginTop: 4,
          }}
        >
          <button
            type="button"
            onClick={handleDownload}
            disabled={!imageUrl}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "none",
              fontWeight: 800,
              fontSize: 10,
              cursor: imageUrl ? "pointer" : "not-allowed",
              background: theme.accent,
              color: "#fff",
              opacity: imageUrl ? 1 : 0.5,
              lineHeight: 1.35,
            }}
          >
            Descargar PNG
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${theme.panelBorder}`,
              fontWeight: 700,
              fontSize: 10,
              cursor: "pointer",
              background: "#fff",
              color: theme.textColorPrimary,
              lineHeight: 1.35,
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
