import type { Resumen } from '../types';

interface Props {
    resumen: Resumen | null;
}

export default function ResumenMensual({ resumen }: Props) {
    if (!resumen) return null;

    return (
        <div>
        <div className="resumen-hero">
            <div className="resumen-hero__pills">
            <span className="resumen-hero__pill ingreso">+ ${resumen.totalIngresos}</span>
            <span className="resumen-hero__pill gasto">− ${resumen.totalGastos}</span>
            </div>
            <div className="resumen-hero__label">balance del mes</div>
            <div className="resumen-hero__monto">${resumen.balance}</div>
        </div>

        <ul className="resumen__categorias">
            {resumen.porCategoria.map((c, i) => (
            <li key={c.categoria} className="resumen__categoria-item">
                <span className={`resumen__dot dot-${i % 5}`} />
                <span className="resumen__categoria-nombre">{c.categoria}</span>
                <span className="resumen__categoria-puntos" />
                <span className="resumen__categoria-monto">${c.total}</span>
            </li>
            ))}
        </ul>
        </div>
    );
}