export async function login(employee_number: string) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_number }),
    credentials: 'include', // importante para cookies httpOnly
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error de login');
  }

  return await res.json();
}

export async function refreshToken() {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('No se pudo renovar el token');
  return await res.json();
}

export async function getUserByToken() {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user-by-token`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('No se pudo obtener el usuario');
  return await res.json();
}