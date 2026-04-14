import { Routes, Route, Navigate, useParams } from "react-router-dom";

import Login from "../components/views/Login";
import Welcome from "../components/views/welcome";
import Bases from "../components/views/bases";
import BaseInformationView from "../components/views/baseInformationView";
import TypeToVehicles from "../components/views/TypeToVehicles";
import VehiclesByTypeView from "../components/views/VehiclesByTypeView";
import VehicleMenuView from "../components/views/VehicleMenuView";
import SummaryServicesView from "../components/views/summaryServices";
import SumaryServiceDetailView from "../components/views/SumaryServiceDetailView";
import ServiceMenuPrincipal from "../components/views/serviceMenuPrincipal";
import StatisticsServicesLayout from "../components/views/statisticsServices/StatisticsServicesLayout";
import WorkForceByGroupView from "../components/views/workForceByGroup";
import WorkForcePersonView from "../components/views/workForcePersonView";
import DevSoporteInternoView from "../components/views/DevSoporteInternoView";
import {
  RequireDevUser,
  RequireOperationalUser,
  RequirePartesOrEstadisticas,
} from "./RouteGuards";

/** Rutas antiguas con guion → mismas vistas bajo /typeToVehicles (Vue / legado) */
function RedirectLegacyVehicleDetail() {
  const { numberVehicle } = useParams();
  return (
    <Navigate to={`/typeToVehicles/description-u/${numberVehicle}`} replace />
  );
}

function RedirectLegacyVehiclesByType() {
  const { type } = useParams();
  return <Navigate to={`/typeToVehicles/${type}`} replace />;
}

export default function AppRouter({ user, setUser }) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/welcome" />
          ) : (
            <Login onLogin={setUser} />
          )
        }
      />

      <Route
        path="/welcome"
        element={
          user ? (
            <Welcome user={user} />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/soporte"
        element={
          user ? (
            <RequireDevUser user={user}>
              <DevSoporteInternoView user={user} />
            </RequireDevUser>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/all-bases"
        element={
          user ? (
            <RequireOperationalUser user={user}>
              <Bases user={user} />
            </RequireOperationalUser>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Flota vehículos (orden: detalle fijo → lista exacta → por tipo) */}
      <Route
        path="/typeToVehicles/description-u/:numberVehicle"
        element={
          user ? (
            <RequireOperationalUser user={user}>
              <VehicleMenuView user={user} />
            </RequireOperationalUser>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/typeToVehicles"
        element={
          user ? (
            <RequireOperationalUser user={user}>
              <TypeToVehicles user={user} />
            </RequireOperationalUser>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/typeToVehicles/:type"
        element={
          user ? (
            <RequireOperationalUser user={user}>
              <VehiclesByTypeView user={user} />
            </RequireOperationalUser>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Alias / rutas viejas */}
      <Route
        path="/type-vehicle"
        element={<Navigate to="/typeToVehicles" replace />}
      />
      <Route
        path="/type-vehicles"
        element={<Navigate to="/typeToVehicles" replace />}
      />
      <Route
        path="/type-vehicle/description-u/:numberVehicle"
        element={<RedirectLegacyVehicleDetail />}
      />
      <Route
        path="/type-vehicle/:type"
        element={<RedirectLegacyVehiclesByType />}
      />

      <Route
        path="/sumary-service/:folioId"
        element={
          user ? (
            <RequirePartesOrEstadisticas user={user}>
              <SumaryServiceDetailView user={user} />
            </RequirePartesOrEstadisticas>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/sumarys"
        element={
          user ? (
            <RequirePartesOrEstadisticas user={user}>
              <SummaryServicesView user={user} />
            </RequirePartesOrEstadisticas>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/services"
        element={
          user ? (
            <RequireOperationalUser user={user}>
              <ServiceMenuPrincipal user={user} />
            </RequireOperationalUser>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/stadistics/*"
        element={
          user ? (
            <RequirePartesOrEstadisticas user={user}>
              <StatisticsServicesLayout />
            </RequirePartesOrEstadisticas>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/work-force-shift/:shift"
        element={
          user ? (
            <RequireOperationalUser user={user}>
              <WorkForceByGroupView />
            </RequireOperationalUser>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/persone-info/:employeeToken/:shiftName"
        element={<WorkForcePersonView />}
      />

      <Route
        path="/base-information/:name"
        element={
          user ? (
            <RequireOperationalUser user={user}>
              <BaseInformationView />
            </RequireOperationalUser>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="*"
        element={
          user ? (
            <Navigate to="/welcome" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}
