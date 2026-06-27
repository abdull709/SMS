import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));

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

function inlineCssHtml() {
  return {
    name: 'inline-css-html',
    closeBundle() {
      const indexPath = path.join(configDir, 'dist', 'index.html');
      const cssPath = path.join(configDir, 'dist', 'assets', 'app.css');
      if (!fs.existsSync(indexPath) || !fs.existsSync(cssPath)) return;

      const html = fs.readFileSync(indexPath, 'utf8');
      const css = fs.readFileSync(cssPath, 'utf8');
      const nextHtml = html.replace(
        /<link rel="stylesheet"[^>]+href="\/assets\/app\.css"[^>]*>/,
        `<style>${css}</style>`
      );
      fs.writeFileSync(indexPath, nextHtml);
    }
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), classicScriptHtml(), inlineCssHtml()],
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
