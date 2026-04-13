const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL;

/**
 * Crea un turno de trabajo (misma firma y cuerpo que rusoit-webapp).
 * @param {string} name
 * @param {string} tipe — workday: operativo | administrativo | otro
 * @param {string} startTime — HH:mm:ss
 * @param {string} workTime — HH:mm:ss (jornada / horario según backend)
 */
export async function createNewWorkShift(name, tipe, startTime, workTime) {
  try {
    const response = await fetch(`${API_URL}/work-shift`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        workday: tipe,
        time_start: startTime,
        working_time: workTime,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Error al crear el turno de trabajo:", err);
    throw err instanceof Error ? err : new Error("No se pudo crear el turno de trabajo");
  }
}
