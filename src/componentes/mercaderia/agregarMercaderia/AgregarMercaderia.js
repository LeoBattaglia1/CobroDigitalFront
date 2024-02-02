import React, { useState } from "react";
import "./agregarMercaderia.css"; // Importa el archivo de estilos

const AgregarMercaderia = ({ handleBackMercaderia }) => {
  const [mercaderia, setMercaderia] = useState({
    codigo: "",
    Nombre: "",
    Precio: "",
  });

  const handleChange = (e) => {
    setMercaderia({
      ...mercaderia,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/mercaderia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mercaderia),
      });

      if (!response.ok) {
        console.error(
          `Error de red: ${response.status} - ${response.statusText}`
        );
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Limpiar el formulario y volver a la vista de mercadería
      setMercaderia({
        codigo: "",
        Nombre: "",
        Precio: "",
      });
    } catch (error) {
      console.error("Error durante la solicitud:", error);
    }
  };

  return (
    <div className="agregar-mercaderia-container2">
      <h2>Agregar Mercadería</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Codigo:
          <input
            type="text"
            name="codigo"
            value={mercaderia.codigo}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Nombre:
          <input
            type="text"
            name="Nombre"
            value={mercaderia.Nombre}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Precio:
          <input
            type="number"
            name="Precio"
            value={mercaderia.Precio}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <div className="button-container">
          <button type="button" onClick={handleBackMercaderia}>
            Volver
          </button>
          <button type="submit">Agregar</button>
        </div>
      </form>
    </div>
  );
};

export default AgregarMercaderia;
