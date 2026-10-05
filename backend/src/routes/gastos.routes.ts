import { Router } from 'express';
import { prisma } from '../prisma';
import { parsearFechaLocal, construirRangoMes } from '../utils/fechas';
import { verificarToken, RequestConUsuario } from '../middleware/auth';

export const gastosRouter = Router();

gastosRouter.use(verificarToken);

gastosRouter.get('/', async (req: RequestConUsuario, res) => {
    try {
        const where = { usuarioId: req.usuarioId, ...construirRangoMes(req.query.mes) };
        const gastos = await prisma.gasto.findMany({
        where,
        orderBy: { fecha: 'desc' },
        include: { items: true },
        });
        res.json(gastos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos' });
    }
    });

    gastosRouter.post('/', async (req: RequestConUsuario, res) => {
    try {
        const { descripcion, monto, categoria, fecha } = req.body;
        const gasto = await prisma.gasto.create({
        data: {
            descripcion,
            monto,
            categoria,
            usuarioId: req.usuarioId as number,
            ...(fecha ? { fecha: parsearFechaLocal(fecha) } : {}),
        },
        });
        res.status(201).json(gasto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el gasto' });
    }
});

gastosRouter.post('/compra-grande', async (req: RequestConUsuario, res) => {
    try {
        const { descripcion, categoria, fecha, lugar, items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Debe incluir al menos un item' });
        }

        const montoTotal = items.reduce(
        (acc: number, item: { cantidad: number; precioUnitario: number }) =>
            acc + item.cantidad * item.precioUnitario,
        0
        );

        const gasto = await prisma.gasto.create({
        data: {
            descripcion,
            categoria,
            lugar,
            monto: montoTotal,
            usuarioId: req.usuarioId as number,
            ...(fecha ? { fecha: parsearFechaLocal(fecha) } : {}),
            items: {
            create: items.map((item: { producto: string; cantidad: number; precioUnitario: number }) => ({
                producto: item.producto,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
            })),
            },
        },
        include: { items: true },
        });

        res.status(201).json(gasto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la compra grande' });
    }
});

gastosRouter.put('/:id', async (req: RequestConUsuario, res) => {
    try {
        const { id } = req.params;
        const { descripcion, monto, categoria, fecha, lugar, items } = req.body;
        const fechaData = fecha ? { fecha: parsearFechaLocal(fecha) } : {};

    // Verificamos que el gasto sea del usuario logueado antes de tocarlo
        const existente = await prisma.gasto.findFirst({
        where: { id: Number(id), usuarioId: req.usuarioId },
        });
        if (!existente) {
        return res.status(404).json({ error: 'Gasto no encontrado' });
        }

    if (Array.isArray(items)) {
        if (items.length === 0) {
            return res.status(400).json({ error: 'Debe incluir al menos un item' });
        }

        const montoTotal = items.reduce(
            (acc: number, item: { cantidad: number; precioUnitario: number }) =>
            acc + item.cantidad * item.precioUnitario,
            0
        );

        const gasto = await prisma.gasto.update({
            where: { id: Number(id) },
            data: {
            descripcion,
            categoria,
            lugar,
            monto: montoTotal,
            ...fechaData,
            items: {
                deleteMany: {},
                create: items.map(
                (item: { producto: string; cantidad: number; precioUnitario: number }) => ({
                    producto: item.producto,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario,
                })
                ),
            },
            },
            include: { items: true },
        });
        return res.json(gasto);
        }

        const gasto = await prisma.gasto.update({
        where: { id: Number(id) },
        data: { descripcion, monto, categoria, ...fechaData },
        });
        res.json(gasto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el gasto' });
    }
});

gastosRouter.delete('/:id', async (req: RequestConUsuario, res) => {
    try {
        const { id } = req.params;

        const existente = await prisma.gasto.findFirst({
        where: { id: Number(id), usuarioId: req.usuarioId },
        });
        if (!existente) {
        return res.status(404).json({ error: 'Gasto no encontrado' });
        }

        await prisma.gasto.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el gasto' });
    }
});