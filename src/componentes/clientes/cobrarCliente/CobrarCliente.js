import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "./cobrarCliente.css";

const CobrarCliente = ({ handleBack, selectedCliente }) => {
  const [datosMercaderia, setDatosMercaderia] = useState([]);
  const initialSelectedRows = datosMercaderia.map(() => true);
  const [selectedRows, setSelectedRows] = useState(initialSelectedRows);
  const [idsClienteMercaderia, setIdsClienteMercaderia] = useState([]);
  const [rowsInfo, setRowsInfo] = useState([]);

  const handleCheckboxChange = (index) => {
    // Actualizar el estado selectedRows
    const newSelectedRows = [...selectedRows];
    newSelectedRows[index] = !newSelectedRows[index];
    setSelectedRows(newSelectedRows);

    const updatedRowsInfo = datosMercaderia.map((mercaderia, i) => ({
      id: idsClienteMercaderia[i],
      isSelected: newSelectedRows[i],
    }));

    setRowsInfo(updatedRowsInfo);
  };

  const obtenerFechaActual = () => {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, "0");
    const day = String(ahora.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const calcularTotal = () => {
    return datosMercaderia.reduce((total, mercaderia, index) => {
      if (selectedRows[index]) {
        return total + parseFloat(mercaderia.precio);
      }
      return total;
    }, 0);
  };

  /////funciones para editar la caja (5 funciones) /////////////
  async function procesarCajaPorFecha() {
    const url = "http://localhost:3000/caja/";
    const fechaHoy = obtenerFechaActual();

    try {
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const idEncontrado = buscarIdPorFechaEnRespuesta(data, fechaHoy);
        if (idEncontrado) {
          const cajaExistente = await obtenerCajaPorId(idEncontrado);
          const nuevoTotal = parseFloat(cajaExistente) + calcularTotal();
          await actualizarCajaPorId(idEncontrado, nuevoTotal);
          console.log(`Se actualizó la caja con ID ${idEncontrado}`);
        } else {
          const nuevoTotal = calcularTotal();
          await crearNuevoRegistro(fechaHoy, nuevoTotal);
          console.log("Se creó un nuevo registro para la fecha de hoy.");
        }
      } else {
        console.error(
          `Error al realizar la petición. Código de respuesta: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error al realizar la petición:", error.message);
    }
  }
  function buscarIdPorFechaEnRespuesta(datos, fecha) {
    for (const entrada of datos) {
      if (entrada.fecha === fecha) {
        return entrada.id;
      }
    }
    return null;
  }
  async function obtenerCajaPorId(id) {
    const url = `http://localhost:3000/caja/${id}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data.caja;
    } else {
      throw new Error(
        `Error al obtener la caja con ID ${id}. Código de respuesta: ${response.status}`
      );
    }
  }
  async function actualizarCajaPorId(id, nuevoTotal) {
    const url = `http://localhost:3000/caja/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ caja: nuevoTotal }),
    });

    if (!response.ok) {
      throw new Error(
        `Error al actualizar la caja con ID ${id}. Código de respuesta: ${response.status}`
      );
    }
  }
  async function crearNuevoRegistro(fecha, nuevoTotal) {
    const url = "http://localhost:3000/caja/";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fecha, caja: nuevoTotal }),
    });

    if (!response.ok) {
      throw new Error(
        `Error al crear un nuevo registro. Código de respuesta: ${response.status}`
      );
    }
  } ////////////////////////////////////////////////////////

  // Función para eliminar registros seleccionados
  const deleteSelectedRows = async () => {
    const rowsToDelete = rowsInfo.filter((row) => row.isSelected);

    for (const row of rowsToDelete) {
      try {
        // Obtener el índice correspondiente del ID en idsClienteMercaderia
        const index = idsClienteMercaderia.indexOf(row.id);

        // Verificar que el índice sea válido antes de realizar la solicitud DELETE
        if (index !== -1) {
          // Realizar la solicitud DELETE a la API
          const response = await fetch(
            `http://localhost:3000/cliente_mercaderia/${row.id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            console.log(`Registro con ID ${row.id} eliminado correctamente.`);

            // Actualizar el estado idsClienteMercaderia eliminando el ID correspondiente
            setIdsClienteMercaderia((prevIds) => [
              ...prevIds.slice(0, index),
              ...prevIds.slice(index + 1),
            ]);

            // Después de eliminar, obtener los nuevos datos de la API
            const clienteID = selectedCliente.ClienteID;
            const response = await fetch(
              `http://localhost:3000/cliente_mercaderia/mercaderias/${clienteID}`
            );
            const newData = await response.json();

            // Actualizar el estado datosMercaderia
            setDatosMercaderia(newData);

            console.log("Registros eliminados y tabla actualizada.");
          } else {
            console.error(`Error al eliminar el registro con ID ${row.id}.`);
          }
        } else {
          console.error(`Índice no encontrado para el ID ${row.id}.`);
        }
      } catch (error) {
        console.error(
          "Error al realizar la operación de eliminación:",
          error.message
        );
      }
    }
  };

  /////////////////////////////////////
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const today = new Date();
    const formattedDate = `${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}`;

    // Agregar encabezado
    doc.text(`Deuda Registrada al día: ${formattedDate}`, 10, 10);
    doc.text(`Cliente: ${selectedCliente.Nombre}`, 10, 20);

    // Iterar sobre los datos de la tabla y agregarlos al PDF
    datosMercaderia.forEach((mercaderia, index) => {
      if (selectedRows[index]) {
        doc.text(
          `${mercaderia.fecha} - ${mercaderia.Nombre} - $${mercaderia.precio}`,
          10,
          30 + index * 10
        );
      }
    });

    // Agregar el total al PDF
    const totalPosition = 30 + datosMercaderia.length * 10;
    doc.text(`Total: $${calcularTotal()}`, 10, totalPosition);

    // Agregar espacio adicional
    const espacioAdicionalPosition = totalPosition + 10;
    doc.text("", 10, espacioAdicionalPosition); // Línea en blanco como espacio adicional

    // Agregar párrafo adicional
    const paragraphLines = [
      "ACLARACION: aquellos precios que no muestra el producto corresponden a",
      "mercadería que no está registrada en el sistema como por ejemplo,",
      "aquellas que deben ser pesadas (frutas, fiambres, milanesas,",
      "alimentos para mascotas, etc)",
    ];

    // Iterar sobre las líneas del párrafo adicional y agregarlas al PDF
    paragraphLines.forEach((line, index) => {
      const paragraphPosition = espacioAdicionalPosition + index * 10 + 10;
      doc.text(line, 10, paragraphPosition);
    });

    // Guardar el PDF
    doc.save("datos_exportados.pdf");
  };

  ///////////////////////////////////////////

  useEffect(() => {
    const clienteID = selectedCliente.ClienteID;

    const fetchData = async () => {
      try {
        // Obtener datos de mercadería
        const response = await fetch(
          `http://localhost:3000/cliente_mercaderia/mercaderias/${clienteID}`
        );
        const data = await response.json();

        // Establecer datos de mercadería y seleccionar todas las filas por defecto
        setDatosMercaderia(data);
        setSelectedRows(new Array(data.length).fill(true));

        // Obtener los IDs de cliente_mercaderia después de obtener los datos
        const url = `http://localhost:3000/cliente_mercaderia/${clienteID}/ids`;
        const idsResponse = await fetch(url);
        const idsData = await idsResponse.json();
        console.log("IDs de cliente_mercaderia:", idsData);

        // Almacenar los IDs en el estado
        setIdsClienteMercaderia(idsData);
      } catch (error) {
        console.error("Error al obtener datos de mercadería:", error.message);
      }
    };

    // Llamar a la función fetchData al cargar o cuando cambia el cliente seleccionado
    fetchData();
  }, [selectedCliente.ClienteID]);

  return (
    <div className="container">
      <button type="button" onClick={handleBack} className="volverInicio">
        Volver
      </button>
      <h2 className="header">{selectedCliente.Nombre}</h2>
      <table className="tabla-cobrar">
        <thead>
          <tr>
            <th>Seleccionar</th>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {datosMercaderia.map((mercaderia, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows[index] || false}
                  onChange={() => handleCheckboxChange(index)}
                />
              </td>
              <td>{mercaderia.fecha}</td>
              <td>{mercaderia.Nombre}</td>
              <td>$ {mercaderia.precio}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cobranza">
        <p>Total: $ {calcularTotal()}</p>
        <div className="button-container">
          <button
            type="button"
            onClick={() => {
              const confirmMessage = `¿El cliente ${
                selectedCliente.Nombre
              } va a pagar la suma de $${calcularTotal()}?`;

              if (window.confirm(confirmMessage)) {
                procesarCajaPorFecha();
                deleteSelectedRows();
              }
            }}
          >
            Cobrar
          </button>
          <button type="button" onClick={handleExportPDF}>
            Exportar Deuda (antes de cobrar)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CobrarCliente;
