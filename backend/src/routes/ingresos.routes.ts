import { Router } from 'express';
import { prisma } from '../prisma';
import { parsearFechaLocal, construirRangoMes } from '../utils/fechas';

export const ingresosRouter = Router();

ingresosRouter.get('/', async (req, res) => {
    try {
        const where = construirRangoMes(req.query.mes);
        const ingresos = await prisma.ingreso.findMany({
        where,
        orderBy: { fecha: 'desc' },
        });
        res.json(ingresos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los ingresos' });
    }
    });

    ingresosRouter.post('/', async (req, res) => {
    try {
        const { descripcion, monto, categoria, fecha } = req.body;
        const ingreso = await prisma.ingreso.create({
        data: {
            descripcion,
            monto,
            categoria,
            ...(fecha ? { fecha: parsearFechaLocal(fecha) } : {}),
        },
        });
        res.status(201).json(ingreso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el ingreso' });
    }
    });

    ingresosRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, monto, categoria, fecha } = req.body;
        const ingreso = await prisma.ingreso.update({
        where: { id: Number(id) },
        data: {
            descripcion,
            monto,
            categoria,
            ...(fecha ? { fecha: parsearFechaLocal(fecha) } : {}),
        },
        });
        res.json(ingreso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el ingreso' });
    }
    });

    ingresosRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.ingreso.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el ingreso' });
    }
});