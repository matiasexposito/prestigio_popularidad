# Guía de los cuatro archivos de datos

> Para alguien que abre la carpeta **PyP-datos** y no sabe nada del proyecto.
>
> Explica qué es cada archivo, de dónde salió, qué tiene adentro y cómo leerlo. No hace falta saber nada de programación ni de datos.
>
> 7 de septiembre de 2026

---

## Antes que nada: qué es este proyecto

**P&P (Prestigio & Popularidad)** es una aplicación web donde un músico sube su canción y recibe dos puntajes:

- **Prestigio** — cuánto se parece al tipo de canción que el Grammy premia
- **Popularidad** — cuánto se parece al tipo de canción que triunfa comercialmente

La idea de fondo es que **esos dos mundos casi nunca coinciden**. Hay canciones que ganan premios y canciones que llenan estadios, y rara vez son las mismas. La app no predice nada: te muestra dónde está parada tu canción entre esos dos polos, y qué la acerca o la aleja de cada uno.

### Y por qué hacen falta estos archivos

Para que la app pueda decir *"tu canción se parece un 32% al perfil del Grammy"*, primero hay que enseñarle **cómo suena** cada uno de esos dos mundos.

Se le enseña igual que se le enseñaría a una persona a distinguir vinos: no con teoría, sino haciéndole probar **miles de ejemplos con la respuesta puesta**. Esta canción ganó un Grammy. Esta fue un hit. Esta no fue ninguna de las dos.

**Estos cuatro archivos son esos ejemplos.**

---

## Los cuatro archivos, de un vistazo

| Archivo | Filas | Qué es |
|---|---|---|
| `billboard_canciones.csv` | 32.702 | Todas las canciones que entraron al ranking de más escuchadas de EE.UU. desde 1958 |
| `grammy_nominaciones.csv` | 2.513 | Todas las nominaciones al Grammy desde 1959 |
| **`corpus_v2.csv`** | **26.577** | **El archivo principal.** Las dos listas anteriores, ya cruzadas y con las características del sonido de cada canción |
| **`control_v2.csv`** | **27.000** | Canciones comunes: ni premiadas ni exitosas. Sirven de punto de comparación |

Los **dos primeros son las materias primas**. Los **dos últimos son el producto terminado**, y son los que usa el sistema para aprender.

### Cómo se relacionan

```
   Billboard              ──►  billboard_canciones.csv ─┐
   (ranking semanal)                                    │
                                                        ├──►  corpus_v2.csv
   Wikipedia              ──►  grammy_nominaciones.csv ─┘     (26.577 canciones
   (14 páginas de premios)                                     con premio, éxito
                                                               o ambos)
   Base de sonido         ──────────────────────────────────►  control_v2.csv
   (56 millones de canciones)                                  (27.000 comunes)
```

Los dos archivos finales tienen **exactamente las mismas columnas**, así que se pueden juntar en una sola tabla: **53.577 canciones** en total para que el sistema aprenda.

---

# Archivo 1 — `billboard_canciones.csv`

**32.702 filas · 6 columnas · 1,5 MB**

## Qué es

El **Billboard Hot 100** es el ranking semanal de las 100 canciones más escuchadas en Estados Unidos. Existe sin interrupción desde agosto de 1958, y es la referencia de éxito comercial más antigua y más consistente que hay.

Este archivo tiene **una fila por canción**, con el resumen de todo su paso por ese ranking.

## De dónde salió

De un repositorio público en GitHub que lo mantiene actualizado. Descarga directa, gratis, sin cuenta.

El archivo original tiene **355.001 filas**, porque registra cada canción **una vez por semana**: si una canción estuvo 30 semanas en el ranking, aparece 30 veces. Lo resumimos a una fila por canción.

## Las columnas

| Columna | Qué dice | Ejemplo |
|---|---|---|
| `titulo` | Nombre de la canción | Blinding Lights |
| `artista` | Quién la canta | The Weeknd |
| `mejor_puesto` | El puesto más alto que alcanzó, de 1 a 100 | 1 |
| `semanas_en_chart` | Cuántas semanas estuvo en el ranking | 90 |
| `anio_primera_aparicion` | El año en que entró por primera vez | 2019 |
| `apariciones` | Cuántas veces figura en el archivo original | 90 |

## Qué mirar si lo abrís

- **`mejor_puesto` = 1** significa que fue número uno del país. Hay **1.196** canciones así en toda la historia.
- **`semanas_en_chart`** es la medida de cuánto duró el éxito. El récord del archivo son **112 semanas**, más de dos años.
- Un puesto 1 con 4 semanas y un puesto 12 con 60 semanas son éxitos muy distintos. Por eso guardamos las dos columnas y no solo el puesto.

> **Por qué Billboard y no la cantidad de reproducciones en Spotify.** Es la decisión más importante de todo el proyecto. Las reproducciones existen desde 2015 más o menos: **no hay forma de saber cuántas veces se reprodujo una canción en 1967**. Billboard es la única medida de éxito comercial que existe en las seis décadas que queremos comparar, y siempre se midió igual.

---

# Archivo 2 — `grammy_nominaciones.csv`

**2.513 filas · 5 columnas · 147 KB**

## Qué es

Todas las canciones **nominadas** al Grammy —no solo las ganadoras— entre 1959 y 2026, en 14 categorías.

Cada fila es **una nominación**. Si una canción fue nominada en tres categorías, aparece tres veces.

## De dónde salió

**Lo armamos nosotros.** Buscamos listas ya hechas y ninguna servía: las de Kaggle exigen crear una cuenta y varias traen solo ganadores, y la mejor que encontramos en GitHub solo cubría del 2000 al 2022.

Wikipedia tiene una página por cada categoría del Grammy, con una tabla de todos los años y todos los nominados. Escribimos un programa que baja esas páginas y las convierte en tabla. Es gratis, no pide cuenta, y es la fuente más completa que existe para los años viejos.

## Las columnas

| Columna | Qué dice | Ejemplo |
|---|---|---|
| `anio` | Año de la ceremonia | 1959 |
| `categoria` | En qué categoría compitió | Record of the Year |
| `titulo` | Nombre de la canción | Nel Blu Dipinto Di Blu (Volare) |
| `artista` | Quién la canta | Domenico Modugno |
| `ganador` | 1 si ganó, 0 si solo fue nominada | 1 |

## Las 14 categorías

| Categoría | Nominaciones |
|---|---|
| Song of the Year | 370 |
| Record of the Year | 367 |
| Best Country Song | 317 |
| Best R&B Song | 291 |
| Best Alternative Music Album | 178 |
| Best Rock Song | 177 |
| Best Metal Performance | 175 |
| Best Melodic Rap Performance | 126 |
| Best Rap Song | 116 |
| Best Rap Performance | 88 |
| Best Rock Performance | 80 |
| Best Pop Solo Performance | 77 |
| Best Pop Duo/Group Performance | 76 |
| Best Country Solo Performance | 76 |

**Las dos primeras son distintas de todas las demás.** *Record of the Year* y *Song of the Year* premian una canción **sin importar el género**: son las que representan el gusto general de la Academia. Las otras doce premian dentro de un estilo.

Esa diferencia importa: si uno mide "lo que premia la Academia" mezclando todas las categorías, el resultado sale distorsionado. El metal es ruidoso por definición, así que meterlo en la misma bolsa que una balada no mide prestigio, mide que el metal es ruidoso.

## Qué mirar si lo abrís

- De las 2.513 nominaciones, **488 ganaron**.
- La primera fila es de 1959: *Volare*, de Domenico Modugno, ganadora de Record of the Year en la primera entrega de la historia.

> **Por qué nominados y no solo ganadores.** Ganadores de Canción del Año hay unos **60 en toda la historia**. Con 60 ejemplos un sistema no aprende nada: se los memoriza y después falla con todo lo demás. Sumando los nominados pasamos de 60 a 2.513, **cuarenta veces más material**. Y es más correcto: una nominación ya es reconocimiento de la Academia. Que gane una de las cinco finalistas depende de campaña, sello y política, cosas que ningún dato sobre el sonido puede capturar.

---

# Archivo 3 — `corpus_v2.csv` ← el principal

**26.577 filas · 21 columnas · 3,1 MB**

## Qué es

**El archivo más importante de los cuatro.** Es el resultado de cruzar los dos anteriores contra una base de 56 millones de canciones que tiene, para cada una, **números que describen cómo suena**.

Cada fila es una canción con tres cosas juntas:

1. **Quién es** — título, artista, año
2. **Qué le pasó** — si ganó o fue nominada al Grammy, y qué puesto alcanzó en Billboard
3. **Cómo suena** — diez números que describen su sonido

Esa combinación es la que permite que el sistema encuentre el patrón.

## Los cuatro grupos

La columna `grupo` resume de un vistazo qué es cada canción:

| Grupo | Canciones | Qué son |
|---|---|---|
| `hit` | 24.913 | Entraron al ranking, nunca fueron nominadas |
| `ambas` | 1.071 | **Premio y éxito a la vez.** Las raras |
| `premiada` | 593 | Nominadas al Grammy, nunca entraron al ranking |

Ese grupo `ambas` de 1.071 canciones es interesante por sí solo: es la prueba de qué tan poco frecuente es lograr las dos cosas.

## Las columnas

**Identidad y resultados** (las primeras diez):

| Columna | Qué dice |
|---|---|
| `titulo`, `artista`, `anio` | Quién es y de cuándo |
| `grammy_gano` | 1 si ganó, 0 si no |
| `grammy_nominada` | 1 si fue nominada, 0 si no |
| `grammy_categorias` | En qué categorías compitió |
| `mejor_puesto` | Su mejor posición en Billboard |
| `semanas_en_chart` | Cuántas semanas duró en el ranking |
| `fue_hit` | 1 si entró alguna vez al ranking |
| `grupo` | `hit`, `ambas` o `premiada` |

**Cómo suena** (las últimas once) — ver la sección siguiente.

## Un ejemplo real del archivo

```
titulo             Nasty
artista            Ariana Grande
anio               2020
grupo              hit
mejor_puesto       49          ← llegó al puesto 49
semanas_en_chart   1           ← duró una sola semana
grammy_nominada    0           ← no fue nominada
energy             0.506
valence            0.456       ← ni alegre ni triste
danceability       0.772       ← muy bailable
duration_ms        200732      ← 3 minutos 20 segundos
```

---

# Archivo 4 — `control_v2.csv`

**27.000 filas · 21 columnas · 3,3 MB**

## Qué es

Canciones **comunes**: no ganaron nada y nunca fueron un éxito. Tiene exactamente las mismas columnas que el archivo anterior.

## Por qué existe — y es lo que más cuesta explicar

Parece que con los premiados y los exitosos ya alcanzaría. **No alcanza.**

Si al sistema solo le mostramos canciones ganadoras y canciones exitosas, **nunca ve cómo suena una canción normal**, y entonces no tiene contra qué comparar. Todo lo que le entre va a puntuar alto en algo.

> Es como enseñarle a alguien a reconocer caras famosas mostrándole únicamente fotos de famosos. Cuando le muestres a un desconocido, va a decir que también es famoso — porque nunca vio cómo se ve alguien que no lo es.

Sin este archivo, los dos puntajes de la app **no significarían nada**. Y lo peor es que no se notaría: los números saldrían, se verían razonables, el gráfico se dibujaría bien. El error sería invisible desde la pantalla.

## De dónde salieron

De la misma base de 56 millones de canciones. Todas las que están ahí y **no** aparecen ni en Billboard ni en Grammy son, por definición, canciones que no ganaron ni fueron hit. De esas quedaron 8,9 millones de candidatas, y tomamos **4.500 por década desde 1970**, para que ninguna época domine.

## Un detalle que hubo que resolver

La base de Spotify no tiene solo música: tiene **audiolibros, ruido blanco para dormir, y grabaciones de meditación**. En el primer intento se coló un audiolibro infantil alemán y un track de sonidos para dormir bebés.

Eso habría arruinado todo: el sistema habría aprendido que "no ser un hit" significa "ser palabra hablada", que es facilísimo de detectar. Se habría visto muy preciso y habría sido completamente inútil.

Se filtró: fuera lo que tiene más de dos tercios de palabra hablada, lo que dura menos de un minuto o más de quince, y los artistas de fábrica tipo *"White Noise Baby Sleep"*.

## Un ejemplo real del archivo

```
titulo             Everybody Wants to Rule the World
artista            No BS! Brass          ← una banda de bronces, no Tears for Fears
anio               2017
grupo              control
mejor_puesto       (vacío)               ← nunca entró al ranking
semanas_en_chart   0
grammy_nominada    0
energy             0.545
instrumentalness   0.782                 ← casi sin voz, es instrumental
```

---

# Las once columnas de sonido

Estas son las que aparecen en los dos archivos grandes. **Casi todas van de 0 a 1**, donde 0 es nada y 1 es el máximo.

## Antes que nada: ¿quién analizó las canciones?

Es la pregunta que más se hace y conviene tenerla clara: **nosotros no analizamos ninguna canción. El análisis lo hizo Spotify.**

La cadena, en cuatro pasos:

1. **Spotify analizó el audio.** Durante años su sistema procesó cada canción de su catálogo y calculó automáticamente estos valores — energía, valencia, acústica y el resto. Lo hacía para sus propias recomendaciones, no para nosotros.
2. **Los publicaba por su API.** Cualquier programador podía preguntarle "dame las características de esta canción" y Spotify devolvía los números.
3. **Alguien los cosechó.** Un usuario de HuggingFace le pidió a esa API los datos de millones de canciones y armó una tabla con todo. Ese es el archivo que bajamos.
4. **En noviembre de 2024 Spotify cerró el acceso.** Las aplicaciones nuevas ya no pueden pedir esos datos. Por eso ese archivo es la única vía que queda: es una foto tomada antes del cierre.

> **Cómo decirlo con precisión.** El archivo de origen tiene 56 millones de canciones, pero eso es el tamaño de la fuente, no de nuestro trabajo: usamos 8,9 millones como referencia de época y 53.577 como material de aprendizaje. Decir "analizamos 56 millones de canciones" sería falso, y la primera pregunta sobre cómo se hizo eso en una computadora dejaría sin respuesta.

**Y una limitación honesta:** nunca pudimos verificar el algoritmo de Spotify. Confiamos en que su "energía 0,82" mide lo que dice medir, pero es una caja negra — nunca publicaron cómo lo calculan. Si alguien pregunta "¿cómo se calcula la energía?", la respuesta correcta es "con el método propietario de Spotify, que no es público".

## Las columnas, una por una

Están ordenadas por **cuánto sirven para distinguir** una canción premiada de un hit — eso está medido, no supuesto:

| Columna | Qué mide, en criollo | Ejemplo | Sirve |
|---|---|---|---|
| `energy` | Qué tan intensa y activa suena | Metal ≈ 0,95 · balada de piano ≈ 0,15 | **mucho** |
| `valence` | Qué tan **alegre** suena. No la letra: el sonido | Canción de fiesta ≈ 0,9 · melancólica ≈ 0,2 | **mucho** |
| `acousticness` | Si usa instrumentos reales o electrónicos | Guitarra y voz ≈ 0,9 · electrónica ≈ 0,02 | **bastante** |
| `duration_ms` | Cuánto dura, en milésimas de segundo | 200.000 = 3 min 20 s | **bastante** |
| `danceability` | Qué tan regular y marcado es el ritmo | Reguetón ≈ 0,85 · rock progresivo ≈ 0,3 | algo |
| `loudness` | Volumen promedio en decibeles. Es negativo: cuanto más cerca de cero, más fuerte | Pop moderno ≈ −5 · grabación de los 60 ≈ −13 | algo |
| `speechiness` | Cuánta palabra hablada tiene, en vez de cantada | Rap ≈ 0,3 · pop ≈ 0,04 | algo |
| `tempo` | Velocidad, en pulsos por minuto | Balada ≈ 70 · house ≈ 128 | poco |
| `mode` | 1 si está en modo mayor, 0 si es menor | Mayor suele sonar alegre; menor, triste | casi nada |
| `instrumentalness` | Probabilidad de que no tenga voz cantada | Instrumental ≈ 0,9 · canción normal ≈ 0,0 | casi nada |
| `rareza` | **Calculada por nosotros.** Cuán distinta es de todo lo que se publicó ese año | 0,5 = del montón · 2,0 = muy rara | poco |

**Las cuatro primeras son las que explican el resultado.** Las canciones premiadas son, en promedio, **menos enérgicas, más melancólicas, más acústicas y más largas** que los hits. Eso es el hallazgo central del proyecto, y sale de estas cuatro columnas.

> **Sobre la rareza.** La agregamos para probar una idea propia: que quizá la Academia premia lo que se sale de la norma. **No se sostuvo** — las premiadas son igual de comunes que los hits. Es un resultado negativo y lo dejamos escrito como tal. La columna se queda porque igual es información interesante para el usuario: *"tu canción es más rara que el 90% de lo que se publicó este año"* es algo que un músico quiere saber.

---

# Sobre las celdas vacías

Al abrir los archivos en Excel se ven columnas con celdas en blanco. **Ninguna es un error.** Cada una está vacía por un motivo:

| Columna | Vacía en | Por qué |
|---|---|---|
| `grammy_categorias` | Todo el control, y el 94% del corpus | Son canciones que **nunca fueron nominadas**. No hay categoría que poner |
| `mejor_puesto` | Todo el control, y 593 del corpus | Son canciones que **nunca entraron al ranking**. Dejarlo vacío es lo correcto: poner un 0 o un 101 sería **inventar una posición que no existe** |
| `rareza` | 6.156 del corpus (23%) | Son las **anteriores a 1970**. La rareza se mide comparando contra la música de cada año, y para los años viejos no tenemos una referencia confiable |

Una distinción que vale la pena: **`semanas_en_chart` dice 0, no está vacía**. Es a propósito. Vacío significa *"no sabemos"*; cero significa *"sabemos que fue ninguna"*. Una canción que nunca entró al ranking efectivamente estuvo cero semanas ahí, y eso es un dato.

---

# Cómo verificar que los archivos están bien

Si querés comprobarlo por tu cuenta, abrilos en Excel y mirá esto:

1. **`corpus_v2.csv` — filtrá por `grupo`.** Tienen que aparecer exactamente tres valores: `hit` (24.913), `ambas` (1.071) y `premiada` (593).
2. **`control_v2.csv` — la columna `grupo`** tiene que decir `control` en las 27.000 filas, y `grammy_nominada` y `fue_hit` tienen que ser 0 en todas.
3. **Buscá una canción que conozcas** en `corpus_v2.csv`. Si buscás *Rolling in the Deep* de Adele, tiene que figurar como `ambas`, con `mejor_puesto` 1 y `grammy_gano` 1.
4. **Los años.** El corpus va de 1958 a 2026; el control, de 1970 a 2025.

> **Nota para Excel:** los números usan **punto** decimal (0.506, no 0,506) porque salieron de una herramienta en inglés. Si Excel te los muestra como texto o los convierte en fechas, importalos con *Datos → Obtener datos → Desde archivo de texto* eligiendo el punto como separador decimal.

---

# Glosario

**CSV** — un archivo de tabla en texto plano, donde las columnas se separan con comas. Se abre con Excel haciendo doble clic.

**Corpus** — el conjunto de canciones con las que el sistema aprende.

**Grupo de control** — el conjunto de ejemplos comunes, los que no tienen nada especial. Sirve para que el sistema sepa contra qué comparar.

**Billboard Hot 100** — el ranking semanal de las 100 canciones más escuchadas en Estados Unidos. Existe desde 1958.

**Nominación** — que la Academia haya elegido una canción entre las finalistas de una categoría, haya ganado o no.

**Valencia** — qué tan alegre suena una canción. No la letra: el sonido. Va de 0 a 1.

**Milisegundos** — milésimas de segundo. `duration_ms = 200000` son 200 segundos, o sea 3 minutos y 20.
