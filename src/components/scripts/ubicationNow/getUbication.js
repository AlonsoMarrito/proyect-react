const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function getAllActiveUbications() {
    let ubication = [];
    try {
      const response = await fetch(`${API_URL}/valiza/actives`);
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      ubication = await response.json();
      return ubication;
    } catch (err) {
      console.error('Error en getAllActiveUbications:', err);
      return [];
    }
  }