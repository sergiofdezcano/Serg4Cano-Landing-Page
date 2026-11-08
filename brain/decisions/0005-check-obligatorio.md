# 0005 Cada cambio se demuestra con npm run check

**Contexto.** La AI Software Factory trabaja sobre este repo y necesita una forma objetiva de demostrar que un cambio funciona.

**Decisión.** `npm run check` (build, vitest y Playwright con axe) debe pasar en todo cambio. Para cambios visibles, la evidencia incluye capturas de escritorio y móvil (`scripts/factory-screenshots.mjs`), y la página no puede tener scroll horizontal.

**Consecuencias.** Un cambio que rompe accesibilidad (axe) o el layout no se cierra. Los tests nuevos van en `tests/unit` (lógica y datos) o `tests/e2e` (lo que ve el visitante).
