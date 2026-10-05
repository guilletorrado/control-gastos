import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { gastosRouter } from './routes/gastos.routes';
import { ingresosRouter } from './routes/ingresos.routes';
import { productosRouter } from './routes/productos.routes';
import { resumenRouter } from './routes/resumen.routes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

app.use('/gastos', gastosRouter);
app.use('/ingresos', ingresosRouter);
app.use('/productos', productosRouter);
app.use('/resumen', resumenRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});