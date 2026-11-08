# 0002 Contenido en JSON validado por esquemas

**Contexto.** Sergio edita el contenido (setup, recomendaciones, descuentos, tweets) sin tocar componentes.

**Decisión.** Todo el contenido editable vive en `src/data/*.json`. Cada archivo tiene un esquema zod en `src/lib/schemas.js` y `tests/unit/data.test.js` valida todos los archivos. Los enlaces de Instant Gaming llevan siempre `igr=serg4Cano`.

**Consecuencias.** Cambiar contenido es editar un JSON, que es un cambio de bajo riesgo. Un campo nuevo requiere actualizar el esquema y su test en el mismo cambio. `kit.co` cerró: no se usan enlaces a kit.co.
