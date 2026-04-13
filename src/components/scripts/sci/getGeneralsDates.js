const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL


export async function getAllDysturbingPhenoms(){
    let typeInstallations = []
    try {
        const response = await fetch(`${API_URL}/disturbed-phenoms`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeInstallations = await response.json();
    return typeInstallations
    } catch (err) {
        return err
    }
  }

  export async function getOnlyPositionPerson(){
    try {
      const response = await fetch(`${API_URL}/position-person-on-sci`);
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      return await response.json();
  
    } catch (err) {
      console.error(err)
      return []
    }
  }

  export async function getAllInformationById(param){
    try {
      const response = await fetch(`${API_URL}/information-sci/id-sci/${param}`);
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      return await response.json();
  
    } catch (err) {
      console.error(err)
      return []
    }
  }