import React, { useEffect, useState } from "react";
import "./mercaderia.css"; // Asegúrate de tener el archivo CSS para los estilos de Mercadería
import jsPDF from "jspdf";
import "jspdf-autotable";

const Mercaderia = ({ handleBackInicio, mostrar, handleSelectMercaderia }) => {
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/mercaderia");

        if (!response.ok) {
          console.error(
            `Error de red: ${response.status} - ${response.statusText}`
          );
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Filtrar los productos donde el Nombre no sea "Sin nombre"
        const productosFiltrados = data.filter(
          (producto) => producto.Nombre !== "-"
        );

        setProductos(productosFiltrados);
      } catch (error) {
        console.error("Error durante la solicitud:", error);
      }
    };

    fetchData();
  }, []);

  const handleSelectFila = (codigo) => {
    // Clona la lista de productos seleccionados
    const nuevosSeleccionados = [...productosSeleccionados];

    // Verifica si el producto ya está seleccionado
    const index = nuevosSeleccionados.indexOf(codigo);

    // Si ya está seleccionado, lo elimina, de lo contrario, lo agrega
    if (index !== -1) {
      nuevosSeleccionados.splice(index, 1);
    } else {
      nuevosSeleccionados.push(codigo);
    }

    // Actualiza la lista de productos seleccionados
    setProductosSeleccionados(nuevosSeleccionados);
    console.log("Filas seleccionadas:", nuevosSeleccionados);
  };

  const handleBuscarProducto = () => {
    if (busqueda.trim() === "") {
      // Si la búsqueda está vacía, retornar todos los productos
      return productos;
    }

    // Filtrar la lista de productos según el término de búsqueda
    const productosFiltrados = productos
      .filter((producto) => producto.Nombre) // Filtra aquellos productos que tengan la propiedad Nombre definida
      .filter((producto) =>
        producto.Nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    return productosFiltrados;
  };

  const handleExportarPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape", // Configura la orientación a horizontal
      unit: "mm", // Configura la unidad a milímetros
    });

    const rectWidth = 60; // Ancho del rectángulo (aprox. 2.36 pulgadas)
    const rectHeight = 30; // Alto del rectángulo (aprox. 1.18 pulgadas)
    const margin = 0; // Margen entre rectángulos (ajustado a 5)
    const rectangulosPorFila = 5;

    let rectX = margin;
    let rectY = margin;

    productos
      .filter((producto) => productosSeleccionados.includes(producto.codigo))
      .forEach((producto, index) => {
        doc.rect(rectX, rectY, rectWidth, rectHeight);

        const textX = rectX + rectWidth / 2;
        const textY = rectY + rectHeight / 2;

        doc.text(producto.Nombre, textX, textY - 5, { align: "center" });
        doc.text(`$${producto.Precio}`, textX, textY + 5, { align: "center" });

        rectX += rectWidth + margin;

        if ((index + 1) % rectangulosPorFila === 0) {
          rectX = margin;
          rectY += rectHeight + margin;
        }
      });

    doc.save("productos_seleccionados.pdf");
  };

  return (
    <div className="container">
      <button type="button" onClick={handleBackInicio} className="volverInicio">
        Volver
      </button>
      <h2 className="header">Mercadería</h2>
      <button
        onClick={() => mostrar("agregarMercaderia")}
        className="add-button"
      >
        Agregar
      </button>
      <button
        onClick={() => {
          const productoSeleccionado = productos.find(
            (p) => p.codigo === productosSeleccionados[0]
          );
          handleSelectMercaderia(productoSeleccionado);
          mostrar("CambiarPrecio");
        }}
        className="edit-button"
        disabled={productosSeleccionados.length !== 1}
      >
        Cambiar Precio
      </button>

      <button
        onClick={() => handleExportarPDF()}
        disabled={productosSeleccionados.length === 0}
      >
        Generar cartel
      </button>

      <input
        type="text"
        placeholder="Buscar"
        className="input"
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <table className={`table`}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {handleBuscarProducto().map((producto, index) => (
            <tr
              key={producto.codigo}
              className={`${
                productosSeleccionados.includes(producto.codigo)
                  ? "selected"
                  : ""
              } ${index % 2 === 0 ? "even" : ""}`}
              onClick={() => {
                handleSelectFila(producto.codigo);
                handleSelectMercaderia(producto);
              }}
            >
              <td>{producto.Nombre}</td>
              <td>$ {producto.Precio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Mercaderia;
