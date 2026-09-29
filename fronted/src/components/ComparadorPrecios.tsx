import { useState } from 'react';
import { buscarHistorialProducto } from '../services/gastosApi';
import type { HistorialProducto } from '../types';

interface ResumenLugar {
    lugar: string;
    ultimoPrecio: number;
    minimo: number;
    promedio: number;
    unidades: number;
    }

    // Los registros llegan ordenados de más nuevo a más viejo,
    // así que el primero de cada lugar es su compra más reciente.
    const calcularResumenPorLugar = (registros: HistorialProducto[]): ResumenLugar[] => {
    const grupos = new Map<string, HistorialProducto[]>();

    for (const r of registros) {
        const clave = r.lugar ?? 'Sin lugar';
        grupos.set(clave, [...(grupos.get(clave) ?? []), r]);
    }

    return Array.from(grupos.entries())
        .map(([lugar, regs]) => {
        const precios = regs.map((r) => r.precioUnitario);
        return {
            lugar,
            ultimoPrecio: regs[0].precioUnitario,
            minimo: Math.min(...precios),
            promedio: precios.reduce((acc, p) => acc + p, 0) / precios.length,
            unidades: regs.reduce((acc, r) => acc + r.cantidad, 0),
        };
        })
        .sort((a, b) => a.ultimoPrecio - b.ultimoPrecio);
    };

    export default function ComparadorPrecios() {
    const [nombre, setNombre] = useState('');
    const [registros, setRegistros] = useState<HistorialProducto[]>([]);
    const [buscado, setBuscado] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const handleBuscar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;

        setCargando(true);
        setError('');
        try {
        setRegistros(await buscarHistorialProducto(nombre));
        setBuscado(true);
        } catch {
        setError('No se pudo buscar el producto');
        } finally {
        setCargando(false);
        }
    };

    const resumenPorLugar = calcularResumenPorLugar(registros);
    const totalUnidades = registros.reduce((acc, r) => acc + r.cantidad, 0);

    return (
        <div style={{ marginTop: 32, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Comparador de precios</h2>

        <form onSubmit={handleBuscar} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
            placeholder="Producto (ej: leche)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            />
            <button type="submit" disabled={cargando}>
            {cargando ? 'Buscando...' : 'Buscar'}
            </button>
        </form>

        {error && <p>{error}</p>}

        {buscado && registros.length === 0 && <p>No se encontraron compras de "{nombre}".</p>}

        {registros.length > 0 && (
            <>
            <p>
                Compraste <strong>{totalUnidades}</strong> unidades en total, en {registros.length}{' '}
                {registros.length === 1 ? 'compra' : 'compras'}.
            </p>

            <strong>Por lugar (del más barato al más caro, según el último precio)</strong>
            <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ textAlign: 'left' }}>
                    <th>Lugar</th>
                    <th>Último</th>
                    <th>Mínimo</th>
                    <th>Promedio</th>
                    <th>Unidades</th>
                </tr>
                </thead>
                <tbody>
                {resumenPorLugar.map((r, i) => (
                    <tr key={r.lugar} style={{ borderTop: '1px solid #ddd' }}>
                    <td>
                        {i === 0 && resumenPorLugar.length > 1 ? '⭐ ' : ''}
                        {r.lugar}
                    </td>
                    <td>${r.ultimoPrecio}</td>
                    <td>${r.minimo}</td>
                    <td>${r.promedio.toFixed(2)}</td>
                    <td>{r.unidades}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div style={{ marginTop: 16 }}>
                <strong>Historial</strong>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
                {registros.map((r) => (
                    <li key={r.id} style={{ borderTop: '1px solid #ddd', padding: '4px 0' }}>
                    {new Date(r.fecha).toLocaleDateString('es-AR')} · {r.lugar ?? 'Sin lugar'} ·{' '}
                    {r.producto}: {r.cantidad} x ${r.precioUnitario}
                    </li>
                ))}
                </ul>
            </div>
            </>
        )}
        </div>
    );
}