# Serg4Cano Landing Page

Web de Serg4Cano: últimos vídeos y Shorts de YouTube, plataformas de directo, recomendaciones, tweets, descuentos y contacto. Está hecha con Astro y se publica gratis en GitHub Pages:

https://sergiofdezcano.github.io/Serg4Cano-Landing-Page/

## Cómo se actualiza

Los vídeos y los Shorts se descargan solos del feed público de YouTube, sin API key. Una GitHub Action reconstruye la web cada 3 horas y en cada push a `main`. Si YouTube falla, la web sigue mostrando los últimos vídeos que tenía guardados.

Todo lo demás está en `src/data/` y se edita a mano:

| Archivo | Qué contiene |
| --- | --- |
| `profile.json` | Bio, horario de directos, email y redes |
| `recommendations.json` | Juegos, tiendas y recursos recomendados |
| `setup.json` | Tu equipamiento. Si está vacío, la sección no aparece |
| `deals.json` | Descuentos y patrocinadores. Si está vacío, la sección no aparece |
| `tweets.json` | URLs de tus tweets, en cualquier orden. Se muestran los 6 más recientes. Si está vacío, la sección no aparece |

`videos.json` y `tweet-cache.json` los genera `npm run fetch`. No hace falta tocarlos.

Ejemplo de entrada en `setup.json`:

```json
{ "name": "Logitech G Pro X Superlight", "category": "Periféricos", "url": "https://...", "affiliate": true }
```

Ejemplo de entrada en `deals.json`:

```json
{ "brand": "Marca", "discount": "10% DTO", "description": "En toda la tienda", "code": "SERG4CANO", "url": "https://...", "sponsor": true }
```

### Añadir un tweet

1. En X, abre el tweet y pulsa «Compartir → Copiar enlace».
2. Abre `src/data/tweets.json`. Desde el móvil o el navegador puedes hacerlo en github.com: entra en el archivo, pulsa el lápiz («Edit this file») y luego «Commit changes».
3. Pega el enlace como una entrada más de la lista, entre comillas y separado por comas:

```json
[
  "https://x.com/serg4Cano/status/1234567890123456789",
  "https://x.com/serg4Cano/status/1234567890123456790?s=20"
]
```

Da igual el orden, que sea de x.com o twitter.com, que lleve `?s=20` al final o que esté repetido. La web muestra los 6 más recientes, del más nuevo al más antiguo, así que no hace falta borrar los antiguos: dejan de verse solos. El tweet aparece en la siguiente build, que se lanza con cada push a `main` y, como mucho, a las 3 horas.

Cada archivo tiene un esquema en `src/lib/schemas.js`. Si falta un campo o un enlace está mal escrito, la build falla y la web publicada no cambia.

## Desarrollo

Necesitas Node 22.23 o superior.

```sh
npm install
npm run fetch      # descarga vídeos y tweets
npm run dev        # servidor local
npm run check      # build + tests unitarios + tests de navegador
```

Los tests de navegador comprueban que se ven todas las secciones, que no hay scroll horizontal en móvil, que el reproductor carga, que los recursos responden y que no hay errores de accesibilidad WCAG AA (con axe). Para capturas de escritorio y móvil, con `npm run preview` en marcha:

```sh
node scripts/screenshot.mjs
```

## Dominio propio

Cuando tengas dominio, configúralo en Settings > Pages del repositorio y cambia las variables de la build en `.github/workflows/deploy.yml`:

```yaml
env:
  SITE: https://tudominio.com
  BASE: /
```

## Diseño

Los colores y la tipografía salen de los banners de Twitch y YouTube: fondo azul noche con grano, azul `#0083FF` y franjas diagonales. La fuente es Archivo, que lleva su propio servidor, y los iconos de marca vienen de simple-icons.
