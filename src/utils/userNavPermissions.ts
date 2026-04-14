/** Código o etiqueta de cargo (p. ej. "04", "Oficial") desde el usuario de sesión. */
export function getCargoCode(user: Record<string, unknown> | null | undefined): string {
  if (!user || typeof user !== "object") return "";
  const emp = user.employees as Record<string, unknown> | undefined;
  const p = emp?.position ?? user.position;
  if (p == null) return "";
  return String(p).trim();
}

/** Usuario de desarrollo (type_user / flags en backend). */
export function isDevUser(user: unknown): boolean {
  if (!user || typeof user !== "object") return false;
  const u = user as Record<string, unknown>;
  const emp = u.employees as Record<string, unknown> | undefined;
  const tu = String(u.type_user ?? emp?.type_user ?? "").toLowerCase();
  if (["dev", "desarrollador", "developer", "desarrollo"].includes(tu)) return true;
  if (u.is_dev === true || emp?.is_dev === true) return true;
  const pos = getCargoCode(u).toLowerCase();
  if (pos === "dev" || pos === "desarrollador") return true;
  return false;
}

/**
 * Partes de atención y estadísticas (gráficas): no para cargo "Oficial" a secas;
 * sí para jurídico y para cargos numéricos 04 en adelante (04, 05, 06, …).
 */
export function canAccessPartesYEstadisticas(user: unknown): boolean {
  if (!user || typeof user !== "object") return false;
  if (isDevUser(user)) return true;
  const cargo = getCargoCode(user as Record<string, unknown>);
  if (!cargo) return false;
  const lower = cargo.toLowerCase();
  if (lower === "juridico") return true;
  if (lower === "oficial") return false;

  const n = parseInt(cargo.replace(/\D/g, "") || cargo, 10);
  if (!Number.isNaN(n) && n >= 4) return true;

  return ["04", "05", "06", "07", "08", "09", "10", "11", "12"].includes(cargo);
}
