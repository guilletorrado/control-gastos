import type { Resumen } from '../types';

interface Props {
    resumen: Resumen | null;
}

export default function ResumenMensual({ resumen }: Props) {
    if (!resumen) return null;

    const colorBalance = resumen.balance >= 0 ? '#155724' : '#721c24';
    const fondoBalance = resumen.balance >= 0 ? '#d4edda' : '#f8d7da';

    return (
        <div style={{ marginBottom: 20, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#155724' }}>Ingresos: ${resumen.totalIngresos}</span>
            <span style={{ color: '#721c24' }}>Gastos: ${resumen.totalGastos}</span>
        </div>

        <div
            style={{
            textAlign: 'center',
            padding: 8,
            borderRadius: 6,
            backgroundColor: fondoBalance,
            color: colorBalance,
            fontWeight: 'bold',
            marginBottom: 8,
            }}
        >
            Balance: ${resumen.balance}
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {resumen.porCategoria.map((c) => (
            <li key={c.categoria}>
                {c.categoria}: ${c.total}
            </li>
            ))}
        </ul>
        </div>
    );
}