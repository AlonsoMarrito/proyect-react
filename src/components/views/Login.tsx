import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 🔥 TUS ARCHIVOS REALES
import { logInToApp } from "../../components/scripts/user/logIn";
import { authUser } from "../../components/scripts/user/authUser";

import { theme } from "../../theme";
import logo from "../../assets/logo_rusoit.png";

type Props = {
  onLogin: (user: any) => void;
};

export default function Login({ onLogin }: Props) {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeNumber.trim()) {
      setError("Ingresa tu número de empleado");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 🔐 LOGIN REAL (usa cookie en backend)
      const loginRes = await logInToApp(employeeNumber);

      if (!loginRes) {
        throw new Error("Error en login");
      }

      // 👤 OBTENER USUARIO DESPUÉS DEL LOGIN
      const userData = await authUser();

      if (!userData) {
        throw new Error("No se pudo obtener el usuario");
      }

      onLogin(userData);

      // 🚀 redirección
      navigate("/welcome");

    } catch (err: any) {
      setError(err?.message || "Error de login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.backLogin}>
      <div style={styles.header}>
        <h1 style={styles.welcomeText}>RUSO-IT</h1>
      </div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.logoContainer}>
          <img src={logo} alt="RUSO-IT Logo" style={styles.logo} />
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.inputLabel}>Número de Empleado</label>

          <input
            placeholder="Ejemplo: 133423"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            backgroundColor: hover
              ? theme.buttonsPrimaryAltern
              : "#D32F2F",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        {error && <span style={styles.errorText}>{error}</span>}
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backLogin: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #FF6B6B, #FFD166)",
  },

  header: {
    position: "absolute",
    top: "5%",
    textAlign: "center",
    width: "100%",
  },

  welcomeText: {
    color: "#D32F2F",
    fontSize: "3rem",
    margin: 0,
    fontWeight: 700,
  },

  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
    padding: "2.5rem 3rem",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    minWidth: "350px",
  },

  logoContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },

  logo: {
    width: "120px",
    height: "120px",
  },

  inputContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },

  inputLabel: {
    fontWeight: 600,
  },

  input: {
    width: "70%",
    padding: "0.85rem",
    borderRadius: "12px",
    border: "1px solid #ccc",
    textAlign: "center",
  },

  button: {
    width: "65%",
    padding: "0.85rem",
    borderRadius: "15px",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
  },

  errorText: {
    color: "#B00020",
    fontWeight: "bold",
  },
};