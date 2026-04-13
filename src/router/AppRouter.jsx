import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../components/views/Login";
import Welcome from "../components/views/welcome";
import Bases from "../components/views/bases";
import TypeToVehicles from "../components/views/TypeToVehicles";
import SummaryServicesView from "../components/views/summaryServices";
import ServiceMenuPrincipal from "../components/views/serviceMenuPrincipal";
import WorkForceByGroupView from "../components/views/workForceByGroup";

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
            path="/all-bases"
            element={
            user ? (
                <Bases user={user} />
            ) : (
                <Navigate to="/" />
            )
            }
        />

        <Route
            path="/typeToVehicles"
            element={
            user ? (
                <TypeToVehicles user={user} />
            ) : (
                <Navigate to="/" />
            )
            }
        />

      <Route
            path="/sumarys"
            element={
            user ? (
                <SummaryServicesView user={user} />
            ) : (
                <Navigate to="/" />
            )
            }
        />

        <Route
            path="/services"
            element={
            user ? (
                <ServiceMenuPrincipal user={user} />
            ) : (
                <Navigate to="/" />
            )
            }
        />

        <Route
          path="/work-force-shift/:shift"
          element={
            user ? (
              <WorkForceByGroupView />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        
    </Routes>
  );
}