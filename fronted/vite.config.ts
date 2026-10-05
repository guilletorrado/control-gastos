import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Agregá esta línea para que Vite acepte NEXT_PUBLIC_ además de VITE_
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
});