# P&P — Cómo seguimos

Estado al 16 de noviembre de 2026 · Matías

> Este documento reemplaza la versión del 11/11, que quedó vieja. Esa versión está en el historial de git.

## Dónde estamos

**La entrega 4 es el martes 17 de noviembre.** Presentación oral de 10 minutos, con la app funcionando en vivo.

La consigna pide cinco cosas:

1. **La app funcionando** → ✅ publicada en https://pyp-ashy.vercel.app.
2. **Una IA en tiempo real** → ✅ funcionando desde el 15/11. Escribe la lectura del resultado.
3. **La página de racional** → 🟡 completa, salvo un recuadro: falta lo que diga un productor.
4. **La pirueta** → ⏸ en pausa. Los datos están preparados; no está armada.
5. **La demo en vivo** → ⬜ falta el guion y el ensayo.

## Lo que ya está hecho

### La app

Siete pantallas:

1. **Portada**: 240 canciones reales giran como una galaxia. Con el sonido activado suena una melodía lenta.
2. **Los dos mundos**: qué premia la Academia y qué escucha el público (3%: 609 canciones de 23.279 lograron las dos cosas).
3. **Crear cuenta**: nombre y mail.
4. **Subir la canción**: dos columnas que entran en una pantalla. Se sube un archivo o se busca una de las 760 canciones conocidas.
5. **Resultado**: el mapa con 100 canciones reales, los dos puntajes con una frase que dice qué significan, y la lectura escrita por la IA.
6. **Qué suma y qué resta**: una columna por rasgo del sonido, y el conflicto.
7. **Simular**: se mueve un control y el punto se mueve en el mapa, con los puntajes recalculados.

Los colores quieren decir lo mismo en todas las pantallas: **azul es prestigio, ámbar es popularidad**.

### El modelo

- **Prestigio**: compara con las 202 nominadas a Record o Song of the Year desde 2000, contra 8.788 hits nunca nominados.
- **Popularidad**: dos preguntas encadenadas, "¿entra al Hot 100?" y "¿hasta dónde llega?".
- Entrena con **23.279 canciones** del 2000 en adelante, después de las limpiezas del 15 y el 16/11.

### La IA que explica el resultado

Un modelo de lenguaje (GPT-OSS 120B, servido por Groq) toma los números de la canción, sin el título ni el artista, y los pone en palabras: dos párrafos, 70 palabras como máximo. Tiene prohibido predecir, opinar de la letra o del artista, e inventar datos. Las instrucciones están en `prompts/lectura_ia.md`.

La clave de Groq está cargada en Vercel. No está en el repositorio.

### El racional

Completo en `racional.md` y publicado en https://pyp-ashy.vercel.app/racional. Nueve secciones: problema, hipótesis, datos, modelo, lo que no medimos (letra, redes y YouTube, con el peso de cada una), usuario, diseño, recorte y uso de la IA.

### Los datos

Limpiados el 15 y el 16/11: se sacaron 124 canciones (15 con volumen imposible, 36 cantadas que figuraban como instrumentales, 25 con el dato de otra versión, 19 repetidas y 29 con la misma grabación cargada dos veces). El criterio es usar la versión original de cada canción. Revisados el 16/11: los archivos de `datasets_procesados/` son exactamente los de `datasets/` filtrados desde el año 2000.

## Lo que falta

### 1. Hablar con un productor

**Quién:** los tres.

Lo pidió la devolución de la entrega 3. Lo ideal: mostrarle la app, que suba una canción suya, y anotar qué entiende, qué no y qué le serviría. Va en el recuadro "Pendiente" de la sección 1 del racional.

### 2. Guion y ensayo de la demo

**Quién:** los tres.

Diez minutos. Hay que decidir quién dice qué y tener un plan B si falla internet (capturas o un video corto).

**Canciones para la demo.** El 16/11 medimos tres canciones que no están en la base, con los 30 segundos de vista previa:

| Canción | Prestigio | Popularidad | Zona |
|---|---|---|---|
| Seminare — Serú Girán | 79 | 17 | Prestigio sin público |
| Goteo — Duki | 12 | 67 | Hit puro |
| Crimen — Gustavo Cerati | 59 | 54 | Las dos cosas |

Son los valores con la calibración nueva del 16/11. Crimen quedó cerca del medio: es la más arriesgada. Con el archivo completo el número puede moverse, y con el audio de un video de YouTube se mueve mucho (Goteo dio 10 y 32). Hay que probar antes de la demo el archivo exacto que se va a usar, dos veces, y usar ese mismo.

### 3. Decidir qué se hace con el error de medición

**Quién:** decide el equipo.

El 16/11 probamos el modelo y encontramos que calcula bien con los datos de la base, pero un archivo subido se mide con menos precisión. Ya se hizo una mejora: se recalibró la medición con 31 canciones y la diferencia bajó de 12,7 a 8,0 puntos en popularidad y de 8,9 a 6,5 en prestigio (sección 4.2 del racional). Queda por decidir:

- Mostrar un margen de error más ancho cuando la canción se subió como archivo.
- Permitir medir la vista previa de 30 segundos desde el buscador, sin archivo. Da siempre el mismo resultado.
- Contarlo en la demo como un límite medido.

### 4. Definir la pirueta

**Quién:** decide el equipo.

El viaje en el tiempo: cómo habría leído la canción la Academia y el ranking de cada época desde 2000. Los cinco modelos por período están entrenados. Si no hay tiempo, es lo primero que se corta.

### 5. Diseño: lo que queda por decidir

- Una frase más clara para cada puntaje.
- Menos texto en la pantalla del resultado.
- Una lectura más corta.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| La app | https://pyp-ashy.vercel.app |
| El racional | https://pyp-ashy.vercel.app/racional |
| Qué hace cada pantalla | https://pyp-ashy.vercel.app/la_pagina |
| Las decisiones de diseño | https://pyp-ashy.vercel.app/decisiones_de_diseno |
| Cómo impacta la letra | https://pyp-ashy.vercel.app/la_letra |
| El repositorio | https://github.com/matiasexposito/prestigio_popularidad |

| Carpeta o archivo | Qué tiene |
|---|---|
| `readme.md` | Qué es el proyecto, las fuentes y cómo se mide cada eje |
| `racional.md` | El racional |
| `decisiones.md` | Todo lo que probamos, descartamos y por qué, con fecha |
| `analisis/` | Cómo medimos la popularidad, la letra, las redes y la propuesta de pesos |
| `datasets/` y `datasets_procesados/` | Los datos: todo desde 1958, y el recorte desde 2000 que usa la app |
| `diseno/borrador/` | Las pantallas que diseñamos el 9 y el 13 de septiembre |
| `diseno/prototipos/prototipo_matias/` | La app publicada |
| `prompts/lectura_ia.md` | Las instrucciones que recibe la IA |
| `codigo/` | Los scripts que arman los datos, y el que mide la letra |

**Una regla para no pisarnos:** antes de cada subida, revisar si hay algo nuevo en GitHub (`git pull`) e integrarlo primero.
