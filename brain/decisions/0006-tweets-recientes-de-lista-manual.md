# 0006 Los 6 tweets más recientes de una lista manual

Complementa a [0004 Tweets sin API de pago](0004-tweets-sin-api-de-pago.md).

**Contexto.** Se buscó una fuente gratuita y fiable para listar los últimos tweets de la cuenta y no la hay: la API de X es de pago, el timeline de syndication pide login, y Nitter y los puentes RSS de terceros se caen o cambian sin avisar. `cdn.syndication.twimg.com` solo sirve tweets por ID.

**Decisión.** La sección muestra los 6 tweets más recientes de la lista manual `src/data/tweets.json`, sin duplicados y ordenados por fecha de publicación, del más nuevo al más antiguo. La lógica vive en `latestTweets` (`src/lib/tweets.js`) y se aplica al `tweets` que exporta `src/lib/data.js`, así que también vale para las copias de `tweet-cache.json` cuando falla la descarga. Añadir un tweet es pegar su URL en cualquier posición; `scripts/fetch-content.mjs` no pide dos veces el mismo ID. Son 6 porque la rejilla tiene 3 columnas en escritorio: 2 filas completas.

**Consecuencias.** Mantener la sección es pegar una URL, y nunca se llena de tweets viejos porque los antiguos dejan de verse solos. El límite no es configurable. Si algún día aparece una fuente gratuita y fiable para listar tweets, se escribirá otra decisión que sustituya a esta.
