import React, { useEffect } from "react";

/** Debe quedar por encima del SideBar (`App.jsx` ~10100) y del menú dev (~10200). */
const Z_BACKDROP = 12000;
const Z_PANEL = 12001;

type Theme = {
  primary: string;
  secondary: string;
  borderBottomDecoration: string;
  panelBg: string;
  mutedText: string;
  overlay: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onLogout: () => void | Promise<void>;
  theme: Theme;
  userLabel: string;
  /** Índice de paleta (0 claro, 1 rojo intenso) para variar sombras */
  styleColor: number;
  logoutBusy?: boolean;
};

export default function UserMenuDrawer({
  open,
  onClose,
  onLogout,
  theme,
  userLabel,
  styleColor,
  logoutBusy = false,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: Z_BACKDROP,
          background: theme.overlay,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          cursor: "pointer",
        }}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-menu-title"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: Z_PANEL,
          width: "min(320px, 92vw)",
          height: "100dvh",
          maxHeight: "100dvh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          background: theme.panelBg,
          boxShadow:
            styleColor === 1
              ? "-12px 0 40px rgba(183, 28, 28, 0.18)"
              : "-12px 0 40px rgba(15, 23, 42, 0.12)",
          borderLeft: `4px solid ${theme.primary}`,
          animation: "userDrawerSlideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        <style>
          {`
            @keyframes userDrawerSlideIn {
              from { transform: translateX(100%); opacity: 0.96; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}
        </style>

        <div
          style={{
            padding: "18px 18px 14px",
            background: `linear-gradient(165deg, ${theme.primary} 0%, ${theme.borderBottomDecoration} 100%)`,
            color: theme.secondary,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              id="user-menu-title"
              style={{
                margin: 0,
                fontSize: "11px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                opacity: 0.92,
                fontWeight: 600,
              }}
            >
              Menú de cuenta
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "1rem",
                fontWeight: 700,
                lineHeight: 1.35,
                wordBreak: "break-word",
              }}
            >
              {userLabel || "Usuario"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              flexShrink: 0,
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: `2px solid rgba(255,255,255,0.35)`,
              background: "rgba(255,255,255,0.12)",
              color: theme.secondary,
              fontSize: "1.25rem",
              lineHeight: 1,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <p style={{ margin: "0 0 4px", fontSize: "13px", color: theme.mutedText, lineHeight: 1.45 }}>
            Opciones rápidas. Cerrar sesión invalida la sesión en el servidor y limpia datos locales.
          </p>

          <button
            type="button"
            disabled={logoutBusy}
            onClick={() => {
              void onLogout();
            }}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "none",
              cursor: logoutBusy ? "wait" : "pointer",
              fontWeight: 800,
              fontSize: "0.95rem",
              color: theme.secondary,
              background: `linear-gradient(165deg, ${theme.primary} 0%, ${theme.borderBottomDecoration} 100%)`,
              boxShadow: "0 4px 14px rgba(211, 47, 47, 0.35)",
              opacity: logoutBusy ? 0.85 : 1,
            }}
          >
            {logoutBusy ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
        </div>

        <div
          style={{
            padding: "12px 16px 18px",
            borderTop: `1px solid rgba(0,0,0,0.06)`,
            fontSize: "11px",
            color: theme.mutedText,
            textAlign: "center",
          }}
        >
          RUSO-IT
        </div>
      </aside>
    </>
  );
}
