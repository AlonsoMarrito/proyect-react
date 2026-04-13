const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function createNewSCI(dateBody) {
    try {
      const response = await fetch(
        `${API_URL}/sci`,
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

  export async function createNewOperationLocation(dateBody) {
    try {
      const response = await fetch(
        `${API_URL}/locations-operative-on-sci`,
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

  export async function createNewOUserOnSci(dateBody) {
    try {
      const response = await fetch(
        `${API_URL}/users-on-sci`,
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

  export async function createNewNOTS(dateBody) {
    try {
      const response = await fetch(
        `${API_URL}/information-sci`,
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

  