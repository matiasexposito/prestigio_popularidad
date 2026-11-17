# Entrega 1 — la página unificada

Una sola página que une lo mejor de los tres prototipos: el flujo claro de `prototipo_matias` (mapa, modelo de 23.279 canciones, medición del audio), la portada con video y el efecto de letras del prototipo de Diógenes, y el asistente **The Engineer**. Suma tres pantallas sobre el proyecto: historia, cómo lo hicimos y nosotros.

**Dónde se ve:** https://pyp-ashy.vercel.app/entrega-1/ (se publica sola con cada push a `main`, junto con la app de siempre). La app original sigue en la raíz y no cambió.

## Cómo se edita

Todo es HTML, CSS y JS sin compilar: se edita el archivo, se hace commit y se publica.

| Archivo | Qué es |
|---|---|
| `index.html` | Todas las pantallas (portada, los dos mundos, cuenta, subir, resultado, desglose, simulador, The Engineer, historia, cómo lo hicimos, nosotros) |
| `entrega.css`, `entrega.js` | La capa de esta entrega: tipografía, portada con video, páginas del proyecto, botón Ingresar/Continuar |
| `engineer.js` | El chat de The Engineer (el navegador arma el pedido y muestra la respuesta) |
| `../api/asistente.js` | El "cerebro" de The Engineer: el texto de sistema está en la constante `SISTEMA` |
| `loco.js`, `videos.js`, `videos.css`, `videos/` | El movimiento (preloader, telón, letras) y los videos de la portada. Los videos se cambian en la lista de `videos.js` |
| `app.js`, `logica.js`, `mapa.js`, `modelo.js`, `medicion.js`, `escuchar.js`, `galaxia.js`, `lectura.js`, `analisis_*.js`, `estilos.css` | La app de la carpeta de arriba (`prototipo_matias`), copiada. La única edición de `app.js`: expone `PP.estado`, `PP.PINTAR` y `PP.render` y suma `asistente` a las pantallas que piden análisis |
| `racional*.html`, `la_pagina.html`, `decisiones_de_diseno.html`, `la_letra.html` | Las páginas del trabajo, enlazadas desde "Cómo lo hicimos" |

Si se reentrena el modelo o se cambia algo de la app de arriba, hay que copiar el archivo correspondiente (`modelo.js`, `logica.js`…) a esta carpeta.

## Variables de entorno (Vercel → Settings → Environment Variables)

- `ANTHROPIC_API_KEY`: **necesaria** para que The Engineer responda con IA. Sin ella contesta con reglas simples y el resto de la página funciona igual.
- `GROQ_API_KEY`: ya está; la lectura escrita por IA del resultado la usa.
- `CLAUDE_MODEL` (opcional): por defecto `claude-haiku-5-5`.
- `ORIGENES_PERMITIDOS` (opcional): dominios que pueden usar la clave de Claude, separados por coma. Por defecto `pyp-ashy.vercel.app` y `pyp-loco.vercel.app`.

## A tener en cuenta

- Los videos de `videos/` son material de terceros (conciertos y entrevistas): sirven para la presentación, no para publicar la página de forma abierta.
- Hacer `git pull` antes de tocar algo: el resto del grupo también trabaja en el repositorio.
