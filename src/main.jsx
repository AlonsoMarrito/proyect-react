import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

// Compatibilidad temporal para scripts legacy que usan process.env.VUE_APP_API_URL
if (!globalThis.process) {
  globalThis.process = { env: {} };
}

globalThis.process.env = {
  ...globalThis.process.env,
  ...import.meta.env,
  VUE_APP_API_URL:
    import.meta.env.VUE_APP_API_URL ?? import.meta.env.VITE_BACKEND_URL,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);