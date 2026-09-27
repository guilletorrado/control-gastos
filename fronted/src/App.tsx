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

  const cargarGastos = async () => {
    const res = await fetch(`${API_URL}/gastos`);
    const data = await res.json();
    setGastos(data);
  };

  useEffect(() => {
    cargarGastos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/gastos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion,
        monto: Number(monto),
        categoria,
      }),
    });
    setDescripcion('');
    setMonto('');
    setCategoria('');
    cargarGastos();
  };

  const handleEliminar = async (id: number) => {
    await fetch(`${API_URL}/gastos/${id}`, { method: 'DELETE' });
    cargarGastos();
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
        <button type="submit">Agregar</button>
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
            <button onClick={() => handleEliminar(g.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;