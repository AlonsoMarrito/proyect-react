const API_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_BACKEND_URL;

export async function authUser() {
  try {
    const response = await fetch(`${API_URL}/auth/user-by-token`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (err) {
    console.error("Error en authUser:", err);
    return null;
  }
}
