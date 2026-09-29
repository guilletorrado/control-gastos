import { Router } from 'express';
import { prisma } from '../prisma';
import { parsearFechaLocal, construirRangoMes } from '../utils/fechas';

export const gastosRouter = Router();

// Listar gastos (con items) filtrados por mes
gastosRouter.get('/', async (req, res) => {
    try {
        const where = construirRangoMes(req.query.mes);
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

    // Crear un gasto simple
    gastosRouter.post('/', async (req, res) => {
    try {
        const { descripcion, monto, categoria, fecha } = req.body;
        const gasto = await prisma.gasto.create({
        data: {
            descripcion,
            monto,
            categoria,
            ...(fecha ? { fecha: parsearFechaLocal(fecha) } : {}),
        },
        });
        res.status(201).json(gasto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el gasto' });
    }
    });

    // Crear una compra grande con items
    gastosRouter.post('/compra-grande', async (req, res) => {
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

    // Editar un gasto (simple o compra grande, según si vienen items)
    gastosRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, monto, categoria, fecha, lugar, items } = req.body;
        const fechaData = fecha ? { fecha: parsearFechaLocal(fecha) } : {};

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

// Eliminar un gasto
gastosRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.gasto.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el gasto' });
    }
});