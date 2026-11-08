# 0004 Tweets sin API de pago

**Contexto.** La API de X es de pago. El endpoint público `cdn.syndication.twimg.com` devuelve un tweet por ID, pero no permite listar los últimos de una cuenta.

**Decisión.** `src/data/tweets.json` es una lista manual de URLs de tweets; en build se obtienen sus datos y se guardan en `tweet-cache.json`. Hoy la lista está vacía, así que la sección está oculta (ver 0003).

**Consecuencias.** No se añade ninguna dependencia ni clave de la API de X. Automatizar "los últimos tweets" requiere otra fuente y una decisión nueva.
