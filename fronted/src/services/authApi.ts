const API_URL = 'http://localhost:3000';
const CLAVE_TOKEN = 'controlgastos_token';
const CLAVE_EMAIL = 'controlgastos_email';

export function obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
}

export function obtenerEmailGuardado(): string | null {
    return localStorage.getItem(CLAVE_EMAIL);
}

function guardarSesion(token: string, email: string) {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_EMAIL, email);
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_EMAIL);
}

async function manejarRespuesta(res: Response) {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error ?? 'Ocurrió un error');
    }
    return data;
}

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await manejarRespuesta(res);
    guardarSesion(data.token, data.email);
    return data;
}

export async function registrar(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await manejarRespuesta(res);
    guardarSesion(data.token, data.email);
    return data;
}