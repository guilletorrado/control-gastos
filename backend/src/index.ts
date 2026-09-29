import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

function parsearFechaLocal(fechaStr: string): Date {
  const [year, month, day] = fechaStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Historial de precios de un producto (busca por nombre, sin distinguir mayúsculas)
app.get('/productos/historial', async (req, res) => {
  try {
    const { nombre } = req.query;

    if (typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'Debe indicar el nombre del producto' });
    }

    const items = await prisma.itemGasto.findMany({
      where: { producto: { contains: nombre.trim(), mode: 'insensitive' } },
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
      include: { items: true },
    });
    res.json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los gastos' });
  }
});

// Resumen de gastos: total general y por categoría
// Resumen combinado del mes: ingresos, gastos y balance
app.get('/resumen', async (req, res) => {
  try {
    const { mes } = req.query;
    let where = {};

    if (typeof mes === 'string' && /^\d{4}-\d{2}$/.test(mes)) {
      const [year, month] = mes.split('-').map(Number);
      const inicio = new Date(year, month - 1, 1);
      const fin = new Date(year, month, 1);
      where = { fecha: { gte: inicio, lt: fin } };
    }

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

// Editar un gasto existente
app.put('/gastos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, monto, categoria, fecha, lugar, items } = req.body;
    const fechaData = fecha ? { fecha: parsearFechaLocal(fecha) } : {};

    // Compra grande: reemplaza los items y recalcula el total
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

    // Gasto simple
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

// Crear una compra grande con múltiples items
app.post('/gastos/compra-grande', async (req, res) => {
  try {
    const { descripcion, categoria, fecha, lugar, items } = req.body;
    // items: [{ producto, cantidad, precioUnitario }, ...]

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

// Crear un ingreso
app.post('/ingresos', async (req, res) => {
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

// Listar ingresos (opcionalmente filtrados por mes)
app.get('/ingresos', async (req, res) => {
  try {
    const { mes } = req.query;
    let where = {};

    if (typeof mes === 'string' && /^\d{4}-\d{2}$/.test(mes)) {
      const [year, month] = mes.split('-').map(Number);
      const inicio = new Date(year, month - 1, 1);
      const fin = new Date(year, month, 1);
      where = { fecha: { gte: inicio, lt: fin } };
    }

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

// Editar un ingreso
app.put('/ingresos/:id', async (req, res) => {
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

// Eliminar un ingreso
app.delete('/ingresos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ingreso.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el ingreso' });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});