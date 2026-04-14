import { useState, useEffect } from "react";
import BarNav from "./components/common/BarNav";
import SideBar from "./components/common/sideBar";
import AppRouter from "./router/AppRouter";

import { getUserByToken } from "./api/auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await getUserByToken();
        setUser(u);
      } catch {
        console.log("No hay usuario logueado");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {user && (
        <BarNav sessionUser={user} onLogoutSuccess={() => setUser(null)} />
      )}

      {user && (
        <div
          style={{
            width: "100%",
            flexShrink: 0,
            position: "relative",
            zIndex: 10100,
          }}
        >
          <SideBar user={user} />
        </div>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppRouter user={user} setUser={setUser} />
      </div>
    </div>
  );
}

export default App;