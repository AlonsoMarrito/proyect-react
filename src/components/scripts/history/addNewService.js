const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function createNewService(dateBody) {
    try {
      const response = await fetch(
        API_URL+"/folio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

  export async function closeDataNewService(noConsecutive, dateBody) {
    try {
      const response = await fetch(
        API_URL+"/folio/closing-service/"+noConsecutive,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
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

  export async function addedSumaryService(noConsecutive, dateBody) {
    try {
      const response = await fetch(
        API_URL+"/folio/added-summary-service/"+noConsecutive,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
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