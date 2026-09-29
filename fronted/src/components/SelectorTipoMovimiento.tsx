interface Props {
    tipo: 'egreso' | 'ingreso';
    onCambiar: (tipo: 'egreso' | 'ingreso') => void;
}

export default function SelectorTipoMovimiento({ tipo, onCambiar }: Props) {
    const estiloBase: React.CSSProperties = {
        flex: 1,
        padding: 8,
        border: '1px solid #999',
        cursor: 'pointer',
    };

    return (
        <div style={{ display: 'flex', marginBottom: 12 }}>
        <button
            type="button"
            onClick={() => onCambiar('egreso')}
            style={{
            ...estiloBase,
            backgroundColor: tipo === 'egreso' ? '#f8d7da' : '#f5f5f5',
            fontWeight: tipo === 'egreso' ? 'bold' : 'normal',
            }}
        >
            − Egreso
        </button>
        <button
            type="button"
            onClick={() => onCambiar('ingreso')}
            style={{
            ...estiloBase,
            backgroundColor: tipo === 'ingreso' ? '#d4edda' : '#f5f5f5',
            fontWeight: tipo === 'ingreso' ? 'bold' : 'normal',
            }}
        >
            + Ingreso
        </button>
        </div>
    );
}