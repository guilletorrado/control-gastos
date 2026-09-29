import { useState } from 'react';
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
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

    const toggleExpandido = (clave: string) => {
        setExpandidos((prev) => {
        const nuevo = new Set(prev);
        if (nuevo.has(clave)) {
            nuevo.delete(clave);
        } else {
            nuevo.add(clave);
        }
        return nuevo;
        });
    };

    const movimientos: Movimiento[] = [
        ...gastos.map((g): Movimiento => ({ tipo: 'gasto', dato: g })),
        ...ingresos.map((i): Movimiento => ({ tipo: 'ingreso', dato: i })),
    ].sort((a, b) => new Date(b.dato.fecha).getTime() - new Date(a.dato.fecha).getTime());

    return (
        <ul className="lista-movimientos">
        {movimientos.map((m) => (
            <li key={`${m.tipo}-${m.dato.id}`} className="movimiento">
            <div className="movimiento__linea">
                <span className={`movimiento__desc ${m.tipo}`}>
                {m.tipo === 'gasto' &&
                    `${CATEGORIAS.find((c) => c.valor === m.dato.categoria)?.icono ?? '📦'} `}
                {m.dato.descripcion}
                {m.tipo === 'gasto' && (m.dato as Gasto).lugar ? ` · ${(m.dato as Gasto).lugar}` : ''}
                </span>
                <span className={`movimiento__monto ${m.tipo}`}>
                {m.tipo === 'ingreso' ? '+' : '−'} ${m.dato.monto}
                </span>
            </div>

            <div className="movimiento__acciones">
                <button
                type="button"
                className="boton--texto"
                onClick={() => (m.tipo === 'gasto' ? onEditarGasto(m.dato) : onEditarIngreso(m.dato))}
                >
                editar
                </button>{' '}
                <button
                type="button"
                className="boton--texto"
                onClick={() =>
                    m.tipo === 'gasto' ? onEliminarGasto(m.dato.id) : onEliminarIngreso(m.dato.id)
                }
                >
                eliminar
                </button>
            </div>

            {m.tipo === 'gasto' && (m.dato as Gasto).items && (m.dato as Gasto).items!.length > 0 && (
                <>
                <button
                    type="button"
                    className="movimiento__toggle-items"
                    onClick={() => toggleExpandido(`gasto-${m.dato.id}`)}
                >
                    {expandidos.has(`gasto-${m.dato.id}`)
                    ? 'ocultar productos'
                    : `ver ${(m.dato as Gasto).items!.length} productos`}
                </button>
                {expandidos.has(`gasto-${m.dato.id}`) && (
                    <ul className="movimiento__items">
                    {(m.dato as Gasto).items!.map((item) => (
                        <li key={item.id}>
                        {item.producto}: {item.cantidad} x ${item.precioUnitario}
                        </li>
                    ))}
                    </ul>
                )}
                </>
            )}
            </li>
        ))}
        </ul>
    );
}