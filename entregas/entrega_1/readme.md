# Entrega 1 — la página unificada

Una sola página que une lo mejor de los tres prototipos: el flujo claro de `prototipo_matias` (mapa, modelo de 23.279 canciones, medición del audio), la portada con video y el efecto de letras del prototipo de Diógenes, y el asistente **The Engineer**. Suma además tres pantallas sobre el proyecto: historia, cómo lo hicimos y nosotros.

**No toca nada de `prototipo_matias/` ni de `main`:** es una carpeta aparte y se publica por separado. La app de https://pyp-ashy.vercel.app sigue igual.

## Cómo se publica

Es una carpeta lista para Vercel, con su `index.html`, sus funciones en `api/` y su `vercel.json`.

1. En Vercel: *Add New Project* → este repositorio → **Root Directory** = `entregas/entrega_1`.
2. Variables de entorno (Settings → Environment Variables):
   - `ANTHROPIC_API_KEY` (**necesaria** para The Engineer y para la lectura del resultado).
   - `ORIGENES_PERMITIDOS` si el dominio no es `pyp-loco.vercel.app` ni `pyp-ashy.vercel.app` (dominios separados por coma).
   - `GROQ_API_KEY` es opcional: si está, la lectura usa Groq; si no, la escribe Claude.
   - `CLAUDE_MODEL` es opcional (por defecto `claude-haiku-5-5`).
3. Sin claves la página funciona igual: The Engineer contesta con reglas simples y el resultado muestra la lectura fija del modelo.

Hay una copia publicada en https://pyp-loco.vercel.app/entrega-1/ (la sube Diógenes con `npx vercel --prod`).

## Qué hay en la carpeta

| Archivo | Qué es |
|---|---|
| `index.html`, `app.js`, `estilos.css`, `logica.js`, `mapa.js`, `modelo.js`, `medicion.js`, `escuchar.js`, `galaxia.js`, `lectura.js`, `analisis_*.js` | La app de `prototipo_matias`. La única edición en `app.js`: expone `PP.estado`, `PP.PINTAR` y `PP.render` y suma `asistente` a las pantallas que piden análisis |
| `entrega.css`, `entrega.js` | La capa de esta entrega: tipografía, portada con video, páginas del proyecto, botón Ingresar/Continuar |
| `engineer.js`, `api/asistente.js` | The Engineer. El texto de sistema (su "cerebro") está en `api/asistente.js`, constante `SISTEMA` |
| `api/lectura.js` | La lectura escrita por IA del resultado (Groq o, sin clave, Claude) |
| `loco.js`, `videos.js`, `videos.css`, `videos/` | El movimiento (preloader, telón, letras) y los videos de la portada |
| `racional*.html`, `la_pagina.html`, `decisiones_de_diseno.html`, `la_letra.html` | Las páginas del trabajo, enlazadas desde "Cómo lo hicimos" |

## A tener en cuenta

- Los videos de `videos/` son material de terceros (conciertos y entrevistas): sirven para la presentación, no para publicar la página de forma abierta.
- Antes de tocar algo, hacer `git pull`: el resto del grupo también trabaja en el repositorio.
