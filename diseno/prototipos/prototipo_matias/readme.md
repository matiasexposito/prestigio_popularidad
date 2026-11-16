# La app publicada

Esta carpeta es la app de P&P tal como está en **https://pyp-ashy.vercel.app**. Es la que se sube a Vercel.

Se rearmó el 2 de noviembre de 2026 desde nuestro borrador de diseño (`diseno/borrador/`). Las cuentas del modelo y la medición del audio vienen del prototipo de Diógenes (`../prototipo_diogenes/`).

**Cómo abrirla en tu computadora:** doble clic en `index.html`. Funciona todo menos la lectura escrita por la IA, que necesita el servidor de Vercel; en ese caso la app muestra una lectura fija y no se rompe.

## Qué hace cada parte

| Parte | Cómo funciona |
|---|---|
| Portada | 240 canciones reales de la base giran como una galaxia. Azul: nominada al Grammy. Ámbar: entró al Hot 100. Con el sonido activado suena una melodía lenta |
| Los dos puntajes | Salen del modelo entrenado con 23.333 canciones del año 2000 en adelante. Cada puntaje es el percentil de la canción dentro de esas 23.333 |
| Margen de error | 20 remuestreos del modelo, con un piso de ±4 puntos |
| Mapa | 100 canciones reales: 30 nominadas o ganadoras, 40 hits nunca nominados y 30 que no entraron al ranking. Cada punto se puede tocar para escuchar la canción |
| Buscar por nombre | 773 canciones conocidas desde 2000 (las que fueron nominadas y entraron al ranking, y las que llegaron al puesto 1) |
| Subir un audio | ReccoBeats mide energía, valencia, acústica, bailabilidad, habla, volumen e instrumentalidad. Essentia.js mide tempo y modo. La duración la da el navegador |
| Qué suma y qué resta | Cuántos puntos aporta cada rasgo, comparado con una canción promedio |
| Simular | Recalcula los dos puntajes con el modelo cada vez que se mueve un control |
| La lectura | Una IA (GPT-OSS 120B, servida por Groq) pone en palabras los números de la canción. No recibe el título ni el artista |

Los colores quieren decir lo mismo en todas las pantallas: **azul es prestigio, ámbar es popularidad**. Lo que no es de ningún eje va en negro o gris.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Las siete pantallas |
| `estilos.css` | Los estilos |
| `app.js` | Qué se muestra en cada pantalla y cómo |
| `logica.js` | Las cuentas del modelo: puntajes, margen, aportes de cada rasgo, conflicto y zonas |
| `mapa.js` | El mapa y la elección de las 100 canciones |
| `galaxia.js` | La galaxia de la portada y de "creá tu cuenta", y la melodía |
| `escuchar.js` | Tocar un punto del mapa para escuchar esa canción (vista previa de Apple Music) |
| `medicion.js` | Mide el archivo que sube el usuario |
| `analisis_reccobeats.js` | La consulta a ReccoBeats y su calibración contra Spotify |
| `analisis_essentia.js` | El análisis con Essentia.js |
| `lectura.js` | Arma el paquete de números que se le manda a la IA |
| `api/lectura.js` | La función del servidor que habla con la IA. Lee la clave de una variable de entorno; la clave no está en el repositorio |
| `modelo.js` | Los coeficientes del modelo y las canciones. **Generado: no se edita a mano** |
| `generar_modelo.py` | Vuelve a generar `modelo.js` desde `datasets/` |
| `la_pagina.md`, `decisiones_de_diseno.md` | Los textos de las páginas "qué hace cada pantalla" y "las decisiones de diseño" |
| `armar_documentos.js` | Convierte esos textos, el racional y el análisis de la letra en las páginas `.html` |
| `racional.html`, `la_pagina.html`, `decisiones_de_diseno.html`, `la_letra.html` | Las páginas publicadas. **Generadas: no se editan a mano** |
| `vercel.json`, `.vercelignore` | Configuración de la publicación |

## Cómo se actualiza

Volver a generar el modelo (necesita Python con numpy), desde la raíz del repositorio:

```
python diseno/prototipos/prototipo_matias/generar_modelo.py
```

Volver a generar las páginas después de cambiar el racional o los textos, desde esta carpeta:

```
node armar_documentos.js
```

Publicar, desde esta carpeta:

```
vercel deploy --prod
```

## Límites

- Usa solo canciones desde el año 2000: mide dónde está parada una canción hoy.
- Mide el sonido. No la letra, ni las redes, ni quién es el artista.
- **Un archivo subido se mide con menos precisión que una canción de la base.** En una prueba con 38 canciones, medir el audio en vez de usar el dato original movió la popularidad unos 15 puntos y el prestigio unos 11. Está explicado en `decisiones.md` (16 de noviembre de 2026).
- Licencia de Essentia.js: AGPL-3.0 (uso académico libre).
