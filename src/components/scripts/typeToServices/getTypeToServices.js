const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

const fetchOpts = { credentials: "include" };

export async function getAllTypeToServices() {
  try {
    const response = await fetch(`${API_URL}/type-services`, fetchOpts);
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }
    const typeService = await response.json();
    return Array.isArray(typeService) ? typeService : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}
