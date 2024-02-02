import React, { useEffect, useState } from "react";
import "./clientes.css";

const Clientes = ({ handleBackInicio, mostrar, handleSelectCliente }) => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/clientes");

        if (!response.ok) {
          console.error(
            `Error de red: ${response.status} - ${response.statusText}`
          );
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setClientes(data);
      } catch (error) {
        console.error("Error durante la solicitud:", error);
      }
    };

    fetchData();
  }, []);

  const handleSelectFila = (clienteID) => {
    setClienteSeleccionado(clienteID);

    // Actualiza la fila seleccionada
    setFilaSeleccionada(clienteID);
  };

  const handleEliminarCliente = () => {
    console.log(clienteSeleccionado);
    const cliente = clientes.find((c) => c.ClienteID === clienteSeleccionado);
    const confirmarEliminar = window.confirm(
      `¿Estás seguro de que quieres eliminar a ${cliente.Nombre}?`
    );

    if (confirmarEliminar) {
      const url = `http://localhost:3000/clientes/${clienteSeleccionado}`;

      fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Error de red: ${response.status} - ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          console.log("Cliente eliminado:", data);
          // Aquí puedes actualizar el estado o realizar otras acciones después de la eliminación.
        })
        .catch((error) => {
          window.confirm(`No se puede eliminar un cliente que tenga deuda`);
        });
      const nuevosClientes = clientes.filter(
        (c) => c.ClienteID !== clienteSeleccionado
      );
      setClientes(nuevosClientes);

      // Limpiar la selección después de eliminar
      setClienteSeleccionado(null);
      setFilaSeleccionada(null);
    }
  };

  return (
    <div className="container">
      {" "}
      <button type="button" onClick={handleBackInicio} className="volverInicio">
        Volver
      </button>
      <h2 className="header">Clientes</h2>
      <button onClick={() => mostrar("agregarCliente")} className="add-button">
        Agregar
      </button>
      <button
        onClick={() => mostrar("editarCliente")}
        className="edit-button"
        disabled={!clienteSeleccionado}
      >
        Editar
      </button>
      <button
        className="delete-button"
        disabled={!clienteSeleccionado}
        onClick={handleEliminarCliente}
      >
        {" "}
        Eliminar
      </button>
      <button
        onClick={() => mostrar("cobrarCliente", clienteSeleccionado?.ClienteID)}
        className="charge-button"
        disabled={!clienteSeleccionado}
      >
        Cobrar
      </button>
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Dirección</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente, index) => (
            <tr
              key={cliente.ClienteID}
              className={`${
                filaSeleccionada === cliente.ClienteID ? "selected" : ""
              } ${index % 2 === 0 ? "even" : ""}`}
              onClick={() => {
                handleSelectFila(cliente.ClienteID);
                handleSelectCliente(cliente);
              }}
            >
              <td>{cliente.Nombre}</td>
              <td>{cliente.Telefono}</td>
              <td>{cliente.Direccion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Clientes;
