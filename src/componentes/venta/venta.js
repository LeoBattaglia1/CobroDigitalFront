import React, { useState, useEffect } from "react";
import "./venta.css";
import jsPDF from "jspdf";

const Ventas = ({ handleBackInicio }) => {
  const [busquedaCodigo, setBusquedaCodigo] = useState("");
  const [busquedaNombre, setBusquedaNombre] = useState("");
  const [precioIngresado, setPrecioIngresado] = useState("");
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [sugerenciasNombres, setSugerenciasNombres] = useState([]);
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mostrarClientes, setMostrarClientes] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/mercaderia/${busquedaCodigo}`
        );

        if (response.ok) {
          const producto = await response.json();
          // Agregar el producto seleccionado a la lista de productos
          setProductosSeleccionados((prevProductos) => [
            producto,
            ...prevProductos,
          ]);
          // Limpiar el código de búsqueda después de agregar el producto
          setBusquedaCodigo("");
        } else {
          console.error(
            `Error de red: ${response.status} - ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error durante la solicitud:", error);
      }
    };

    // Realizar la solicitud solo si hay un código de búsqueda
    if (busquedaCodigo.trim() !== "") {
      fetchData();
    }
  }, [busquedaCodigo]);

  useEffect(() => {
    const fetchTodosLosProductos = async () => {
      try {
        const response = await fetch("http://localhost:3000/mercaderia");
        if (response.ok) {
          const productos = await response.json();
          // Filtrar los productos indeseados
          const productosFiltrados = productos.filter(
            (producto) =>
              producto.Nombre !== "-" &&
              producto.Nombre !== "Resto de un pago realizado"
          );
          // Establecer los productos filtrados en el estado
          setTodosLosProductos(productosFiltrados);
        } else {
          console.error(
            `Error de red: ${response.status} - ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error durante la solicitud:", error);
      }
    };

    fetchTodosLosProductos();
  }, []);

  useEffect(() => {
    // Filtrar y mapear sugerencias solo si la lista debe mostrarse
    if (mostrarSugerencias) {
      const sugerencias = todosLosProductos
        .filter(
          (producto) =>
            producto.Nombre &&
            producto.Nombre.toLowerCase().includes(busquedaNombre.toLowerCase())
        )
        .map((producto) => producto.Nombre);

      setSugerenciasNombres(sugerencias);
    }
  }, [busquedaNombre, todosLosProductos, mostrarSugerencias]);

  //ingreso de precio y guarda el precio con un id igual al valor
  const handleKeyPress = async (e) => {
    if (e.key === "Enter" && !isNaN(parseFloat(precioIngresado))) {
      // Validar que el valor ingresado sea un número
      const nuevoProducto = {
        codigo: precioIngresado.toString() + "000000",
        Nombre: "-",
        Precio: parseFloat(precioIngresado).toFixed(),
      };
      setProductosSeleccionados([nuevoProducto, ...productosSeleccionados]);

      // Realizar una solicitud GET para verificar la existencia del ID
      const nuevoCodigo = nuevoProducto.codigo;
      try {
        const checkResponse = await fetch(
          `http://localhost:3000/mercaderia/${nuevoCodigo}`
        );
        if (checkResponse.ok) {
          console.error(
            "Ya existe un registro con el mismo ID. Otra opción permitida."
          );
          return; // No hacer el POST, pero permitir la otra opción
        }
      } catch (error) {
        console.error(
          "Error al verificar la existencia del ID:",
          error.message
        );
        return;
      }

      // Si no existe un registro con el mismo ID, realizar la solicitud POST
      try {
        const response = await fetch("http://localhost:3000/mercaderia", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            codigo: precioIngresado.toString() + "000000",
            Nombre: "-",
            Precio: parseFloat(precioIngresado).toFixed(),
          }),
        });

        if (!response.ok) {
          // Manejar el caso en que la solicitud no sea exitosa
          console.error(
            "Error al realizar la solicitud POST:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error al realizar la solicitud POST:", error.message);
      }

      setPrecioIngresado(""); // Limpiar el input de precio después de agregarlo y hacer el POST
    }
  };

  const handleChangeCodigo = (e) => {
    setBusquedaCodigo(e.target.value);
  };

  ///para búsquedas por nombre
  const handleChangeNombre = (e) => {
    setBusquedaNombre(e.target.value);
    // Mostrar las sugerencias solo si hay algo escrito en el input
    setMostrarSugerencias(e.target.value.trim() !== "");
  };

  const handleClickSugerencia = async (nombre) => {
    try {
      const response = await fetch(
        `http://localhost:3000/mercaderia/?Nombre_like=${nombre}&Nombre_ne=Resto%20de%20un%20pago%20realizado&Nombre_ne=-`
      );

      if (response.ok) {
        const productos = await response.json();

        const producto = productos.find((p) => p.Nombre === nombre);

        if (producto) {
          setProductosSeleccionados([
            { ...producto, Nombre: nombre },
            ...productosSeleccionados,
          ]);

          setBusquedaNombre("");
          setSugerenciasNombres([]);
          setMostrarSugerencias(false);
        } else {
          console.error("Producto no encontrado para el nombre:", nombre);
        }
      } else {
        console.error(
          `Error al obtener la lista de productos. Código de respuesta: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error.message);
    }
  };

  const handleInputBlur = () => {
    // Ocultar las sugerencias cuando el input pierde foco
    setMostrarSugerencias(false);
  };
  /////////////////////////

  //FUNCION PARA ELIMINAR PRODUCTO DE LA LISTA
  const handleRemoveProducto = (index) => {
    // Remover el producto de la lista al hacer clic en la "x"
    const nuevosProductos = [...productosSeleccionados];
    nuevosProductos.splice(index, 1);
    setProductosSeleccionados(nuevosProductos);
  };

  // Función para calcular el total de los precios
  const calcularTotal = () => {
    return productosSeleccionados.reduce(
      (total, producto) => total + parseFloat(producto.Precio),
      0
    );
  };

  /////////////////////////////////////////
  const obtenerFechaActual = () => {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, "0");
    const day = String(ahora.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  async function procesarCajaPorFecha() {
    const url = "http://localhost:3000/caja/";
    const fechaHoy = obtenerFechaActual(); // Utiliza la nueva función

    console.log("Fecha de hoy:", fechaHoy);

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
        setProductosSeleccionados([]);
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

  const handleFiadoClick = async () => {
    try {
      if (mostrarClientes) {
        setMostrarClientes(false);
        return;
      }
      const response = await fetch("http://localhost:3000/clientes");

      if (response.ok) {
        const clientesData = await response.json();
        setClientes(clientesData);
        setMostrarClientes(true);
      } else {
        console.error(
          `Error al realizar la petición. Código de respuesta: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error al realizar la petición:", error.message);
    }
  };

  const handleClienteSeleccionado = (id) => {
    setClienteSeleccionadoId(id);
  };

  const handleGuardarClick = async () => {
    // Realizar el POST con el ID del cliente seleccionado y los productos seleccionados
    if (clienteSeleccionadoId !== null && productosSeleccionados.length > 0) {
      try {
        const fechaHoy = obtenerFechaActual();

        // Mapear los códigos de los productos
        const codigosProductos = productosSeleccionados.map(
          (producto) => producto.codigo
        );
        console.log(codigosProductos);
        // Realizar una solicitud POST por cada código de producto
        const promesasPost = codigosProductos.map(async (codigoProducto) => {
          const response = await fetch(
            "http://localhost:3000/cliente_mercaderia",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ClienteID: clienteSeleccionadoId,
                codigo: codigoProducto,
                fecha: fechaHoy,
              }),
            }
          );

          if (response.ok) {
            console.log(
              `Se guardó correctamente para el código ${codigoProducto}.`
            );
          } else {
            console.error(
              `Error al realizar la petición para el código ${codigoProducto}. Código de respuesta: ${response.status}`
            );
          }
        });

        // Esperar a que todas las solicitudes POST se completen
        await Promise.all(promesasPost);

        console.log(fechaHoy);
        console.log(clienteSeleccionadoId);
        console.log(productosSeleccionados);
        console.log("codigos de productos", codigosProductos);
        // Limpiar la tabla de productos seleccionados y ocultar la tabla de clientes
        setProductosSeleccionados([]);
        setMostrarClientes(false);

        console.log("Todos los registros se guardaron correctamente.");
      } catch (error) {
        console.error("Error al realizar la petición:", error.message);
      }
    } else {
      console.warn("Ningún cliente seleccionado o productos para guardar.");
    }
  };

  /////////////////////////////////////
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Obtener la fecha actual en formato DD/MM/YYYY
    const today = new Date();
    const formattedDate = `${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}`;

    // Agregar encabezado con la fecha actual
    doc.text(`Vente del dia: ${formattedDate}`, 10, 10);

    // Array para almacenar líneas de texto
    const lines = [];

    // Iterar sobre los datos de la tabla y agregarlos al array de líneas
    productosSeleccionados.forEach((producto, index) => {
      lines.push(`${producto.Nombre} - $ ${producto.Precio}`);
    });

    // Agregar el total al array de líneas
    lines.push(`Total: $${calcularTotal()}`);

    // Agregar espacio adicional
    lines.push(""); // Línea en blanco como espacio adicional

    // Agregar párrafo adicional
    lines.push(
      "ACLARACION: aquellos precios que no muestra el producto corresponde a"
    );
    lines.push(
      "mercaderia que no está registrada en el sistema como por ejemplo,"
    );
    lines.push("aquellas que deben ser pesadas (frutas, fiambres, milanesas,");
    lines.push("alimentos para mascotas, etc)");

    // Iterar sobre las líneas y agregarlas al PDF
    lines.forEach((line, index) => {
      const yPosition = 20 + index * 10;
      // Agregar la línea al PDF
      doc.text(line, 10, yPosition);
    });

    // Guardar el PDF
    doc.save("datos_exportados.pdf");
  };

  ///////////////////////////////////////////

  return (
    <div className="ventas-container">
      <button
        type="button"
        onClick={handleBackInicio}
        className="volverInicioV"
      >
        Volver
      </button>
      <h1>Ventas</h1>

      <div className="buscador-container">
        <input
          type="text"
          placeholder="Buscar por código"
          value={busquedaCodigo}
          onChange={handleChangeCodigo}
        />
        <input
          type="text"
          placeholder="Ingresar precio"
          value={precioIngresado}
          onChange={(e) => setPrecioIngresado(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={busquedaNombre}
          onChange={handleChangeNombre}
          onFocus={() => setMostrarSugerencias(busquedaNombre.trim() !== "")}
          onBlur={handleInputBlur}
        />
        {sugerenciasNombres.length > 0 && (
          <ul className="sugerencias-nombres">
            {sugerenciasNombres.map((nombre, index) => (
              <li key={index} onClick={() => handleClickSugerencia(nombre)}>
                {nombre}
              </li>
            ))}
          </ul>
        )}
        <p>Total productos: {productosSeleccionados.length}</p>{" "}
        {/* Contador de productos */}
      </div>

      <table className="tabla-ventas">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productosSeleccionados.map((producto, index) => (
            <tr key={index}>
              <td>{producto.Nombre}</td>
              <td>$ {producto.Precio}</td>
              <td>
                <button
                  className="sacarProducto"
                  type="button"
                  onClick={() => handleRemoveProducto(index)}
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="parte-dos">
        <p>Total Venta: $ {calcularTotal()}</p>
        <div className="button-container">
          <button
            type="button"
            onClick={procesarCajaPorFecha}
            disabled={calcularTotal() === 0}
          >
            Cobrar
          </button>
          <button type="button" onClick={handleExportPDF}>
            Exportar Venta (antes de cobrar)
          </button>
          <button
            type="button"
            onClick={handleFiadoClick}
            disabled={calcularTotal() === 0}
          >
            Fiado
          </button>
        </div>
      </div>

      {/* Tabla para mostrar la lista de clientes */}
      {mostrarClientes && (
        <div className="tabla-clientes">
          <h2>Lista de Clientes</h2>
          <table>
            <thead>
              <tr></tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.ClienteID}>
                  <td>
                    <input
                      type="radio"
                      name="clienteRadio"
                      value={cliente.ClienteID}
                      checked={clienteSeleccionadoId === cliente.ClienteID}
                      onChange={() =>
                        handleClienteSeleccionado(cliente.ClienteID)
                      }
                    />

                    {cliente.Nombre}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Botón de guardar al final de la lista */}
          <button type="button" onClick={handleGuardarClick}>
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

export default Ventas;
