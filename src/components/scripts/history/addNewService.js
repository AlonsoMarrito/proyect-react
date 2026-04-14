const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

const fetchOpts = { credentials: "include" };

export async function createNewService(dateBody) {
    try {
      const response = await fetch(
        API_URL+"/folio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          ...fetchOpts,
          body: JSON.stringify(dateBody),
        }
      );
      const service = await response.json();
      return service;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  export async function updateDataNewService(noConsecutive, dateBody) {
    try {
      const response = await fetch(
        API_URL+"/folio/references-service/"+noConsecutive,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          ...fetchOpts,
          body: JSON.stringify(dateBody),
        }
      );
      if (!response.ok) {
        console.error("updateDataNewService", response.status, await response.text());
        return null;
      }
      const service = await response.json();
      return service;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  export async function closeDataNewService(noConsecutive, dateBody) {
    try {
      const response = await fetch(
        API_URL+"/folio/closing-service/"+noConsecutive,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          ...fetchOpts,
          body: JSON.stringify(dateBody),
        }
      );
      if (!response.ok) {
        console.error("closeDataNewService", response.status, await response.text());
        return null;
      }
      const service = await response.json();
      return service;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  export async function addedSumaryService(noConsecutive, dateBody) {
    try {
      const response = await fetch(
        API_URL+"/folio/added-summary-service/"+noConsecutive,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          ...fetchOpts,
          body: JSON.stringify(dateBody),
        }
      );
      if (!response.ok) {
        console.error("addedSumaryService", response.status, await response.text());
        return null;
      }
      const service = await response.json();
      return service;
    } catch (err) {
      console.error(err);
      return null;
    }
  }