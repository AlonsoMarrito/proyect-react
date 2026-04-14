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

/** Borra cookies legibles por JS (las HttpOnly solo las invalida el servidor en logout). */
export function clearBrowserCookies() {
  try {
    const parts = document.cookie.split(";");
    for (const part of parts) {
      const name = part.split("=")[0]?.trim();
      if (!name) continue;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  } catch {
    /* ignore */
  }
}

/** Igual que en el proyecto Vue: POST /auth/logout + limpiar storages y cookies locales. */
export async function logoutFromApp() {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("logout:", err);
  }
  try {
    sessionStorage.clear();
    localStorage.clear();
    clearBrowserCookies();
  } catch {
    /* ignore */
  }
}

