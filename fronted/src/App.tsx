import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [mensaje, setMensaje] = useState('Cargando...');

  useEffect(() => {
    fetch('http://localhost:3000/')
      .then((res) => res.json())
      .then((data) => setMensaje(data.message))
      .catch(() => setMensaje('Error al conectar con el backend'));
  }, []);

  return (
    <div>
      <h1>Control de Gastos</h1>
      <p>Mensaje del backend: {mensaje}</p>
    </div>
  );
}

export default App;