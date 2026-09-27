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
    const { descripcion, monto, categoria } = req.body;
    const gasto = await prisma.gasto.create({
      data: { descripcion, monto, categoria },
    });
    res.status(201).json(gasto);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al crear el gasto' });
  }
});

// Listar todos los gastos
app.get('/gastos', async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      orderBy: { fecha: 'desc' },
    });
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los gastos' });
  }
});

// Editar un gasto existente
app.put('/gastos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, monto, categoria } = req.body;
    const gasto = await prisma.gasto.update({
      where: { id: Number(id) },
      data: { descripcion, monto, categoria },
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