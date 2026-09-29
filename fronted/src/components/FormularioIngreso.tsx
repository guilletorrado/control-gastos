import { useEffect, useState } from 'react';
import { CATEGORIAS_INGRESO } from '../constants';
import { fechaDeHoy } from '../utils/fechas';
import type { Ingreso } from '../types';

interface DatosIngreso {
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
}

interface Props {
    ingresoEditando: Ingreso | null;
    onGuardar: (datos: DatosIngreso) => void;
    onCancelar: () => void;
}

export default function FormularioIngreso({ ingresoEditando, onGuardar, onCancelar }: Props) {
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [categoria, setCategoria] = useState(CATEGORIAS_INGRESO[0].valor);
    const [fecha, setFecha] = useState(fechaDeHoy());

    useEffect(() => {
        if (!ingresoEditando) return;
        /* eslint-disable react-hooks/set-state-in-effect */
        setDescripcion(ingresoEditando.descripcion);
        setMonto(String(ingresoEditando.monto));
        setCategoria(ingresoEditando.categoria);
        setFecha(ingresoEditando.fecha.split('T')[0]);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [ingresoEditando]);

    const limpiar = () => {
        setDescripcion('');
        setMonto('');
        setCategoria(CATEGORIAS_INGRESO[0].valor);
        setFecha(fechaDeHoy());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGuardar({ descripcion, monto: Number(monto), categoria, fecha });
        limpiar();
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
        />
        <input
            placeholder="Monto"
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
            {CATEGORIAS_INGRESO.map((c) => (
            <option key={c.valor} value={c.valor}>
                {c.icono} {c.valor}
            </option>
            ))}
        </select>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />

        <div style={{ marginTop: 12 }}>
            <button type="submit">{ingresoEditando ? 'Guardar cambios' : 'Agregar'}</button>
            {ingresoEditando && (
            <button
                type="button"
                onClick={() => {
                limpiar();
                onCancelar();
                }}
            >
                Cancelar
            </button>
            )}
        </div>
        </form>
    );
}