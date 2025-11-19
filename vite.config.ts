import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

// https://vite.dev/config/
export default defineConfig({
  plugins: [dyadComponentTagger(), react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/webhook': {
        target: 'http://localhost:5679',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/webhook/, '/webhook')
      }
    },
    cors: true,
    port: 5179 // Adicione esta linha para definir a porta explicitamente
  }
});