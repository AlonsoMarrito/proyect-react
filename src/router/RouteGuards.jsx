import { Navigate } from "react-router-dom";
import {
  canAccessPartesYEstadisticas,
  isDevUser,
} from "../utils/userNavPermissions";

/** Usuario autenticado (sin bloquear cuentas dev). */
export function RequireOperationalUser({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

/** Partes de atención y estadísticas: cargo ≥ 04 (o jurídico), no Oficial solo; dev tiene acceso. */
export function RequirePartesOrEstadisticas({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  if (isDevUser(user)) return children;
  if (!canAccessPartesYEstadisticas(user)) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}

/** Solo usuarios dev (p. ej. soporte interno). */
export function RequireDevUser({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  if (!isDevUser(user)) return <Navigate to="/welcome" replace />;
  return children;
}
