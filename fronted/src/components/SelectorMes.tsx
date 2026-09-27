import { mesActual, nombreMes, sumarMes } from '../utils/fechas';

interface Props {
    mes: string;
    onCambiarMes: (mes: string) => void;
}

export default function SelectorMes({ mes, onCambiarMes }: Props) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => onCambiarMes(sumarMes(mes, -1))}>← Mes anterior</button>
        <strong style={{ textTransform: 'capitalize' }}>{nombreMes(mes)}</strong>
        <button onClick={() => onCambiarMes(sumarMes(mes, 1))} disabled={mes >= mesActual}>
            Mes siguiente →
        </button>
        </div>
    );
}