import { API_URL } from '../constants';
import type { Gasto, Resumen, ItemGasto, HistorialProducto, Ingreso } from '../types';

interface DatosIngreso {
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
}

interface DatosGastoSimple {
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
}

interface DatosCompraGrande {
    descripcion: string;
    categoria: string;
    fecha: string;
    lugar: string;
    items: ItemGasto[];
}


export async function obtenerGastos(mes: string): Promise<Gasto[]> {
    const res = await fetch(`${API_URL}/gastos?mes=${mes}`);
    return res.json();
}

export async function obtenerResumen(mes: string): Promise<Resumen> {
    const res = await fetch(`${API_URL}/resumen?mes=${mes}`);
    return res.json();
}

export async function crearGasto(data: DatosGastoSimple) {
    await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function actualizarGasto(id: number, data: DatosGastoSimple) {
    await fetch(`${API_URL}/gastos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function eliminarGasto(id: number) {
    await fetch(`${API_URL}/gastos/${id}`, { method: 'DELETE' });
}

export async function crearCompraGrande(data: DatosCompraGrande) {
    await fetch(`${API_URL}/gastos/compra-grande`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function actualizarCompraGrande(id: number, data: DatosCompraGrande) {
    await fetch(`${API_URL}/gastos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function buscarHistorialProducto(nombre: string): Promise<HistorialProducto[]> {
    const res = await fetch(`${API_URL}/productos/historial?nombre=${encodeURIComponent(nombre)}`);
    if (!res.ok) throw new Error('Error al buscar el producto');
    return res.json();
}

export async function obtenerIngresos(mes: string): Promise<Ingreso[]> {
    const res = await fetch(`${API_URL}/ingresos?mes=${mes}`);
    return res.json();
}

export async function crearIngreso(data: DatosIngreso) {
    await fetch(`${API_URL}/ingresos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function actualizarIngreso(id: number, data: DatosIngreso) {
    await fetch(`${API_URL}/ingresos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function eliminarIngreso(id: number) {
    await fetch(`${API_URL}/ingresos/${id}`, { method: 'DELETE' });
}