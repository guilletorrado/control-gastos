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

  const handleGuardarSimple = async (datos: {
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
  }) => {
    if (gastoEditando) {
      await actualizarGasto(gastoEditando.id, datos);
    } else {
      await crearGasto(datos);
    }
    setGastoEditando(null);
    recargarDatos();
  };

  const handleGuardarCompraGrande = async (datos: {
    descripcion: string;
    categoria: string;
    fecha: string;
    lugar: string;
    items: { producto: string; cantidad: number; precioUnitario: number }[];
  }) => {
    if (gastoEditando) {
      await actualizarCompraGrande(gastoEditando.id, datos);
    } else {
      await crearCompraGrande(datos);
    }
    setGastoEditando(null);
    recargarDatos();
  };

  const handleGuardarIngreso = async (datos: {
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
  }) => {
    if (ingresoEditando) {
      await actualizarIngreso(ingresoEditando.id, datos);
    } else {
      await crearIngreso(datos);
    }
    setIngresoEditando(null);
    recargarDatos();
  };

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

  const handleEditarGasto = (gasto: Gasto) => {
    setIngresoEditando(null);
    setTipoMovimiento('egreso');
    setGastoEditando(gasto);
  };

  const handleEditarIngreso = (ingreso: Ingreso) => {
    setGastoEditando(null);
    setTipoMovimiento('ingreso');
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
                gastoEditando={gastoEditando}
                onGuardarSimple={handleGuardarSimple}
                onGuardarCompraGrande={handleGuardarCompraGrande}
                onCancelar={() => setGastoEditando(null)}
              />
            ) : (
              <FormularioIngreso
                ingresoEditando={ingresoEditando}
                onGuardar={handleGuardarIngreso}
                onCancelar={() => setIngresoEditando(null)}
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
    </div>
  );
}

export default App;