import { useState, useEffect } from 'react';
import Login from './components/Login';
import { getUserByToken } from './api/auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await getUserByToken();
        setUser(u);
      } catch (err) {
        console.log('No hay usuario logueado');
      }
    })();
  }, []);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenido, {user.employees?.position || user.email}</h1>
      <p>Número de empleado: {user.employees?.employee_number}</p>
    </div>
  );
}

export default App;