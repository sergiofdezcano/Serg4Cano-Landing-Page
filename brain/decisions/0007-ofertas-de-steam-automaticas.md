# 0007 Ofertas de juegos automáticas desde Steam

Complementa a [0003 Las secciones vacías no se muestran](0003-secciones-vacias-ocultas.md).

**Contexto.** Los juegos con descuento se mantenían a mano y se quedaban viejos. Instant Gaming no tiene una API pública documentada y su programa de afiliados no ofrece un feed accesible sin cuenta. PlayStation Store tampoco tiene API pública. Scrapear cualquiera de las dos se rompe sin avisar, igual que pasó con Nitter y los puentes RSS (ver [0006](0006-tweets-recientes-de-lista-manual.md)).

**Decisión.** Las ofertas salen en build del endpoint público de Steam `https://store.steampowered.com/api/featuredcategories?cc=es&l=spanish` (sin clave ni login). `scripts/fetch-content.mjs` las convierte con `toSteamOffers` (`src/lib/steam.js`) y las guarda en `src/data/steam-offers.json`, validado con `steamOffersSchema`. Solo descuentos mayores que 0, sin ids duplicados, en el orden de Steam y como máximo 6 (dos filas de la rejilla de 3 columnas). Si Steam falla o no devuelve ofertas, se conserva la última copia buena. `src/lib/data.js` aplica `activeOffers` al exportar, así que al construir la página se descartan las ofertas cuya fecha de fin ya pasó, también las de una copia vieja. Cada tarjeta enlaza a la ficha de Steam (`https://store.steampowered.com/app/<id>/`) sin afiliado, para que el precio que se ve coincida con el de la tienda.

La sección Descuentos se considera vacía solo si `deals.json` está vacío y no hay ofertas de Steam vigentes; si no, se muestra y aparece en la navegación. Los códigos y patrocinadores de `deals.json` van antes del bloque de Steam, y el aviso de afiliados solo se muestra si hay entradas de `deals.json`.

**Consecuencias.** Las ofertas se renuevan solas cada 3 horas y en cada push a `main` sin editar archivos. No se añade ninguna dependencia ni clave. Las ofertas de Steam no generan comisión. Si aparece una fuente oficial de Instant Gaming o PlayStation, se escribirá otra decisión.
