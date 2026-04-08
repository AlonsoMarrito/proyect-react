import { useState } from "react";
import { login } from "../api/auth";
import { theme } from "../theme";
import logo from "../assets/logo_rusoit.png";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [error, setError] = useState("");
  const [hover, setHover] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(employeeNumber);

      const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user-by-token`, {
        credentials: "include",
      });
      const userData = await userRes.json();
      onLogin(userData);
    } catch (err: any) {
      setError(err.message || "Error de login");
    }
  };

  return (
    <div style={styles.backLogin}>
      {/* Título separado arriba */}
      <div style={styles.header}>
        <h1 style={styles.welcomeText}>RUSO-IT</h1>
      </div>

      <form onSubmit={handleSubmit} style={styles.card}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <img src={logo} alt="RUSO-IT Logo" style={styles.logo} />
        </div>

        {/* Subtítulo pegado al input */}
        <div style={styles.inputContainer}>
          <label style={styles.inputLabel}>Número de Empleado</label>
          <input
            placeholder="Ejemplo: 133423"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            style={styles.input}
            onKeyUp={(e) => e.key === "Enter" && handleSubmit(e)}
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          style={{
            ...styles.button,
            backgroundColor: hover ? theme.buttonsPrimaryAltern : "#D32F2F",
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          Ingresar
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
    margin: 0,
    padding: 0,
    background: "linear-gradient(135deg, #FF6B6B, #FFD166)", // rojo a naranja cálido
    fontFamily: "Arial, sans-serif",
    overflow: "hidden",
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
    background: "rgba(255,255,255,0.95)", // card clara
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    minWidth: "350px",
    maxWidth: "450px",
    textAlign: "center",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginBottom: "1rem",
  },
  logo: {
    width: "120px",
    height: "120px",
    borderRadius: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    gap: "0.5rem",
  },
  inputLabel: {
    alignSelf: "flex-start",
    marginLeft: "15%",
    fontWeight: 600,
    color: "#333",
    fontSize: "1rem",
  },
  input: {
    width: "70%",
    padding: "0.85rem",
    borderRadius: "12px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#333",
    fontSize: "1rem",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  button: {
    width: "65%",
    padding: "0.85rem",
    borderRadius: "15px",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "0.3s",
  },
  errorText: {
    color: "#B00020",
    fontWeight: "bold",
    marginTop: "0.5rem",
  },
};