const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL


  export async function getOnlyInstallations(){
    let typeInstallations = []
    try {
        const response = await fetch(`${API_URL}/operative-installations`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeInstallations = await response.json();
    return typeInstallations.filter( ti => ti.is_instalation === true)
    } catch (err) {
        return err
    }
  }

  export async function getEveryLocations(){
    let typeInstallations = []
    try {
        const response = await fetch(`${API_URL}/operative-installations`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeInstallations = await response.json();
    return typeInstallations
    } catch (err) {
        return err
    }
  }

  export async function getEveryResourceOnSci(param){
    let typeInstallations = []
    try {
        const response = await fetch(`${API_URL}/resource-on-sci/sci/${param}`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeInstallations = await response.json();
    return typeInstallations
    } catch (err) {
        return err
    }
  }

  export async function getOneInstallation(param){
    let typeInstallations = {}
    try {
        const response = await fetch(`${API_URL}/operative-installations`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeInstallations = await response.json();
    return typeInstallations.filter( ti => ti.id === +param)
    } catch (err) {
        return err
    }
  }

  export async function getOnlyPositionPerson(){
    let typeInstallations = []
    try {
        const response = await fetch(`${API_URL}/position-person-on-sci`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeInstallations = await response.json();
    return typeInstallations.filter(po => po.name !== "Personal operativo")
    } catch (err) {
        return err
    }
  }

  export async function getAllActiveSCI(){
    let typeInstallations = []
    try {
        const response = await fetch(`${API_URL}/sci`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeInstallations = await response.json();
    return typeInstallations.filter( ti => ti.status === 'active')
    } catch (err) {
        return err
    }
  }

  export async function getOneSCI(param){
    let typeInstallations = []
    try {
        const response = await fetch(`${API_URL}/sci/${param}`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeInstallations = await response.json();
    return typeInstallations.filter( ti => ti.status === 'active')
    } catch (err) {
        return err
    }
  }

  export async function getInstallationBySCI(param){
    let groupInstallations = []
    try {
        const response = await fetch(`${API_URL}/locations-operative-on-sci/installation/${param}`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        groupInstallations = await response.json();
    return groupInstallations.filter( ti => ti.id_sci === +param)
    } catch (err) {
        return err
    }
  }

  export async function getCommandLineBySci(param){
    try {
      const response = await fetch(`${API_URL}/users-on-sci/sci-users/${param}`);
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      const data = await response.json();
  
      return Array.isArray(data) ? data : [];
  
    } catch (err) {
      console.error("API ERROR:", err);
      return [];
    }
  }

  export async function getOnePositionResponsabilityBySci(param){
    try {
      const response = await fetch(`${API_URL}/position-person-on-sci/${param}`);
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      const data = await response.json();
  
      return Array.isArray(data) ? data : [];
  
    } catch (err) {
      console.error("API ERROR:", err);
      return [];
    }
  }

  