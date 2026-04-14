import { getTypeVehicle } from "../generalInfoVehicle/getVehicles";

const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function getColums(category, numberUnit) {
  try {
    const dataUnit = await getTypeVehicle(numberUnit);
    const response = await fetch(
      `${API_URL}/vehicle-registration/vehicle-logs-${category}/${dataUnit.id}`,
      { credentials: "include" }
    );
    if (!response.ok) throw new Error(`Error en la petición: ${response.status}`);

    const units = await response.json();
    if (!units.length) return [];

    const vehicle = units[0];

    return Object.entries(vehicle)
      .filter(([key]) => key !== "id" && key !== "vehicle_id" && key !== "driver_id" && key !== "fecha_registro")
      .map(([key, value]) => ({
        name: key.replace(/_/g, " "),
        state: value ?? "N/A"
      }));
  } catch (err) {
    console.error(`Error obteniendo ${category}:`, err);
    return [];
  }
}