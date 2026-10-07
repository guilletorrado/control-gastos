import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../prisma';

export const authRouter = Router();

// Máximo 5 cuentas nuevas por hora desde la misma IP
const registroLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,
    message: { error: 'Demasiados intentos de registro. Probá de nuevo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Máximo 10 intentos de login cada 15 minutos desde la misma IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    message: { error: 'Demasiados intentos de inicio de sesión. Probá de nuevo en unos minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

authRouter.post('/registro', registroLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
        }

        const existente = await prisma.usuario.findUnique({ where: { email } });
        if (existente) {
        return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const usuario = await prisma.usuario.create({
        data: { email, passwordHash },
        });

        const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
        });

        res.status(201).json({ token, email: usuario.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

authRouter.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
        if (!passwordValida) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
        });

        res.json({ token, email: usuario.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});