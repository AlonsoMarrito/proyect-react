import { useEffect, useState } from "react";

import { getPreferences } from "../scripts/preference/getPreference";

/**
 * Soporte interno (solo accesible vía menú Dev → Soporte).
 * Amplía aquí tickets, FAQ interno o enlaces a herramientas internas.
 */
export default function DevSoporteInternoView(_props: { user?: unknown }) {
  const [styleColor, setStyleColor] = useState(0);

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
    })();
  }, []);

  const accent = styleColor === 1 ? "#c62828" : "#D32F2F";

  return (
    <div
      style={{
        padding: "1.5rem clamp(1rem, 4vw, 2rem)",
        maxWidth: "720px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ marginTop: 0, color: accent }}>Soporte interno</h1>
      <p style={{ lineHeight: 1.65, color: "#37474f" }}>
        Área de soporte dentro de la aplicación (usuarios dev). Aquí puedes enlazar procesos,
        contactos internos o herramientas propias del equipo.
      </p>
    </div>
  );
}
