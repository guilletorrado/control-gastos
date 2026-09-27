import { useEffect, useState } from 'react';
import { CATEGORIAS } from '../constants';
import { fechaDeHoy } from '../utils/fechas';
import type { Gasto, ItemGasto } from '../types';

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
    items: ItemGasto[];
}

interface Props {
    gastoEditando: Gasto | null;
    onGuardarSimple: (datos: DatosGastoSimple) => void;
    onGuardarCompraGrande: (datos: DatosCompraGrande) => void;
    onCancelar: () => void;
}

export default function FormularioGasto({
    gastoEditando,
    onGuardarSimple,
    onGuardarCompraGrande,
    onCancelar,
    }: Props) {
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [categoria, setCategoria] = useState(CATEGORIAS[0].valor);
    const [fecha, setFecha] = useState(fechaDeHoy());

    const [esCompraGrande, setEsCompraGrande] = useState(false);
    const [lugar, setLugar] = useState('');
    const [items, setItems] = useState<ItemGasto[]>([]);
    const [productoTemp, setProductoTemp] = useState('');
    const [cantidadTemp, setCantidadTemp] = useState('');
    const [precioTemp, setPrecioTemp] = useState('');
    const [editandoItemIndex, setEditandoItemIndex] = useState<number | null>(null);

  // Cuando cambia el gasto a editar, precargamos el formulario
    useEffect(() => {
        if (!gastoEditando) return;

        /* eslint-disable react-hooks/set-state-in-effect */
        setDescripcion(gastoEditando.descripcion);
        setMonto(String(gastoEditando.monto));
        setCategoria(gastoEditando.categoria);
        setFecha(gastoEditando.fecha.split('T')[0]);
        setProductoTemp('');
        setCantidadTemp('');
        setPrecioTemp('');
        setEditandoItemIndex(null);

        if (gastoEditando.items && gastoEditando.items.length > 0) {
            setEsCompraGrande(true);
            setLugar(gastoEditando.lugar ?? '');
            setItems(
            gastoEditando.items.map((i) => ({
                producto: i.producto,
                cantidad: i.cantidad,
                precioUnitario: i.precioUnitario,
            }))
            );
        } else {
            setEsCompraGrande(false);
            setLugar('');
            setItems([]);
        }
        /* eslint-enable react-hooks/set-state-in-effect */
        }, [gastoEditando]);

    const limpiarFormulario = () => {
        setDescripcion('');
        setMonto('');
        setCategoria(CATEGORIAS[0].valor);
        setFecha(fechaDeHoy());
        setEsCompraGrande(false);
        setLugar('');
        setItems([]);
        setProductoTemp('');
        setCantidadTemp('');
        setPrecioTemp('');
        setEditandoItemIndex(null);
    };

    const agregarItem = () => {
        if (!productoTemp || !cantidadTemp || !precioTemp) return;

        const nuevoItem = {
        producto: productoTemp,
        cantidad: Number(cantidadTemp),
        precioUnitario: Number(precioTemp),
        };

        if (editandoItemIndex !== null) {
        setItems(items.map((it, i) => (i === editandoItemIndex ? nuevoItem : it)));
        setEditandoItemIndex(null);
        } else {
        setItems([...items, nuevoItem]);
        }

        setProductoTemp('');
        setCantidadTemp('');
        setPrecioTemp('');
    };

    const quitarItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
        if (editandoItemIndex === index) {
        setEditandoItemIndex(null);
        setProductoTemp('');
        setCantidadTemp('');
        setPrecioTemp('');
        }
    };

    const editarItem = (index: number) => {
        const item = items[index];
        setProductoTemp(item.producto);
        setCantidadTemp(String(item.cantidad));
        setPrecioTemp(String(item.precioUnitario));
        setEditandoItemIndex(index);
    };

    const cancelarEdicionItem = () => {
        setEditandoItemIndex(null);
        setProductoTemp('');
        setCantidadTemp('');
        setPrecioTemp('');
    };

    const totalItems = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (esCompraGrande) {
        if (items.length === 0) {
            alert('Agregá al menos un producto');
            return;
        }
        onGuardarCompraGrande({
            descripcion: descripcion || `Compra en ${lugar}`,
            categoria,
            fecha,
            lugar,
            items,
        });
        } else {
        onGuardarSimple({ descripcion, monto: Number(monto), categoria, fecha });
        }

        limpiarFormulario();
    };

    const handleCancelar = () => {
        limpiarFormulario();
        onCancelar();
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input
            type="checkbox"
            checked={esCompraGrande}
            onChange={(e) => setEsCompraGrande(e.target.checked)}
            disabled={gastoEditando !== null}
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
                <strong>{editandoItemIndex !== null ? 'Editando producto' : 'Agregar productos'}</strong>
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
                    {editandoItemIndex !== null ? 'Guardar producto' : '+ Agregar producto'}
                </button>
                {editandoItemIndex !== null && (
                    <button type="button" onClick={cancelarEdicionItem}>
                    Cancelar
                    </button>
                )}
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
                        backgroundColor: editandoItemIndex === i ? '#fff3cd' : 'transparent',
                        }}
                    >
                        <span>
                        {item.producto} — {item.cantidad} x ${item.precioUnitario} = $
                        {item.cantidad * item.precioUnitario}
                        </span>
                        <span>
                        <button type="button" onClick={() => editarItem(i)}>
                            Editar
                        </button>{' '}
                        <button type="button" onClick={() => quitarItem(i)}>
                            Quitar
                        </button>
                        </span>
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
            <button type="submit">{gastoEditando !== null ? 'Guardar cambios' : 'Agregar'}</button>
            {gastoEditando !== null && (
            <button type="button" onClick={handleCancelar}>
                Cancelar
            </button>
            )}
        </div>
        </form>
    );
}