import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export const authRouter = Router();

authRouter.post('/registro', async (req, res) => {
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

authRouter.post('/login', async (req, res) => {
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