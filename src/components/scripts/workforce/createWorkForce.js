const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function createNewWorkForce(payload) {
  const response = await fetch(API_URL + "/work-force", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log("Backend error:", error);
    throw new Error("No se pudo crear la unidad");
  }

  return await response.json();
}

