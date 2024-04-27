import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import "./cobrarCliente.css";

const CobrarCliente = ({ handleBack, selectedCliente }) => {
  const [datosMercaderia, setDatosMercaderia] = useState([]);
  const [valorIngresado, setValorIngresado] = useState("");
  const [valorProductosSeleccionados, setValorProductosSeleccionados] =
    useState(0);
  const [resto, setResto] = useState(0);
  const [idsSeleccionados, setIdsSeleccionados] = useState([]);

  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  /*  /////funciones para editar la caja (5 funciones) ///////////// SIN FUNCIONAMIENTO DESDE LA ULTIMA ACTUALIZACION FINES DE ABRIL
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
 */
  /////////////////////////////////////
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const today = new Date();
    const formattedDate = `${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}`;

    // Agregar encabezado en la primera página
    doc.text(`Deuda Registrada al día: ${formattedDate}`, 10, 10);
    doc.text(`Cliente: ${selectedCliente.Nombre}`, 10, 20);

    let currentPage = 1; // Página actual del PDF
    let yPosition = 30; // Posición inicial para datos

    // Iterar sobre los datos de la tabla y agregarlos al PDF
    datosMercaderia.forEach((mercaderia, index) => {
      const text = `${mercaderia.fecha} - ${mercaderia.Nombre} - $${mercaderia.precio}`;
      const textHeight = doc.getTextDimensions(text).h;

      if (yPosition + textHeight > 280) {
        // 280 es el alto máximo de la página (ajustar según sea necesario)
        doc.addPage(); // Agregar nueva página
        currentPage++;
        yPosition = 10; // Reiniciar la posición en la nueva página
      }

      doc.text(text, 10, yPosition);
      yPosition += textHeight + 5; // Aumentar la posición para el siguiente elemento
    });

    // Agregar el total al PDF en la última página
    doc.text(`Total: $${calcularTotal()}`, 10, yPosition + 10);

    // Agregar espacio adicional en la última página
    const espacioAdicionalPosition = yPosition + 30;
    doc.text("", 10, espacioAdicionalPosition); // Línea en blanco como espacio adicional

    // Agregar párrafo adicional en la última página
    const paragraphLines = [
      "ACLARACION: aquellos precios que no muestra el producto corresponden a",
      "mercadería que no está registrada en el sistema como por ejemplo,",
      "aquellas que deben ser pesadas (frutas, fiambres, milanesas,",
      "alimentos para mascotas, etc)",
    ];

    paragraphLines.forEach((line, index) => {
      const paragraphPosition = espacioAdicionalPosition + index * 10 + 10;
      doc.text(line, 10, paragraphPosition);
    });

    // Guardar el PDF
    doc.save("datos_exportados.pdf");
  };

  ///////////////////////////////////////////

  // Función para manejar el cambio en el input del valor ingresado
  const handleChangeValorIngresado = (event) => {
    setValorIngresado(event.target.value);
  };

  const obtenerIdClienteMercaderia = async (producto) => {
    try {
      // Hacer la solicitud GET al endpoint para obtener los IDs de cliente_mercaderia
      const clienteID = selectedCliente.ClienteID;

      const response = await axios.get(
        `http://localhost:3000/cliente_mercaderia/${clienteID}/ids`
      );
      // Suponiendo que el endpoint devuelve un array de IDs
      return response.data;
    } catch (error) {
      console.error("Error al obtener los IDs de cliente_mercaderia:", error);
      // Manejar el error apropiadamente, por ejemplo, lanzando una excepción o devolviendo un valor por defecto
      return null;
    }
  };

  // Función para procesar la selección de productos según el valor ingresado
  const procesarSeleccionProductos = async () => {
    const valor = parseFloat(valorIngresado);
    let sumaTotal = 0;
    let productosSeleccionados = [];
    let idsSeleccionados = []; // Agregar una lista para los IDs seleccionados

    for (const producto of datosMercaderia) {
      // Obtener los IDs correspondientes al producto
      const ids = await obtenerIdClienteMercaderia(producto);

      // Iterar sobre los IDs y agregarlos a la lista de IDs seleccionados
      for (const id of ids) {
        // Verificar si el producto está seleccionado o su ID está en la lista de IDs seleccionados
        const isSelected =
          productosSeleccionados.includes(producto) ||
          idsSeleccionados.includes(id);

        if (!isSelected) {
          // Si el producto no está seleccionado y el ID no está en la lista, continuar verificando si se debe seleccionar el producto según el valor ingresado
          sumaTotal += parseFloat(producto.precio);
          if (sumaTotal <= valor) {
            productosSeleccionados.push(producto);
            idsSeleccionados.push(id); // Agregar el ID correspondiente al producto seleccionado
          } else {
            break;
          }
        }
      }
    }

    const valorTotalProductosSeleccionados = productosSeleccionados.reduce(
      (total, producto) => total + parseFloat(producto.precio),
      0
    );
    const resto = valor - valorTotalProductosSeleccionados;

    setProductosSeleccionados(productosSeleccionados);
    setIdsSeleccionados(idsSeleccionados);
    setValorProductosSeleccionados(valorTotalProductosSeleccionados);
    setResto(resto);
    setMostrarResultado(true); // Mostrar los resultados después de calcularlos
  };

  // Función para manejar el evento de seleccionar una fila manualmente
  const handlSeeleccionarFila = async (index) => {
    const productoSeleccionado = datosMercaderia[index];
    const isSelected = productosSeleccionados.includes(productoSeleccionado);
    const idsProducto = await obtenerIdClienteMercaderia(productoSeleccionado);
    const idSeleccionado =
      idsProducto && idsProducto.length > index ? idsProducto[index] : null;

    let nuevosProductosSeleccionados = [...productosSeleccionados];
    let nuevosIdsSeleccionados = [...idsSeleccionados];

    if (isSelected) {
      // Si ya está seleccionado, lo eliminamos
      nuevosProductosSeleccionados = nuevosProductosSeleccionados.filter(
        (producto) => producto !== productoSeleccionado
      );
      nuevosIdsSeleccionados = nuevosIdsSeleccionados.filter(
        (id) => id !== idSeleccionado
      );
    } else {
      // Si no está seleccionado, lo añadimos
      nuevosProductosSeleccionados.push(productoSeleccionado);
      if (idSeleccionado) {
        nuevosIdsSeleccionados.push(idSeleccionado); // Solo agregar el ID si está definido
      }
    }

    // Calcular el valor total de los productos seleccionados
    const valorTotalProductosSeleccionados =
      nuevosProductosSeleccionados.reduce(
        (total, producto) => total + parseFloat(producto.precio),
        0
      );

    // Calcular el resto
    const resto = parseFloat(valorIngresado) - valorTotalProductosSeleccionados;

    // Actualizar los estados
    setProductosSeleccionados(nuevosProductosSeleccionados);
    setIdsSeleccionados(nuevosIdsSeleccionados);
    setValorProductosSeleccionados(valorTotalProductosSeleccionados);
    setResto(resto);
  };

  const handleCalcular = () => {
    procesarSeleccionProductos(); // Llamar a la función para procesar la selección de productos
  };

  const calcularTotal = () => {
    return datosMercaderia.reduce(
      (total, mercaderia) => total + parseFloat(mercaderia.precio),
      0
    );
  };

  // Función para manejar el evento de cobrar
  const handleCobrar = async () => {
    const confirmMessage = `¿El cliente ${
      selectedCliente.Nombre
    } va a pagar la suma de ${
      valorIngresado ? parseFloat(valorIngresado) : valorProductosSeleccionados
    }?`;

    if (window.confirm(confirmMessage)) {
      try {
        // Iterar sobre cada ID en idsSeleccionados
        for (const id of idsSeleccionados) {
          console.log(`Eliminando producto con ID ${id}`);
          // Realizar una solicitud de eliminación para el ID actual
          const response = await fetch(
            `http://localhost:3000/cliente_mercaderia/${id}`,
            {
              method: "DELETE",
            }
          );

          // Verificar si la solicitud de eliminación fue exitosa
          if (response.ok) {
            console.log(
              `Producto con ID ${id} cobrado y eliminado correctamente.`
            );
          } else {
            console.error(`Error al cobrar el producto con ID ${id}.`);
          }
        }

        if (typeof resto !== "undefined" && !isNaN(resto) && resto !== 0) {
          // Realizar el POST para agregar la mercadería correspondiente al "Resto del día"
          const fechaHoy = new Date().toISOString().slice(0, 10); // Obtener la fecha de hoy en formato YYYY-MM-DD
          const mercaderiaRestoDia = {
            codigo: -resto + "111111111111111",
            Nombre: "Resto de un pago realizado",
            Precio: -resto,
          };

          const responsePost = await fetch("http://localhost:3000/mercaderia", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(mercaderiaRestoDia),
          });

          /////////////////////////////////////////////////////////
          const RstoDia = {
            ClienteID: selectedCliente.ClienteID,
            codigo: -resto + "111111111111111",
            fecha: fechaHoy,
          };

          const responseePost = await fetch(
            "http://localhost:3000/cliente_mercaderia",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(RstoDia),
            }
          );
          /////////////////////////////////////////////////////////
          if (!responsePost.ok) {
            console.error(
              `Error de red: ${responsePost.status} - ${responsePost.statusText}`
            );
            throw new Error(`HTTP error! Status: ${responsePost.status}`);
          }

          if (!responseePost.ok) {
            console.error(
              `Error de red: ${responseePost.status} - ${responseePost.statusText}`
            );
            throw new Error(`HTTP error! Status: ${responseePost.status}`);
          }
          handleBack();
        }

        // Limpiar los arrays después de eliminar los productos
        setProductosSeleccionados([]);
        setIdsSeleccionados([]);
        setValorProductosSeleccionados(0);
        setResto(valorIngresado); // Restaurar el valor ingresado
        setMostrarResultado(false); // Ocultar los resultados
        handleBack();
      } catch (error) {
        console.error("Error al cobrar productos:", error.message);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clienteID = selectedCliente.ClienteID;
        const response = await fetch(
          `http://localhost:3000/cliente_mercaderia/mercaderias/${clienteID}`
        );
        const data = await response.json();
        setDatosMercaderia(data);
      } catch (error) {
        console.error("Error al obtener datos de mercadería:", error.message);
      }
    };

    fetchData();
  }, [selectedCliente.ClienteID]);

  return (
    <div className="container">
      <button type="button" onClick={handleBack} className="volverInicio">
        Volver
      </button>
      <h2 className="header">{selectedCliente.Nombre}</h2>
      <div className="resultado-container">
        <label>Valor a pagar:</label>
        <input
          type="text"
          value={valorIngresado}
          onChange={handleChangeValorIngresado}
        />
        <div>
          <button onClick={handleCalcular}>Calcular</button>
        </div>
        <div>
          <div className="resultado-container">
            <p>Total seleccionado: $ {valorProductosSeleccionados}</p>
            <p>Resto: $ {resto}</p>
          </div>
        </div>
        <button type="button" className="buttonPdf" onClick={handleExportPDF}>
          Exportar Deuda en PDF
        </button>
      </div>
      <table className="tabla-cobrar">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {datosMercaderia.map((mercaderia, index) => (
            <tr
              key={index}
              className={
                productosSeleccionados.includes(mercaderia)
                  ? "selected-row"
                  : ""
              }
              onClick={() => handlSeeleccionarFila(index)}
            >
              <td>{mercaderia.fecha}</td>
              <td>{mercaderia.Nombre}</td>
              <td>$ {mercaderia.precio}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cobranza">
        <h4>Deuda Total: $ {calcularTotal()}</h4>
        <div className="button-container">
          <button type="button" onClick={handleCobrar} disabled={resto > 0}>
            Cobrar: ${" "}
            {valorIngresado
              ? parseFloat(valorIngresado)
              : valorProductosSeleccionados}
          </button>
        </div>

        <p>
          La deuda quedará en ${" "}
          {valorIngresado
            ? calcularTotal() - parseFloat(valorIngresado)
            : calcularTotal() - valorProductosSeleccionados}
        </p>
      </div>
    </div>
  );
};

export default CobrarCliente;
