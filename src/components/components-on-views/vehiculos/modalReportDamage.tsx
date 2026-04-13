import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import dumieImg from "../../../assets/vehiclesUnitImg/dumie.png";
import takePictureImg from "../../../assets/icons-app/takePicture.png";
import { getPreferences } from "../../scripts/preference/getPreference";
import { getTypeVehicle } from "../../scripts/vehicle/generalInfoVehicle/getVehicles";

export default function ModalReportDamage({ onClose }) {
  const { numberVehicle } = useParams();

  const [vehicleNumber, setVehicleNumber] = useState(0);
  const [generalDataAboutVehicle, setGeneralDataAboutVehicle] = useState(null);
  const [preferenceColor, setPreferenceColor] = useState(1);

  const [imgSelected, setImgSelected] = useState("Frontal");

  // form fields (si después quieres enviarlo a backend)
  const [damageType, setDamageType] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  useEffect(() => {
    const init = async () => {
      const preferences = await getPreferences();
      setPreferenceColor(preferences?.color ?? 1);

      setVehicleNumber(numberVehicle);

      const vehicleData = await getTypeVehicle(numberVehicle);
      setGeneralDataAboutVehicle(vehicleData);
    };

    init();
  }, [numberVehicle]);

  const saveData = () => {
    alert("hola");

    // aquí después puedes enviar payload:
    // console.log({
    //   vehicleNumber,
    //   imgSelected,
    //   damageType,
    //   damageDescription,
    //   eventDescription
    // });

    onClose?.();
  };

  return (
    <div className="modal-view-report-damage text-style-color-and-family">
      <div className="modal-body-report-damages text-style-color-and-family">

        <div className="up-close-zone">
          <button className="button-close-modal" onClick={onClose}>
            X
          </button>
        </div>

        <h1 className="text-style-color-and-family-modal-tittle-without-margin">
          Registro de Nuevo Daño o Percance
        </h1>

        <h3 className="section-damage-buttons">
          Sección Incidentada del Vehículo
        </h3>

        {generalDataAboutVehicle && (
          <div className="space-images">
            <button
              className="image-size-car"
              onClick={() => setImgSelected("Frontal")}
              style={{
                border: imgSelected === "Frontal" ? "2px solid #ff8400" : "",
              }}
            >
              <p>Frontal</p>
              <div className="image-space-individual">
                <img
                  src={
                    generalDataAboutVehicle.front_img || dumieImg
                  }
                  alt=""
                  className="img-modal-damage"
                />
              </div>
            </button>

            <button
              className="image-size-car"
              onClick={() => setImgSelected("Trasero")}
              style={{
                border: imgSelected === "Trasero" ? "2px solid #ff8400" : "",
              }}
            >
              <p>Trasero</p>
              <div className="image-space-individual">
                <img
                  src={
                    generalDataAboutVehicle.back_img || dumieImg
                  }
                  alt=""
                  className="img-modal-damage"
                />
              </div>
            </button>

            <button
              className="image-size-car"
              onClick={() => setImgSelected("L. Derecho")}
              style={{
                border: imgSelected === "L. Derecho" ? "2px solid #ff8400" : "",
              }}
            >
              <p>L. Derecho</p>
              <div className="image-space-individual">
                <img
                  src={
                    generalDataAboutVehicle.cover_img || dumieImg
                  }
                  alt=""
                  className="img-modal-damage"
                />
              </div>
            </button>

            <button
              className="image-size-car"
              onClick={() => setImgSelected("L. Izquierdo")}
              style={{
                border:
                  imgSelected === "L. Izquierdo" ? "2px solid #ff8400" : "",
              }}
            >
              <p>L. Izquierdo</p>
              <div className="image-space-individual">
                <img
                  src={
                    generalDataAboutVehicle.left_img || dumieImg
                  }
                  alt=""
                  className="img-modal-damage"
                />
              </div>
            </button>

            <button
              className="image-size-car"
              onClick={() => setImgSelected("Superior")}
              style={{
                border: imgSelected === "Superior" ? "2px solid #ff8400" : "",
              }}
            >
              <p>Superior</p>
              <div className="image-space-individual">
                <img
                  src={
                    generalDataAboutVehicle.up_img || dumieImg
                  }
                  alt=""
                  className="img-modal-damage"
                />
              </div>
            </button>
          </div>
        )}

        <div className="down-space-danger">
          <input
            className="show-text-damage"
            type="text"
            value={`Sección Seleccionada << ${imgSelected} >>`}
            disabled
          />

          <select
            className="select_type_damage select-primary-medium"
            value={damageType}
            onChange={(e) => setDamageType(e.target.value)}
          >
            <option disabled value="">
              Elegir
            </option>
            <option value="rayon">Rayón</option>
            <option value="golpe">Golpe</option>
            <option value="raspadura">Raspadura</option>
            <option value="ponchadura">Ponchadura</option>
            <option value="otros">Otros</option>
          </select>

          <div className="space-description-damage">
            <textarea
              className="text-area-damage"
              placeholder="Descripción del daño"
              value={damageDescription}
              onChange={(e) => setDamageDescription(e.target.value)}
            />

            <div className="space-to-button-and-text-add-damage">
              Adjuntar imagen
              <button className="button-img">
                <img
                  src={takePictureImg}
                  className={preferenceColor === 1 ? "invertido" : ""}
                  alt=""
                />
              </button>
            </div>

            <textarea
              className="text-area-damage"
              placeholder="Descripción del evento"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
            />
          </div>

          <button
            className="button-primary-minus-medium-width-margin"
            onClick={saveData}
          >
            Aceptar y Guardar
          </button>
        </div>
      </div>
    </div>
  );
}