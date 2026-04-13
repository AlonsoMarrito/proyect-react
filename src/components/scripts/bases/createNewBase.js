const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL;

/**
 * Crea una base o garza (POST /bases).
 * Campos alineados con el modelo usado en la app Vue / detalle de base.
 */
export async function createNewBase(payload) {
  const response = await fetch(`${API_URL}/bases`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(errText || `Error ${response.status}`);
  }

  return response.json();
}
