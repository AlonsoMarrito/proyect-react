const API_URL =
  import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL;

const fetchOpts = { credentials: "include" };

export async function getServicesHistory() {
  try {
    const response = await fetch(`${API_URL}/folio`, fetchOpts);
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }
    const service = await response.json();
    if (!Array.isArray(service)) return [];
    return service.sort((a, b) => b.id - a.id);
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getLastOnServicesHistory() {
  try {
    const response = await fetch(`${API_URL}/folio`, fetchOpts);
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }
    const service = await response.json();
    if (!Array.isArray(service) || service.length === 0) return 0;
    return Math.max(...service.map((s) => s.id));
  } catch (err) {
    console.error(err);
    return 0;
  }
}

export async function getOneServicesHistory(idService) {
  try {
    const response = await fetch(`${API_URL}/folio/${idService}`, fetchOpts);
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data)) return data[0] ?? null;
    return data ?? null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getOneTypeServicesById(idService) {
  try {
    const response = await fetch(`${API_URL}/type-services/${idService}`, fetchOpts);
    if (!response.ok) return null;
    const service = await response.json();
    if (Array.isArray(service) && service[0]?.name) return service[0].name;
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getAllTypeServices() {
  try {
    const response = await fetch(`${API_URL}/type-services/`, fetchOpts);
    if (!response.ok) return [];
    const service = await response.json();
    return Array.isArray(service) ? service : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}
