

export function parsearFechaLocal(fechaStr: string): Date {
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Arma un filtro { fecha: { gte, lt } } a partir de un mes "YYYY-MM".
// Si el mes no viene o no tiene el formato esperado, devuelve un objeto vacío (sin filtrar).
export function construirRangoMes(mes: unknown): { fecha?: { gte: Date; lt: Date } } {
    if (typeof mes !== 'string' || !/^\d{4}-\d{2}$/.test(mes)) {
        return {};
    }
    const [year, month] = mes.split('-').map(Number);
    const inicio = new Date(year, month - 1, 1);
    const fin = new Date(year, month, 1);
    return { fecha: { gte: inicio, lt: fin } };
}