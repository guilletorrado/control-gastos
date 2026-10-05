import { useState } from 'react';
import { login, registrar } from '../services/authApi';

interface Props {
    onIngresar: () => void;
}

export default function LoginForm({ onIngresar }: Props) {
    const [modo, setModo] = useState<'login' | 'registro'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
        if (modo === 'login') {
            await login(email, password);
        } else {
            await registrar(email, password);
        }
        onIngresar();
        } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error');
        } finally {
        setCargando(false);
        }
    };

    return (
        <div className="login-pantalla">
        <div className="login-caja">
            <h1 className="login-titulo">Control de Gastos</h1>
            <p className="login-subtitulo">
            {modo === 'login' ? 'Iniciá sesión para continuar' : 'Creá tu cuenta gratis'}
            </p>

            <form onSubmit={handleSubmit}>
            <input
                className="formulario__campo"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                className="formulario__campo"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
            />

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="boton login-boton" disabled={cargando}>
                {cargando ? 'Un momento...' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
            </form>

            <button
            type="button"
            className="boton--texto login-cambiar"
            onClick={() => {
                setModo(modo === 'login' ? 'registro' : 'login');
                setError('');
            }}
            >
            {modo === 'login' ? '¿No tenés cuenta? Creá una' : '¿Ya tenés cuenta? Iniciá sesión'}
            </button>
        </div>
        </div>
    );
}