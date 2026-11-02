# Diccionario de datos

Qué significa cada columna de cada archivo, qué valores toma y cuándo está vacía.

Todos los rangos y conteos de esta página están **medidos sobre los archivos que están en el repositorio**, no estimados. Se regeneran con `node codigo/auditar_datasets.js`.

Una aclaración sobre los nombres: las columnas mezclan castellano e inglés a propósito. Las que describen **el sonido** conservan el nombre original de Spotify (`danceability`, `energy`, `valence`…) para que se pueda rastrear cada valor hasta su fuente. Las que armamos nosotros van en castellano.

---

## Los cuatro archivos

| Archivo | Filas | Columnas | Qué es |
|---|---|---|---|
| `corpus_v2.csv` | 26.577 | 21 | El principal: canciones premiadas y/o exitosas, con su sonido |
| `control_v2.csv` | 27.000 | 21 | Canciones comunes, el punto de comparación |
| `billboard_canciones.csv` | 32.702 | 6 | Billboard procesado, una fila por canción |
| `grammy_nominaciones.csv` | 2.513 | 5 | Las nominaciones al Grammy, una fila por nominación |

`corpus_v2` y `control_v2` tienen **las mismas 21 columnas en el mismo orden** — verificado — así que se apilan directo: **53.577 canciones**.

---

## `corpus_v2.csv` y `control_v2.csv`

### Identificación

| Columna | Tipo | Qué es | Rango medido |
|---|---|---|---|
| `titulo` | texto | Título de la canción | sin vacíos |
| `artista` | texto | Quién la interpreta | sin vacíos |
| `anio` | entero | Año de referencia de la canción | 1958–2026 (promedio 1990) |

De dónde sale `anio`: **no** del dump de Spotify, porque ahí el año es el de la reedición y para las décadas viejas está mal. Sale de Billboard (primera aparición en el ranking) o del Grammy (año de la nominación). En el control, donde no hay ninguna de las dos, sale del dump — con la salvedad que está más abajo.

### Etiquetas de premio y de éxito

| Columna | Tipo | Qué es | Valores |
|---|---|---|---|
| `grammy_gano` | 0 o 1 | Si ganó al menos un Grammy | 1,2% del corpus |
| `grammy_nominada` | 0 o 1 | Si fue nominada al menos una vez | 6,3% del corpus |
| `grammy_categorias` | texto | En qué categorías, separadas por `\|` | **vacía en 24.913 filas** |
| `mejor_puesto` | entero | Puesto más alto alcanzado en el Hot 100 | 1–100 · **vacía en 593 filas** |
| `semanas_en_chart` | entero | Cuántas semanas estuvo en el ranking | 0–112 |
| `fue_hit` | 0 o 1 | Si entró alguna vez al Hot 100 | 97,8% del corpus |
| `grupo` | texto | A qué grupo pertenece | ver abajo |

**Cuándo están vacías, y por qué no es un error:**

- `grammy_categorias` está vacía en las **24.913** filas del grupo `hit`. Son canciones que nunca fueron nominadas: no hay categoría que poner. En `control_v2` está vacía en las 27.000.
- `mejor_puesto` está vacío en las **593** filas del grupo `premiada`. Son canciones nominadas que nunca entraron al ranking: no alcanzaron ningún puesto. En `control_v2` está vacío en las 27.000.

Los números coinciden exactamente con el tamaño de cada grupo, que es la señal de que el vacío es el correcto y no un dato perdido.

**Valores de `grupo`:**

| Valor | Filas | Qué significa |
|---|---|---|
| `hit` | 24.913 | Entró al Hot 100, nunca fue nominada |
| `ambas` | 1.071 | Premio y éxito a la vez |
| `premiada` | 593 | Nominada al Grammy, nunca entró al ranking |
| `control` | 27.000 | Ni una cosa ni la otra (está en `control_v2.csv`) |

### Cómo suena

Estas once las calculó **Spotify**, no nosotros. Salvo `rareza`, que la calculamos acá.

| Columna | Tipo | Qué mide | Rango medido en el corpus |
|---|---|---|---|
| `danceability` | 0 a 1 | Cuán bailable es: pulso estable, regularidad rítmica | 0 – 0,988 (prom. 0,600) |
| `energy` | 0 a 1 | Intensidad y actividad: rápida, fuerte, ruidosa | 0,002 – 0,997 (prom. 0,615) |
| `valence` | 0 a 1 | Positividad emocional: 1 alegre, 0 triste | 0 – 0,993 (prom. 0,591) |
| `acousticness` | 0 a 1 | Probabilidad de que sea acústica y no eléctrica | 0,0000015 – 0,996 (prom. 0,298) |
| `instrumentalness` | 0 a 1 | Probabilidad de que no tenga voz cantada | 0 – 0,995 (prom. 0,033) |
| `speechiness` | 0 a 1 | Cuánta palabra hablada tiene | 0 – 0,951 (prom. 0,076) |
| `loudness` | decibeles | Volumen promedio | −54,3 – −0,05 dB (prom. −8,6) |
| `tempo` | BPM | Pulsos por minuto | 0 – 241 (prom. 120,7) |
| `mode` | 0 o 1 | Modo: 1 mayor, 0 menor | 72,1% en mayor |
| `duration_ms` | milisegundos | Duración | 31.453 – 1.367.093 (prom. 217.397 ≈ 3:37) |
| `rareza` | ≥ 0 | Cuán lejos está del centro de su año | 0,235 – 2,292 · **vacía en 6.156 filas** |

**`rareza` la calculamos nosotros.** Mide a cuántos desvíos está la canción del promedio de su propio año, en las nueve características continuas a la vez. Un 0,8 es lo normal; arriba de 2 es una canción rara para su época.

Está **vacía en 6.156 filas**, que son **exactamente** todas las anteriores a 1970 — verificado: el mínimo es 1958 y el máximo 1969, y el total de canciones previas a 1970 en el corpus es también 6.156. El motivo es que para calcularla hace falta el promedio de ese año, y la referencia por año solo es confiable desde 1970. No es un dato perdido: es una medición que no se puede hacer.

---

## `billboard_canciones.csv`

Una fila por canción, a partir de las 355.001 filas semanales del Hot 100.

| Columna | Tipo | Qué es | Rango |
|---|---|---|---|
| `titulo` | texto | Título | sin vacíos |
| `artista` | texto | Intérprete tal como lo publica Billboard | sin vacíos |
| `mejor_puesto` | entero | Puesto más alto alcanzado | 1–100 |
| `semanas_en_chart` | entero | Semanas distintas en el ranking | 1–112 |
| `anio_primera_aparicion` | entero | Año en que entró por primera vez | 1958–2026 |
| `apariciones` | entero | Cuántas filas semanales tenía en el original | 1–112 |

Sin vacíos en ninguna columna.

---

## `grammy_nominaciones.csv`

Una fila por nominación. Una canción nominada en tres categorías ocupa tres filas.

| Columna | Tipo | Qué es | Rango |
|---|---|---|---|
| `anio` | entero | Año de la ceremonia | 1959–2026 |
| `categoria` | texto | Categoría del premio | 14 categorías |
| `titulo` | texto | Título de la canción | sin vacíos |
| `artista` | texto | Intérprete | sin vacíos |
| `ganador` | 0 o 1 | Si ganó | 488 ganadoras de 2.513 |

---

## Límites conocidos de estos datos

Cosas medidas, no sospechadas. Si alguien encuentra estos números raros, ya sabemos por qué.

**1. El control acumula canciones viejas en 1970.** El grupo de control arranca en 1970, y el año que trae el dump de Spotify para las grabaciones viejas es el de la reedición, no el de la grabación. Resultado: **2.058 de las 4.500 canciones de la década del 70 caen en el año 1970**, casi la mitad, y al mirarlas se ve que varias son más viejas — *Strange Brew* de Cream es de 1967, *I'll Try Something New* de las Supremes es de los sesenta.

**El año de esas filas hay que leerlo como "1970 o antes", no como 1970 exacto.** Las otras cinco décadas no tienen este problema: su reparto por año es el esperable.

**2. Doce canciones tienen `tempo` en 0.** Una en el corpus (*Hello, Dolly!* de Louis Armstrong) y once en el control. Un tempo de 0 BPM no existe: es el detector de Spotify que falló. Son 12 filas sobre 53.577, el 0,02%.

**3. Ocho canciones aparecen dos veces en el corpus.** Todas del grupo `ambas`, en varios casos con dos años distintos porque entraron al ranking en un año y fueron nominadas en otro — *Born in the U.S.A.* figura como 1984 y como 2026, *Beautiful* de Christina Aguilera como 2002 y 2011. Son 8 filas sobre 26.577.

**4. El algoritmo de Spotify es una caja negra.** Nunca publicaron cómo calculan estos once valores, así que no se pueden reproducir desde cero ni auditar. Se usan como vienen.

---

## Corregido el 26 de septiembre de 2026

Tres problemas del archivo de nominaciones que estaban documentados acá como límites y ya no lo son.

**Faltaban 20 artistas.** Cuando dos canciones comparten intérprete, Wikipedia usa `rowspan` y la segunda fila no trae la celda del artista; el parser no lo manejaba y las columnas se corrían. Se sumaba un segundo caso: los nombres escritos con la plantilla `{{sort|Adele}}`, que el limpiador de texto borraba entera. **Ahora no falta ninguno** — entre los recuperados, *Billie Jean* (Michael Jackson) y *Circle of Life* (Elton John).

**Había una fila fantasma.** Una plantilla de cita de Wikipedia se parseaba como si fuera una nominación de 2024 en Best Rock Song. Por eso el total pasó de 2.514 a **2.513**: no se perdió una nominación, se eliminó una que nunca existió.

**Algunos títulos arrastraban una comilla suelta** — `Layla" (Unplugged Version)`. Ya no.

> ⚠️ **`corpus_v2.csv` todavía no incorpora estas correcciones.** Se armó cruzando la versión anterior del archivo de nominaciones, así que las 20 canciones cuyo artista faltaba siguen sin cruzar contra su sonido. Para incorporarlas hay que volver a correr `cruzar.js` y `armar_corpus_v2.js`, que necesitan el parquet de 4,1 GB.

---

## La ventana de la herramienta: desde el año 2000

Los archivos de esta carpeta tienen **todas las canciones, de 1958 a 2026**. Sirven para el análisis, que mide un cambio a lo largo de las décadas.

**La herramienta usa solo las que son del año 2000 en adelante**, y están en `datasets_procesados/`:

| | Todo | Desde 2000 |
|---|---|---|
| `corpus_v2.csv` | 26.577 | **9.903** |
| `control_v2.csv` | 27.000 | **13.500** |
| | | **23.403 en total** |

**Por qué el corte.** Hasta los 2000, las canciones premiadas eran más melancólicas que los hits. En los 2010 se emparejaron y en los 2020 se dio vuelta: hoy las premiadas son levemente más alegres. Son dos reglas opuestas, y entrenar con las dos épocas le enseña al modelo el promedio de ambas, que no describe bien a ninguna.

Hay un segundo motivo: las mezclas modernas suenan más fuerte, así que con todas las épocas juntas el volumen sumaba prestigio cuando en realidad estaba midiendo "canción reciente".

---

## Cómo se arman los dos ejes con estas columnas

### El eje de popularidad

Usa tres columnas: `fue_hit`, `mejor_puesto` y `anio`.

Son dos preguntas encadenadas:

1. **¿Entra al chart?** — sale directo de `fue_hit`
2. **Si entra, ¿hasta dónde?** — sale de `mejor_puesto`, invertido y estirado en la punta

La inversión es necesaria porque en el chart el 1 es lo mejor, y un puntaje tiene que ser alto cuando le va bien. El estirado es porque los puestos no cuestan lo mismo: del 11 al 100 hay unas 300 canciones por puesto, y en el top 10 se dispara.

| Puesto | Puntaje |
|---|---|
| 1 | 100 |
| 10 | 50 |
| 50 | 15 |
| 100 | 0 |
| No entró | 0 |

`anio` **no es popularidad**: es el contexto para normalizar por época.

**Qué no usamos, y por qué:** `semanas_en_chart` quedó afuera porque cambió demasiado de significado — su mediana pasó de 17 semanas en los 2000 a 2 en los 2020, porque el streaming llena el chart de temas que entran una semana y desaparecen.

### El eje de prestigio

Usa dos columnas: `grammy_categorias` y `anio`.

Una sola pregunta binaria: **¿está nominada en una categoría general o no?**

| Grupo | Cómo se arma | Canciones desde 2000 |
|---|---|---|
| **Reconocidas** | `grammy_categorias` contiene "Record of the Year" o "Song of the Year" | **213** |
| **Grupo de comparación** | `grammy_categorias` está vacía **y** `fue_hit` es 1 | **8.883** |
| **Fuera de este eje** | `grammy_categorias` tiene algo, pero ninguna de las dos generales | 807 |

Esas 807 no van ni arriba ni abajo. No van arriba porque las categorías de género miden género: las nominadas a Best Metal Performance tienen energía 0,94 y acústica 0,002. Y no van abajo porque sería mentira: 126 de ellas ganaron un Grammy. **Se siguen usando normal para el eje de popularidad.**

**`grammy_gano` no se usa en este eje.** Medimos si ganar suena distinto de estar nominada y la diferencia es de 0,04 en acústica, y para el lado contrario — menos de la mitad de la brecha que sí importa. Con 71 ganadoras, distinguirlas sería inventar una precisión que los datos no tienen.

**Nota para quien mire los pesos del modelo:** la valencia va a aparecer en casi cero. No es un error. Con el corte en 2000 quedan mezclados los dos regímenes opuestos —antes las premiadas eran más tristes, ahora más alegres— y se cancelan solos. Lo que de verdad separa a las premiadas es que son **más acústicas, menos enérgicas y más largas**.
