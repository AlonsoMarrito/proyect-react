import { getTypeVehicle } from "../generalInfoVehicle/getVehicles";

const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function getDatasNotOrBadFunction(numVeh) {
  try {
    const dataUnit = await getTypeVehicle(numVeh);

    const response = await fetch(
      `${API_URL}/vehicle-registration/${dataUnit.id}`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const units = await response.json();

    const maxIdUnit = units.reduce((prev, current) =>
      current.id > prev.id ? current : prev
    , units[0]);

    const badFields = Object.fromEntries(
      Object.entries(maxIdUnit).filter(entry =>
        entry[1]?.toString().trim().toLowerCase() === "malo"
      )
    );

    return badFields;

  } catch (err) {
    return err;
  }
}




export async function getDatasDamages(numVeh){
  let units = []
  try {
    const dataUnit = await getTypeVehicle(numVeh);
      const response = await fetch(API_URL + "/damages/inone-vehicle/"+dataUnit.id, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      units = await response.json();
  return units
  } catch (err) {
      return err
  }
}

export async function getDataDamageOneVehicle(numVeh){
  let units = []
  try {
      const response = await fetch(API_URL + "/damages/damage/"+numVeh, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      units = await response.json();
  return units
  } catch (err) {
      return err
  }
}

