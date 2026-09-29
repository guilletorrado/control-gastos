import { mesActual, nombreMes, sumarMes } from '../utils/fechas';

interface Props {
    mes: string;
    onCambiarMes: (mes: string) => void;
}

export default function SelectorMes({ mes, onCambiarMes }: Props) {
    return (
        <div className="selector-mes">
        <button className="selector-mes__boton" onClick={() => onCambiarMes(sumarMes(mes, -1))}>
            ← anterior
        </button>
        <span className="selector-mes__nombre">{nombreMes(mes)}</span>
        <button
            className="selector-mes__boton"
            onClick={() => onCambiarMes(sumarMes(mes, 1))}
            disabled={mes >= mesActual}
        >
            siguiente →
        </button>
        </div>
    );
}