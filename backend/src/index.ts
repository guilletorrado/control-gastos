import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});


// Crear un gasto nuevo
app.post('/gastos', async (req, res) => {
  try {
    const { descripcion, monto, categoria, fecha } = req.body;
    const gasto = await prisma.gasto.create({
      data: {
        descripcion,
        monto,
        categoria,
        ...(fecha ? { fecha: new Date(fecha) } : {}),
      },
    });
    res.status(201).json(gasto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el gasto' });
  }
});

// Listar todos los gastos
app.get('/gastos', async (req, res) => {
  try {
    const { mes } = req.query; // formato "YYYY-MM"
    let where = {};

    if (typeof mes === 'string' && /^\d{4}-\d{2}$/.test(mes)) {
      const [year, month] = mes.split('-').map(Number);
      const inicio = new Date(year, month - 1, 1);
      const fin = new Date(year, month, 1);
      where = { fecha: { gte: inicio, lt: fin } };
    }

    const gastos = await prisma.gasto.findMany({
      where,
      orderBy: { fecha: 'desc' },
    });
    res.json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los gastos' });
  }
});

// Resumen de gastos: total general y por categoría
app.get('/gastos/resumen', async (req, res) => {
  try {
    const { mes } = req.query;
    let where = {};

    if (typeof mes === 'string' && /^\d{4}-\d{2}$/.test(mes)) {
      const [year, month] = mes.split('-').map(Number);
      const inicio = new Date(year, month - 1, 1);
      const fin = new Date(year, month, 1);
      where = { fecha: { gte: inicio, lt: fin } };
    }

    const totalGeneral = await prisma.gasto.aggregate({
      where,
      _sum: { monto: true },
    });

    const porCategoria = await prisma.gasto.groupBy({
      by: ['categoria'],
      where,
      _sum: { monto: true },
      orderBy: { _sum: { monto: 'desc' } },
    });

    res.json({
      total: totalGeneral._sum.monto ?? 0,
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

// Editar un gasto existente
app.put('/gastos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, monto, categoria, fecha } = req.body;
    const gasto = await prisma.gasto.update({
      where: { id: Number(id) },
      data: {
        descripcion,
        monto,
        categoria,
        ...(fecha ? { fecha: new Date(fecha) } : {}),
      },
    });
    res.json(gasto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el gasto' });
  }
});

// Eliminar un gasto
app.delete('/gastos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.gasto.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el gasto' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});