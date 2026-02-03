
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Keeps support for existing API_KEY logic if needed, 
    // but the app now relies on VITE_BACKEND_URL for the Python transition
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
