const ENV = (import.meta as any).env ?? {};

const API = ENV.DEV
  ? "/api"
  : ENV.VITE_BACKEND_URL;

export async function login(employeeNumber) {
  return fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeNumber }),
    credentials: "include",
  });
}

export async function getUserByToken() {
  const res = await fetch(`${API}/auth/user-by-token`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("No autorizado");

  return await res.json();
}