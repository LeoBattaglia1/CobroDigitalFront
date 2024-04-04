import React, { useEffect, useState } from "react";
import "./mercaderia.css"; // Asegúrate de tener el archivo CSS para los estilos de Mercadería
import jsPDF from "jspdf";
import "jspdf-autotable";

const Mercaderia = ({ handleBackInicio, mostrar, handleSelectMercaderia }) => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [ultimoValorBusqueda, setUltimoValorBusqueda] = useState("");

  const [busqueda, setBusqueda] = useState(ultimoValorBusqueda);

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

  useEffect(() => {
    // Actualizar el estado del campo de búsqueda al montar el componente
    setBusqueda(ultimoValorBusqueda);
  }, [ultimoValorBusqueda]);

  const handleSelectFila = (producto) => {
    // Actualizar el producto seleccionado
    setProductoSeleccionado(producto);
    handleSelectMercaderia(producto);
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
      .filter((producto) => producto === productoSeleccionado)
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
          mostrar("CambiarPrecio");
        }}
        className="edit-button"
        disabled={!productoSeleccionado}
      >
        Editar Producto
      </button>

      <button
        onClick={() => handleExportarPDF()}
        disabled={!productoSeleccionado}
      >
        Generar cartel
      </button>

      <input
        type="text"
        placeholder="Buscar"
        className="input"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        onBlur={(e) => setUltimoValorBusqueda(e.target.value)}
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
                producto === productoSeleccionado ? "selected" : ""
              } ${index % 2 === 0 ? "even" : ""}`}
              onClick={() => handleSelectFila(producto)}
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
