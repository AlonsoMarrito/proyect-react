import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL;

export async function createNewVehicle(formData) {
  await axios.post(`${API_URL}/vehicle`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  await Toast.fire({
    icon: "success",
    title: "Vehículo registrado con éxito",
  });
}

export async function getTypeVehicles(typeUnit, status) {
  try {
    const response = await fetch(`${API_URL}/vehicle`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(String(response.status));
    const units = await response.json();
    if (!Array.isArray(units)) return [];

    if (status === "todas") {
      return units.filter((unit) => unit.id_type === typeUnit);
    }
    return units.filter(
      (unit) => unit.id_type === typeUnit && unit.status === status
    );
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getTypeVehicle(numberUnit) {
  try {
    const response = await fetch(`${API_URL}/vehicle/${numberUnit}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(String(response.status));
    return await response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getKilometerTypeVehicle(numberUnit) {
  try {
    const response = await fetch(`${API_URL}/vehicle/${numberUnit}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(String(response.status));
    const units = await response.json();
    return {
      kilometers: units.kilometers,
      idUnit: units.id,
      number_unit: units.number_unit,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getAllTypeToVehicle() {
  try {
    const response = await fetch(`${API_URL}/type-to-vehicles`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(String(response.status));
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getAllInformationToVehicle() {
  try {
    const response = await fetch(`${API_URL}/vehicle/`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(String(response.status));
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getVehicleById(numberUnit) {
  try {
    const response = await fetch(`${API_URL}/vehicle`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(String(response.status));
    const units = await response.json();
    if (!Array.isArray(units)) return null;
    return units.find((id) => id.id === numberUnit) ?? null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getTypeVehiclesOperatives() {
  try {
    const response = await fetch(`${API_URL}/vehicle`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(String(response.status));
    const units = await response.json();
    if (!Array.isArray(units)) return [];
    return units.filter((e) => e.status === "operativa");
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getVehicleByTypeVehicle(typeUnit) {
  try {
    const response = await fetch(`${API_URL}/type-to-vehicles`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(String(response.status));
    const units = await response.json();
    if (!Array.isArray(units)) return null;
    const found = units.find((u) => u.type === typeUnit);
    return found != null ? found.id : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}
