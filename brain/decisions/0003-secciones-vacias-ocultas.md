# 0003 Las secciones vacías no se muestran

**Contexto.** Hay secciones sin contenido todavía (setup, descuentos, tweets).

**Decisión.** Si el JSON de una sección está vacío, la sección no se renderiza y tampoco aparece en la navegación (`src/pages/index.astro` construye los enlaces a partir de los datos).

**Consecuencias.** Para mostrar una sección basta con rellenar su JSON. Una sección nueva debe seguir el mismo patrón: componente que no renderiza nada con datos vacíos y enlace condicional en la navegación.
