import { CATEGORIAS } from '../constants';
import type { Gasto } from '../types';

interface Props {
    gastos: Gasto[];
    onEditar: (gasto: Gasto) => void;
    onEliminar: (id: number) => void;
}

export default function ListaGastos({ gastos, onEditar, onEliminar }: Props) {
    return (
        <ul style={{ listStyle: 'none', padding: 0 }}>
        {gastos.map((g) => (
            <li key={g.id} style={{ borderBottom: '1px solid #ccc', padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                {CATEGORIAS.find((c) => c.valor === g.categoria)?.icono ?? '📦'} {g.descripcion} — $
                {g.monto} ({g.categoria})
                {g.lugar && <span style={{ color: '#888' }}> · {g.lugar}</span>}
                </span>
                <span>
                <button onClick={() => onEditar(g)}>Editar</button>{' '}
                <button onClick={() => onEliminar(g.id)}>Eliminar</button>
                </span>
            </div>
            {g.items && g.items.length > 0 && (
                <ul style={{ listStyle: 'none', paddingLeft: 16, marginTop: 4, color: '#666', fontSize: 14 }}>
                {g.items.map((item) => (
                    <li key={item.id}>
                    {item.producto}: {item.cantidad} x ${item.precioUnitario}
                    </li>
                ))}
                </ul>
            )}
            </li>
        ))}
        </ul>
    );
}