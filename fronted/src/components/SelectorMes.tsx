import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { mesActual, nombreMes, sumarMes } from '../utils/fechas';

registerLocale('es', es);

interface Props {
    mes: string;
    onCambiarMes: (mes: string) => void;
}

// Convierte "2026-10" -> Date, y viceversa
const mesAFecha = (mes: string): Date => {
    const [year, month] = mes.split('-').map(Number);
    return new Date(year, month - 1, 1);
};

const fechaAMes = (fecha: Date): string =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

export default function SelectorMes({ mes, onCambiarMes }: Props) {
    return (
        <div className="selector-mes">
        <button className="selector-mes__boton" onClick={() => onCambiarMes(sumarMes(mes, -1))}>
            ← anterior
        </button>

        <DatePicker
            selected={mesAFecha(mes)}
            onChange={(fecha : Date | null) => fecha && onCambiarMes(fechaAMes(fecha))}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            maxDate={mesAFecha(mesActual)}
            locale="es"
            customInput={
                <button type="button" className="selector-mes__nombre">
                {nombreMes(mes)}
                </button>
            }
        />

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