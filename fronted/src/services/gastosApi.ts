import { API_URL } from '../constants';
import type { Gasto, Resumen, ItemGasto, HistorialProducto, Ingreso } from '../types';
import { obtenerToken, cerrarSesion } from './authApi';

function headersAutenticados(): HeadersInit {
    const token = obtenerToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    }

    async function fetchAutenticado(url: string, options: RequestInit = {}) {
    const res = await fetch(url, {
        ...options,
        headers: { ...headersAutenticados(), ...(options.headers ?? {}) },
    });

    if (res.status === 401) {
        cerrarSesion();
        window.location.reload();
        throw new Error('Sesión vencida');
    }

    return res;
}

export async function obtenerGastos(mes: string): Promise<Gasto[]> {
    const res = await fetchAutenticado(`${API_URL}/gastos?mes=${mes}`);
    return res.json();
}

export async function obtenerResumen(mes: string): Promise<Resumen> {
    const res = await fetchAutenticado(`${API_URL}/resumen?mes=${mes}`);
    return res.json();
}

interface DatosGastoSimple {
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
}

export async function crearGasto(data: DatosGastoSimple) {
    await fetchAutenticado(`${API_URL}/gastos`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    }

export async function actualizarGasto(id: number, data: DatosGastoSimple) {
    await fetchAutenticado(`${API_URL}/gastos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function eliminarGasto(id: number) {
    await fetchAutenticado(`${API_URL}/gastos/${id}`, { method: 'DELETE' });
}

interface DatosCompraGrande {
    descripcion: string;
    categoria: string;
    fecha: string;
    lugar: string;
    items: ItemGasto[];
}

export async function crearCompraGrande(data: DatosCompraGrande) {
    await fetchAutenticado(`${API_URL}/gastos/compra-grande`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function actualizarCompraGrande(id: number, data: DatosCompraGrande) {
    await fetchAutenticado(`${API_URL}/gastos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

interface DatosIngreso {
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
}

export async function obtenerIngresos(mes: string): Promise<Ingreso[]> {
    const res = await fetchAutenticado(`${API_URL}/ingresos?mes=${mes}`);
    return res.json();
}

export async function crearIngreso(data: DatosIngreso) {
    await fetchAutenticado(`${API_URL}/ingresos`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function actualizarIngreso(id: number, data: DatosIngreso) {
    await fetchAutenticado(`${API_URL}/ingresos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function eliminarIngreso(id: number) {
    await fetchAutenticado(`${API_URL}/ingresos/${id}`, { method: 'DELETE' });
}

export async function buscarHistorialProducto(nombre: string): Promise<HistorialProducto[]> {
    const res = await fetchAutenticado(`${API_URL}/productos/historial?nombre=${encodeURIComponent(nombre)}`);
    if (!res.ok) throw new Error('Error al buscar el producto');
    return res.json();
}