# La versión conjunta: la app publicada

Esta carpeta es la versión final de P&P, la que está en **https://pyp-ashy.vercel.app**.

Es una **copia** de la versión conjunta que armó Diógenes, que está en `../prototipo_matias/entrega-1/`. Él sigue trabajando en la suya; acá se hicieron los cambios del 17 de noviembre (la lectura con la frase sola, la explicación de los puntos, los enlaces para volver a Historia y Nosotros, y la página Nosotros). Cuando termine, hay que juntar las dos.

Junta el trabajo de los tres:

- **De Matías:** las pantallas de la app, el mapa, el modelo y la medición del audio. Viene de `../prototipo_matias/`.
- **De Diógenes:** la portada con video, las animaciones entre pantallas, las páginas Historia, Cómo lo hicimos y Nosotros, y The Engineer, el asistente de IA. También la investigación de Essentia y ReccoBeats con la que se mide el audio.
- **De Tomás:** prototipos y validación.

**Cómo abrirla en tu computadora:** doble clic en `index.html`. Funciona todo menos la lectura y el asistente con IA, que necesitan el servidor de Vercel; en ese caso la app muestra una lectura fija, el asistente contesta con reglas simples y nada se rompe.

## Las pantallas

| Pantalla | Qué tiene |
|---|---|
| Portada | El nombre sobre un video de fondo, y los accesos a Historia, Cómo lo hicimos y Nosotros |
| Los dos mundos | Qué premia la Academia y qué escucha el público |
| Crear cuenta | Nombre y mail |
| Subir la canción | Arrastrar un archivo o buscar una de las 760 canciones conocidas |
| Resultado | El mapa con 100 canciones reales, los dos puntajes y la lectura, que es una sola frase |
| Qué suma y qué resta | Una columna por rasgo y un recuadro que explica por qué cada uno suma o resta puntos |
| Simular | Se mueve un control y el punto se mueve en el mapa |
| The Engineer | Un asistente de IA para conversar sobre el resultado |
| Historia, Cómo lo hicimos, Nosotros | Las páginas sobre el proyecto. Se entra desde cualquier pantalla con "Sobre P&P" |

## Archivos

Los archivos del modelo, el mapa y la medición son los mismos que los de `../prototipo_matias/`, y están explicados en su `readme.md`. Estos son los propios de esta versión:

| Archivo | Qué es |
|---|---|
| `loco.js` | Las animaciones: pantalla de carga, telón entre pantallas, títulos que suben y letras que se mezclan al pasar el mouse |
| `videos.js`, `videos.css`, `videos/` | Los videos de fondo de la portada |
| `engineer.js` | The Engineer, del lado del navegador: arma lo que se le manda a la IA y contesta con reglas simples si la IA no responde |
| `entrega.js`, `entrega.css` | Lo que une las tres versiones: el diseño de las páginas nuevas y los enlaces para ir y volver |
| `api/lectura.js` | La función del servidor que escribe la lectura. Lee la clave de Groq de una variable de entorno |
| `api/asistente.js` | La función del servidor de The Engineer: las instrucciones de la IA, arriba de todo. Lee la clave de Claude de una variable de entorno |
| `racional.html` y las demás páginas `.html` | Las páginas de documentos. Se generan en `../prototipo_matias/` con `node armar_documentos.js` y se copian acá |

## Lo que falta

**Cargar la clave de Claude en Vercel**, con el nombre `ANTHROPIC_API_KEY`. Hoy está solo la de Groq. Mientras falte, el asistente contesta con reglas simples, sin IA. La clave no se sube al repositorio.

## Cómo se publica

Desde esta carpeta:

```
vercel deploy --prod
```
