# P&P — readme del repositorio

Herramienta web que analiza una canción y la ubica entre dos perfiles de sonido medibles: **el que la Academia del Grammy premia** y **el que el público consume masivamente**.

Devuelve dos puntajes con su margen de error, ubica la canción en un mapa de esos dos ejes rodeada de canciones conocidas, y explica qué la acerca y qué la aleja de cada uno. No predice si una canción va a ganar un premio ni si va a ser un éxito: muestra dónde está parada y qué implica cada camino.

La idea de fondo es que **esos dos mundos casi nunca coinciden**. De las 26.577 canciones que analizamos, solo 1.071 lograron las dos cosas — un 4%.

## Integrantes

- Matías Expósito
- Tomás Kelly — prototipos y validación
- Diógenes Ustariz

Universidad de San Andrés · 2026

## Sitio

**App publicada:**

https://pyp-ashy.vercel.app

Se puede subir un audio propio (mp3 o wav) o buscar una canción conocida por nombre. En el mapa, cualquier punto se puede clickear para escuchar esa canción. Código en [`diseno/prototipos/prototipo_matias/`](diseno/prototipos/prototipo_matias/).

Junto con la app hay tres páginas que la explican, pensadas para alguien que no conoce el proyecto:

| Página | Qué cuenta |
|---|---|
| [Qué hace cada pantalla](https://pyp-ashy.vercel.app/la-pagina) | El recorrido de la app, pantalla por pantalla |
| [Las decisiones de diseño](https://pyp-ashy.vercel.app/decisiones-de-diseno) | Qué le pedimos a la IA y por qué |
| [Cómo impacta la letra](https://pyp-ashy.vercel.app/la-letra) | Qué sabemos de la letra y qué queda para la entrega siguiente |

El prototipo anterior, de Diógenes, sigue en [`diseno/prototipos/prototipo_diogenes/`](diseno/prototipos/prototipo_diogenes/) y publicado en https://pyp-green.vercel.app. La app actual nació de ese código.

**Prototipo baja fidelidad:**

https://claude.ai/artifact/DoFVcgcU83Aha2U5JrXdjv

## Hipótesis

**La original:**

> Existe un tipo de perfil sonoro medible asociado al reconocimiento de la Academia, distinto del perfil asociado al éxito comercial masivo, y la distancia entre ambos se amplió a lo largo de las últimas décadas.

**Lo que dijeron los datos:**

La primera parte se confirma: los dos perfiles existen y son distintos de forma medible. La segunda se confirma a medias, y en una dirección que no esperábamos.

> Los dos mundos **se acercaron en el ánimo de las canciones y se alejaron en su duración.**

Durante cincuenta años los éxitos comerciales fueron más alegres que las premiadas. Esa diferencia se achicó década tras década hasta desaparecer en los 2010, y en los 2020 se dio vuelta. **Lo que se movió fue el público, no la Academia:** el gusto de la Academia se mantuvo casi idéntico, y los hits se volvieron más melancólicos hasta llegar a donde ella ya estaba.

Al mismo tiempo, la diferencia de duración pasó de un segundo en los noventa a **43 segundos** hoy: las premiadas duran casi un minuto más que los hits.

El detalle, con los números por década, está en [`decisiones.md`](decisiones.md) y en [`nuevos_puntos.md`](nuevos_puntos.md).

## Cómo medimos cada eje

### Popularidad

Dos preguntas encadenadas, en vez de un solo número:

1. **¿Entra al Hot 100?** — sí o no
2. **Si entra, ¿hasta dónde llega?** — su mejor puesto, en una escala estirada en la punta

La escala se invierte (el puesto 1 es lo mejor, pero el puntaje tiene que ser alto) y se estira arriba, porque los puestos no cuestan lo mismo: del 11 al 100 hay unas 300 canciones por puesto, y en el top 10 se dispara. **El top 10 se lleva la mitad del puntaje.**

El puesto **no necesita normalizarse por época**: el Hot 100 siempre tuvo exactamente 100 lugares, así que el puesto 20 de 1965 y el de 2025 ya son posiciones relativas a su propia semana.

### Prestigio

Una sola pregunta: **¿está nominada en una categoría general o no?**

| | Canciones |
|---|---|
| Nominadas a Record o Song of the Year, desde 2000 | **213** (212 en el entrenamiento) |
| Hits del Hot 100 nunca nominados | **8.883** (8.870 en el entrenamiento) |

Los dos números entre paréntesis son después de descartar 15 cruces rotos (canciones con volumen menor a −25 dB, pegadas a otra versión). La población es la misma; el modelo entrena con **23.388** de las 23.403 canciones desde 2000.

**Solo esas dos categorías**, porque son las únicas que vota la Academia entera —en las demás cada miembro vota solo en su género— y las únicas que existen desde 1959 sin interrupción.

**Las 807 nominadas solo en categorías de género quedan fuera de este eje.** Las de Best Metal Performance tienen energía 0,94 y acústica 0,002: sumarlas mediría "suena a metal", no prestigio. Pero tampoco van al grupo de abajo, porque 126 de ellas ganaron un Grammy. Se siguen usando para el eje de popularidad.

**Es binario y no una escalera.** Medimos si ganar suena distinto de estar nominada y la diferencia es 0,04 en acústica, y para el lado contrario — menos de la mitad de la brecha que sí importa.

### La letra, pendiente

El análisis mide solo el sonido. La letra influye en los dos ejes y todavía no la incorporamos: queda como línea de trabajo para la entrega siguiente. El detalle, con las fuentes, está en [`la_letra.md`](la_letra.md).

## Fuentes de datos

### 1. Billboard Hot 100

Ranking semanal de las 100 canciones más escuchadas en Estados Unidos, sin interrupción desde agosto de 1958.

| | |
|---|---|
| **Origen** | https://github.com/utdata/rwd-billboard-data |
| **Archivo** | `data-out/hot-100-current.csv` |
| **Descargado** | 18 de agosto de 2026 |
| **Licencia** | MIT License |
| **Atribución** | Christian McDonald · School of Journalism and Media, University of Texas at Austin |
| **Volumen** | 355.001 filas semanales → **32.702 canciones únicas** |

Aporta el **eje de la popularidad**: mejor puesto alcanzado, semanas en el ranking y año de primera aparición.

### 2. Premios Grammy

Nominaciones y ganadoras entre 1959 y 2026, en 14 categorías.

| | |
|---|---|
| **Origen** | Wikipedia, una página por categoría |
| **Método** | Extraído con `codigo/fetch_grammy.js` vía la API pública de Wikipedia |
| **Descargado** | 18 de agosto de 2026 |
| **Licencia** | CC BY-SA 4.0 |
| **Atribución** | Wikipedia — Los colaboradores de Wikipedia |
| **Volumen** | **2.513 nominaciones**, de las cuales 488 ganaron |

Aporta el **eje del prestigio**. Lo armamos nosotros porque ningún dataset público tenía los nominados de las décadas viejas.

### 3. Características del sonido

Valores numéricos que describen cómo suena cada canción.

| | |
|---|---|
| **Origen** | https://huggingface.co/datasets/GildasLeDrogoff/spotify-huge-track-analysis-dataset |
| **Descargado** | 18 de agosto de 2026 |
| **Licencia** | **CC BY-NC 4.0** — atribución, **uso no comercial** |
| **Atribución** | Gildas Le Drogoff · datos originales calculados por Spotify |
| **Volumen** | 56.277.664 canciones · 4,1 GB |

⚠️ **La licencia es no comercial.** Sirve para este trabajo académico, pero si el proyecto se quisiera monetizar habría que reemplazar esta fuente.

**Quién analizó las canciones.** No fuimos nosotros: fue **Spotify**. Su sistema procesó su catálogo y calculó estos valores automáticamente para sus propias recomendaciones; los publicaba por su API hasta que **cerró el acceso en noviembre de 2024**. Alguien los había cosechado antes en este dataset, que es la única vía que queda.

**No está en el repositorio: pesa 4,1 GB.**

## Archivos de datos

El proyecto tiene **dos conjuntos de datos con dos propósitos distintos**, y eso es una decisión, no un descuido:

| Carpeta | Para qué | Qué contiene |
|---|---|---|
| **`datasets/`** | **El análisis** — probar la hipótesis, que es sobre un cambio a lo largo de las décadas | Todo, 1958–2026 |
| **`datasets_procesados/`** | **La herramienta** — ubicar una canción de hoy contra el perfil de hoy | Desde el año 2000 |

**El análisis necesita historia porque mide un cambio; la herramienta necesita el presente porque mide una posición.**

Los cuatro CSV, en `datasets/`:

| Archivo | Filas | Qué es |
|---|---|---|
| `corpus_v2.csv` | 26.577 | **El principal.** Canciones con sus características y sus etiquetas |
| `control_v2.csv` | 27.000 | Canciones comunes: ni premiadas ni exitosas |
| `billboard_canciones.csv` | 32.702 | Billboard procesado, una fila por canción |
| `grammy_nominaciones.csv` | 2.513 | Las nominaciones al Grammy |

Los dos primeros tienen **las mismas 21 columnas en el mismo orden**, así que se apilan: **53.577 canciones**.

El significado de cada columna, con sus rangos medidos y sus límites conocidos, está en [`datasets/diccionario.md`](datasets/diccionario.md).

## Composición

**El corpus completo**, que usa el análisis:

| Grupo | Canciones | Qué son |
|---|---|---|
| `hit` | 24.913 | Entraron al ranking, nunca fueron nominadas |
| `ambas` | 1.071 | **Premio y éxito a la vez** |
| `premiada` | 593 | Nominadas al Grammy, nunca entraron al ranking |
| `control` | 27.000 | Ni una cosa ni la otra |

**La ventana de la herramienta**, desde el año 2000:

| | Canciones |
|---|---|
| Del corpus | 9.903 |
| Del control | 13.500 |
| **Total** | **23.403** |

Y dentro de esas 9.903: **213 premiadas** en las dos categorías generales, 807 nominadas solo por género —que quedan fuera del eje de prestigio— y 8.883 hits nunca nominados.

## Herramientas que usa la app

| | |
|---|---|
| **Essentia.js** | Mide tempo, tonalidad, volumen y bailabilidad del audio que sube el usuario, **en el navegador**: el archivo no sale de su computadora |
| **ReccoBeats** | Mide energía, valencia y acústica |

Esto cumple la promesa de la app: *"tu archivo se analiza y se descarta"*.

**Pendiente de calibración.** El modelo se entrenó con los valores de Spotify, y Essentia mide parecido pero en otra escala. Hay una conversión provisoria, calibrada con 10 canciones. Para la entrega siguiente: calibrar con más canciones.

## Librerías

| Archivo | Qué es |
|---|---|
| `package.json` | La lista de librerías que necesitan los scripts |
| `package-lock.json` | Las versiones exactas, para que a todos les instale igual |

Quien clone el repositorio corre `npm install` y ya puede ejecutar `codigo/armar_control.js` y `codigo/auditar_datasets.js`.

**`codigo/letra.js`** consulta la letra de una canción en la API pública de lyrics.ovh y la **mide**: cantidad de palabras, palabras distintas, repetición de líneas, palabra más repetida, proporción de primera persona. No guarda el texto (la letra tiene derechos de autor); con `--csv` guarda solo los números en `datasets_procesados/letras_metricas.csv`. Es la herramienta para el análisis de la letra que quedó pendiente.

```
node codigo/letra.js "Luis Fonsi" "Despacito"
node codigo/letra.js --lote canciones.csv
```

## Límites declarados

- **Solo mide el sonido.** No la letra, ni el sello, ni la campaña, ni quién es el artista. Un Grammy depende muchísimo de factores que ningún dato acústico captura.
- **Mide el mercado estadounidense.** Billboard y el Grammy son instituciones de Estados Unidos.
- **La forma de medir cambió con los años, en los dos ejes.** Hasta noviembre de 1991 Billboard armaba el ranking con encuestas a disquerías y listas de DJ, auto-reportadas; recién ahí pasó a medición electrónica. Y hasta 2021 los nominados al Grammy en las categorías generales los elegían comités secretos de 15 a 20 miembros anónimos, que se disolvieron en abril de ese año.
- **"Popular" no significa lo mismo en 1965 que hoy.** Antes medía intención de compra: alguien iba a un local y pagaba por un disco. Hoy mide volumen de atención, y una reproducción se cuenta a los 30 segundos. La herramienta usa solo música desde el año 2000 justamente por esto.
- **Para Song of the Year medimos una aproximación.** Ese premio se da a los compositores por una obra que debe contener melodía y letra; nosotros medimos el sonido de la grabación resultante. Para Record of the Year, en cambio, la medición es directa: ese premio sí juzga la grabación.
- **La muestra de premiadas es chica:** 213 canciones. Por eso el margen de error del prestigio es más ancho que el de la popularidad, y la app lo muestra.
- **El algoritmo de Spotify es una caja negra.** Nunca publicaron cómo calculan estos valores, así que no se pueden reproducir desde cero.
- **En el grupo de control, el año 1970 hay que leerlo como "1970 o antes".** El dump de Spotify trae el año de la reedición, no el de la grabación original, así que 2.058 de las 4.500 canciones de esa década quedaron amontonadas en 1970 y varias son más viejas. Las otras cinco décadas no tienen este problema.

## El modelo de la app

El análisis histórico usa las seis décadas; **la app se entrena solo con las 23.388 canciones del 2000 en adelante**. El análisis necesita historia porque mide un cambio; la herramienta necesita el presente porque mide una posición.

| Eje | Qué compara | Modelo |
|---|---|---|
| **Prestigio** | 212 nominadas a Record o Song of the Year contra 8.870 hits del Hot 100 nunca nominados | Regresión logística |
| **Popularidad** | Dos preguntas encadenadas. 1: ¿entra al Hot 100? (hits contra las que nunca entraron). 2: si entra, ¿hasta dónde llega? (su mejor puesto en una escala estirada: #1 = 100, #10 = 50, #100 = 0, aprendida solo entre los hits). Puntaje = probabilidad de entrar × hasta dónde llega | Logística × lineal |

Los puntajes que muestra la app son el percentil de la canción dentro de las 23.388, con un margen de error de 20 remuestreos. Se regeneran con `python diseno/prototipos/prototipo_matias/generar_modelo.py`.

**Por qué la popularidad son dos cuentas y no una (03/11/2026).** Hasta ese día era una sola regresión lineal sobre el puntaje de chart, con 0 para las canciones que no entraron. Como de las 23.388 la mayoría son ceros, la recta se gastaba casi entera en distinguir "entró / no entró" y aplastaba las diferencias entre hits: Despacito daba 42 de popularidad y Shape Of You 44. Con las dos preguntas separadas dan 62 y 82, y mejora todo lo que se mide (separa hits del resto: 0,752 → 0,762; acierta el puesto entre los hits: 0,066 → 0,121). Lo que no arregla son las filas con datos rotos: Havana figura con instrumentalidad 0,92 y −12 dB (una versión instrumental mal cruzada), así que sigue dando 6. Eso es limpieza de datos, pendiente.

**Análisis del audio subido**, en el navegador:

| Rasgos | Herramienta | Cómo |
|---|---|---|
| Energía, valencia, acústica, bailabilidad, habla, volumen, instrumentalidad | [ReccoBeats](https://reccobeats.com) (API gratuita) | El tema se corta en tramos de 30 s (MP3 estéreo), se promedian y se calibran contra Spotify |
| Tempo y modo | [Essentia.js](https://mtg.github.io/essentia.js/) | En el navegador, sin servidor |
| Duración | El navegador | — |

## Cambios del 20 al 27 de octubre de 2026

- **Análisis de audio con ReccoBeats.** Antes, valencia, habla e instrumentalidad quedaban fijas en el promedio del corpus, y energía y acústica eran estimaciones. Ahora se miden en la escala de Spotify, la misma con la que se entrenó el modelo.
- **Calibración contra Spotify** con 10 canciones del corpus (64 tramos): correlación entre 0,89 y 0,97 en energía, valencia, acústica, bailabilidad y habla. Un solo tramo es una lotería (la valencia de una misma canción va de 0,17 a 0,43 según el tramo), por eso se promedian todos.
- **El tempo de ReccoBeats no se usa** (correlación −0,36): lo mide Essentia, que acertó 8 de 10.
- **ReccoBeats solo acepta MP3 estéreo**: rechaza WAV y MP3 mono (error 4002), aunque su documentación diga lo contrario. La app arma el MP3 en el navegador con lamejs.
- **Modelo reentrenado** con las decisiones del grupo: desde 2000, prestigio = Record y Song of the Year, popularidad = puntaje de chart.
- **Prestigio contra hits, no contra el grupo de control.** Contra canciones que nunca entraron a ningún ranking, el modelo aprendía "suena a disco profesional" en vez de "suena a Grammy". Por eso la cifra de comparación pasó de 22.383 a **8.870**: los promedios de la Entrega (acústica 0,28 contra 0,19, energía 0,60 contra 0,67, duración 3:57 contra 3:36) ya salían de comparar contra los hits.
- **El volumen ya no suma prestigio.** Con todas las épocas mezcladas, "Treat Me" de Chlöe recibía +28 puntos de prestigio solo por estar masterizada fuerte: medía "canción reciente", no "Grammy". Con el recorte da +1.
- **Limpieza:** se descartan 15 hits con volumen menor a −25 dB, cruces rotos con otra versión (por ejemplo, el disco de Bad Bunny de 2025).
- **App publicada en Vercel.**

## Estructura del repositorio

```
prestigio_popularidad/
├── readme.md               # Este archivo
├── decisiones.md           # Registro fechado de lo que probamos, descartamos y por qué
├── nuevos_puntos.md        # Cómo definimos el eje de popularidad, con las mediciones
├── la_letra.md             # Qué sabemos del impacto de la letra, y qué falta medir
├── .gitignore
├── package.json            # Librerías que necesitan los scripts (npm install)
├── datasets/               # Los CSV del análisis (todo 1958–2026) + diccionario.md
├── datasets_procesados/    # Los datos de la app (desde el año 2000)
├── diseno/
│   ├── referencias/        # Imágenes de referencia
│   └── prototipos/         # Una carpeta por versión o por integrante
│       ├── prototipo_v1/
│       ├── prototipo_diogenes/
│       ├── prototipo_matias/
│       └── prototipo_tomas/
├── prompts/                # Prompts usados con el LLM, versionados
├── codigo/                 # Scripts de descarga, cruce y auditoría
├── normalizacion/          # Normalización por época de las características
├── versiones/              # Versiones anteriores de los datasets y del modelo
├── entregas/
│   ├── entrega_1/          # Capturas + link al sitio en ese momento
│   └── entrega_2/
└── app/                    # Solo los archivos del sitio (lo que se publica)
```
