const API_URL = import.meta.env.VITE_BACKEND_URL 


export async function logInToApp(employee_number) {
  try {

    const response = await fetch(`${API_URL}/auth`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employee_number }),
    });

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

    console.log('hola')
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_URL}/auth/user-by-token`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

