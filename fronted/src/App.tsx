import { useEffect, useState } from 'react';
import './App.css';

interface ItemGasto {
  id?: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
}

interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
  lugar?: string | null;
  items?: ItemGasto[];
}

interface Resumen {
  total: number;
  porCategoria: { categoria: string; total: number }[];
}

const API_URL = 'http://localhost:3000';

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

const hoy = new Date();
const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

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

  // Campos comunes
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0].valor);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Compra grande
  const [esCompraGrande, setEsCompraGrande] = useState(false);
  const [lugar, setLugar] = useState('');
  const [items, setItems] = useState<ItemGasto[]>([]);
  const [productoTemp, setProductoTemp] = useState('');
  const [cantidadTemp, setCantidadTemp] = useState('');
  const [precioTemp, setPrecioTemp] = useState('');

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
    setCategoria(CATEGORIAS[0].valor);
    setFecha(new Date().toISOString().split('T')[0]);
    setEditandoId(null);
    setEsCompraGrande(false);
    setLugar('');
    setItems([]);
    setProductoTemp('');
    setCantidadTemp('');
    setPrecioTemp('');
  };

  const agregarItem = () => {
    if (!productoTemp || !cantidadTemp || !precioTemp) return;
    setItems([
      ...items,
      {
        producto: productoTemp,
        cantidad: Number(cantidadTemp),
        precioUnitario: Number(precioTemp),
      },
    ]);
    setProductoTemp('');
    setCantidadTemp('');
    setPrecioTemp('');
  };

  const quitarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalItems = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (esCompraGrande) {
      if (items.length === 0) {
        alert('Agregá al menos un producto');
        return;
      }
      await fetch(`${API_URL}/gastos/compra-grande`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: descripcion || `Compra en ${lugar}`,
          categoria,
          fecha,
          lugar,
          items,
        }),
      });
    } else if (editandoId !== null) {
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
    setEsCompraGrande(false); // por ahora, edición simple no soporta editar items
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
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={esCompraGrande}
            onChange={(e) => setEsCompraGrande(e.target.checked)}
            disabled={editandoId !== null}
          />
          Es una compra grande
        </label>

        {esCompraGrande ? (
          <>
            <input
              placeholder="Descripción (opcional)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <input
              placeholder="Lugar (ej: Coto, Almacén del barrio)"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
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

            <div style={{ border: '1px dashed #999', borderRadius: 8, padding: 12, margin: '12px 0' }}>
              <strong>Agregar productos</strong>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <input
                  placeholder="Producto"
                  value={productoTemp}
                  onChange={(e) => setProductoTemp(e.target.value)}
                />
                <input
                  placeholder="Cantidad"
                  type="number"
                  value={cantidadTemp}
                  onChange={(e) => setCantidadTemp(e.target.value)}
                  style={{ width: 90 }}
                />
                <input
                  placeholder="Precio unitario"
                  type="number"
                  value={precioTemp}
                  onChange={(e) => setPrecioTemp(e.target.value)}
                  style={{ width: 120 }}
                />
                <button type="button" onClick={agregarItem}>
                  + Agregar producto
                </button>
              </div>

              {items.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
                  {items.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #ddd',
                        padding: '4px 0',
                      }}
                    >
                      <span>
                        {item.producto} — {item.cantidad} x ${item.precioUnitario} = $
                        {item.cantidad * item.precioUnitario}
                      </span>
                      <button type="button" onClick={() => quitarItem(i)}>
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {items.length > 0 && (
                <p style={{ textAlign: 'right', marginTop: 8 }}>
                  <strong>Total: ${totalItems}</strong>
                </p>
              )}
            </div>
          </>
        ) : (
          <>
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
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <button type="submit">{editandoId !== null ? 'Guardar cambios' : 'Agregar'}</button>
          {editandoId !== null && (
            <button type="button" onClick={limpiarFormulario}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {gastos.map((g) => (
          <li
            key={g.id}
            style={{
              borderBottom: '1px solid #ccc',
              padding: '8px 0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {CATEGORIAS.find((c) => c.valor === g.categoria)?.icono ?? '📦'} {g.descripcion} — $
                {g.monto} ({g.categoria})
                {g.lugar && <span style={{ color: '#888' }}> · {g.lugar}</span>}
              </span>
              <span>
                <button onClick={() => handleEditar(g)}>Editar</button>{' '}
                <button onClick={() => handleEliminar(g.id)}>Eliminar</button>
              </span>
            </div>
            {g.items && g.items.length > 0 && (
              <ul style={{ listStyle: 'none', paddingLeft: 16, marginTop: 4, color: '#666', fontSize: 14 }}>
                {g.items.map((item) => (
                  <li key={item.id}>
                    {item.producto}: {item.cantidad} x ${item.precioUnitario}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;