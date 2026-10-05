import { Router } from 'express';
import { prisma } from '../prisma';
import { construirRangoMes } from '../utils/fechas';
import { verificarToken, RequestConUsuario } from '../middleware/auth';

export const resumenRouter = Router();

resumenRouter.use(verificarToken);

resumenRouter.get('/', async (req: RequestConUsuario, res) => {
    try {
        const where = { usuarioId: req.usuarioId, ...construirRangoMes(req.query.mes) };

        const totalGastosResult = await prisma.gasto.aggregate({
        where,
        _sum: { monto: true },
        });

        const totalIngresosResult = await prisma.ingreso.aggregate({
        where,
        _sum: { monto: true },
        });

        const porCategoria = await prisma.gasto.groupBy({
        by: ['categoria'],
        where,
        _sum: { monto: true },
        orderBy: { _sum: { monto: 'desc' } },
        });

        const totalGastos = totalGastosResult._sum.monto ?? 0;
        const totalIngresos = totalIngresosResult._sum.monto ?? 0;

        res.json({
        totalGastos,
        totalIngresos,
        balance: totalIngresos - totalGastos,
        porCategoria: porCategoria.map((c) => ({
            categoria: c.categoria,
            total: c._sum.monto ?? 0,
        })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el resumen' });
    }
});