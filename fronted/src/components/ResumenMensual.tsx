import { CATEGORIAS } from '../constants';
import type { Resumen } from '../types';
import { formatearMonto } from '../utils/formato';

interface Props {
    resumen: Resumen | null;
}

const PALETA = [
    '#3a4fcb', '#1f9d63', '#e3a92b', '#d1483a', '#8a5ad1',
    '#1f9dab', '#c2554f', '#5a6485', '#2f7a4f', '#b8862f',
    '#6a4fd1', '#a84f8a',
];

const RADIO = 42;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

export default function ResumenMensual({ resumen }: Props) {
    if (!resumen) return null;

    const totalGastos = resumen.porCategoria.reduce((acc, c) => acc + c.total, 0);

  // Recorremos SIEMPRE la lista completa de categorías en un reduce funcional
  // para acumular el offset sin mutar variables externas dentro de un callback.
    const { segmentos } = CATEGORIAS.reduce(
        (acc, cat, i) => {
        const encontrada = resumen.porCategoria.find((c) => c.categoria === cat.valor);
        const monto = encontrada?.total ?? 0;
        const largo = totalGastos > 0 ? (monto / totalGastos) * CIRCUNFERENCIA : 0;
        const offset = acc.acumulado;

        acc.segmentos.push({
            categoria: cat.valor,
            color: PALETA[i % PALETA.length],
            largo,
            offset,
            monto,
        });

        acc.acumulado += largo;
        return acc;
        },
        { segmentos: [] as Array<{ categoria: string; color: string; largo: number; offset: number; monto: number }>, acumulado: 0 }
    );

    return (
        <div>
        <div className="resumen-hero__pills">
            <span className="resumen-hero__pill ingreso">+ ${formatearMonto(resumen.totalIngresos)}</span>
            <span className="resumen-hero__pill gasto">− ${formatearMonto(resumen.totalGastos)}</span>
        </div>

        <div className="resumen-anillo">
            <svg viewBox="0 0 100 100" className="resumen-anillo__svg">
            <circle cx="50" cy="50" r={RADIO} className="resumen-anillo__fondo" />
            <g transform="rotate(-90 50 50)">
                {segmentos.map((s) => (
                <circle
                    key={s.categoria}
                    cx="50"
                    cy="50"
                    r={RADIO}
                    stroke={s.color}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${s.largo} ${CIRCUNFERENCIA - s.largo}`}
                    strokeDashoffset={-s.offset}
                    className="resumen-anillo__segmento"
                />
                ))}
            </g>
            </svg>

            <div className="resumen-anillo__overlay">
            <span className="resumen-anillo__label">balance del mes</span>
            <span className="resumen-anillo__monto">${formatearMonto(resumen.balance)}</span>
            </div>
        </div>

        <ul className="resumen__categorias">
            {segmentos
            .filter((s) => s.monto > 0)
            .map((s) => (
                <li key={s.categoria} className="resumen__categoria-item">
                <span className="resumen__dot" style={{ backgroundColor: s.color }} />
                <span className="resumen__categoria-nombre">{s.categoria}</span>
                <span className="resumen__categoria-puntos" />
                <span className="resumen__categoria-monto">${formatearMonto(s.monto)}</span>
                </li>
            ))}
        </ul>
        </div>
    );
}