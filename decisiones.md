# P&P — registro de decisiones

Qué probamos, qué descartamos y por qué. Incluye los errores que cometimos y cómo los encontramos, porque en varios casos el error explica mejor la decisión final que la decisión sola.

---

## 18 de agosto de 2026 — Elección de las fuentes

### Descartado: pedirle los datos a Spotify directamente

En **noviembre de 2024 Spotify cerró el acceso** a las características de audio para las aplicaciones nuevas. Una app creada hoy no se las puede pedir.

Y aunque estuviera abierto no alcanzaría: **la canción que sube el usuario puede ser un demo sin publicar**, que no existe en Spotify. Analizar el audio con nuestras propias herramientas no es un plan B, es el único plan que cumple lo que la app promete.

### Descartado: medir el éxito con reproducciones en vez de Billboard

Es la decisión más importante de todo el proyecto.

Los datos de reproducciones existen desde 2015 más o menos. **No hay forma de saber cuántas veces se reprodujo una canción en 1967** — el concepto no existía. Como la hipótesis compara seis décadas, hace falta una medida que exista en las seis y se haya medido siempre igual. Billboard es la única.

Además da una medida **gradual**: llegar al puesto 3 y quedarse 20 semanas no es lo mismo que asomar al 87 durante dos, y esa diferencia queda registrada.

### Descartados: dos datasets de Grammy

| Opción | Por qué no |
|---|---|
| Datasets de Kaggle | Exigen crear cuenta, y varios traen **solo ganadores** |
| `pezon/music-mining` | Parecía ideal: ya venía cruzado con características y premios. Pero **solo cubre 2000-2022**, con 457 nominados. Sin las seis décadas la hipótesis no se puede ni probar ni refutar |

**Decisión:** armarlo nosotros parseando Wikipedia, que tiene una página por categoría con todos los años y todos los nominados.

### Descartados: dos dumps de características

| Opción | Por qué no |
|---|---|
| `maharshipandya/spotify-tracks-dataset` | Cómodo (13 MB, 114.000 canciones) pero **no tiene el año**. Sin año no se puede comparar 1965 con 2025 |
| `ozefe/spotify_audio_features` | 12 GB y 255 millones de canciones: más de lo necesario y mucho más pesado de manejar |

**Elegido:** `GildasLeDrogoff/spotify-huge-track-analysis-dataset` — tiene año, artista, título y las características, con un tamaño manejable.

### Decisión: usar nominados, no solo ganadores

Ganadores de Canción del Año hay unos **60 en toda la historia**. Con 60 ejemplos un sistema no aprende: memoriza esos 60 y falla con todo lo demás. Sumando nominados pasamos a **2.513** — cuarenta veces más material.

Y es más correcto conceptualmente: la hipótesis habla del perfil que la Academia reconoce, y una nominación ya es reconocimiento. Que gane una de las cinco finalistas depende de campaña, sello y política, cosas que ningún dato acústico puede capturar.

## 18 de agosto de 2026 — Problemas al cruzar los datos

### Error nuestro: la columna de artista traía al productor

La primera versión del programa que parsea Wikipedia devolvía `It's Too Late — Lou Adler, producer` en vez de **Carole King**, que es quien la canta.

El motivo: las categorías no comparten estructura de tabla. *Record of the Year* es `Año | Grabación | Artista | Equipo de producción`, y *Song of the Year* es `Año | Canción | Compositores | Artista`. Tomar "la última columna" da el productor en un caso y el artista en el otro.

**Por qué importaba:** con el productor en lugar del artista, el cruce contra las características habría fallado casi entero y no habríamos sabido por qué.

**Solución:** leer los encabezados de cada tabla para identificar la columna correcta.

### Cada canción aparecía muchas veces

Tres versiones de *Bohemian Rhapsody* en el dump: dos remasterizaciones y una toma en vivo, con **energía 0,85 en vivo contra 0,40 en estudio**.

**Solución:** una sola versión por canción. Se descartan las que dicen "live", "remix", "karaoke", "cover", "instrumental" o "demo", y entre las que quedan se elige la más popular. De 56 millones de filas quedaron 43.618.889 canciones únicas.

## 18 de agosto de 2026 — El grupo de control

### Decisión: agregar un tercer grupo que no estaba en el plan original

Con Grammy y Billboard tenemos las que ganaron y las que fueron éxito. Parece completo y no lo es.

Si al sistema solo le mostramos ganadoras y exitosas, **nunca ve cómo suena una canción normal** y no tiene contra qué comparar. Es como enseñarle a alguien a reconocer caras famosas mostrándole únicamente famosos: cuando le mostrás a un desconocido, dice que también es famoso.

Sin este grupo los dos puntajes **no significan nada**, y lo peor es que no se nota: los números salen, se ven razonables, el gráfico se dibuja bien.

**Armado:** 27.000 canciones, 4.500 por década desde 1970.

## 18–19 de agosto de 2026 — Análisis

### Error nuestro: medir el prestigio mezclando categorías de género

El primer cálculo daba que las premiadas tienen **más** energía que los hits, lo contrario de la hipótesis. El motivo apareció al abrir por categoría:

| Categoría | Energía media |
|---|---|
| Best Metal Performance | 0,93 |
| Best Rock Song | 0,76 |
| **Record of the Year** | **0,55** |
| **Song of the Year** | **0,44** |

El metal es ruidoso por definición. Meterlo en la bolsa de "lo que premia la Academia" no mide prestigio: mide que el metal es ruidoso.

**Solución:** el perfil de prestigio se calcula **solo con Record of the Year y Song of the Year**, que premian una canción sin importar el género.

### Decisión: normalizar por época

Una grabación de 1965 y una de 2024 no son comparables sin más: en el medio pasó la *loudness war* y un cambio completo de prácticas de mastering. Parte de cualquier diferencia que midamos sería **tecnología de grabación, no música**.

**Solución:** comparar cada canción contra lo que sonaba **en su propio año**. La referencia son 8,9 millones de canciones agrupadas por año — unas 40.000 por año.

Además evita un error grave en la app: sin esto el sistema aprende que "prestigio = suena a grabación vieja" y le baja el puntaje a cualquier canción de 2026 por cómo está producida.

## 3–7 de septiembre de 2026 — Selección de características

### Sacada: la tonalidad

Venía como un número del 0 al 11 (Do es 0, Do# es 1). El modelo lo leería como una **cantidad** y creería que el 11 está lejos del 0, cuando musicalmente Si y Do son vecinos. No aportaba información: metía ruido.

### Sacada: "en vivo"

Al deduplicar sacamos a propósito las tomas en vivo, así que en el corpus casi no varía — solo el 0,8% pasa de 0,8. Separaba 0,128, de las más bajas.

### Agregada y refutada: la rareza

La agregamos como hipótesis propia: **quizá la Academia premia lo que se sale de la norma.** Mide cuán lejos está una canción del centro de su propio año, en las nueve características continuas a la vez.

**No se sostiene.** Separación **0,077**, la más baja de todas, y en dirección contraria a lo esperado: las premiadas generales son ligeramente *menos* raras (0,768) que los hits (0,785). Por década no hay tendencia.

La medida en sí funciona — las canciones que salieron como más raras son coherentes: *Baile Inolvidable* de Bad Bunny (una salsa en el Hot 100), *Honeycomb* de Deafheaven (blackgaze), *Junk Food Junkie* de Larry Groce (novelty). Mide rareza de verdad; la rareza no predice premios.

**Explicación probable:** la métrica es **ciega a la dirección**. Mide distancia al centro sin importar hacia dónde, así que una canción muy acústica y una muy electrónica dan la misma rareza alta siendo opuestas. Si las premiadas son raras hacia lo acústico y los hits hacia lo enérgico, las dos rarezas se cancelan.

**Se queda en el corpus** igual: ya está calculada y como información al usuario sirve — *tu canción es más rara que el 90% de lo que se publicó este año* es algo que un músico quiere saber aunque no prediga premios.

## 9–14 de septiembre de 2026 — Prototipo de baja fidelidad

### Decisión: el color codifica una sola cosa

En las ocho pantallas, **azul = el modelo calcula, ámbar = la IA interpreta**, y todo lo demás en grises. Así se ve de un vistazo dónde interviene la IA sin leer una palabra.

Es la decisión de diseño que sostiene el requisito de la entrega: evidenciar cómo interviene la IA en el proceso.

### Descartadas: siluetas de artistas en la portada

Se probaron dos veces y no llegaron a una calidad aceptable — quedaban como pictogramas de cartel de baño, no como siluetas de artistas. Una portada con figuras mediocres abarata un prototipo que por lo demás está prolijo.

Tampoco se usó la silueta de ningún artista identificable: son imágenes registradas y sus sucesiones las licencian, y además habrían sesgado la lectura del proyecto hacia un artista en particular.

**Decisión:** portada limpia, solo el nombre y el botón.

### Ideas evaluadas y descartadas para más adelante

**Agregar reproducciones de la canción como característica.** Descartado: el eje de popularidad *es* el éxito comercial, así que darle las reproducciones al modelo es predecir el resultado con el resultado. Daría 97% de acierto y sería una tautología. Además el usuario sube un demo sin publicar, que tiene cero reproducciones — el dato falta justo cuando la app se usa.

**Agregar seguidores del artista.** Menos circular que lo anterior, pero el número de hoy no es el de la época (Michael Jackson tiene millones de seguidores en 2026; eso no dice nada sobre 1984), se lleva puesta la explicación de todo lo demás, y sobre todo **dejaría de probar la hipótesis**: el proyecto pregunta si el *sonido* separa los dos mundos.

Ambos sirven **como contexto en la interfaz**, no como variables del modelo.

**Comparación por género.** Sería la mejora más grande para la utilidad real —decirle a una banda de metal "bajá la energía" es un consejo inútil—, pero el dump no trae género y habría que traerlo de MusicBrainz o Discogs y volver a cruzar.

## 29 de septiembre de 2026 — Estructura del repositorio

### Decisión: adoptar la estructura de carpetas de la cátedra

Se reorganizó el repositorio siguiendo la plantilla de la materia, sin borrar ni renombrar ningún dataset.

- `scripts/` pasó a llamarse `codigo/`. Se actualizaron las rutas en el readme, el diccionario, los comentarios de uso de cada script y el `.gitignore`.
- Los prototipos por integrante van en `diseno/prototipos/prototipo_<nombre>/`, en vez de una carpeta `estudiantes/` aparte.
- `diseno/` deja de estar ignorado: la cátedra pide versionar referencias y prototipos.

### Decisión: los CSV quedan en `datasets/`

La plantilla separa originales (`datasets/`) de procesados (`datasets_procesados/`). Nuestros cuatro CSV ya son el resultado de procesar las fuentes, pero **los originales no entran al repositorio**: el dump de características pesa 4,1 GB y Billboard son 355.001 filas semanales. Mover los CSV habría obligado a cambiar rutas en todos los scripts y documentos sin ganar nada, así que se quedan donde están. `datasets_procesados/` queda para recortes futuros.


## 13 de octubre de 2026 — Análisis de audio en la app

### Decisión: Essentia.js en lugar de librosa

El plan era analizar el audio del usuario con librosa. Lo cambiamos por **Essentia.js**, la versión para navegador de Essentia (Music Technology Group, Universitat Pompeu Fabra).

| | librosa | Essentia.js |
|---|---|---|
| Dónde corre | Python: necesita un servidor | En el navegador, sin servidor (WebAssembly) |
| Tempo, tonalidad, volumen | Sí | Sí |
| Valencia, acústica, instrumentalidad | No: hay que inventar fórmulas | Sí, con modelos ya entrenados (paso 2) |
| Privacidad | El audio viaja a un servidor | El audio no sale de la computadora del usuario |

La última fila importa: la app promete "tu archivo se analiza y se descarta", y con Essentia.js el archivo ni siquiera sale del navegador.

### Paso 1: tempo, modo, volumen y bailabilidad

Algoritmos de Essentia sin modelos de IA: `RhythmExtractor2013` (tempo), `KeyExtractor` (tonalidad mayor/menor), `LoudnessEBUR128` (volumen en LUFS) y `Danceability`. Probado con pistas sintéticas de tempo y tonalidad conocidos (100 BPM en La menor, 124 BPM en Sol mayor): acierta los dos.

**Velocidad:** analizar un tema entero de 4 minutos tardaba ~30 s. Con el tempo y la bailabilidad sobre 90 s del centro, y el volumen y la tonalidad a 11.025 Hz, baja a ~4 s con los mismos resultados (el volumen cambia menos de 0,2 dB).

**Sin internet** (Essentia se descarga del CDN la primera vez) la app vuelve a la medición básica del navegador y lo avisa.

### Pendiente: las escalas no son las de Spotify

El modelo de puntajes se entrenó con los valores de Spotify, y Essentia mide parecido pero en otra escala: la bailabilidad de Essentia va de ~0,5 a ~2,5 y la de Spotify de 0 a 1; el volumen de Essentia está en LUFS y el de Spotify en dB promedio. Por ahora hay una conversión lineal provisoria. **El paso 2 la reemplaza por una calibración**: pasar por Essentia canciones que ya están en el dataset y medir la equivalencia. Sin eso los puntajes de un audio subido pueden salir corridos.

### A tener en cuenta: licencia

Essentia.js es AGPL-3.0 y los modelos preentrenados de Essentia son CC BY-NC-SA (no comercial). Para el proyecto académico no hay problema; un uso comercial requeriría licencia del MTG.


## 20 de octubre de 2026 — Cómo medimos la popularidad

### Decisión: dos preguntas encadenadas, no un solo puntaje

En vez de un número que mezcle todo, la app responde dos cosas por separado:

1. **¿Entra al Hot 100 o no?** — sí o no
2. **Si entra, ¿hasta dónde llega?** — un puntaje de 1 a 100

**Por qué así.** El 51,5% de las canciones del corpus apilado nunca entró al chart. En un puntaje único todas quedarían empatadas en cero, y el modelo gastaría la mitad de su esfuerzo aprendiendo a reconocer ceros en vez de distinguir un puesto 60 de un puesto 5.

Y además es lo que el usuario pregunta de verdad: "¿tiene chance de entrar?" y "si entra, ¿cuán arriba?" son dos preguntas distintas. Cada una puede mostrar su propio margen de error, que es más honesto que un solo número con la incertidumbre promediada.

### Decisión: la escala se invierte y se estira en la punta

El chart da el puesto del 1 al 100, donde 1 es lo mejor. Para un puntaje hace falta lo contrario, así que se invierte. Y además se estira la punta:

| Puesto | Inversión simple | Escala estirada |
|---|---|---|
| 1 | 100 | **100** |
| 2 | 99 | **85** |
| 5 | 96 | **65** |
| 10 | 91 | **50** |
| 50 | 51 | 15 |
| 100 | 1 | 0 |

Con la escala estirada, **el top 10 se lleva la mitad del puntaje**. Con la inversión simple, llegar al puesto 10 daba 91 — casi lo mismo que llegar al 1, lo cual no distingue nada.

**Por qué la estirada refleja mejor la realidad.** Medimos cuántas canciones tuvieron su mejor puesto en cada tramo, sobre las 32.702 de toda la historia del chart:

| Tramo | Canciones | Por cada puesto |
|---|---|---|
| **#1** | 1.194 | **1.194** |
| #2–5 | 2.016 | 504 |
| #6–10 | 2.101 | 420 |
| #11–20 | 3.272 | 327 |
| #21–40 | 5.903 | 295 |
| #41–70 | 9.131 | 304 |
| #71–100 | 9.085 | 303 |

Del puesto 11 al 100 está planchado —unas 300 canciones por puesto— y se dispara en el top 10. El #1 tiene cuatro veces la densidad del #2 al 5: la canción que tiene envión para llegar al 2 generalmente termina en el 1.

**Aclaración importante:** esa escala es para **entrenar**, no para mostrar. La app no dice "vas a caer en el puesto 35". Dice cuánto se parece tu canción al perfil de lo que entra al chart. La gradación sirve para que el perfil que el modelo aprende salga más nítido: si solo le decimos "entró o no entró", una canción que llegó al 1 y una que tocó el 99 una semana le enseñan lo mismo.

### Hallazgo: el puesto ya viene normalizado por época

El Hot 100 siempre tuvo exactamente 100 lugares. El puesto 20 de 1965 significa "la vigésima mejor de esa semana de 1965", y el de 2025 lo mismo para su semana. **Es una posición relativa a su propia época por construcción**, no una medición absoluta como el volumen o la energía.

Así que el problema que resolvimos normalizando el sonido no existe acá. Donde sí queda algo es en la primera pregunta, porque entrar al chart no costó lo mismo siempre — pero medido resultó chico: entre 37,5% y 47,5% de canciones que entraron, según la década. Diez puntos de diferencia en seis décadas.

**Decisión:** dejarlo así y medirlo después de entrenar. Si el modelo predice sistemáticamente más alto para unas décadas que para otras, se empareja la mezcla. Si no, no se gastó trabajo arreglando algo que no estaba roto.

### Descartadas: tres variables que parecían útiles

| Variable | Por qué quedó afuera |
|---|---|
| Semanas en el chart | Cambió tanto de significado por época que no es comparable: mediana de 17 semanas en los 2000 contra **2 en los 2020**. El streaming llena el chart de temas que entran una semana y desaparecen |
| Semanas en el mejor puesto | **Mediana 1.** Para la mitad de las canciones el valor es exactamente 1: no distingue nada |
| Puesto de debut | Aportaba información independiente —es la única casi no correlacionada con las demás— pero el equipo decidió no complicar el eje |

**Dato que quedó anotado sobre el puesto de debut, por si se retoma:** antes se entraba por abajo y se trepaba; hoy se entra alto y se cae. La mediana de debut pasó de #89 en los sesenta a #63 en los 2020, y las entradas directas al top 40 pasaron de 28 a 1.222. La causa es mecánica: sale un disco y todos sus temas chartean una semana por el volumen de streaming del lanzamiento.


## 26 de octubre de 2026 — Cómo medimos el prestigio

### Decisión: solo Record of the Year y Song of the Year

De las 14 categorías del Grammy que tenemos, el perfil de prestigio usa **únicamente esas dos**, por dos razones:

**Son las únicas que vota la Academia entera.** En las demás, cada miembro vota solo en el género donde trabaja: los de metal votan metal, los de country votan country. Las dos generales las votan todos.

**Son las únicas que existen desde 1959 sin interrupción.** Varias de las otras arrancan en 1990, 2002 o 2012, así que no sirven para comparar épocas.

### Decisión: las 807 nominadas solo por género quedan fuera de este eje

Son muchas —casi cuatro veces las 213 que usamos— pero miden otra cosa:

| Nominadas a… | Energía | Acústica |
|---|---|---|
| **Best Metal Performance** | **0,94** | **0,002** |
| Best Rock Song | 0,77 | 0,058 |
| Best Country Song | 0,56 | 0,34 |
| **Record of the Year** | 0,64 | 0,22 |
| **Song of the Year** | 0,57 | 0,31 |
| *(los hits, de referencia)* | *0,67* | *0,19* |

Meterlas en la misma bolsa le enseñaría al modelo que el prestigio suena a metal, que es lo contrario de lo que buscamos. Es el error que ya cometimos una vez y está documentado más arriba.

**Pero tampoco van al grupo de abajo.** Decir que la Academia nunca reconoció a esas canciones sería mentira: 126 de ellas **ganaron un Grammy**. Quedan afuera del entrenamiento de este eje, ni arriba ni abajo, y se siguen usando normal para el eje de popularidad, donde 446 de ellas son hits.

Beneficio secundario: el grupo de abajo queda más limpio, sin colarse ninguna canción que sí fue reconocida.

### Hallazgo: ganar no suena distinto de estar nominada

La idea era hacer una escalera de prestigio: nominada en una categoría vale menos que nominada en las dos, y ganar vale más que todo. Lo medimos y no funciona.

| Escalón | Canciones | Acústica |
|---|---|---|
| Nunca nominada | 8.883 | 0,187 |
| Nominada en una general | 98 | **0,330** |
| Nominada en las dos | 44 | **0,212** |
| Ganó | 71 | 0,253 |

**La columna sube, baja y vuelve a subir.** No está ordenada. Estar nominada en las dos categorías no suena más prestigioso que estar en una: suena más parecido al grupo de abajo.

Comparando directo las 71 ganadoras contra las 142 nominadas que no ganaron, la diferencia de acústica es **0,04 y va para el lado contrario** — menos de la mitad de la brecha que sí importa, que es la de 0,09 entre el grupo de abajo y las reconocidas.

**Decisión: el prestigio es binario.** Una sola pregunta: ¿está nominada en una categoría general o no? Intentar distinguir "nominada" de "ganadora" con 71 ejemplos sería inventar una precisión que los datos no tienen.

Esto además confirma con números una decisión que ya habíamos tomado por criterio en agosto: usar nominadas y no solo ganadoras. Una nominación ya es reconocimiento; que de las cinco finalistas gane una depende de campaña, sello y política, cosas que ningún dato acústico captura.


## 2 de noviembre de 2026 — El corte en el año 2000

### Decisión: la herramienta usa solo música desde el año 2000

El análisis que prueba la hipótesis sigue usando las seis décadas. La **herramienta**, en cambio, se entrena solo con música desde el 2000.

**Por qué.** El patrón se dio vuelta a mitad de camino. Medimos qué tan alegres son las premiadas comparadas con los hits, década por década, comparando dentro de cada década para que el efecto de época se cancele solo:

| Década | Premiadas | Hits | ¿Quién es más alegre? |
|---|---|---|---|
| 1960 | 0,44 | 0,67 | **Los hits**, por mucho |
| 1970 | 0,47 | 0,67 | Los hits |
| 1980 | 0,56 | 0,66 | Los hits |
| 1990 | 0,47 | 0,59 | Los hits |
| 2000 | 0,48 | 0,55 | Los hits |
| **2010** | **0,49** | **0,48** | **Empate** |
| **2020** | **0,50** | **0,46** | **Las premiadas** |

Durante cincuenta años los hits fueron más alegres que las premiadas. En los 2010 se emparejó y en los 2020 se invirtió. **Son dos reglas opuestas**, y entrenar con las dos épocas le enseña al modelo el promedio de ambas, que no describe bien a ninguna.

Y hay un segundo motivo, igual de fuerte: **las mezclas nuevas suenan más fuerte**. Con todas las épocas juntas, el volumen sumaba prestigio — pero en realidad estaba midiendo "canción reciente", no calidad.

**Lo que se mueve fue el público, no la Academia.** Las premiadas se mantuvieron entre 0,44 y 0,50 en sesenta años. Los hits se desplomaron de 0,67 a 0,46. El público se volvió más melancólico y terminó llegando a donde la Academia ya estaba.

### Por qué el año 2000 y no 2010

El cruce ocurrió en los 2010, así que 2010 parecía el corte natural. Pero medimos qué se pierde con cada uno:

| Corte | Canciones premiadas |
|---|---|
| Todo (1958) | 483 |
| **2000** | **213** |
| 2010 | 142 |
| 2015 | 107 |
| 2020 | 68 |

Y comparamos cómo se comportan las características con los dos cortes candidatos:

| Característica | Corte 2000 | Corte 2010 |
|---|---|---|
| **Acústica** | **+0,092** | **+0,088** |
| Energía | −0,067 | −0,062 |
| Duración | +21 seg | +26 seg |
| **Valencia** | **−0,005** | +0,025 |

**Todo es prácticamente idéntico salvo la valencia**, que con el corte en 2000 queda neutralizada porque se cancelan los dos regímenes. Pero aun con el corte en 2010 la valencia es débil: +0,025 contra +0,088 de la acústica, que distingue tres veces y media mejor.

**Entonces cortamos en 2000:** se ganan 71 canciones premiadas —un 50% más de evidencia— y lo único que se pierde es una variable que en el período moderno casi no distinguía nada.

**Nota para quien mire los pesos del modelo:** la valencia va a aparecer en casi cero. No es un error — es el resultado de cancelarse dos regímenes opuestos, y es a propósito.

### Decisión: dos conjuntos de datos con dos propósitos

| | Para qué | Qué datos |
|---|---|---|
| **El análisis** | Probar la hipótesis: ¿los dos mundos se acercaron o se alejaron? | Las seis décadas, 53.577 canciones |
| **La herramienta** | Ubicar una canción de hoy contra el perfil de hoy | Desde el 2000, 23.403 canciones |

No es que se tiraron datos. **El análisis necesita historia porque mide un cambio; la herramienta necesita el presente porque mide una posición.**


## 2 de noviembre de 2026 — La letra queda para la entrega siguiente

El análisis mide solo el sonido. La letra influye en los dos ejes y todavía no la incorporamos.

**Del lado comercial**, está cuantificado: por cada repetición adicional del estribillo, una canción tiene un 14,5% más de probabilidad de llegar al puesto 1 en lugar de quedarse en el fondo del ranking. Y las letras más simples llegan más alto, sobre todo en los años donde se publica más música — hoy se suben 106.000 canciones por día.

**Del lado del Grammy**, hay que separar los dos premios. **Record of the Year** se da por la grabación: la ejecución y la producción. **Song of the Year** se da a los compositores por la obra, y el reglamento exige que la canción "contenga melodía y letra". O sea que para una de las dos categorías que usamos, estamos midiendo con el sonido algo que el premio juzga por la composición.

**Lo que sabemos hasta ahora juega a favor de lo que hicimos:** un estudio de la Universidad de Nueva York midió que, para Song of the Year y Record of the Year, la letra resulta **menos predictiva que el sonido**. Pesaron más la energía, la acústica y la cantidad de palabra hablada.

El detalle completo, con las fuentes y el plan de trabajo, está en [`analisis/la_letra.md`](analisis/la_letra.md).


## 2 de noviembre de 2026 — La comparación por género queda descartada

Más arriba figuraba como "idea evaluada para más adelante": comparar cada canción **dentro de su género** además de contra toda la música, porque decirle a una banda de metal "bajá la energía" es un consejo inútil.

**Se descarta.** No va a estar en la herramienta.

**Lo que había armado en la app y se sacó:**

- La pregunta "¿en qué género te movés?" del formulario de cuenta, con sus ocho opciones
- El texto que prometía *"con el género te damos dos lecturas — contra toda la música, y dentro de lo tuyo"*
- El aviso en la pantalla de resultado que decía que la lectura dentro del género "llega cuando sumemos el género al dataset"

**Por qué conviene sacarlo y no dejarlo como pendiente.** Pedir un dato que no se usa es una promesa que la app no cumple. El usuario completa el género esperando que cambie algo, y no cambia nada. Es mejor no preguntarlo.

**El límite sigue en pie y se declara igual:** el modelo no distingue géneros. Eso se dice en la app, pero ahora como una limitación honesta en vez de como una función que está por llegar.
