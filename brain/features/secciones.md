# Secciones de la página

Lo que un visitante puede hacer hoy, en orden de aparición:

- **Navegación**: saltar a cada sección visible; incluye enlace "Saltar al contenido".
- **Navegación**: mientras toca directo, el enlace "Directos" lleva un punto rojo. En móvil, el menú se desplaza solo para que se vea la sección actual.
- **Hero**: ver quién es Serg4Cano, ir a YouTube o Twitch con los botones principales y saltar a sus redes (YouTube, Kick, Twitch, Instagram, X y Discord) desde una fila de iconos. Las URLs salen de `profile.json`; TikTok solo aparece en Contacto. La cuenta atrás del próximo directo muestra también la hora en la zona horaria del visitante cuando no es la de Madrid.
- **Vídeos**: ver el último vídeo en un reproductor ligero y, al lado, una lista con los 7 más recientes. Pulsar uno de la lista lo reproduce en la propia página (con Ctrl/Cmd o botón central se abre YouTube como siempre).
- **Shorts**: carrusel de shorts con barra de progreso; las flechas se desactivan al llegar a cada extremo. Vídeos y shorts se refrescan cada 3 horas (`videos.json`, generado en build).
- **Directos**: ver el horario de directos (lun, mié y vie a las 20:00, hora de Madrid) y si ahora toca directo según ese horario (se calcula con el horario, no consultando Twitch ni YouTube). Botón "Añadir a mi calendario" que descarga `directos.ics`, un evento semanal generado en build desde `profile.json`.
- **Setup**: ver el equipamiento agrupado por categoría (`setup.json`). Oculta mientras esté vacía.
- **Recomendaciones**: ver juegos y productos recomendados con enlaces de afiliado (`recommendations.json`).
- **Descuentos**: ver códigos de descuento y patrocinadores (`deals.json`) y hasta 6 ofertas actuales de Steam que se actualizan solas cada 3 horas, con enlace a la tienda (`steam-offers.json`, generado en build). Oculta si no hay ninguna de las dos cosas.
- **Tweets**: ver los 6 tweets más recientes de los que Sergio ha seleccionado en `tweets.json`, del más nuevo al más antiguo. Oculta mientras esté vacía.
- **Contacto**: escribir por email (con botón para copiar la dirección) y ver todas las redes con su nombre y usuario.
