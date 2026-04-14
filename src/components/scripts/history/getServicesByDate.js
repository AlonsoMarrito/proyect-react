import { getApiBaseUrl } from "./apiBase.js";

const postJson = (path, dateBody) =>
  fetch(getApiBaseUrl() + path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dateBody),
  });

export async function getServicesByDate(dateBody) {
    try {
      const response = await postJson("/folio/group-by-date", dateBody);
  
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
      const response = await postJson("/folio/status-group-by-date", dateBody);
  
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
      const response = await postJson(
        "/folio/cologne-group-by-date-status/" + status,
        dateBody
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
      const response = await postJson(
        "/folio/cologne-group-by-date/" + cologne,
        dateBody
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
      const response = await postJson(
        "/folio/status-on-cologne-group-by-date/" + cologne,
        dateBody
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
  
  