import type { Resumen } from '../types';
import { formatearMonto } from '../utils/formato';

interface Props {
    porCategoria: Resumen['porCategoria'];
}

const COLORES = ['#3a4fcb', '#1f9d63', '#e3a92b', '#d1483a', '#8a5ad1'];

export default function GraficoCategorias({ porCategoria }: Props) {
    if (!porCategoria || porCategoria.length === 0) return null;

    const total = porCategoria.reduce((acc, c) => acc + c.total, 0);
    if (total === 0) return null;

    const { stops } = porCategoria.reduce(
        (acc, c, i) => {
            const inicio = (acc.acumulado / total) * 360;
            const nuevoAcumulado = acc.acumulado + c.total;
            const fin = (nuevoAcumulado / total) * 360;

            acc.stops.push(`${COLORES[i % COLORES.length]} ${inicio}deg ${fin}deg`);
            acc.acumulado = nuevoAcumulado;

            return acc;
        },
        { stops: [] as string[], acumulado: 0 }
    );

    const gradiente = `conic-gradient(${stops.join(', ')})`;

    return (
        <div>
        <h2 className="comparador__titulo">Gastos por categoría</h2>
        <div className="grafico-categorias">
            <div className="grafico-categorias__torta" style={{ background: gradiente }} />
            <ul className="grafico-categorias__leyenda">
            {porCategoria.map((c, i) => (
                <li key={c.categoria} className="grafico-categorias__item">
                <span
                    className="grafico-categorias__dot"
                    style={{ backgroundColor: COLORES[i % COLORES.length] }}
                />
                {c.categoria}
                <span className="grafico-categorias__porcentaje">
                    {((c.total / total) * 100).toFixed(0)}% · ${formatearMonto(c.total)}
                </span>
                </li>
            ))}
            </ul>
        </div>
        </div>
    );
}