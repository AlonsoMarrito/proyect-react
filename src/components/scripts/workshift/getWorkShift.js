const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL;

export async function getWorkShift() {
    try {
      const response = await fetch(`${API_URL}/work-shift`);
      if (!response.ok) throw new Error(`Error en la petición: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("Error al obtener los turnos de trabajo:", err);
      throw new Error("No se pudo obtener la lista de turnos de trabajo");
    }
  }

  export async function getWorkShiftById(idShift) {
    try {
      const response = await fetch(`${API_URL}/work-shift`);
      if (!response.ok) throw new Error(`Error en la petición: ${response.status}`);
      const workShiftNow = await response.json()
      return workShiftNow.find(ws => ws.id === idShift).name;
    } catch (err) {
      console.error("Error al obtener los turnos de trabajo:", err);
      throw new Error("No se pudo obtener la lista de turnos de trabajo");
    }
  }
  