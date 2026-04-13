export async function createNewWorkShift(name, tipe, startTime, workTime) {
    try {
      const response = await fetch('https://localhost:3000/work-shift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          workday: tipe,
          time_start: startTime, 
          working_time: workTime 
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      return await response.json();
    } catch (err) {
      console.error("Error al crear el turno de trabajo:", err);
      throw new Error("No se pudo crear el turno de trabajo");
    }
  }
  