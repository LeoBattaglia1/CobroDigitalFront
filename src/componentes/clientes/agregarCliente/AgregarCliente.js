import React, { useState } from "react";
import "./agregarCliente.css"; // Importa el archivo de estilos

const AgregarCliente = ({ handleBack }) => {
  const [cliente, setCliente] = useState({
    Nombre: "",
    Telefono: "",
    Direccion: "",
  });

  const handleChange = (e) => {
    setCliente({
      ...cliente,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cliente),
      });

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
    <div className="agregar-cliente-container2">
      <h2>Agregar Cliente</h2>

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
        <div className="button-container">
          <button type="button" onClick={handleBack}>
            Volver
          </button>
          <button type="submit">Agregar</button>
        </div>
      </form>
    </div>
  );
};

export default AgregarCliente;
