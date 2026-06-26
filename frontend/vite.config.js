import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function classicScriptHtml() {
  return {
    name: 'classic-script-html',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
        '<script type="module" crossorigin src="/assets/app.js"></script>',
        '<script defer src="/assets/app.js"></script>'
        );
      }
    }
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), classicScriptHtml()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'assets/app.css';
          return 'assets/[name][extname]';
        }
      }
    }
  }
});
