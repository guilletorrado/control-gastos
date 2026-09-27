import { useEffect, useState } from 'react';
import './App.css';

interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
}

const API_URL = 'http://localhost:3000';

function App() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarGastos = async () => {
    const res = await fetch(`${API_URL}/gastos`);
    const data = await res.json();
    setGastos(data);
  };

  useEffect(() => {
    void cargarGastos();
  }, []);

  const limpiarFormulario = () => {
    setDescripcion('');
    setMonto('');
    setCategoria('');
    setEditandoId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editandoId !== null) {
      // Modo edición: PUT
      await fetch(`${API_URL}/gastos/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion,
          monto: Number(monto),
          categoria,
        }),
      });
    } else {
      // Modo creación: POST
      await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion,
          monto: Number(monto),
          categoria,
        }),
      });
    }

    limpiarFormulario();
    cargarGastos();
  };

  const handleEliminar = async (id: number) => {
    await fetch(`${API_URL}/gastos/${id}`, { method: 'DELETE' });
    if (editandoId === id) limpiarFormulario();
    cargarGastos();
  };

  const handleEditar = (gasto: Gasto) => {
    setEditandoId(gasto.id);
    setDescripcion(gasto.descripcion);
    setMonto(String(gasto.monto));
    setCategoria(gasto.categoria);
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
      <h1>Control de Gastos</h1>

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
        <input
          placeholder="Categoría"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        />
        <button type="submit">
          {editandoId !== null ? 'Guardar cambios' : 'Agregar'}
        </button>
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
              {g.descripcion} — ${g.monto} ({g.categoria})
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