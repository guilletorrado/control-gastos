import { useState } from 'react';
import { buscarHistorialProducto } from '../services/gastosApi';
import { formatearMonto } from '../utils/formato';
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
    <div className="comparador">
        <h2 className="comparador__titulo">Comparador de precios</h2>

        <form onSubmit={handleBuscar} className="comparador__form">
        <input
            className="formulario__campo"
            placeholder="Producto (ej: leche)"
            value={nombre}
            onChange={(e) => {
                const valor = e.target.value;
                setNombre(valor);
                if (valor.trim() === '') {
                setRegistros([]);
                setBuscado(false);
                setError('');
                }
            }}
        />
        <button type="submit" className="boton" disabled={cargando}>
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

            <table className="comparador__tabla">
            <thead>
                <tr>
                <th>Lugar</th>
                <th>Último</th>
                <th>Mínimo</th>
                <th>Promedio</th>
                <th>Unid.</th>
                </tr>
            </thead>
            <tbody>
                {resumenPorLugar.map((r, i) => (
                <tr key={r.lugar}>
                    <td>
                    {i === 0 && resumenPorLugar.length > 1 ? '⭐ ' : ''}
                    {r.lugar}
                    </td>
                    <td>${formatearMonto(r.ultimoPrecio)}</td>
                    <td>${formatearMonto(r.minimo)}</td>
                    <td>${formatearMonto(r.promedio)}</td>
                    <td>{r.unidades}</td>
                </tr>
                ))}
            </tbody>
            </table>

            <ul className="comparador__historial">
            {registros.map((r) => (
                <li key={r.id}>
                {new Date(r.fecha).toLocaleDateString('es-AR')} · {r.lugar ?? 'Sin lugar'} ·{' '}
                {r.producto}: {r.cantidad} x ${formatearMonto(r.precioUnitario)}
                </li>
            ))}
            </ul>
        </>
        )}
    </div>
    );
}