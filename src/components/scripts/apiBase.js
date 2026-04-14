/**
 * En dev sin VITE_BACKEND_URL, las peticiones van a /api (proxy de Vite → backend).
 * Igual criterio que authUser.js.
 */
export function getApiBaseUrl() {
  if (import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL) {
    return "/api";
  }
  return (
    import.meta.env.VITE_BACKEND_URL ??
    import.meta.env.VUE_APP_API_URL ??
    ""
  );
}
