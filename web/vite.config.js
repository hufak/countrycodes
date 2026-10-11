import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'vite';

const dataRoot = new URL('../', import.meta.url);
const csvFiles = () => readdirSync(dataRoot).filter((name) => name.endsWith('.csv'));

export default defineConfig({
  base: '/countrycodes/',
  plugins: [{
    name: 'publish-csv-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = new URL(req.url, 'http://localhost').pathname;
        const fileName = pathname.startsWith(server.config.base)
          ? pathname.slice(server.config.base.length)
          : pathname.slice(1);
        if (!csvFiles().includes(fileName)) return next();
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.end(readFileSync(new URL(fileName, dataRoot)));
      });
    },
    generateBundle() {
      for (const fileName of csvFiles()) {
        this.emitFile({
          type: 'asset',
          fileName,
          source: readFileSync(new URL(fileName, dataRoot)),
        });
      }
    },
  }],
});
