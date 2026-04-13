const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function getServiceActiveByUnid(unidId) {
    try {
      const response = await fetch(
        API_URL+"/folio/filtered-by-date-and-unid/" + unidId
      );
  
      if (!response.ok) {
        return null;
      }
  
      const text = await response.text();
  
      if (!text) {
        return null;
      }
  
      return JSON.parse(text);
  
    } catch (err) {
      console.error(err);
      return null;
    }
  }