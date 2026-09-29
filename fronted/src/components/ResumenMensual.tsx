import type { Resumen } from '../types';

interface Props {
    resumen: Resumen | null;
}

export default function ResumenMensual({ resumen }: Props) {
    if (!resumen) return null;

    return (
        <div className="resumen">
        <div className="resumen__linea">
            <span className="resumen__ingresos">+ ${resumen.totalIngresos}</span>
            <span className="resumen__gastos">− ${resumen.totalGastos}</span>
        </div>

        <div className="resumen__balance">
            <div className="resumen__balance-label">balance del mes</div>
            <div className={`resumen__balance-monto ${resumen.balance >= 0 ? 'positivo' : 'negativo'}`}>
            ${resumen.balance}
            </div>
        </div>

        <ul className="resumen__categorias">
            {resumen.porCategoria.map((c) => (
            <li key={c.categoria} className="resumen__categoria-item">
                <span className="resumen__categoria-nombre">{c.categoria}</span>
                <span className="resumen__categoria-puntos" />
                <span className="resumen__categoria-monto">${c.total}</span>
            </li>
            ))}
        </ul>
        </div>
    );
}