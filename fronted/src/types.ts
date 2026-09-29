export interface ItemGasto {
    id?: number;
    producto: string;
    cantidad: number;
    precioUnitario: number;
}

export interface Gasto {
    id: number;
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
    lugar?: string | null;
    items?: ItemGasto[];
}

export interface Ingreso {
    id: number;
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
}

export interface Resumen {
    totalGastos: number;
    totalIngresos: number;
    balance: number;
    porCategoria: { categoria: string; total: number }[];
}

export interface HistorialProducto {
    id: number;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    fecha: string;
    lugar: string | null;
}