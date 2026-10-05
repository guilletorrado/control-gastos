import { Router } from 'express';
import { prisma } from '../prisma';
import { verificarToken, RequestConUsuario } from '../middleware/auth';

export const productosRouter = Router();

productosRouter.use(verificarToken);

productosRouter.get('/historial', async (req: RequestConUsuario, res) => {
    try {
        const { nombre } = req.query;

        if (typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'Debe indicar el nombre del producto' });
        }

        const items = await prisma.itemGasto.findMany({
        where: {
            producto: { contains: nombre.trim(), mode: 'insensitive' },
            gasto: { usuarioId: req.usuarioId },
        },
        include: { gasto: { select: { fecha: true, lugar: true } } },
        orderBy: { gasto: { fecha: 'desc' } },
    });

    res.json(
        items.map((i) => ({
        id: i.id,
        producto: i.producto,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        fecha: i.gasto.fecha,
        lugar: i.gasto.lugar,
        }))
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar el historial del producto' });
    }
});