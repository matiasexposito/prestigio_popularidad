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
