const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function getAllTypeTools(){
    let typeUnits = []
    try {
        const response = await fetch(API_URL + "/type-tools");
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeUnits = await response.json();
    return typeUnits
    } catch (err) {
        return err
    }
  }

  export async function getAllTypeToolsByType(type){
    let typeUnits = []
    try {
        const response = await fetch(API_URL + "/type-tools");
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeUnits = await response.json();
    return typeUnits.find(t => t.name === type).id
    } catch (err) {
        return err
    }
  }
  
  export async function getAllToolsByOneType(id_type){
    let typeUnits = []
    try {
        const response = await fetch(API_URL + "/tools/type/"+id_type);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeUnits = await response.json();
    return typeUnits
    } catch (err) {
        return err
    }
  }