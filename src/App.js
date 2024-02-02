import React, { useState } from "react";
import Inicio from "./componentes/inicio";
//////////////////////////////
import Clientes from "./componentes/clientes/clientes";
import AgregarCliente from "./componentes/clientes/agregarCliente/AgregarCliente"; // Asegúrate de importar correctamente tus componentes

import EditarCliente from "./componentes/clientes/editarCliente/EditarCliente";
import CobrarCliente from "./componentes/clientes/cobrarCliente/CobrarCliente";
//////////////////////////////////////
import Mercaderia from "./componentes/mercaderia/mercaderia";
import AgregarMercaderia from "./componentes/mercaderia/agregarMercaderia/AgregarMercaderia";
import CambiarPrecio from "./componentes/mercaderia/cambiarPrecio/CambiarPrecio";
//////////////////////////
import Venta from "./componentes/venta/venta";
import CalendarioCaja from "./componentes/calendarioCaja/calendarioCaja";

const App = () => {
  const [mostrarInicio, setMostrarInicio] = useState(true);
  //clientes
  const [mostrarClientes, setMostrarClientes] = useState(true);
  const [mostrarAgregarCliente, setMostrarAgregarCliente] = useState(false);
  const [mostrarEditarCliente, setMostrarEditarCliente] = useState(false);
  const [mostrarCobrarCliente, setMostrarCobrarCliente] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  //mercaderia
  const [mostrarMercaderia, setMostrarMercaderia] = useState(false);
  const [mostrarAgregarMercaderia, setMostrarAgregarMercaderia] =
    useState(false);

  const [mostrarCambiarPrecio, setMostrarCambiarPrecio] = useState(false);

  const [selectedMercaderia, setSelectedMercaderia] = useState(null);
  ///////////////////////////////
  const [mostrarVenta, setMostrarVenta] = useState(false);
  const [mostrarCalendarioCaja, setMostrarCalendarioCaja] = useState(false);

  ///////////////////////////////

  //funciones de inicio/////

  const mostrarComponenteInicio = (componente) => {
    setMostrarInicio(false);
    setMostrarClientes(false);
    setMostrarMercaderia(false);
    setMostrarVenta(false);
    setMostrarCalendarioCaja(false);

    switch (componente) {
      case "clientes":
        setMostrarClientes(true);
        break;
      case "mercaderia":
        setMostrarMercaderia(true);
        break;
      case "venta":
        setMostrarVenta(true);
        break;
      case "calendarioCaja":
        setMostrarCalendarioCaja(true);
        break;
      default:
        break;
    }
  };

  const handleBackInicio = () => {
    setMostrarInicio(true);
    setMostrarClientes(false);
    setMostrarMercaderia(false);
    setMostrarVenta(false);
    setMostrarCalendarioCaja(false);
  };

  ////////////////////////

  //funciones de clientes///////
  const handleMostrarComponente = (componente) => {
    setMostrarClientes(false);
    setMostrarAgregarCliente(false);

    setMostrarEditarCliente(false);
    setMostrarCobrarCliente(false);

    switch (componente) {
      case "clientes":
        setMostrarClientes(true);
        break;
      case "agregarCliente":
        setMostrarAgregarCliente(true);
        break;
      case "editarCliente":
        setMostrarEditarCliente(true);
        break;
      case "cobrarCliente":
        setMostrarCobrarCliente(true);
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    setMostrarClientes(true);
    setMostrarAgregarCliente(false);
    setMostrarEditarCliente(false);
    setMostrarCobrarCliente(false);
  };

  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
  };
  //////////////////////////////

  //funciones de mercaderia///////
  const handleMostrarComponenteMercaderia = (componente) => {
    setMostrarMercaderia(false);
    setMostrarAgregarMercaderia(false);
    setMostrarCambiarPrecio(false);

    switch (componente) {
      case "Mercaderias":
        setMostrarMercaderia(true);
        break;
      case "agregarMercaderia":
        setMostrarAgregarMercaderia(true);
        break;
      case "CambiarPrecio":
        setMostrarCambiarPrecio(true);
        setMostrarMercaderia(true);
        break;
      default:
        break;
    }
  };

  const handleBackMercaderia = () => {
    setMostrarMercaderia(true);
    setMostrarAgregarMercaderia(false);
    setMostrarCambiarPrecio(false);
  };

  const handleSelectMercaderia = (Mercaderia) => {
    setSelectedMercaderia(Mercaderia);
  };
  //////////////////////////////

  return (
    <div>
      {mostrarInicio && <Inicio mostrar={mostrarComponenteInicio} />}

      {!mostrarInicio && mostrarClientes && (
        <Clientes
          mostrar={handleMostrarComponente}
          handleSelectCliente={handleSelectCliente}
          handleBackInicio={handleBackInicio}
        />
      )}

      {mostrarAgregarCliente && <AgregarCliente handleBack={handleBack} />}

      {mostrarEditarCliente && (
        <EditarCliente
          handleBack={handleBack}
          selectedCliente={selectedCliente}
        />
      )}

      {mostrarCobrarCliente && (
        <CobrarCliente
          handleBack={handleBack}
          selectedCliente={selectedCliente}
        />
      )}

      {!mostrarInicio && mostrarMercaderia && (
        <Mercaderia
          mostrar={handleMostrarComponenteMercaderia}
          handleSelectMercaderia={handleSelectMercaderia}
          handleBackInicio={handleBackInicio}
        />
      )}
      {mostrarAgregarMercaderia && (
        <AgregarMercaderia handleBackMercaderia={handleBackMercaderia} />
      )}

      {mostrarCambiarPrecio && (
        <CambiarPrecio
          handleBackMercaderia={handleBackMercaderia}
          selectedMercaderia={selectedMercaderia}
        />
      )}

      {!mostrarInicio && mostrarVenta && (
        <Venta handleBackInicio={handleBackInicio} />
      )}

      {!mostrarInicio && mostrarCalendarioCaja && (
        <CalendarioCaja handleBackInicio={handleBackInicio} />
      )}
    </div>
  );
};
export default App;
