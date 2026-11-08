# 0001 Astro estático en GitHub Pages

**Contexto.** La landing es una sola página de presentación sin usuarios ni backend.

**Decisión.** Astro genera HTML estático y GitHub Actions lo publica en GitHub Pages en cada push a `main` y cada 3 horas (para refrescar vídeos y tweets con `npm run fetch`). El sitio vive bajo `/Serg4Cano-Landing-Page`; `astro.config.mjs` lee `SITE` y `BASE` para cuando haya dominio propio.

**Consecuencias.** Nada de servidor, base de datos, login ni APIs con secretos en el navegador. Cualquier dato dinámico se obtiene en build (`scripts/fetch-content.mjs`). Las rutas a assets deben usar `import.meta.env.BASE_URL`, nunca `/` a pelo.
