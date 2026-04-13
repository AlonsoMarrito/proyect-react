const API_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_BACKEND_URL;


export async function logInToApp(employee_number) {
  try {
    const requestConfig = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Compatibilidad con backends que esperan /auth/login + employee_number
    // o /auth + employee_number (implementaciones anteriores).
    let response = await fetch(`${API_URL}/auth/login`, {
      ...requestConfig,
      body: JSON.stringify({ employee_number }),
    });

    if (!response.ok) {
      response = await fetch(`${API_URL}/auth`, {
        ...requestConfig,
        body: JSON.stringify({ employee_number }),
      });
    }

    if (!response.ok) {
      console.error("Login falló:", response.status);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error("Error en logInToApp:", err);
    return null;
  }
}

export async function authUser() {
  try {
    const response = await fetch(`${API_URL}/auth/user-by-token`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

