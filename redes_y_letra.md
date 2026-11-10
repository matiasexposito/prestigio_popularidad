# Redes sociales y letra: ¿las incluimos en P&P?

10 de noviembre de 2026

Este documento responde dos preguntas que nos hicieron los docentes:

1. **Las redes sociales** (YouTube, TikTok, Instagram, Spotify): ¿las incluimos en el análisis de la popularidad desde el año 2000? ¿Por qué sí o por qué no?
2. **La letra**: si tuviéramos la letra de las canciones, ¿qué cambiaría?

Está escrito para alguien que no conoce el proyecto. Todo lo que dice "medimos" lo medimos nosotros sobre nuestros datos; lo que viene de afuera tiene su fuente al final.

---

## Antes de empezar: hay dos maneras de "incluir" algo

Esta distinción ordena todo el documento, así que conviene tenerla clara desde el principio.

**Incluirlo en la herramienta.** La persona sube su canción y la app la evalúa. Para que algo entre acá, la app tiene que poder **medirlo en esa canción**, en ese momento.

**Incluirlo en el análisis.** Es lo que escribimos en el racional para explicar cómo funciona la popularidad: cuánto pesa el sonido, cuánto las redes, cuánto la letra. Acá alcanza con **saber algo sobre el factor**, aunque no lo midamos canción por canción.

Un factor puede no servir para la herramienta y sí servir para el análisis. Es exactamente lo que pasa con las redes.

---

# Parte 1. Las redes sociales

## La pregunta, en concreto

¿Qué parte del éxito de una canción desde el año 2000 se explica por lo que pasó con ella en YouTube, TikTok, Instagram o las playlists de Spotify? ¿Y lo podemos medir con datos?

## Qué sabemos de cómo influyen

Que influyen está fuera de discusión. Tres cifras publicadas:

- **TikTok.** En 2021, más de **175 canciones** que fueron tendencia en TikTok entraron al Hot 100, el doble que en 2020 (informe de fin de año de MRC Data, hoy Luminate, con Billboard). En 2024, el **84%** de las canciones que entraron al ranking global de Billboard ya habían tenido un pico en TikTok antes de entrar (TikTok con Luminate, febrero de 2025). Ojo con esta segunda cifra: los datos de actividad en TikTok los aportó TikTok mismo.
- **Playlists.** Entrar a *Today's Top Hits*, la playlist más grande de Spotify, le suma a una canción cerca de **20 millones** de reproducciones (Aguiar y Waldfogel, National Bureau of Economic Research, 2018).
- **El ranking mismo.** El Hot 100 cuenta el streaming desde **2007** y las vistas de YouTube desde **2013**. Billboard dice que hoy el streaming es el componente que más pesa.

Y una medida propia, indirecta: entrenamos nuestro modelo con las canciones de cada período por separado y medimos cuánto de "entrar al chart" explica el sonido. Bajó de **0,31 en 2005–2009** a **0,22 en 2020–2026**. Cuando el sonido explica menos, algo más explica más, y el período en que más baja coincide con TikTok.

## Qué datos existen, uno por uno

| Fuente | Qué da | Desde cuándo | Cómo se accede | ¿Nos sirve? |
|---|---|---|---|---|
| **YouTube** (API oficial) | Las vistas totales de un video **hoy** | El video existe desde que se subió | Gratis con clave. Límite: 10.000 "unidades" por día, y cada búsqueda cuesta 100. O sea, **unas 99 canciones por día** | **A medias.** Para las 9.497 canciones que entraron al chart desde 2000 harían falta unos 96 días. Y da las vistas de hoy, no las que tenía cuando la canción estaba en el chart: una canción de 2009 tuvo 17 años para juntar vistas y una de 2025, uno |
| **Spotify** (API oficial) | El índice de popularidad de cada canción | — | **Ya no está disponible** para proyectos como el nuestro: Spotify lo sacó en febrero–marzo de 2026, igual que había cerrado las características del sonido en noviembre de 2024. Solo lo siguen viendo las empresas con acuerdo especial | **No** |
| **TikTok** (API de investigación) | Datos públicos de videos y cuentas | TikTok existe desde 2016 | Solo para investigadores de universidades **de Estados Unidos y Europa**, con aprobación de TikTok. **La Universidad de San Andrés no califica.** Además, no está claro que incluya cuántas veces se usó cada canción | **No** |
| **Instagram** | — | — | No publica datos de uso de música | **No** |
| **Wikipedia** (visitas por artículo) | Cuántas personas visitaron por día el artículo de una canción | Julio de **2015** | Gratis, abierta, sin clave | **Como aproximación.** No es una red social: mide atención en general. Ver la prueba más abajo |
| **Chartmetric, Luminate, Soundcharts** | Historial de TikTok, YouTube, playlists, por canción | Según la plataforma, desde 2015–2017 | **Pagas**, por suscripción. Son las que usan los sellos | **Técnicamente sí**, para los años recientes. Fuera de nuestro alcance por costo |

**Resumen de la tabla:** no existe ninguna fuente **abierta, gratuita y que cubra 2000–2026** con lo que pasó con cada canción en redes. Las que sirven son pagas o cubren solo los últimos años.

## Nuestra prueba con Wikipedia

Wikipedia es el único dato abierto, gratis y con historia diaria que se parece a "cuánta atención recibió una canción". Lo probamos con una muestra al azar de **60 canciones que entraron al Hot 100 desde 2016** (las visitas por artículo existen desde mediados de 2015).

**Resultado:**

- **45 de las 60** tienen un artículo propio en Wikipedia en inglés. Las que no tienen suelen ser temas de un disco que entraron al chart una sola semana, que en los 2020 son muchos.
- Las visitas que tuvo cada artículo en el año de la canción y el siguiente **se relacionan con el mejor puesto** que alcanzó: correlación de **0,30** (0 = ninguna relación, 1 = perfecta). Las del top 10 tuvieron una mediana de unas 237.000 visitas; las del puesto 11 al 100, unas 124.000. Ojo: en la muestra solo hay 5 canciones del top 10, así que esa comparación es apenas indicativa.

**Qué nos dice esto.** La atención se relaciona con cuán alto llega una canción **bastante más que el sonido**: el sonido explica apenas un 3% del puesto, y la atención en Wikipedia ya muestra una relación clara con una muestra chica. Es lo que esperábamos: el puesto depende mucho de lo que pasa *alrededor* de la canción.

**Pero mirá el problema que aparece enseguida.** ¿La canción llegó alto porque la gente la buscó, o la gente la buscó porque llegó alto? Las dos cosas pasan a la vez y no se pueden separar con estos datos. Ese es el primer problema de fondo, y explica por qué no usamos esto como variable.

## Los tres problemas de fondo, aunque consiguiéramos los datos

Supongamos que mañana alguien nos regala todos los datos de redes de 2000 a 2026. Igual quedan tres problemas, y son los que deciden.

### 1. Es circular: las redes no explican la popularidad, **son** popularidad

Las vistas de YouTube, las reproducciones de Spotify y las tendencias de TikTok no son una causa de que una canción sea popular: son **otra forma de medir que es popular**. Y además, el Hot 100 ya las cuenta adentro: desde 2007 suma streaming y desde 2013 suma YouTube.

Si metiéramos "vistas en YouTube" para predecir "entró al Hot 100", el modelo aprendería algo como *"las canciones que mucha gente escucha son las que mucha gente escucha"*. Daría números altísimos y no explicaría nada. Es como querer predecir la altura de una persona usando el talle de pantalón: acierta, pero no te dice por qué alguien es alto.

### 2. El usuario no los tiene

La herramienta está pensada para quien está terminando una canción, y muchas veces es un **demo sin publicar**. Esa canción tiene **cero** vistas, cero reproducciones y cero videos en TikTok. No hay nada que medir. Cualquier dato de redes que pidiéramos sería un cero o un número inventado por el usuario.

Esto vale para la herramienta. Para el análisis no es un problema, pero sí lo es el siguiente.

### 3. No existían igual en todo el período

Nuestra ventana es 2000–2026. YouTube existe desde 2005, Spotify desde 2008, TikTok desde 2016. Si usáramos esos datos, las canciones de 2000 a 2005 tendrían cero en todo, no porque no fueran virales sino porque no había dónde. El modelo aprendería *"tener redes = canción reciente"*, el mismo error que ya cometimos una vez con el volumen y que nos obligó a cortar en 2000.

## Qué hacemos, entonces

**En la herramienta: las redes no entran.** Por los tres motivos de arriba. La pantalla de bienvenida ya lo dice: *"No medimos la letra, ni el sello, ni quién sos. Solo cómo suena."*

**En el análisis: las redes sí entran, como peso estimado y con evidencia.** En el racional (sección "El peso de cada factor"):

- Les asignamos un peso aproximado de **~40% para entrar al chart** y **~50% para llegar alto**, dentro de lo que llamamos *difusión* (redes, playlists, radio, YouTube).
- Ese número **no es una medición nuestra**: es una estimación razonada a partir de las cifras publicadas de arriba, y así lo decimos.
- Lo que sí medimos es la **huella** que dejan: el peso del sonido bajó de 0,31 a 0,22, y la caída más grande coincide con la era de TikTok.

**Lo que no se puede evaluar, dicho tal cual:** cuánto de la popularidad de **cada canción** se debe a las redes. No hay datos abiertos que lo permitan. **Se podría** para las canciones de 2016 en adelante con una herramienta paga (Chartmetric o Luminate), y aun así quedaría el problema de la circularidad. **No lo hicimos** por costo, porque solo cubriría un tercio del período, y porque la herramienta no lo podría usar con un demo.

---

# Parte 2. La letra

Queda **pendiente** por decisión del equipo con los docentes. Esta parte responde: si tuviéramos la letra, ¿qué cambiaría?

## Primero: ¿se puede conseguir?

**Sí, y lo probamos.** Tomamos una muestra al azar de 60 canciones nominadas a Record o Song of the Year y 60 hits nunca nominados, todas del 2000 en adelante, y las buscamos en una fuente abierta (`lyrics.ovh`).

**Las encontró a las 120.** Conseguir la letra no es el problema.

**El problema es legal.** La letra de una canción tiene derechos de autor. No podemos guardarla en el repositorio ni mostrarla en la app. Lo que sí podemos hacer es **medirla y tirar el texto**: quedarnos solo con números (cuántas palabras tiene, cuánto se repite). Así funciona la herramienta que ya dejamos en el repositorio, `codigo/letra.js`. Y por eso no usamos Genius: bloquea a los programas y sus condiciones de uso prohíben copiar las letras.

## Qué mediríamos de una letra

Todo esto se puede medir sin guardar el texto:

| Qué | Qué quiere decir | Por qué importa |
|---|---|---|
| **Cantidad de palabras** | Qué tan larga es la letra | Las canciones más largas tienen más letra. Se cruza con la duración, que ya medimos |
| **Variedad** | Cuántas palabras distintas sobre el total. 1 = ninguna se repite | Un estudio de 353.320 canciones encontró que las letras se volvieron menos variadas entre 1970 y 2020, y que las más simples tendían a ser más populares |
| **Repetición** | Qué parte de las líneas se repite | Por cada repetición extra del estribillo, una canción tiene un 14,5% más de probabilidad de llegar al puesto 1 en vez de quedarse abajo (estudio sobre el Hot 100, 1958–2012) |
| **Primera persona** | Cuánto habla de "yo, me, mi" | El mismo estudio de 353.320 canciones encontró que las letras se volvieron más personales |
| **Emoción** | Si las palabras son más positivas o negativas | Las letras se volvieron más negativas, igual que el sonido se volvió más melancólico |
| **Idioma** | En qué idioma está | Necesario porque todas las medidas de arriba cambian con el idioma |

## Qué dice nuestra prueba

Con las 120 letras de la muestra medimos las cuatro primeras cosas, comparando premiadas contra hits:

| | Nominadas a Record o Song of the Year | Hits nunca nominados |
|---|---|---|
| Palabras | **419** | **380** |
| Variedad | 0,336 | 0,348 |
| Repetición de líneas | 0,327 | 0,322 |
| Primera persona | 0,082 | 0,078 |

**En criollo:** las premiadas tienen letras un poco más largas, y en todo lo demás **son casi iguales a los hits**. La diferencia de largo seguramente es la misma que ya vemos en la duración (las premiadas duran 21 segundos más): más canción, más letra.

**Lo que esto sugiere, con cuidado.** Las características de la letra que más se asocian al éxito comercial —repetir, simplificar, hablar de uno mismo— **no separan a las premiadas de los hits** en nuestra muestra. Coincide con lo que encontró un estudio de la Universidad de Nueva York: para Record y Song of the Year, la letra predice **menos** que el sonido.

**Lo que no se puede afirmar:** con 60 canciones por grupo, estas diferencias son demasiado chicas para concluir algo firme. Es una primera mirada, no una medición. Para afirmarlo habría que medir las 212 premiadas y algunos miles de hits.

## Cómo entraría la letra a P&P, si se retoma

Hay dos caminos, y conviene elegir uno:

**A. Como un panel aparte, sin tocar los dos puntajes.** El usuario pega su letra (opcional, porque de un demo no la tenemos) y la app le muestra cómo queda contra los dos grupos en esas cuatro medidas. Es honesto y es rápido: no cambia el modelo, que ya está probado.

**B. Dentro del modelo, como rasgos nuevos.** Medir las 23.388 canciones de la base y sumar las medidas de letra a las 10 del sonido. Es lo correcto si se quiere decir "cuánto pesa la letra", pero obliga a volver a entrenar y validar todo, y queda el problema de qué hacer cuando el usuario no pega la letra.

**Dos cosas a resolver en cualquier camino:**

1. **El idioma.** Una medida de "variedad" en inglés no es comparable con una en español. Despacito, por ejemplo, habría que medirla con criterios del español.
2. **Song of the Year y Record of the Year no juzgan lo mismo.** Song of the Year premia la composición, y su reglamento exige que la canción tenga melodía y letra: ahí la letra cuenta por regla. Record of the Year premia la grabación: ahí el sonido es lo central. Si la letra entra, tal vez convenga separar las dos categorías.

## Lo que ganaríamos y lo que costaría

| Ganaríamos | Costaría |
|---|---|
| Responder directamente a la devolución de la entrega 3 | Medir 23.388 letras (técnicamente posible: la fuente respondió rápido a las 120) |
| Un peso **medido**, no estimado, para la letra en la tabla de factores | Resolver el idioma |
| Algo concreto que decirle a quien compone, no solo a quien produce | Volver a entrenar y validar el modelo, o diseñar un panel nuevo |
| | Un riesgo legal si alguna vez se guarda un texto por error |

---

# Resumen

| Factor | ¿Entra a la herramienta? | ¿Entra al análisis? | Por qué |
|---|---|---|---|
| **Sonido** | **Sí** | **Sí, medido** | Es lo que la app mide. Explica ~25% de entrar al chart y ~5% de llegar alto |
| **Redes, playlists, YouTube** | **No** | **Sí, estimado (~40% / ~50%)** | No hay datos abiertos de 2000 a 2026; son circulares (son popularidad, no causa); un demo no tiene redes |
| **Letra** | **No, por ahora** | **Sí, estimado (~10%)**; pendiente de medir | Se puede conseguir y medir sin guardar el texto; en nuestra muestra casi no separa premiadas de hits; queda para la siguiente etapa |
| **Contexto** (artista, sello, campaña) | **No** | **Sí, como resto (~25% / ~35%)** | No hay datos abiertos |

---

## Fuentes

- MRC Data (hoy Luminate), [informe de fin de año 2021](https://luminatedata.com/wp-content/uploads/2022/01/MRC_YEAREND_2021_US_FNL-1.pdf) · TikTok, [informe de música 2021](https://newsroom.tiktok.com/en-us/year-on-tiktok-music-report-2021)
- TikTok y Luminate, [Music Impact Report](https://newsroom.tiktok.com/tiktok-and-luminate-release-latest-music-impact-report), febrero de 2025
- Aguiar y Waldfogel, [Platforms, Promotion, and Product Discovery: Evidence from Spotify Playlists](https://www.nber.org/papers/w24713.pdf), NBER, 2018
- Wikipedia, [Billboard Hot 100](https://en.wikipedia.org/wiki/Billboard_Hot_100): streaming desde 2007, YouTube desde 2013
- Google, [YouTube Data API](https://developers.google.com/youtube/v3/getting-started) y [cuotas](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits)
- Spotify, [cambios de la API, febrero de 2026](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)
- TikTok, [API de investigación](https://developers.tiktok.com/doc/research-api-codebook): quiénes pueden pedirla
- Wikimedia, [API de visitas por artículo](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/examples/page-metrics.html)
- Parada-Cabaleiro y otros, [Song lyrics have become simpler and more repetitive over the last five decades](https://www.nature.com/articles/s41598-024-55742-x), *Scientific Reports*, 2024 (353.320 canciones)
- Nunes, Ordanini y Valsesia, [The power of repetition](https://myscp.onlinelibrary.wiley.com/doi/abs/10.1016/j.jcps.2014.12.004), *Journal of Consumer Psychology*, 2015
- Universidad de Nueva York, [qué predice un Grammy](https://www.futurity.org/grammy-awards-songs-artificial-intelligence-3243692-2/)
- El resto de las fuentes sobre la letra están en [`la_letra.md`](la_letra.md)
