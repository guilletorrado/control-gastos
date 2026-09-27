const hoy = new Date();
export const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

export const nombreMes = (mes: string) => {
    const [year, month] = mes.split('-').map(Number);
    const fecha = new Date(year, month - 1, 1);
    return fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
};

export const sumarMes = (mes: string, delta: number) => {
    const [year, month] = mes.split('-').map(Number);
    const fecha = new Date(year, month - 1 + delta, 1);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
};

export const fechaDeHoy = () => new Date().toISOString().split('T')[0];