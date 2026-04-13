import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { getTypeVehicle } from "../../scripts/vehicle/generalInfoVehicle/getVehicles";

export default function ModalChangeDataToService({ onClose }) {
  const { numberVehicle } = useParams();

  const [changeDataView, setChangeDataView] = useState(1);
  const [vehicleNumber, setVehicleNumber] = useState(null);
  const [generalDataAboutVehicle, setGeneralDataAboutVehicle] = useState(null);

  // (Opcional) estados si después quieres hacer editable real
  const [form, setForm] = useState({
    conductor: "",
    apoyo1: "",
    apoyo2: "",
    apoyo3: "",
    typeService: "",
    folio: "",
    cologne: "",
    street: "",
    cross: "",
    reporter: "",
    phone: "",
    closeType: "",
    conclusions: "",
    closeKm: "",
  });

  useEffect(() => {
    const init = async () => {
      setVehicleNumber(numberVehicle);
      const data = await getTypeVehicle(numberVehicle);
      setGeneralDataAboutVehicle(data);
    };

    init();
  }, [numberVehicle]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveData = () => {
    alert("hola");

    // aquí puedes enviar form al backend
    // console.log(form);

    onClose?.();
  };

  return (
    <div className="modal-view-report">
      <div className="modal-body-change-data">

        <div className="up-close-zone">
          <button className="button-close-modal" onClick={onClose}>
            X
          </button>
        </div>

        <h1 className="text-style-color-and-family-modal-tittle">
          Cambio de Datos de Servicio
        </h1>

        <div className="button-view-space">
          <button
            className="butto-change-data text-style-color-and-family"
            onClick={() => setChangeDataView(1)}
            style={
              changeDataView === 1
                ? { borderBottom: "2px solid var(--borderBottomDecoration)" }
                : {}
            }
          >
            Datos de Tripulación
          </button>

          <button
            className="butto-change-data text-style-color-and-family"
            onClick={() => setChangeDataView(2)}
            style={
              changeDataView === 2
                ? { borderBottom: "2px solid var(--borderBottomDecoration)" }
                : {}
            }
          >
            Datos de Servicio
          </button>

          <button
            className="butto-change-data text-style-color-and-family"
            onClick={() => setChangeDataView(3)}
            style={
              changeDataView === 3
                ? { borderBottom: "2px solid var(--borderBottomDecoration)" }
                : {}
            }
          >
            Datos de Cierre
          </button>
        </div>

        {/* VIEW 1 */}
        {changeDataView === 1 && (
          <table className="change-close-service">
            <tbody>
              <tr>
                <td>Conductor:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.conductor}
                    onChange={(e) =>
                      handleChange("conductor", e.target.value)
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>Apoyo 1:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.apoyo1}
                    onChange={(e) => handleChange("apoyo1", e.target.value)}
                  />
                </td>
              </tr>

              <tr>
                <td>Apoyo 2:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.apoyo2}
                    onChange={(e) => handleChange("apoyo2", e.target.value)}
                  />
                </td>
              </tr>

              <tr>
                <td>Apoyo 3:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.apoyo3}
                    onChange={(e) => handleChange("apoyo3", e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* VIEW 2 */}
        {changeDataView === 2 && (
          <table className="change-close-service">
            <tbody>
              <tr>
                <td>Tipo de Servicio:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.typeService}
                    onChange={(e) =>
                      handleChange("typeService", e.target.value)
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>Folio:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.folio}
                    onChange={(e) => handleChange("folio", e.target.value)}
                  />
                </td>
              </tr>

              <tr>
                <td>Colonia:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.cologne}
                    onChange={(e) => handleChange("cologne", e.target.value)}
                  />
                </td>
              </tr>

              <tr>
                <td>Calle:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.street}
                    onChange={(e) => handleChange("street", e.target.value)}
                  />
                </td>
              </tr>

              <tr>
                <td>Cruce:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.cross}
                    onChange={(e) => handleChange("cross", e.target.value)}
                  />
                </td>
              </tr>

              <tr>
                <td>Reportante:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.reporter}
                    onChange={(e) => handleChange("reporter", e.target.value)}
                  />
                </td>
              </tr>

              <tr>
                <td>Teléfono:</td>
                <td>
                  <input
                    className="input-search-small-width"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* VIEW 3 */}
        {changeDataView === 3 && (
          <div className="close-service-form">
            <div className="form-group">
              <label>Tipo de Cierre:</label>
              <input
                className="input-search-medium-width"
                value={form.closeType}
                onChange={(e) => handleChange("closeType", e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Generales y Conclusiones del Servicio:</label>
              <textarea
                className="text-area-close-service"
                value={form.conclusions}
                onChange={(e) =>
                  handleChange("conclusions", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Kilometraje de Cierre:</label>
              <input
                className="input-search-medium-width"
                value={form.closeKm}
                onChange={(e) => handleChange("closeKm", e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="down-space-danger">
          <button
            className="button-primary-medium-width-margin"
            onClick={saveData}
          >
            Aceptar y Guardar
          </button>
        </div>
      </div>
    </div>
  );
}