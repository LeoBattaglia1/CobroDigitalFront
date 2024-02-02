import React, { useState, useEffect } from "react";
import "./editarCliente.css";

const EditarCliente = ({ handleBack, selectedCliente }) => {
  const [cliente, setCliente] = useState({
    Nombre: "",
    Telefono: "",
    Direccion: "",
  });

  useEffect(() => {
    // Se ejecuta cuando cambia el cliente seleccionado
    setCliente({
      Nombre: selectedCliente.Nombre || "",
      Telefono: selectedCliente.Telefono || "",
      Direccion: selectedCliente.Direccion || "",
    });
  }, [selectedCliente]);

  const handleChange = (e) => {
    setCliente({
      ...cliente,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:3000/clientes/${selectedCliente.ClienteID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cliente),
        }
      );

      if (!response.ok) {
        console.error(
          `Error de red: ${response.status} - ${response.statusText}`
        );
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Limpiar el formulario y volver a la vista de clientes
      setCliente({
        Nombre: "",
        Telefono: "",
        Direccion: "",
      });
      handleBack();
    } catch (error) {
      console.error("Error durante la solicitud:", error);
    }
  };

  return (
    <div className="editar-cliente-container2">
      <h2>Editar Cliente</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre y Apellido:
          <input
            type="text"
            name="Nombre"
            value={cliente.Nombre}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Teléfono:
          <input
            type="text"
            name="Telefono"
            value={cliente.Telefono}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Dirección:
          <input
            type="text"
            name="Direccion"
            value={cliente.Direccion}
            onChange={handleChange}
          />
        </label>
        <br />
        <div className="button-container">
          <button type="button" onClick={handleBack}>
            Volver
          </button>
          <button type="submit">Guardar cambios</button>
        </div>
      </form>
    </div>
  );
};

export default EditarCliente;
