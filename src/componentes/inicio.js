import React, { useState, useEffect } from "react";
import "./inicio.css";

const Inicio = ({ mostrar }) => {
  const [fechaHoraActual, setFechaHoraActual] = useState("");

  useEffect(() => {
    // Función para obtener la fecha y hora actual formateada
    const obtenerFechaHoraActual = () => {
      const ahora = new Date();
      const opciones = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };
      return ahora.toLocaleDateString(undefined, opciones);
    };

    // Actualizar la fecha y hora actual cada segundo
    const intervalo = setInterval(() => {
      setFechaHoraActual(obtenerFechaHoraActual());
    }, 1000);

    // Limpieza del intervalo al desmontar el componente
    return () => clearInterval(intervalo);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecutará una vez al montar el componente

  return (
    <div className="column">
      <button onClick={() => mostrar("venta")} className="buttonVenta">
        Venta
      </button>
      <button onClick={() => mostrar("clientes")} className="buttonClientes">
        Clientes
      </button>
      <button
        onClick={() => mostrar("mercaderia")}
        className="buttonMercaderia"
      >
        Mercadería
      </button>
      <div className="informacion-container">
        <p>{fechaHoraActual}</p>
        {/* Agrega tu botón con el logo de información aquí */}
        <button
          className="buttonInformacion"
          onClick={() => mostrar("calendarioCaja")}
        >
          ℹ️
        </button>
      </div>
    </div>
  );
};

export default Inicio;
