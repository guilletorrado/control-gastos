export const API_URL = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const CATEGORIAS = [
    { valor: 'Comida y bebida', icono: '🍔' },
    { valor: 'Supermercado', icono: '🛒' },
    { valor: 'Transporte', icono: '🚌' },
    { valor: 'Salud', icono: '💊' },
    { valor: 'Entretenimiento', icono: '🎬' },
    { valor: 'Compras', icono: '🛍️' },
    { valor: 'Servicios', icono: '💡' },
    { valor: 'Educación', icono: '📚' },
    { valor: 'Hogar', icono: '🏠' },
    { valor: 'Vestimenta', icono: '👕' },
    { valor: 'Mascotas', icono: '🐶' },
    { valor: 'Otros', icono: '📦' },
];

export const CATEGORIAS_INGRESO = [
    { valor: 'Sueldo', icono: '💼' },
    { valor: 'Trabajo particular', icono: '🧑‍🔧' },
    { valor: 'Regalo', icono: '🎁' },
    { valor: 'Venta', icono: '💰' },
    { valor: 'Inversión', icono: '📈' },
    { valor: 'Otro', icono: '📦' },
];