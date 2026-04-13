import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function createNewVehicle(formData) {
  try {
    await axios.post(API_URL + "/vehicle", formData, {
      headers: { "Content-Type": "multipart/form-data" },
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
      }
    });
    Toast.fire({
      icon: "success",
      title: "Vehículo Registrado Con Exito"
    });
    setTimeout(() => {
      window.location.reload();
    }, 3000); 
  } catch (err) {
    console.error("Error registrando vehículo:", err);
      const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: "error",
      title: "Algo Salio Mal"
    });
  }
}

export async function getTypeVehicles(typeUnit, status) {
    let units = []
    try {
        const response = await fetch(API_URL + "/vehicle");
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        units = await response.json();
    } catch (err) {
        return err
    }
    if(status === "todas"){
        const result = units.filter(
            unit => unit.id_type === typeUnit
        );
    return result;
    }
    else {
        const result = units.filter(
            unit => unit.id_type === typeUnit && unit.status === status
        );
    return result;
    }
}

export async function getTypeVehicle(numberUnit){
    let units = []
    try {
        const response = await fetch(API_URL + "/vehicle/"+numberUnit);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        units = await response.json();
    return units
    } catch (err) {
        return err
    }
}

export async function getKilometerTypeVehicle(numberUnit){
  let units = []
  try {
      const response = await fetch(API_URL + "/vehicle/"+numberUnit);
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      units = await response.json();
  return {
      kilometers: units.kilometers,
      idUnit: units.id,
      number_unit: units.number_unit,
    }
  } catch (err) {
      return err
  }
}

export async function getAllTypeToVehicle(){
  let typeUnits = []
  try {
      const response = await fetch(API_URL + "/type-to-vehicles");
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      typeUnits = await response.json();
  return typeUnits
  } catch (err) {
      return err
  }
}

export async function getAllInformationToVehicle(){
  let vehiclesData = []
  try {
      const response = await fetch(API_URL + "/vehicle/");
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      vehiclesData = await response.json();
  return vehiclesData
  } catch (err) {
      return err
  }
}

export async function getVehicleById(numberUnit){
  let units = []
  try {
      const response = await fetch(API_URL + "/vehicle");
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      units = await response.json();
  return units.find(id => id.id === numberUnit)
  } catch (err) {
      return err
  }
}

export async function getTypeVehiclesOperatives() {
  let units = []
  try {
      const response = await fetch(API_URL + "/vehicle");
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      units = await response.json();
      return units.filter(e => e.status === 'operativa');
  } catch (err) {
      return err
  }
}

export async function getVehicleByTypeVehicle(typeUnit){
  //console.log(typeUnit)
  let units = []
  try {
      const response = await fetch(API_URL + "/type-to-vehicles");
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      units = await response.json();
  return units.find(u => u.type === typeUnit).id
  } catch (err) {
      return err
  }
}