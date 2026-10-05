import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface RequestConUsuario extends Request {
    usuarioId?: number;
}

export function verificarToken(req: RequestConUsuario, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { usuarioId: number };
        req.usuarioId = payload.usuarioId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
}