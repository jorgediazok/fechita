# fechita-web

La app Next.js de **Fechita**. La documentación vive en la raíz del repo:

- [`../README.md`](../README.md) — arquitectura completa, arranque local, deploy
- [`../docs/product-design.md`](../docs/product-design.md) — diseño del producto
- [`../CLAUDE.md`](../CLAUDE.md) — notas de arquitectura y trampas del repo
- [`AGENTS.md`](AGENTS.md) — Next.js 16 tiene breaking changes, leer antes de tocar código

## Rápido

```bash
npm install
cp .env.example .env.local   # completar variables
npm run dev                  # http://localhost:3000
```

Con `FIXTURE_SOURCE=mock` (default) no hace falta ninguna API key. `npm run seed` carga datos de
prueba (usuarios, bots, pronósticos con spread).
