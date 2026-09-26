# P&P — Datos y referencias

> Documento único y autocontenido: **todos los datos que usamos** (de dónde salen, por qué elegimos esos, qué problemas tienen, para qué sirve cada uno) y **todas las referencias** (las herramientas técnicas que usamos y los referentes de diseño y producto).
>
> Escrito para alguien que arranca de cero. Cada término técnico se explica la primera vez que aparece, y hay un glosario al final.
>
> El detalle de los problemas encontrados y los resultados del análisis está en `plan_de_datos.md`.
> Actualizado: 3 de septiembre de 2026

---

# PARTE A — LOS DATOS

## A.0 Antes que nada: cómo pensar el problema

La app promete que el usuario sube una canción y recibe dos puntajes: cuánto se parece al perfil que premia el Grammy y cuánto al que triunfa comercialmente.

Para poder decir eso, hay que enseñarle al sistema cómo suena cada uno de esos dos mundos. Y se le enseña como se le enseñaría a una persona a distinguir vinos: no con teoría, sino haciéndole probar cientos de ejemplos con la respuesta puesta.

**Todos los datos del proyecto terminan en una sola tabla**, donde cada fila es una canción:

| título | artista | año | energía | valencia | acústica | … | ¿Grammy? | ¿puesto Billboard? |
|---|---|---|---|---|---|---|---|---|
| Bohemian Rhapsody | Queen | 1975 | 0,40 | 0,23 | 0,29 | … | no | 9 |
| Rolling in the Deep | Adele | 2011 | 0,77 | 0,51 | 0,14 | … | **ganó** | 1 |
| (una canción cualquiera) | … | 1998 | 0,55 | 0,44 | 0,31 | … | no | — |

Las columnas del medio son **las características del sonido**: lo que le damos al sistema. Las dos últimas son **las respuestas**: qué le pasó a esa canción en cada mundo.

> **La distinción más importante del proyecto:** "el perfil que premia la Academia" **no es un dato que se descarga**. Es lo que el sistema deduce al mirar miles de filas. Si se pudiera bajar de algún lado, no habría proyecto. Lo que se baja son las canciones con sus características y sus respuestas.

Esa tabla se arma con **cuatro fuentes**, más una quinta que funciona distinto.

---

## A.1 Fuente 1 — Billboard Hot 100 ✅ conseguida

### Qué es
El ranking semanal de las 100 canciones más escuchadas en Estados Unidos. Existe sin interrupción **desde el 4 de agosto de 1958**.

### De dónde lo sacamos
Del repositorio público [utdatasets/rwd-billboard-data](https://github.com/utdatasets/rwd-billboard-data) en GitHub. Es una descarga directa: gratis, sin cuenta, sin permisos.

### Para qué sirve
**Es el eje de la popularidad de la app.** Cuando el gráfico ubica una canción más a la derecha o más a la izquierda en "éxito comercial", ese eje está construido con estos datos.

### Por qué esta fuente y no la cantidad de reproducciones en Spotify
Esta es la decisión más importante de todas las fuentes, y conviene poder defenderla:

La hipótesis del proyecto compara **seis décadas**. Los datos de reproducciones (*streams*) existen desde 2015 más o menos. **No hay forma de saber cuántas veces se "reprodujo" una canción en 1967** — el concepto no existía. Billboard es la única medida de éxito comercial que existe en las seis décadas y que se midió siempre de la misma manera.

Y tiene una ventaja extra: da una medida **gradual**, no un sí o un no. Llegar al puesto 3 y quedarse 20 semanas no es lo mismo que asomar al puesto 87 durante dos semanas, y esa diferencia queda registrada.

### Qué trae y qué hicimos con eso
El archivo original tiene **355.001 filas**, pero es la misma canción repetida semana a semana. Lo colapsamos a **una fila por canción: 32.702 canciones únicas**, cada una con:

- Su **mejor puesto** histórico (de 1 a 100)
- Cuántas **semanas** estuvo en el ranking
- El **año de su primera aparición** ← este dato resultó ser clave, ver A.3

| Década | Canciones | Llegaron al top 10 |
|---|---|---|
| 1950s | 925 | 147 |
| 1960s | 6.850 | 1.059 |
| 1970s | 5.301 | 941 |
| 1980s | 4.113 | 969 |
| 1990s | 3.424 | 671 |
| 2000s | 3.418 | 591 |
| 2010s | 4.431 | 522 |
| 2020s | 4.240 | 417 |

Está parejo en todas las décadas, que es justo lo que hace falta para comparar épocas sin que una domine.

> Archivo: `datasets/raw/billboard_hot100.csv` (19 MB) → `datasets/billboard_canciones.csv` · Script: `preparar_billboard.js`

---

## A.2 Fuente 2 — Premios Grammy ✅ conseguida

### Qué es
Las canciones nominadas y ganadoras del Grammy, desde la primera entrega en 1959 hasta la de 2026.

### De dónde lo sacamos
**Lo armamos nosotros**, escribiendo un programa que baja las páginas de Wikipedia y las convierte en tabla.

### Para qué sirve
**Es el eje del prestigio de la app.** El otro eje del gráfico.

### Por qué nos lo armamos en vez de bajar uno hecho
Buscamos datasets ya armados y ninguno servía:

| Opción | Por qué no |
|---|---|
| Datasets de **Kaggle** | Exigen crear una cuenta, y varios traen **solo ganadores**, no nominados |
| `music-mining` (GitHub) | Parecía ideal: ya venía cruzado con características de sonido y premios. Pero **solo cubre 2000-2022**, con 457 nominados. Sin las seis décadas, la hipótesis no se puede ni probar ni refutar |

Wikipedia tiene una página por cada categoría del Grammy, con una tabla que lista todos los años y todos los nominados. Es gratis, no pide cuenta, y es la fuente más completa que existe para los años viejos.

### Qué conseguimos
**2.513 nominaciones, de las cuales 488 ganaron**, entre 1959 y 2026, en **14 categorías**:

- **Generales** (premian una canción sin importar el género): Record of the Year, Song of the Year
- **De género**: rock, pop, R&B, country, rap, metal, alternativo, dance

### Por qué nominados y no solo ganadores
Esto es clave y es fácil pasarlo por alto.

Ganadores de Canción del Año hay unos **60 en toda la historia**. Con 60 ejemplos un sistema no aprende nada: memoriza esos 60 casos y después falla con todo lo demás. Sumando nominados pasamos de 60 a más de 2.500 — **cuarenta veces más material**.

Y es más correcto conceptualmente. La hipótesis habla del *perfil de sonido que la Academia reconoce*, y **una nominación ya es reconocimiento**: significa que un comité de la industria eligió esa canción entre miles. Que gane una de las cinco finalistas depende de campaña, sello y política, cosas que ningún dato sobre el sonido puede capturar.

### Cómo verificamos que está bien
Revisamos ganadores de todas las décadas contra lo que se sabe:

| Año | Lo que devolvió el programa |
|---|---|
| 1959 | Nel Blu Dipinto Di Blu (Volare) — Domenico Modugno ✓ |
| 1965 | The Girl from Ipanema — Stan Getz & Astrud Gilberto ✓ |
| 1984 | Beat It — Michael Jackson ✓ |
| 2000 | Smooth — Santana featuring Rob Thomas ✓ |
| 2020 | Bad Guy — Billie Eilish ✓ |
| 2026 | Luther — Kendrick Lamar & SZA ✓ |

### Un error que costó encontrar y que vale contar
La primera versión del programa devolvía esto:

```
It's Too Late — Lou Adler, producer
```

En vez de **Carole King**, que es quien la canta. El motivo: en la tabla de Record of the Year, la última columna no es el intérprete sino el **equipo de producción**. Y las categorías no comparten estructura:

```
Record of the Year:  Año | Grabación | Artista       | Equipo de producción
Song of the Year:    Año | Canción   | Compositores  | Artista
```

Tomar "la última columna" da el productor en un caso y el artista en el otro. Con el productor en lugar del artista, el cruce con la fuente 3 habría fallado casi entero y no habríamos sabido por qué. Se arregló leyendo los **encabezados** de cada tabla para identificar la columna correcta.

> Archivo: `datasets/grammy_nominaciones.csv` · Script: `fetch_grammy.js` (se puede volver a correr cada año cuando salgan los nuevos Grammy)

---

## A.3 Fuente 3 — Características del sonido ✅ conseguida

### Qué es
Una tabla gigante donde cada fila es una canción y las columnas son **números que describen cómo suena**.

### De dónde lo sacamos
Del dataset público [GildasLeDrogoff/spotify-huge-track-analysis-dataset](https://huggingface.co/datasets/GildasLeDrogoff/spotify-huge-track-analysis-dataset), alojado en **HuggingFace**: **56.277.664 canciones, 4,1 GB**, sin cuenta ni credenciales.

### Para qué sirve
**Son las variables del modelo**: lo que el sistema mira para encontrar los patrones. Y son exactamente lo que la app le muestra al usuario cuando le dice *"tu energía te suma en popularidad y te resta en prestigio"*.

### Importante: no contiene música
Nadie nos manda 56 millones de canciones. Nos manda **los números que ya estaban calculados** a partir de ellas. Por eso son 4 GB y no varios petabytes. Adentro se ve así:

```
track_name           artist_name   album_release_date  energy  valence  acousticness  tempo
Bohemian Rhapsody    Queen         2024-07-19          0.402   0.228    0.289         143.9
```

### ¿Quién analizó las canciones? Spotify, no nosotros

Es la pregunta que más se hace sobre el proyecto, así que conviene tenerla clara: **nosotros no analizamos ninguna canción.** La cadena es esta:

1. **Spotify analizó el audio.** Durante años su sistema procesó cada canción de su catálogo y calculó automáticamente estos valores. Lo hacía para sus propias recomendaciones.
2. **Los publicaba por su API.** Cualquier programador podía pedirle las características de una canción y Spotify devolvía los números.
3. **Alguien los cosechó.** Un usuario de HuggingFace le pidió a esa API los datos de millones de canciones y armó la tabla. Eso es lo que bajamos.
4. **En noviembre de 2024 Spotify cerró el acceso** (ver abajo), y el archivo quedó como una foto tomada antes del cierre.

> **Precisión al hablar de esto.** Los 56 millones son el tamaño de la fuente, no de nuestro trabajo: usamos **8,9 millones** como referencia de época y **53.577** como material de aprendizaje. Decir "analizamos 56 millones de canciones" sería falso.

**Y la limitación que arrastra:** nunca pudimos verificar ese algoritmo. Confiamos en que su "energía 0,82" mide lo que dice medir, pero es una **caja negra** — Spotify nunca publicó el método. No podemos reproducir esos números desde cero, y es la razón de fondo por la que hay que calibrar contra librosa (sección A.5): estamos combinando un instrumento que no podemos inspeccionar con otro que sí.

### Por qué no se lo pedimos directamente a Spotify
**Porque ya no se puede.** En noviembre de 2024 Spotify **cerró el acceso** a estos datos para las aplicaciones nuevas. Una app creada hoy no se los puede pedir. Los datasets como este se armaron antes de ese cierre, y son la única forma de acceder a esa información ahora.

Y aunque estuviera abierto, no alcanzaría: **la canción que sube el usuario puede ser un demo sin publicar**, que no está en Spotify. Eso se resuelve con la fuente 5.

### Por qué este dataset y no otro
Comparamos varios candidatos:

| Candidato | Tamaño | Por qué sí o no |
|---|---|---|
| `maharshipandya/spotify-tracks-dataset` | 13 MB, 114.000 canciones | ❌ Cómodo, pero **no tiene el año**. Sin año no se puede comparar 1965 con 2025, que es exactamente lo que la hipótesis necesita |
| `ozefe/spotify_audio_features` | 12 GB, 255 millones | ❌ Más de lo necesario y mucho más pesado de manejar |
| **`GildasLeDrogoff`** | **4,1 GB, 56 millones** | ✅ Tiene año, artista, título y las características. Tamaño manejable |

### Las diez características que usamos, una por una
Casi todas van de **0 a 1**, donde 0 es nada y 1 es el máximo. Están ordenadas por **cuánto separan** a las canciones premiadas de los hits — medido sobre el corpus, no supuesto:

| Característica | Qué mide, en criollo | Separación | Ejemplo |
|---|---|---|---|
| **Energía** | Qué tan intensa y activa suena | **0,473** | Metal ≈ 0,95 · balada de piano ≈ 0,15 |
| **Valencia** | Qué tan alegre suena. **No es la letra, es el sonido** | **0,461** | Canción de fiesta ≈ 0,9 · melancólica ≈ 0,2 |
| **Acústica** | Probabilidad de que use instrumentos reales en vez de electrónicos | **0,349** | Guitarra y voz ≈ 0,9 · electrónica ≈ 0,02 |
| **Duración** | Cuánto dura | **0,344** | — |
| Bailabilidad | Qué tan regular y marcado es el ritmo | 0,215 | Reguetón ≈ 0,85 · rock progresivo ≈ 0,3 |
| Volumen | Nivel promedio en decibeles (número negativo: cuanto más cerca de 0, más fuerte) | 0,171 | Pop moderno ≈ −5 dB · grabación de los 60 ≈ −13 dB |
| Habla | Cuánta palabra hablada tiene en vez de cantada | 0,164 | Rap ≈ 0,3 · pop ≈ 0,04 · **audiolibro > 0,66** |
| Tempo | Velocidad, en pulsos por minuto | 0,061 | Balada ≈ 70 · house ≈ 128 |
| Modo | Mayor (suele sonar alegre) o menor (suele sonar triste) | 0,037 | — |
| Instrumentalidad | Probabilidad de que no tenga voz cantada | 0,036 | Instrumental ≈ 0,9 · canción normal ≈ 0,0 |

**Las cuatro primeras son las que explican el resultado**, y son las que la app le muestra primero al usuario en la lista de "qué suma y qué resta". Las tres últimas aportan casi nada por separado, pero se mantienen porque pueden rendir combinadas — el tempo solo no distingue, pero cruzado con la energía puede separar un tema intenso y lento de uno intenso y rápido.

### Dos que sacamos, y por qué

| Sacada | Motivo |
|---|---|
| **Tonalidad** | Viene como un número del 0 al 11 (Do es 0, Do# es 1, y así). El modelo lo leería como una **cantidad**, y creería que el 11 está muy lejos del 0 — cuando musicalmente Si y Do son vecinos. No aporta información: mete ruido |
| **En vivo** | Al deduplicar sacamos a propósito las tomas en vivo, así que en el corpus casi no varía: solo el 0,8% pasa de 0,8. Separaba 0,128, de las más bajas |

### Una que agregamos: la rareza

**Qué mide.** Cuán lejos está una canción del centro de su propio año, en las nueve características continuas a la vez. La referencia son las 8,9 millones del pozo agrupadas por año — o sea **toda la música publicada ese año**, no solo los hits. Un valor alto significa "no sonaba como nada de lo que se hacía entonces".

**Por qué la agregamos.** Como hipótesis propia y comprobable: quizá la Academia premia lo que se sale de la norma y el público lo que se le parece.

**Qué dio.** Separación **0,077** — la más baja de todas. Y en dirección contraria a lo esperado: las premiadas de categorías generales son *ligeramente menos* raras (0,768) que los hits (0,785). Por década tampoco hay tendencia.

> **La hipótesis se cae: la Academia no premia lo que se sale de la norma.** Es un resultado negativo y se reporta como tal.

**Pero la medida funciona.** Las canciones que salieron como más raras son coherentes: *Baile Inolvidable* de Bad Bunny (una salsa en el Hot 100), *Honeycomb* de Deafheaven (blackgaze), *Junk Food Junkie* de Larry Groce (una canción novelty). Está midiendo rareza de verdad; simplemente la rareza no predice premios.

**Una limitación de diseño que probablemente lo explique.** La rareza, como está definida, **es ciega a la dirección**: mide distancia al centro sin importar hacia dónde. Una canción muy acústica y una muy electrónica dan la misma rareza alta, siendo opuestas. Si las premiadas son raras hacia lo acústico y largo, y los hits hacia lo enérgico y bailable, al colapsar todo en una distancia esas dos rarezas se cancelan.

**Se queda igual**, por dos motivos: ya está calculada y puede rendir combinada con otras, y como información al usuario sirve más allá de que prediga premios — *"tu canción es más rara que el 90% de lo que se publicó este año"* es algo que un músico quiere saber.

### Los dos problemas que trajo esta fuente

**Problema 1: el año que trae no es el año de la canción.**

Al buscar Bohemian Rhapsody el dump devolvió fecha **2024** y **2025**. La canción es de **1975**. Ese campo es la fecha de la *edición* en Spotify: remasterizaciones y recopilatorios.

Lo medimos en vez de suponer, comparándolo contra el año real de Billboard:

| Década | Acierta dentro de ±3 años |
|---|---|
| 1950s | **0%** (se desvía 12 años) |
| 1960s | **21%** (se desvía 8 años) |
| 1970s | 80% |
| 1980s | 88% |
| 1990s | 92% |
| 2000s | 95% |
| 2010s | 96% |
| 2020s | 98% |

**Sirve desde 1970 y falla antes.** El motivo: las grabaciones anteriores a 1970 llegaron a Spotify como reediciones digitales hechas décadas más tarde.

*Cómo lo resolvimos:* el año lo ponen Billboard y Grammy, que lo tienen exacto. **El dump aporta el sonido; el año viene de otro lado.**

**Problema 2: cada canción aparece muchas veces.**

La misma búsqueda devolvió tres Bohemian Rhapsody: dos remasterizaciones y una versión en vivo. Y los números son completamente distintos: **energía 0,85 en vivo contra 0,40 en estudio**.

*Cómo lo resolvimos:* una sola versión por canción. Se descartan las que dicen "live", "remix", "karaoke", "cover", "instrumental" o "demo" en el título, y entre las que quedan se elige la más popular, que es la grabación de estudio original. De 56 millones de filas quedaron **43.618.889 canciones únicas**.

> Archivo: `datasets/raw/spotify_features.parquet` (4,1 GB)

---

## A.4 Fuente 4 — El grupo de control ✅ conseguida

### Qué es
**Canciones que no ganaron nada y nunca fueron hit.** Las comunes.

### Por qué es imprescindible (y por qué casi nadie lo ve venir)
Con Grammy y Billboard tenemos las que ganaron y las que fueron éxito. Parece completo. **No lo es.**

Si al sistema solo le mostramos ganadoras y exitosas, nunca ve cómo suena una canción normal, y entonces **no tiene contra qué comparar**. Todo lo que le entre va a puntuar alto en algo.

> Es como enseñarle a alguien a reconocer caras famosas mostrándole únicamente fotos de famosos: cuando le mostrás a un desconocido, va a decir que también es famoso, porque no sabe cómo se ve alguien que no lo es.

Sin este grupo, los dos puntajes de la app **no significan nada**. Y lo peor es que **no se nota**: los números salen, se ven razonables, el gráfico se dibuja bien. El error es invisible desde la pantalla.

### De dónde sale
Gratis, del mismo dump de la fuente 3. Todas las canciones que están ahí y **no** aparecen ni en Grammy ni en Billboard son, por definición, canciones que no ganaron ni fueron hit.

### Qué armamos
Del dump salieron **8.893.628 candidatas**. De ahí se filtró lo que no es música y se tomaron **27.000: 4.500 por década, de 1970 a hoy**, para que ninguna época domine.

**Por qué desde 1970:** estas canciones no están en Billboard ni en Grammy, así que **no tienen año por ningún lado** que la fecha del dump — y esa fecha falla antes de 1970 (ver A.3).

### El problema que trajo: no todo lo que está en Spotify es música
Al mirar una muestra al azar del primer grupo de control apareció esto:

```
'028 - und die geheimnisvolle Stadt - Teil 36'  — Fünf Freunde       (1991)
'Uterine Sounds'                                 — Relaxing Radiance  (2020)
```

La primera es un **audiolibro infantil alemán**. La segunda es **ruido blanco para dormir**.

**Por qué es grave.** Si el grupo de control tiene audiolibros, el modelo aprende que "no ser un hit" significa "ser palabra hablada". Eso es facilísimo de detectar, así que el modelo se vería muy preciso **y sería completamente inútil**: estaría respondiendo *"¿esto es música?"* en vez de *"¿esto suena a hit?"*.

Lo medimos: **5,8% del control era palabra hablada, contra 0,05% de los hits.** Ciento dieciséis veces más.

### Y el error que cometimos al intentar arreglarlo
El primer filtro fue la regla obvia: *"muy instrumental y con poca energía"*. Al revisar qué agarraba:

```
London Symphony Orchestra  — banda sonora de Indiana Jones
La Petite Bande            — Lully, Le Bourgeois Gentilhomme
Erik Satie                 — Gnossienne No. 2
```

Eso no es ruido: es **música clásica**. La regla describe igual de bien a un generador de ruido blanco que a una pieza de piano de Satie. Si la aplicábamos, sacábamos del control toda la música tranquila e instrumental, y el modelo habría aprendido que "no ser hit" significa "tener voz y ser movida". Sesgo puro.

**Cómo quedó resuelto.** Se descartó esa regla. Los filtros finales son deliberadamente conservadores — prefieren dejar pasar algo de ruido antes que borrar música legítima:

| Filtro | Qué saca |
|---|---|
| Palabra hablada > 0,66 | Audiolibros y radioteatros. Es el umbral que Spotify define como "enteramente hablado" |
| Menos de 1 minuto | Fragmentos, intros, capítulos partidos |
| Más de 15 minutos | Capítulos de audiolibro y sesiones de DJ. Deja pasar prog rock y clásica larga |
| Nombre de artista de fábrica | "White Noise Baby Sleep", "Womb Sounds Heartbeat". Busca en el **artista**, no en el título, para no pisar canciones que se llamen *Rain* o *Sleep* |

Auditado: de las 384.814 canciones instrumentales y tranquilas del pozo, el filtro toca solo el **8%**. Lo que borra es *"Box Fan - Loopable"* de "Vacuum Cleaner White Noise"; lo que deja son grabaciones de piano de baja repercusión, que **corresponde** que estén ahí porque efectivamente no son hits ni ganaron nada.

### Un regalo que salió del cruce
Las canciones que están en Grammy **y** en Billboard son las que lograron las dos cosas. Esa es directamente la funcionalidad *"casos que lograron las dos cosas"* de la app, y además es la prueba de qué tan rara es esa combinación. No hubo que recolectarla: apareció sola. **Son 1.071.**

> Archivo final: `datasets/control_v2.csv` (mismo esquema que el corpus, se pueden apilar) · intermedio `datasets/control.csv` · pozo completo `datasets/pozo_control.parquet` · scripts `armar_control.js` + `armar_control_v2.js`

---

## A.5 Fuente 5 — La canción que sube el usuario ⏹️ pendiente

### Por qué es completamente distinta
Las cuatro fuentes anteriores arman el **corpus histórico**: lo que el sistema estudia. Esta es otra cosa: **el archivo que el usuario sube en el momento**.

Ahí no hay dataset que valga. Puede ser un demo que no existe en ningún lado, que nunca se publicó, que no está en Spotify. Hay que **analizar el audio directamente**, en nuestro servidor.

### Con qué
Con **librosa** o **Essentia**: programas gratuitos y de código abierto que abren un archivo de audio y calculan las mismas características (duración, velocidad, energía, brillo del sonido, dinámica).

### Qué falta para tenerlo
librosa funciona con **Python**, que hoy **no está instalado** en la máquina. Para bajar y cruzar los datos alcanzó con otra herramienta, pero antes de que la app pueda analizar una canción de verdad hay que instalarlo.

### El problema técnico más importante que queda abierto
Los números del corpus los calculó **el algoritmo de Spotify**. Los del usuario los va a calcular **librosa**. Son programas distintos: su "energía" y la "energía" de Spotify miden cosas parecidas de maneras distintas.

Si entrenamos con una escala y medimos con otra, **la app devuelve números mal calibrados**. Otra vez: se ven razonables, están mal.

**Cómo se resuelve.** Tomar unas cien canciones que estén en el dump y de las que tengamos el audio, analizarlas con librosa, y medir cómo se traduce una escala a la otra. Con esa equivalencia se ajustan los números del usuario antes de pasarlos al modelo. Es una tarea acotada, **no se puede saltear**, y hay que dejarla escrita en la página de racional.

### Qué pasa con el archivo del usuario
Se sube, se procesa, se descarta. **Hay que decirlo en la pantalla**: nadie sube un demo inédito a una web sin saber qué pasa con él, y decirlo genera confianza en usuarios que son muy cuidadosos con su material.

---

## A.5b Cómo leer los archivos: las 21 columnas y las celdas vacías

Los dos archivos finales —`corpus_v2.csv` y `control_v2.csv`— tienen **exactamente las mismas 21 columnas en el mismo orden**, así que se pueden apilar directamente para entrenar: 53.577 canciones en total.

| Columna | Qué es |
|---|---|
| `titulo`, `artista`, `anio` | Identidad. El año es el de la primera aparición en Billboard, o el de la premiación |
| `grammy_gano`, `grammy_nominada` | 1 o 0 |
| `grammy_categorias` | En qué categorías fue nominada, separadas por `\|` |
| `mejor_puesto`, `semanas_en_chart`, `fue_hit` | Su paso por el Billboard Hot 100 |
| **`grupo`** | `premiada` · `hit` · `ambas` · `control`. **Es el resumen: dice de un vistazo qué es cada canción** |
| Las 10 características | `danceability`, `energy`, `valence`, `acousticness`, `instrumentalness`, `speechiness`, `loudness`, `tempo`, `mode`, `duration_ms` |
| `rareza` | Cuán lejos está del centro de su año |

### Las celdas vacías son correctas, no son datos faltantes

Al abrir los archivos en Excel se ven columnas con celdas en blanco. **Ninguna es un error**, pero conviene saber por qué está vacía cada una:

| Columna | Vacía en | Por qué |
|---|---|---|
| `grammy_categorias` | 100% del control, 93,7% del corpus | Son las canciones que **nunca fueron nominadas**. No hay categoría que poner |
| `mejor_puesto` | 100% del control, 2,2% del corpus | Son las que **nunca entraron al ranking**. Dejarlo vacío es lo correcto: poner 0 o 101 sería inventar una posición que no existe. En el corpus son exactamente las 593 del grupo `premiada` — nominadas que no llegaron al Hot 100 |
| `rareza` | 23,2% del corpus | Son las **anteriores a 1970**. La rareza se mide contra la música de cada año, y antes de 1970 el pozo no tiene un año confiable (ver A.3). Como el modelo se entrena desde 1970, esas filas quedan fuera igual |

> Una que **sí** estaba mal y se corrigió: `semanas_en_chart` aparecía vacía para las canciones que nunca charteaban. Ahora dice **0**, que es el dato verdadero — esa canción efectivamente estuvo cero semanas en el ranking. La diferencia importa: vacío significa "no sabemos", cero significa "sabemos que fue ninguna".

---

## A.6 Para qué sirve cada dato, pantalla por pantalla

| Pantalla de la app | Qué datos usa | Cómo |
|---|---|---|
| **Los dos puntajes** | Todo el corpus | El sistema aprendió qué características acompañan a cada resultado. Le pasamos las de la canción del usuario y devuelve dos probabilidades |
| **El margen de error** ("32%, entre 24% y 41%") | El corpus | Sale de medir cuánto se equivoca el sistema con canciones que nunca vio. Es la promesa de honestidad de la app y **no es opcional** |
| **El gráfico de dos ejes** | Corpus + canción del usuario | Cada canción histórica es un punto. La del usuario es otro punto en el mismo plano |
| **Lista de qué suma y qué resta** | El modelo entrenado | Se calcula cuánto cambia cada puntaje al mover **una sola** característica dejando el resto igual |
| **"Tu conflicto principal es la energía"** | El modelo entrenado | Es la característica que más empuja los dos puntajes **en direcciones opuestas**. Es el corazón de la app: la tensión |
| **Canciones de referencia** | El corpus | Se buscan las más parecidas dentro de cada grupo (premiadas, exitosas, ambas). **No hace falta ningún dataset extra** |
| **Simular cambios** | El modelo entrenado | Cada vez que el usuario mueve un control, se recalculan los dos puntajes |
| **Modo álbum** | El modelo entrenado | Lo mismo para varias canciones, ordenadas |
| **Explorar la historia** | Corpus agrupado por año | Dos líneas: el promedio de las premiadas y el de las exitosas. La distancia entre ellas es la hipótesis hecha gráfico |
| **El asistente conversacional** | Resultados + acceso al modelo | Recibe los números ya calculados y los traduce a lenguaje de músico. Cuando el usuario pregunta "¿y si bajo la energía?", **le pide al modelo que recalcule** y responde con el número real |

> **La regla que atraviesa todo:** los números los calcula el modelo, siempre igual. La inteligencia artificial conversacional **interpreta y traduce, nunca calcula ni decide**. Todo número que aparezca en pantalla se puede reproducir sin llamar a un modelo de lenguaje.
>
> Esto importa por dos razones prácticas. Una: en una demo en vivo, los resultados dan siempre lo mismo. Dos: cuando pregunten *"¿y esto no lo inventa la IA?"*, la respuesta es no, y se puede demostrar.

---

## A.7 Qué NO recolectamos, y por qué

Sirve tanto como la lista de lo que sí, porque evita perder semanas:

- **Las letras.** La app mide sonido, no texto. Está declarado como límite, y el asistente tiene instrucciones de decir *"eso está fuera de lo que el análisis mide"*.
- **Sello discográfico, presupuesto, campaña de prensa.** Pesan muchísimo en un Grammy real, pero no son características del sonido. Reconocerlo abiertamente es lo que hace honesta a la herramienta.
- **Cantidad de reproducciones.** Redundante con Billboard, y no existe antes de 2015.
- **Un dataset de "canciones de referencia".** Salen del mismo corpus.
- **Datos personales de los usuarios.** No hacen falta para que la app funcione.
- **El rango dinámico** (la distancia entre las partes suaves y las fuertes). Lo habíamos propuesto porque es el mejor indicador de la diferencia entre "grabación que la crítica valora" y "grabación pensada para radio". **No se puede**: el dump no lo trae, y calcularlo exigiría tener el audio de las 50.000 canciones del corpus, cosa que no tenemos ni podemos tener legalmente. Queda el **volumen promedio**, que captura parte del mismo fenómeno. Vale mencionarlo en la presentación: muestra que entendemos qué mide y qué no mide la herramienta.

---

# PARTE B — LAS REFERENCIAS

## B.1 Las herramientas que usamos para construir esto

Todo lo de la Parte A se hizo con estas herramientas. **Todas gratis y sin cuenta**, salvo la última.

| Herramienta | Qué es, en criollo | Para qué la usamos | Estado |
|---|---|---|---|
| **[Node.js](https://nodejs.org)** | El programa que permite ejecutar código JavaScript fuera del navegador. Es el "motor" donde corren nuestros scripts | Todos los scripts de descarga, parseo y cruce | ✅ instalado |
| **[DuckDB](https://duckdb.org)** | Una base de datos que no necesita servidor: es un archivo y listo. Está diseñada para analizar tablas enormes en una computadora común | Cruzar los 56 millones de canciones con Billboard y Grammy. Sin esto habría sido inviable | ✅ instalado |
| **Parquet** | Un formato de archivo para tablas gigantes. Ocupa mucho menos que un CSV y se consulta más rápido, porque guarda los datos por columna en vez de por fila | El dump de 4,1 GB viene en este formato | ✅ |
| **[HuggingFace](https://huggingface.co)** | Una plataforma donde la gente publica datasets y modelos de inteligencia artificial para que otros los usen. Es como GitHub pero para datos | De ahí sacamos las características del sonido | ✅ |
| **[GitHub](https://github.com)** | La plataforma donde los programadores publican y comparten código. Mucha gente también publica datos ahí | De ahí sacamos Billboard | ✅ |
| **[API de Wikipedia](https://en.wikipedia.org/w/api.php)** | Una forma de pedirle a Wikipedia el contenido de una página en formato que un programa pueda leer, en vez de leerlo a ojo | De ahí sacamos las 2.513 nominaciones al Grammy | ✅ |
| **[librosa](https://librosa.org)** | Un programa gratuito que abre un archivo de audio y calcula sus características | Analizar la canción que sube el usuario | ⏹️ falta |
| **[Python](https://www.python.org/downloads/)** | Otro lenguaje de programación, el estándar para trabajo con datos y audio | Necesario para que funcione librosa | ⏹️ falta instalar |
| **[API de Claude](https://console.anthropic.com)** (Anthropic) | El modelo de lenguaje que va a impulsar el asistente conversacional | El chat que traduce los números a lenguaje de músico | ⏹️ falta · **la única que cuesta plata** (centavos por consulta) |

> **Una nota técnica que vale para la presentación.** La primera versión de los scripts agrupaba los 43 millones de canciones de una sola vez y se quedaba sin memoria, volcando 22 GB al disco antes de abortar. Filtrar **antes** de agrupar bajó el tiempo de "se cuelga" a **11 segundos**. Es la diferencia entre pedirle a la base que ordene toda la biblioteca y pedirle que ordene solo el estante que nos interesa.

### Fuentes de datos, con link directo

| Fuente | Link | Licencia / acceso |
|---|---|---|
| Billboard Hot 100 completo | [github.com/utdatasets/rwd-billboard-data](https://github.com/utdatasets/rwd-billboard-data) | Público, sin cuenta |
| Grammy (páginas por categoría) | [Wikipedia — Record of the Year](https://en.wikipedia.org/wiki/Grammy_Award_for_Record_of_the_Year) y 15 páginas más | Público, licencia CC |
| Características del sonido | [huggingface.co/datasets/GildasLeDrogoff/spotify-huge-track-analysis-dataset](https://huggingface.co/datasets/GildasLeDrogoff/spotify-huge-track-analysis-dataset) | Público, sin cuenta |
| *(descartado)* `music-mining` | [github.com/pezon/music-mining](https://github.com/pezon/music-mining) | Solo cubre 2000-2022 |
| *(descartado)* `maharshipandya` | [huggingface.co/datasets/maharshipandya/spotify-tracks-dataset](https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset) | No tiene el año |

---

## B.2 Referentes de diseño y producto

Estos son los proyectos que miramos para decidir **cómo debería verse y comportarse la app**. La consigna pide referentes de diseño, interfaz, utilidad y datos: acá están los cuatro grupos, con qué le tomamos a cada uno.

### Visualización de datos

**[Every Noise at Once](https://everynoise.com)** — de Glenn McDonald, que trabajaba en Spotify
*Qué es:* un mapa de casi seis mil géneros musicales ubicados en un plano de dos dimensiones. Cada punto se puede clickear para escucharlo.
*Por qué es nuestro referente principal:* es **exactamente la idea del gráfico central de P&P** — ubicar música en un plano de dos ejes — y demuestra que funciona como interfaz. Alguien que nunca vio un gráfico de dispersión entiende ese mapa en diez segundos.
*Qué le tomamos:* que el plano es navegable y que cada punto es una canción real que se puede reconocer, no un dato abstracto.

**[The Pudding](https://pudding.cool)**
*Qué es:* una publicación de ensayos visuales, muchos sobre música (la evolución del Billboard, cómo cambió la estructura de las canciones).
*Qué le tomamos:* que **el hallazgo se cuenta como un argumento**, no como un tablero de control. El lector recorre el descubrimiento en vez de recibirlo servido. Es la referencia para el orden de las pantallas.

**[Gapminder](https://www.gapminder.org/tools/)** — de Hans Rosling
*Qué es:* un gráfico de burbujas con una línea de tiempo que se puede arrastrar, mostrando cómo cambiaron los países en salud y riqueza a lo largo de dos siglos.
*Qué le tomamos:* es **el modelo exacto de la pantalla "Explorar la historia"**. Mover el tiempo y ver moverse los puntos es lo que hace entender un cambio histórico sin leer una sola cifra.

**[Datawrapper — blog de Lisa Charlotte Muth](https://blog.datawrapper.de)**
*Qué es:* artículos muy prácticos sobre cómo elegir colores, escalas y anotaciones en un gráfico.
*Qué le tomamos:* decisiones concretas de color y escala. Es la referencia técnica, no conceptual.

### Comunicación de la incertidumbre

**FiveThirtyEight — modelos de pronóstico electoral** · [copia archivada del pronóstico 2020](https://web.archive.org/web/20201102030346/https://projects.fivethirtyeight.com/2020-election-forecast/) · continúa en [Silver Bulletin](https://www.natesilver.net)

> ⚠️ El sitio original ya no existe: Disney cerró FiveThirtyEight en marzo de 2025 y borró el archivo en mayo de 2026. Usar la copia del Archivo de Internet.
*Qué es:* el sitio que popularizó los pronósticos electorales expresados como probabilidades con rango, en vez de un ganador anunciado.
*Por qué importa acá:* son quienes establecieron que **se comunica un rango, no un número**. La propuesta de P&P ya llegó por intuición a la misma decisión — *"32%, con un margen entre 24% y 41%"* — y citarlos convierte esa intuición en una **decisión de diseño fundamentada**, que es justo lo que la consigna pide poder defender.
*Qué le tomamos:* que el margen se muestra siempre, no como letra chica.

### Interfaz y producto

**[iZotope Ozone — Tonal Balance Control](https://www.izotope.com/en/products/ozone.html)**
*Qué es:* una herramienta profesional de mezcla que compara tu tema contra la curva típica de un género y te muestra en qué te desviás.
*Por qué es el mejor referente de utilidad:* es **la misma idea de P&P aplicada a la mezcla**, y es una herramienta que los músicos **ya usan y entienden**. Valida que el formato "tu track contra un perfil de referencia" es legible para el usuario objetivo, que es exactamente quien va a usar nuestra app.

**[Spotify Wrapped](https://www.spotify.com/wrapped/)**
*Qué le tomamos:* cómo volver **personal** un resultado de datos. La diferencia entre "acá están tus números" y "esto es lo que dice tu año".

**[Linear](https://linear.app)**
*Qué es:* una herramienta de gestión de proyectos para equipos de software, conocida por su acabado.
*Qué le tomamos:* densidad de información sin ruido visual, y pantallas vacías que enseñan a usar la app en vez de quedarse en blanco. Es la referencia de terminación de la interfaz.

### Utilidad — el rubro donde compite

**[Chartmetric](https://chartmetric.com)** y **[Soundcharts](https://soundcharts.com)**
*Qué son:* plataformas de analítica musical que usan managers y cazatalentos de sellos para seguir artistas.
*Para qué nos sirven:* son el **contexto profesional** del usuario. Muestran a qué está acostumbrado alguien que trabaja en la industria.

**Musiio, Music Xray y la llamada "hit song science"**
*Qué son:* empresas que venden predicción de éxito. Te dicen *"tu canción tiene 74% de chances de ser un hit"*.
*Por qué están acá:* son el **contraejemplo deliberado**, y es el mejor argumento de posicionamiento del proyecto. Ellos venden una **certeza**; P&P vende un **diagnóstico con una tensión adentro**, con márgenes explícitos y un asistente que admite lo que no sabe. Decirlo así en la presentación deja clarísimo qué hace distinto al proyecto.

### Inteligencia artificial sobre datos propios

**[Perplexity](https://www.perplexity.ai)**
*Qué es:* un buscador conversacional donde cada afirmación viene con el link a la fuente de donde salió.
*Qué le tomamos:* que el asistente **cite el dato concreto** en que se apoya. Si dice "tu duración te suma en prestigio", tiene que poder mostrar de dónde sale ese número.

**[Hex — función Magic](https://hex.tech)**
*Qué es:* una herramienta de análisis de datos donde la IA propone el análisis, pero el código que genera queda a la vista y se puede editar.
*Por qué es el referente clave de arquitectura:* es **exactamente el modelo que planteamos** — el modelo calcula, la IA traduce, y el cálculo queda auditable. Es lo que hace que el asistente de P&P no sea "un ChatGPT pegado al costado", y es defendible frente a cualquier pregunta de la cátedra.

---

## B.3 Glosario

**API** — la forma en que un programa le pide datos a otro por internet. Spotify tenía una para las características de sonido; la cerró en 2024.

**Corpus** — el conjunto completo de canciones con las que el sistema aprende.

**CSV** — un archivo de tabla en texto plano, donde las columnas se separan con comas. Se abre con Excel.

**Dataset** — un archivo con datos ordenados en filas y columnas, como una planilla pero mucho más grande.

**Dump** — una copia completa de una base de datos, publicada como archivo para que otros la usen.

**Entrenar un modelo** — mostrarle al sistema miles de ejemplos con la respuesta puesta, para que aprenda solo qué combinaciones llevan a cada resultado.

**Feature / característica** — una columna que describe algo medible de una canción. "Energía = 0,73" es una característica.

**Grupo de control** — el conjunto de ejemplos "comunes", los que no tienen nada especial. Sirve para que el sistema sepa contra qué comparar.

**Loudness war** — la tendencia de la industria, desde los 90, a masterizar los discos cada vez más fuerte. Hace que las grabaciones de distintas épocas no sean comparables sin ajuste.

**Margen de error** — cuánto puede equivocarse una estimación. "32%, entre 24% y 41%" dice que el valor real probablemente esté en ese rango.

**Matching / cruce** — juntar dos tablas identificando qué fila de una corresponde a qué fila de la otra. Acá: reconocer que "Blinding Lights" en Billboard y "Blinding Lights - Remastered" en el dump son la misma canción.

**Normalizar** — dos sentidos distintos. Con textos: dejarlos en forma estándar (minúsculas, sin acentos) para poder compararlos. Con números: medir cuánto se aparta un valor de su referencia, en vez de usar el valor crudo.

**Parquet** — un formato de archivo pensado para tablas enormes. Ocupa menos que un CSV y se consulta más rápido.

**Parsear** — leer un texto desordenado y extraer de ahí datos ordenados. Lo que hicimos con las páginas de Wikipedia.

**Script** — un programa corto que hace una tarea concreta. Los nuestros están en `pyp/scripts/`.
