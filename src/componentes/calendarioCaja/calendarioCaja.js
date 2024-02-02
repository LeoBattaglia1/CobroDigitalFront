import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendarioCaja.css";

const CalendarioCaja = ({ handleBackInicio }) => {
  const [datosCaja, setDatosCaja] = useState([]);
  const [fechaActual] = useState(new Date());

  useEffect(() => {
    // Lógica para obtener los datos de caja desde la API
    const obtenerDatosCaja = async () => {
      try {
        const response = await fetch("http://localhost:3000/caja");
        if (response.ok) {
          const datos = await response.json();
          setDatosCaja(datos);
        } else {
          console.error(
            `Error al obtener los datos de caja. Código de respuesta: ${response.status}`
          );
        }
      } catch (error) {
        console.error("Error al realizar la petición:", error.message);
      }
    };

    obtenerDatosCaja();
  }, []);

  // Configurar el localizador en español y ajustar el formato de fecha
  const localizer = momentLocalizer(moment);

  // Mapear solo la información necesaria de la columna 'caja'
  const eventosCaja = datosCaja.map((caja) => ({
    title: `$ ${caja.caja}`,
    start: moment(caja.fecha).toDate(), // Convertir la fecha al formato adecuado
    end: moment(caja.fecha).toDate(),
  }));

  const eventPropGetter = (event) => {
    return {
      style: {
        backgroundColor: "#4caf50", // Fondo verde
        color: "white", // Texto blanco
        fontSize: "25px", // Tamaño de fuente más grande
        textAlign: "center", // Texto centrado
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
      },
    };
  };

  return (
    <div className="calendario-caja-container">
      <button
        type="button"
        onClick={handleBackInicio}
        className="volverInicio"
        style={{ marginBottom: "40px" }}
      >
        Volver
      </button>

      <BigCalendar
        localizer={localizer}
        events={eventosCaja}
        defaultDate={fechaActual}
        views={["agenda"]} // Mostrar solo la vista de agenda
        defaultView="agenda"
        showTimeslots={false}
        onSelectEvent={(event) => console.log(event)}
        onSelectSlot={(slotInfo) => console.log(slotInfo)}
        eventPropGetter={eventPropGetter}
      />
    </div>
  );
};

export default CalendarioCaja;
