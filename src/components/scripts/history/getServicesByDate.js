const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function getServicesByDate(dateBody) {
    try {
      const response = await fetch(
        API_URL + "/folio/group-by-date",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dateBody),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      const service = await response.json();
      return service;
  
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  
  export async function getStatusServicesByDate(dateBody) {
    try {
      const response = await fetch(
        API_URL + "/folio/status-group-by-date",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dateBody),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      const service = await response.json();
      return service;
  
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  export async function getCologneByStatusServicesWithDate(dateBody, status) {
    try {
      const response = await fetch(
        API_URL + "/folio/cologne-group-by-date-status/"+status,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dateBody),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      const service = await response.json();
      return service;
  
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  export async function getCologneServicesWithDate(dateBody, cologne) {
    try {
      const response = await fetch(
        API_URL + "/folio/cologne-group-by-date/"+cologne,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dateBody),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      const service = await response.json();
      return service;
  
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  export async function getStatusCologneServicesWithDate(dateBody, cologne) {
    
    try {
      const response = await fetch(
        API_URL + "/folio/status-on-cologne-group-by-date/"+cologne,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dateBody),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      const service = await response.json();
      return service;
  
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  
  