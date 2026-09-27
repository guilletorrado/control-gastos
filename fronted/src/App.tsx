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
} from './services/gastosApi';
import type { Gasto, Resumen } from './types';
import SelectorMes from './components/SelectorMes';
import ResumenMensual from './components/ResumenMensual';
import FormularioGasto from './components/FormularioGasto';
import ListaGastos from './components/ListaGastos';

function App() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null);

  const recargarDatos = useCallback(async () => {
  setGastos(await obtenerGastos(mesSeleccionado));
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

  const handleEliminar = async (id: number) => {
    await eliminarGasto(id);
    if (gastoEditando?.id === id) setGastoEditando(null);
    recargarDatos();
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
      <h1>Control de Gastos</h1>

      <SelectorMes mes={mesSeleccionado} onCambiarMes={setMesSeleccionado} />
      <ResumenMensual resumen={resumen} />

      <FormularioGasto
        gastoEditando={gastoEditando}
        onGuardarSimple={handleGuardarSimple}
        onGuardarCompraGrande={handleGuardarCompraGrande}
        onCancelar={() => setGastoEditando(null)}
      />

      <ListaGastos gastos={gastos} onEditar={setGastoEditando} onEliminar={handleEliminar} />
    </div>
  );
}

export default App;