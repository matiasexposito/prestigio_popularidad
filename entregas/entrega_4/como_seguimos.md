# P&P — Cómo seguimos

11 de noviembre de 2026 · Matías

> Copia del documento de Claude "P&P — Cómo seguimos" tal como estaba el 11/11. La versión viva, donde se van tildando las tareas, es un documento de Claude: pídanle el link a Matías.

## Dónde estamos

**La entrega 4 es el martes 17 de noviembre.** Presentación oral de 10 minutos, con la app funcionando en vivo. El 11/11 quedaban **cinco días de trabajo** (miércoles a lunes).

La consigna pide cinco cosas:

1. **La app funcionando** → ✅ lista y publicada.
2. **Una IA en tiempo real** → 🟡 armada y publicada, **falta cargar la clave de Groq** para que empiece a escribir.
3. **La página de racional** → 🟡 **la mitad escrita**: datos, modelo, instituciones, redes y letra están; faltan usuario, diseño y proceso con la IA.
4. **La pirueta** → ⏸ **en pausa** hasta definir todo lo demás. Los datos ya están preparados.
5. **La demo en vivo** → ⬜ sin empezar: falta el guion y el ensayo.

**En una frase:** lo técnico está casi todo; lo que falta es escribir (racional), conseguir evidencia real (el productor) y ensayar.

## Lo que hay que cerrar, en este orden

La lista de Matías del 11/11. Cada punto se cierra antes de pasar al siguiente, porque los de abajo dependen de los de arriba.

1. **Definir la letra, las redes sociales y YouTube.** Qué entra, qué no, y cómo se explica. *Hoy:* el análisis está hecho (`analisis/redes_y_letra.md`) y la propuesta con los porcentajes está en `analisis/decision_letra_redes.md`. Falta que el equipo lo dé por cerrado.
2. **Definir la pirueta.** Si va el viaje en el tiempo o no. *Hoy:* en pausa, los datos están listos.
3. **Los datos que fallan.** Las canciones con números mal (por ejemplo Havana, que figura como instrumental). Encontrarlas todas, decidir qué se hace con cada tipo de error, y volver a entrenar si cambia algo.
4. **Que los datos estén bien.** Después de arreglarlos, verificar que todos los números de la app, el readme, el diccionario y el racional coincidan.
5. **Que el repositorio esté bien y ordenado.** Ya se ordenó el 10/11; se revisa de nuevo al final para que refleje todo lo de arriba.
6. **Un buen diseño para la página, en base a lo que dijeron los profesores.** UX sacó 5/10: *"la UI tiene estilo IA"*, *"no se ven decisiones concretas de un grupo de tres diseñadores"*, *"aclarar los colores"*, *"repensar la pantalla de carga"*. Las dos últimas ya están; las dos primeras son las grandes.

## Lo que ya está hecho

### La app

Publicada en **https://pyp-ashy.vercel.app**. Siete pantallas, armadas desde nuestro borrador:

1. **Portada** con los destellos azul y ámbar.
2. **Los dos mundos**: qué premia la Academia y qué escucha el público, con cifras desde el año 2000 (3%: 627 canciones de 23.388 lograron las dos cosas).
3. **Crear cuenta**: nombre y mail.
4. **Subir la canción**: el archivo en el centro (corrección que pidieron los docentes), o buscar una de las 785 conocidas.
5. **Resultado**: el mapa con título y explicación, la leyenda de colores, los dos puntajes con su margen, y un "¿Cómo se calcula?" que se despliega debajo de cada número.
6. **Qué suma y qué resta**: las columnas verticales tipo consola, y el conflicto.
7. **Simular**: movés un control y el punto se mueve en el mapa con los puntajes recalculados de verdad.

Y dos cosas que no se ven en una pantalla sola:

- **Click en cualquier punto del mapa** para escuchar 30 segundos de esa canción (lo trajo Diógenes).
- **El chatbot ya no está.** No era una IA, era una lista de preguntas previstas.

### El modelo

- **Prestigio**: compara con las 212 nominadas a Record o Song of the Year desde 2000, contra 8.870 hits nunca nominados.
- **Popularidad**: dos preguntas encadenadas, "¿entra al Hot 100?" y "¿hasta dónde llega?". Se corrigió el 3/11: antes Despacito daba 42 de popularidad, ahora 62.
- Entrena con **23.388 canciones** del 2000 en adelante.

### La IA que explica tu resultado

En la pantalla de resultado, un modelo de lenguaje (Llama, servido por Groq) toma los números de tu canción —sin el título ni el artista— y los pone en palabras. Tiene prohibido predecir, opinar de la letra o del artista, e inventar datos. El texto de instrucciones está en `prompts/lectura_ia.md`.

**Estado:** todo armado y publicado. Sin la clave, la app muestra la lectura fija del modelo y no se rompe.

### El racional (mitad)

En `racional.md`:

- Hipótesis, con lo que asumimos y lo que no podemos afirmar.
- Las fuentes en una tabla (origen, quién la hace, licencia, límites).
- **El embudo de datos**: de 56 millones de filas de Spotify a las 23.388 que entrena la herramienta, paso por paso.
- Las 10 variables explicadas una por una.
- Cómo se arma cada puntaje, las cuatro zonas y los colores.
- **Cómo se arma el Hot 100 y quién vota el Grammy.**
- **El peso de cada factor en la popularidad** (lo que pidieron los profesores): sonido ~25% medido, difusión ~40%, letra ~10%, contexto ~25%.
- Qué no medimos (letra, redes, YouTube) y por qué.

### El análisis de redes y letra

Un documento aparte, con pruebas hechas sobre nuestras canciones: la letra se consigue (120 de 120) pero casi no separa premiadas de hits; Wikipedia muestra que la atención se relaciona con el puesto (0,30), pero es circular. Está en `analisis/redes_y_letra.md`.

### El repositorio

Ordenado el 10/11: racional en la raíz, análisis en su carpeta, el borrador de diseño con fecha (9 y 13 de septiembre), los scripts de datos completos, y `datasets_procesados/` corregido (antes tenía los archivos enteros; ahora solo desde 2000).

## Decisiones ya tomadas

Las que no hay que volver a discutir. Entre paréntesis, cuándo y con quién.

| Tema | Qué se decidió |
|---|---|
| **La herramienta mide el sonido** | Solo las 10 características de cómo suena. No la letra, ni el artista, ni el sello. Y nunca predice: dice cuánto te parecés a cada perfil (desde el principio) |
| **Ventana desde el año 2000** | La herramienta entrena solo con música desde 2000; el análisis histórico usa las seis décadas (2/11) |
| **El chatbot se saca** | O es una IA de verdad que sabe de música, o no va. No va (2/11) |
| **IA en tiempo real** | Una IA que pone en palabras los números de tu canción, con Groq (10/11) |
| **La pirueta** | El viaje en el tiempo: tu canción en el mapa de cada época desde 2000. **En pausa** hasta definir el resto (10/11) |
| **La letra** | **Pendiente.** No entra en esta entrega; se explica cómo influye y por qué no está. La herramienta para medirla ya está en el repo (10/11, con los profesores) |
| **Redes sociales** | Solo importan **desde 2000**. No entran a la herramienta (no hay datos abiertos, son circulares, un demo no tiene redes). Sí entran al racional con un **peso aproximado en una tabla** (10/11, con los profesores) |
| **Clusters de la letra** | Se descarta la idea de que la letra impacte solo en la clusterización (10/11) |
| **Las cuatro zonas del mapa** | Son cuadrantes cortados en 50, no clusters calculados, y se dice así |
| **Bocetos** | No hay bocetos previos a la IA. El primer diseño se hizo en Figma conversando con Claude; el proceso humano se cuenta con lo que decidimos después (10/11) |
| **Explicar el gráfico** | El mapa tiene título, explicación, leyenda, y cada número tiene su "¿Cómo se calcula?" (10/11, con los profesores) |
| **El repositorio** | Racional en la raíz, análisis en `analisis/`, borrador en `diseno/borrador/`, scripts de datos en `codigo/` (10/11) |

## Lo que falta, tarea por tarea

Ordenadas por importancia. Las primeras son las que más pesan en la nota (el racional y la comunicación sacaron 7 y 5 en la entrega 3).

### 1. Terminar el racional: usuario, diseño y proceso con la IA

**Quién:** Claude escribe, Matías corrige con su voz.

Faltan tres secciones y una que está a medio hacer:

- **Problema y contexto (sección 1).** A quién le sirve P&P, en qué momento y qué decide. Hace falta **evidencia real**: cómo deciden hoy los productores y los sellos. Ya hay material: los sellos usan tableros de datos (Chartmetric, Luminate) para decidir a quién firmar, pero nadie mira el *sonido* contra los dos mundos. Le falta la voz de un productor real (tarea 3).
- **Usuario y recorrido (sección 7).** Quién es, qué quiere y qué hace en cada pantalla. Por qué la cuenta va antes de subir, por qué se puede buscar una canción conocida en vez de subir.
- **Decisiones de diseño (sección 8).** Qué es lo más importante de cada pantalla y cómo lo jerarquizamos. El color, la tipografía y la grilla: qué elegimos y por qué. Ya existe la versión corta, en plural y simple; hay que pasarla al racional y sumar pantalla por pantalla.
- **Proceso y uso de la IA (sección 9).** Lo que más pide la consigna para probar autoría: **qué le pedimos a la IA, qué aceptamos, qué corregimos y qué rechazamos.** Con ejemplos concretos: rechazamos que restyleara la app de Diógenes y pedimos rehacerla desde nuestro borrador; sacamos el chatbot; pedimos los controles en vertical; corregimos el eje de popularidad cuando Despacito daba raro. Y qué modelos usamos y cómo manejamos el texto de instrucciones de la IA.

### 2. Cargar la clave de Groq

**Quién:** Matías. Son cinco minutos.

Sin esto, la IA en tiempo real no funciona en la demo. Vercel → proyecto `pyp` → Settings → Environment Variables → nombre `GROQ_API_KEY`, valor la clave, los tres entornos marcados → Save.

### 3. Hablar con un productor

**Quién:** los tres.

La devolución de la entrega 3 lo pidió explícito: *"investiguen al menos un caso real de productores musicales"*. Lo ideal: mostrarle la app, que suba una canción suya, y anotar qué entiende, qué no, qué le serviría y qué le parece inútil.

### 4. Definir y armar la pirueta

**Quién:** decide el equipo; Claude la arma.

Está en pausa. La idea es el viaje en el tiempo: un deslizador con cinco períodos (2000–04 … 2020–26) que muestra cómo habría leído tu canción la Academia y el chart de cada época. Los cinco modelos ya están entrenados y medidos. Armarla lleva un día. Si se atrasa algo, es lo primero que se corta.

### 5. Guion y ensayo de la demo

**Quién:** los tres. Claude prepara el guion.

Diez minutos. Hay que decidir quién dice qué, qué canción usamos en vivo (una que sepamos que funciona y da un resultado interesante: Uptown Funk o Despacito), y un **plan B si falla internet** (capturas o un video corto de la app funcionando).

### 6. Detalles pendientes

- **Las canciones con datos raros** (figuran como instrumentales cuando no lo son, como Havana). Decidir si se filtran o se dejan como límite conocido.
- **Revisar el racional entero** antes del lunes.
- **Pasar el racional final al repositorio** cuando se dé por cerrado.

## Calendario hasta el martes 17

Una cosa grande por día, para que cada una se termine.

| Día | Qué se hace | Quién |
|---|---|---|
| **Miércoles 11** | Racional: proceso y uso de la IA (sección 9) y decisiones de diseño (sección 8). Cargar la clave de Groq. Coordinar la charla con el productor | Claude escribe · Matías la clave · los tres el productor |
| **Jueves 12** | Racional: problema y contexto (sección 1) y usuario y recorrido (sección 7). Probar la IA con la clave cargada | Claude escribe, Matías corrige |
| **Viernes 13** | Decidir la pirueta. Si va, se arma. Si no, se dedica el día a pulir la app y el racional | El equipo decide, Claude arma |
| **Sábado 14 – Domingo 15** | **Charla con el productor** y sumar lo que diga al racional. Revisar el racional entero | Los tres la charla · Claude la suma |
| **Lunes 16** | **Ensayo.** Guion de 10 minutos, quién dice qué, demo con una canción probada, plan B sin internet. Racional final al repositorio | Los tres + Claude |
| **Martes 17** | Entrega | — |

**Si algo se atrasa**, el orden de lo que se corta primero es: la pirueta, después los detalles pendientes. El racional y el ensayo no se cortan: son lo que más pesa.

## Lo que depende del equipo

- [ ] **Cargar la clave de Groq en Vercel.** Sin ella no hay IA en la demo.
- [ ] **Conseguir un productor** con quien hablar el fin de semana.
- [ ] **El link del Figma** donde armamos el primer diseño con Claude, para ponerlo con fecha en el racional.
- [ ] **Leer el racional** a medida que se completa y corregirlo, sobre todo hipótesis, letra y redes, y proceso con la IA.
- [ ] **Los demás puntos de la charla con los profesores**, si quedaron más.

### Lo que hay que decidir todavía

- [ ] **¿Va la pirueta?** A más tardar el viernes 13. Si va, el viaje en el tiempo con el deslizador de cinco períodos.
- [ ] **¿Qué hacemos con las canciones con datos raros?** Filtrarlas (cambia un poco los números y hay que volver a entrenar) o dejarlas y declararlas como límite en el racional (ya está escrito así).
- [ ] **¿Quién presenta qué** en los 10 minutos.
- [ ] **¿Qué canción usamos en vivo?** Una conocida para la búsqueda (Uptown Funk da 83 y 97, cae en "las dos cosas") y un demo propio si alguno tiene, para mostrar que funciona con algo que no existe en ningún lado.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| La app | https://pyp-ashy.vercel.app |
| Qué hace cada pantalla | https://pyp-ashy.vercel.app/la-pagina |
| Las decisiones de diseño | https://pyp-ashy.vercel.app/decisiones-de-diseno |
| Cómo impacta la letra | https://pyp-ashy.vercel.app/la-letra |
| El repositorio | https://github.com/matiasexposito/prestigio_popularidad |

| Carpeta o archivo | Qué tiene |
|---|---|
| `racional.md` | El racional |
| `decisiones.md` | Todo lo que probamos, descartamos y por qué, con fecha |
| `analisis/` | Cómo medimos la popularidad, la letra, el análisis de redes y letra, y la propuesta de pesos |
| `datasets/` y `datasets_procesados/` | Los datos: todo desde 1958, y el recorte desde 2000 que usa la app |
| `diseno/borrador/` | Las pantallas que diseñamos el 9 y el 13 de septiembre |
| `diseno/prototipos/prototipo_matias/` | La app publicada |
| `prompts/lectura_ia.md` | Las instrucciones que recibe la IA que explica el resultado |
| `codigo/` | Los scripts que arman los datos, y el que mide la letra |

**Una regla para no pisarnos:** antes de cada subida, revisar si hay algo nuevo en GitHub (`git pull`) e integrarlo primero.
