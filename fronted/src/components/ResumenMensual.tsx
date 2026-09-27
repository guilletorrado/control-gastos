import type { Resumen } from '../types';

interface Props {
    resumen: Resumen | null;
}

export default function ResumenMensual({ resumen }: Props) {
    if (!resumen) return null;

    return (
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
    );
}