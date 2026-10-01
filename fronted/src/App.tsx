import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { mesActual } from './utils/fechas';
import {
  obtenerGastos,
  obtenerResumen,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
  crearCompraGrande,
  actualizarCompraGrande,
  obtenerIngresos,
  crearIngreso,
  actualizarIngreso,
  eliminarIngreso,
} from './services/gastosApi';
import type { Gasto, Ingreso, Resumen } from './types';
import SelectorMes from './components/SelectorMes';
import ResumenMensual from './components/ResumenMensual';
import SelectorTipoMovimiento from './components/SelectorTipoMovimiento';
import FormularioGasto from './components/FormularioGasto';
import FormularioIngreso from './components/FormularioIngreso';
import ListaGastos from './components/ListaGastos';
import ComparadorPrecios from './components/ComparadorPrecios';
import Modal from './components/Modal';

interface DatosGastoSimple {
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
}

interface DatosCompraGrande {
  descripcion: string;
  categoria: string;
  fecha: string;
  lugar: string;
  items: { producto: string; cantidad: number; precioUnitario: number }[];
}

interface DatosIngreso {
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
}

function App() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const [tipoMovimiento, setTipoMovimiento] = useState<'egreso' | 'ingreso'>('egreso');

  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null);
  const [ingresoEditando, setIngresoEditando] = useState<Ingreso | null>(null);

  const recargarDatos = useCallback(async () => {
    setGastos(await obtenerGastos(mesSeleccionado));
    setIngresos(await obtenerIngresos(mesSeleccionado));
    setResumen(await obtenerResumen(mesSeleccionado));
  }, [mesSeleccionado]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void recargarDatos();
  }, [recargarDatos]);

  // --- Crear (siempre desde el formulario de la izquierda) ---
  const handleCrearGasto = async (datos: DatosGastoSimple) => {
    await crearGasto(datos);
    recargarDatos();
  };

  const handleCrearCompraGrande = async (datos: DatosCompraGrande) => {
    await crearCompraGrande(datos);
    recargarDatos();
  };

  const handleCrearIngreso = async (datos: DatosIngreso) => {
    await crearIngreso(datos);
    recargarDatos();
  };

  // --- Actualizar (siempre desde el modal de edición) ---
  const handleActualizarGasto = async (id: number, datos: DatosGastoSimple) => {
    await actualizarGasto(id, datos);
    setGastoEditando(null);
    recargarDatos();
  };

  const handleActualizarCompraGrande = async (id: number, datos: DatosCompraGrande) => {
    await actualizarCompraGrande(id, datos);
    setGastoEditando(null);
    recargarDatos();
  };

  const handleActualizarIngreso = async (id: number, datos: DatosIngreso) => {
    await actualizarIngreso(id, datos);
    setIngresoEditando(null);
    recargarDatos();
  };

  // --- Eliminar ---
  const handleEliminarGasto = async (id: number) => {
    await eliminarGasto(id);
    if (gastoEditando?.id === id) setGastoEditando(null);
    recargarDatos();
  };

  const handleEliminarIngreso = async (id: number) => {
    await eliminarIngreso(id);
    if (ingresoEditando?.id === id) setIngresoEditando(null);
    recargarDatos();
  };

  // --- Abrir edición ---
  const handleEditarGasto = (gasto: Gasto) => {
    setIngresoEditando(null);
    setGastoEditando(gasto);
  };

  const handleEditarIngreso = (ingreso: Ingreso) => {
    setGastoEditando(null);
    setIngresoEditando(ingreso);
  };

  return (
    <div className="app">
      <div className="app__header">
        <h1 className="app__titulo">Control de Gastos</h1>
        <SelectorMes mes={mesSeleccionado} onCambiarMes={setMesSeleccionado} />
      </div>

      <div className="app__grid">
        <div className="app__col-form">
          <div className="panel">
            <SelectorTipoMovimiento tipo={tipoMovimiento} onCambiar={setTipoMovimiento} />

            {tipoMovimiento === 'egreso' ? (
              <FormularioGasto
                gastoEditando={null}
                onGuardarSimple={handleCrearGasto}
                onGuardarCompraGrande={handleCrearCompraGrande}
                onCancelar={() => {}}
              />
            ) : (
              <FormularioIngreso
                ingresoEditando={null}
                onGuardar={handleCrearIngreso}
                onCancelar={() => {}}
              />
            )}
          </div>
        </div>

        <div className="app__col-derecha">
          <div className="panel">
            <ResumenMensual resumen={resumen} />
          </div>
        </div>
      </div>

      <div className="panel">
        <ListaGastos
          gastos={gastos}
          ingresos={ingresos}
          onEditarGasto={handleEditarGasto}
          onEliminarGasto={handleEliminarGasto}
          onEditarIngreso={handleEditarIngreso}
          onEliminarIngreso={handleEliminarIngreso}
        />
      </div>

      <div className="panel">
        <ComparadorPrecios />
      </div>

      {gastoEditando && (
        <Modal titulo="Editar gasto" onCerrar={() => setGastoEditando(null)}>
          <FormularioGasto
            gastoEditando={gastoEditando}
            onGuardarSimple={(datos) => handleActualizarGasto(gastoEditando.id, datos)}
            onGuardarCompraGrande={(datos) => handleActualizarCompraGrande(gastoEditando.id, datos)}
            onCancelar={() => setGastoEditando(null)}
          />
          <button
            type="button"
            className="boton modal__eliminar"
            onClick={() => handleEliminarGasto(gastoEditando.id)}
          >
            Eliminar gasto
          </button>
        </Modal>
      )}

      {ingresoEditando && (
        <Modal titulo="Editar ingreso" onCerrar={() => setIngresoEditando(null)}>
          <FormularioIngreso
            ingresoEditando={ingresoEditando}
            onGuardar={(datos) => handleActualizarIngreso(ingresoEditando.id, datos)}
            onCancelar={() => setIngresoEditando(null)}
          />
          <button
            type="button"
            className="boton modal__eliminar"
            onClick={() => handleEliminarIngreso(ingresoEditando.id)}
          >
            Eliminar ingreso
          </button>
        </Modal>
      )}
    </div>
  );
}

export default App;