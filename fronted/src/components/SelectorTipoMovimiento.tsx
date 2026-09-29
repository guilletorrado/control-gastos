interface Props {
    tipo: 'egreso' | 'ingreso';
    onCambiar: (tipo: 'egreso' | 'ingreso') => void;
}

export default function SelectorTipoMovimiento({ tipo, onCambiar }: Props) {
    return (
        <div className="tipo-movimiento">
        <button
            type="button"
            onClick={() => onCambiar('egreso')}
            className={`tipo-movimiento__boton egreso ${tipo === 'egreso' ? 'activo' : ''}`}
        >
            − Egreso
        </button>
        <button
            type="button"
            onClick={() => onCambiar('ingreso')}
            className={`tipo-movimiento__boton ingreso ${tipo === 'ingreso' ? 'activo' : ''}`}
        >
            + Ingreso
        </button>
        </div>
    );
}