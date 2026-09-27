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

export interface Resumen {
    total: number;
    porCategoria: { categoria: string; total: number }[];
}