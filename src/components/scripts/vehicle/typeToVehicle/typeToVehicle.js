import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function createNewVehicle(vehicleName, file) {
  if (!vehicleName || !vehicleName.trim()) {
    throw new Error("Debes proporcionar un nombre de la clase de vehículo.");
  }
  if (!file) {
    throw new Error("No se envió archivo.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", vehicleName);

  try {
    const res = await axios.post(
      API_URL + "/type-to-vehicles/create-new_type",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("Imagen subida:", res.data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw new Error("Error subiendo la imagen y nombre: " + err.message);
  }
}
