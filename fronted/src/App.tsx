import { useEffect, useState } from 'react';
import './App.css';

interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
}

interface Resumen {
  total: number;
  porCategoria: { categoria: string; total: number }[];
}

const API_URL = 'http://localhost:3000';

const hoy = new Date();
const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

const CATEGORIAS = [
  { valor: 'Comida y bebida', icono: '🍔' },
  { valor: 'Supermercado', icono: '🛒' },
  { valor: 'Transporte', icono: '🚌' },
  { valor: 'Salud', icono: '💊' },
  { valor: 'Entretenimiento', icono: '🎬' },
  { valor: 'Compras', icono: '🛍️' },
  { valor: 'Servicios', icono: '💡' },
  { valor: 'Educación', icono: '📚' },
  { valor: 'Hogar', icono: '🏠' },
  { valor: 'Vestimenta', icono: '👕' },
  { valor: 'Mascotas', icono: '🐶' },
  { valor: 'Otros', icono: '📦' },
];

const nombreMes = (mes: string) => {
  const [year, month] = mes.split('-').map(Number);
  const fecha = new Date(year, month - 1, 1);
  return fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
};

const sumarMes = (mes: string, delta: number) => {
  const [year, month] = mes.split('-').map(Number);
  const fecha = new Date(year, month - 1 + delta, 1);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
};

function App() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0].valor);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  

  const cargarGastos = async (mes: string) => {
    const res = await fetch(`${API_URL}/gastos?mes=${mes}`);
    const data = await res.json();
    setGastos(data);
  };

  const cargarResumen = async (mes: string) => {
    const res = await fetch(`${API_URL}/gastos/resumen?mes=${mes}`);
    const data = await res.json();
    setResumen(data);
  };

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  void cargarGastos(mesSeleccionado);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  void cargarResumen(mesSeleccionado);
}, [mesSeleccionado]);

  const limpiarFormulario = () => {
    setDescripcion('');
    setMonto('');
    setCategoria('');
    setFecha(new Date().toISOString().split('T')[0]);
    setEditandoId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editandoId !== null) {
      await fetch(`${API_URL}/gastos/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion, monto: Number(monto), categoria, fecha }),
      });
    } else {
      await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion, monto: Number(monto), categoria, fecha }),
      });
    }

    limpiarFormulario();
    cargarGastos(mesSeleccionado);
    cargarResumen(mesSeleccionado);
  };

  const handleEliminar = async (id: number) => {
    await fetch(`${API_URL}/gastos/${id}`, { method: 'DELETE' });
    if (editandoId === id) limpiarFormulario();
    cargarGastos(mesSeleccionado);
    cargarResumen(mesSeleccionado);
  };

  const handleEditar = (gasto: Gasto) => {
    setEditandoId(gasto.id);
    setDescripcion(gasto.descripcion);
    setMonto(String(gasto.monto));
    setCategoria(gasto.categoria);
    setFecha(gasto.fecha.split('T')[0]);
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
      <h1>Control de Gastos</h1>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => setMesSeleccionado((m) => sumarMes(m, -1))}>← Mes anterior</button>
        <strong style={{ textTransform: 'capitalize' }}>{nombreMes(mesSeleccionado)}</strong>
        <button
          onClick={() => setMesSeleccionado((m) => sumarMes(m, 1))}
          disabled={mesSeleccionado >= mesActual}
        >
          Mes siguiente →
        </button>
      </div>

      {resumen && (
        <div style={{ marginBottom: 20, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <strong>Total del mes: ${resumen.total}</strong>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
            {resumen.porCategoria.map((c) => (
              <li key={c.categoria}>
                {c.categoria}: ${c.total}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />
        <input
          placeholder="Monto"
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.icono} {c.valor}
            </option>
          ))}
        </select>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        <button type="submit">{editandoId !== null ? 'Guardar cambios' : 'Agregar'}</button>
        {editandoId !== null && (
          <button type="button" onClick={limpiarFormulario}>
            Cancelar
          </button>
        )}
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {gastos.map((g) => (
          <li
            key={g.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #ccc',
              padding: '8px 0',
            }}
          >
            <span>
              {CATEGORIAS.find((c) => c.valor === g.categoria)?.icono ?? '📦'} {g.descripcion} — ${g.monto} ({g.categoria})
            </span>
            <span>
              <button onClick={() => handleEditar(g)}>Editar</button>{' '}
              <button onClick={() => handleEliminar(g.id)}>Eliminar</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;