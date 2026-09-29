import { CATEGORIAS } from '../constants';
import type { Gasto, Ingreso } from '../types';

type Movimiento =
    | { tipo: 'gasto'; dato: Gasto }
    | { tipo: 'ingreso'; dato: Ingreso };

interface Props {
    gastos: Gasto[];
    ingresos: Ingreso[];
    onEditarGasto: (gasto: Gasto) => void;
    onEliminarGasto: (id: number) => void;
    onEditarIngreso: (ingreso: Ingreso) => void;
    onEliminarIngreso: (id: number) => void;
}

export default function ListaGastos({
    gastos,
    ingresos,
    onEditarGasto,
    onEliminarGasto,
    onEditarIngreso,
    onEliminarIngreso,
}: Props) {
    const movimientos: Movimiento[] = [
        ...gastos.map((g): Movimiento => ({ tipo: 'gasto', dato: g })),
        ...ingresos.map((i): Movimiento => ({ tipo: 'ingreso', dato: i })),
    ].sort((a, b) => new Date(b.dato.fecha).getTime() - new Date(a.dato.fecha).getTime());

    return (
        <ul style={{ listStyle: 'none', padding: 0 }}>
        {movimientos.map((m) => (
            <li
            key={`${m.tipo}-${m.dato.id}`}
            style={{ borderBottom: '1px solid #ccc', padding: '8px 0' }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: m.tipo === 'ingreso' ? '#155724' : '#721c24' }}>
                {m.tipo === 'ingreso'
                    ? `+ ${m.dato.descripcion} — $${m.dato.monto} (${m.dato.categoria})`
                    : `− ${CATEGORIAS.find((c) => c.valor === m.dato.categoria)?.icono ?? '📦'} ${
                        m.dato.descripcion
                    } — $${m.dato.monto} (${m.dato.categoria})${
                        (m.dato as Gasto).lugar ? ` · ${(m.dato as Gasto).lugar}` : ''
                    }`}
                </span>
                <span>
                <button
                    onClick={() =>
                    m.tipo === 'gasto' ? onEditarGasto(m.dato) : onEditarIngreso(m.dato)
                    }
                >
                    Editar
                </button>{' '}
                <button
                    onClick={() =>
                    m.tipo === 'gasto' ? onEliminarGasto(m.dato.id) : onEliminarIngreso(m.dato.id)
                    }
                >
                    Eliminar
                </button>
                </span>
            </div>
            {m.tipo === 'gasto' && (m.dato as Gasto).items && (m.dato as Gasto).items!.length > 0 && (
                <ul style={{ listStyle: 'none', paddingLeft: 16, marginTop: 4, color: '#666', fontSize: 14 }}>
                {(m.dato as Gasto).items!.map((item) => (
                    <li key={item.id}>
                    {item.producto}: {item.cantidad} x ${item.precioUnitario}
                    </li>
                ))}
                </ul>
            )}
            </li>
        ))}
        </ul>
    );
}