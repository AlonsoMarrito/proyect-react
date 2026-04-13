import { getBaseById } from "../bases/getBases";
import { getUserById } from "../user/getUser";
import { getVehicleById } from "../vehicle/generalInfoVehicle/getVehicles";

const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function getUserByShift(shift) {
    try {
      const response = await fetch(`${API_URL}/users/shift/`+shift);
      if (!response.ok) throw new Error(`Error en la petición: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("Error al obtener los turnos de trabajo:", err);
      throw new Error("No se pudo obtener la lista de turnos de trabajo");
    }
  }

  export async function getWorkForceByDay(date, idWorkShift) {
    try {
      const response = await fetch(`${API_URL}/work-force/by-date-and-workshift/${date}/${idWorkShift}`);
      return await response.json();
    } catch {
      throw new Error("No se pudo obtener la lista de turnos de trabajo");
    }
  }  

  export async function getWorkForceByDayForService(date, idWorkShift, idUser) {
    try {
      const response = await fetch(
        `${API_URL}/work-force/by-date-and-workshift/${date}/${idWorkShift}`
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
  
      const data = await response.json();
  
      const match = data.find(wf =>
        wf.personal_on_a_workforce.some(person =>
          person.id_user === idUser
        )
      );
  
      return match ?? null;
  
    } catch (err) {
      console.error(err);
      throw new Error("No se pudo obtener la lista de turnos de trabajo work-shift");
    }
  }

  export async function puzzleForWorkForce(puzzle) {
    try {
      if (!Array.isArray(puzzle)) return []
  
      const puzzleReady = []
  
      for (const element of puzzle) {
        
        const base = await getBaseById(element.id_logistics_hubs);
        const vehicle = await getVehicleById(element.id_vehicle);
        let fullTripulation = [];
        for (const persons of element.personal_on_a_workforce){
          const tripulationName = await getUserById(persons.id_user)
          fullTripulation.push({
            position: persons.position_on_work_force,
            name: tripulationName[0].first_name + ' ' + tripulationName[0].last_name,
            id: persons.id_user,
          })
        }

        puzzleReady.push({
          base: base.name,
          vehicle: vehicle.number_unit,
          notes: element.notes,
          fullTripulation: fullTripulation,
        })
      }  

      return puzzleReady
  
    } catch (error) {
      console.error("Error en puzzleForWorkForce:", error)
      return []
    }
  }
  

  export async function getWorkForceByDayAndUser(date, idUser) {
    try {
      const response = await fetch(
        `${API_URL}/work-force/by-date-and-unit/${date}/${idUser}`
      );
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      const workForceToday = await response.json();
  
      return workForceToday;
    } catch (err) {
      console.error("Error al obtener los turnos de trabajo:", err);
      return [];
    }
  }
  
  
  
  