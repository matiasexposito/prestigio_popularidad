# Letra, redes y YouTube: qué usamos, cómo lo evaluamos y cuánto pesa

11 de noviembre de 2026 · Matías

> **Propuesta, todavía sin confirmar por el equipo.** Copia del documento de Claude del 11/11. El análisis completo, con las pruebas y las fuentes, está en [`redes_y_letra.md`](redes_y_letra.md).

## La respuesta corta

**La herramienta usa solo el sonido.** La letra, las redes sociales y YouTube **no entran a la herramienta**, pero **sí entran al análisis**: les damos un peso aproximado y explicamos por qué no los medimos canción por canción.

| Factor | ¿Lo usamos en la app? | ¿Entra al análisis? | Peso en **entrar al chart** | Peso en **llegar alto** | Cómo se sabe |
|---|---|---|---|---|---|
| **El sonido** | ✅ Sí | ✅ Sí | **25%** | **5%** | **Medido** con nuestro modelo |
| **Redes sociales** (TikTok, Instagram) | ❌ No | ✅ Sí | 20% | 25% | Estimado con estudios publicados |
| **YouTube** | ❌ No | ✅ Sí | 5% | 5% | Estimado; ya está adentro del Hot 100 desde 2013 |
| **Playlists y radio** | ❌ No | ✅ Sí | 15% | 20% | Estimado con estudios publicados |
| **La letra** | ❌ No (pendiente) | ✅ Sí | 10% | 10% | Estimado; probado en una muestra nuestra |
| **El contexto** (artista, sello, campaña) | ❌ No | ✅ Sí | 25% | 35% | Lo que queda; no hay datos abiertos |
| **Total** | | | **100%** | **100%** | |

**Lo más importante para defenderlo:** el único número **medido** es el del sonido. Los demás son una **estimación razonada**, y en la sección de porcentajes está explicado de dónde sale cada uno. Hay que presentarlos como órdenes de magnitud ("alrededor de"), nunca como mediciones exactas.

**Respecto del racional actual:** la tabla del racional junta redes, YouTube, playlists y radio en una sola fila llamada "difusión" (40% y 50%). Acá está separada en tres, porque los profesores pidieron un peso por cada factor. Las sumas dan lo mismo: 20 + 5 + 15 = 40, y 25 + 5 + 20 = 50.

## Antes de leer: hay dos lugares donde se puede "usar" algo

Esta distinción explica casi todas las respuestas de la tabla.

**1. En la herramienta.** La persona sube su canción y la app la evalúa. Para que un factor entre acá, la app tiene que poder **medirlo en esa canción, en ese momento**. Y muchas veces esa canción es un **demo sin publicar**: no tiene vistas, no tiene TikToks, no está en ninguna playlist.

**2. En el análisis.** Es lo que escribimos en el racional para explicar cómo funciona la popularidad. Acá alcanza con **saber algo del factor** —por estudios publicados o por pruebas nuestras— aunque no lo midamos en cada canción.

Por eso un factor puede quedar afuera de la herramienta y adentro del análisis. Es lo que pasa con todo menos el sonido.

## Los porcentajes: de dónde sale cada número

Se arman en tres pasos. Es importante contarlo así, porque muestra qué es medido y qué es criterio nuestro.

### Paso 1. El sonido: lo medimos

Nuestro modelo usa **solo el sonido**. Entonces, todo lo que logra adivinar lo adivina con el sonido, y lo que no logra adivinar es lo que explican las demás cosas.

- **Para entrar al chart:** el sonido explica alrededor de **un cuarto** (0,24 en una escala de 0 a 1). → **25%**.
- **Para llegar alto:** explica apenas un **3%** de las diferencias de puesto entre los hits. Lo redondeamos a **5%** porque, entre los hits, el sonido sí distingue un poco a los que llegan al top 10 (0,63, donde 0,5 sería azar). → **5%**.

Y un dato que sostiene todo lo que viene después: **el peso del sonido viene bajando**. Medido por período, pasó de 0,31 en 2005–2009 a **0,22 en 2020–2026**. Lo que el sonido dejó de explicar lo explica otra cosa, y el período en que más baja es el de TikTok.

### Paso 2. Lo que queda se reparte según la evidencia

Queda **75%** para entrar y **95%** para llegar alto. No lo podemos medir, así que lo repartimos con un criterio: **más peso a lo que tiene más evidencia publicada de que mueve el chart.**

| Factor | Entrar | Llegar alto | Por qué ese número |
|---|---|---|---|
| **Redes sociales** | 20% | 25% | Es lo que más evidencia tiene hoy: el **84%** de las canciones que entraron al ranking global de Billboard en 2024 habían explotado antes en TikTok, y en 2021 más de **175** canciones que fueron tendencia en TikTok entraron al Hot 100, el doble que el año anterior. No le damos más porque esos datos los puso TikTok y porque para los años 2000–2015 TikTok no existía |
| **Playlists y radio** | 15% | 20% | Entrar a la playlist más grande de Spotify suma unos **20 millones** de reproducciones, y la radio sigue siendo uno de los tres componentes del Hot 100. Pesa más para llegar alto: al top 10 se llega con radio y con las playlists grandes |
| **YouTube** | 5% | 5% | Ya está adentro del Hot 100: cuenta desde 2013 como parte del streaming. Le damos poco peso propio porque es el que menos evidencia publicada tiene de mover el chart por sí solo, más allá de ser una plataforma más donde se escucha |
| **La letra** | 10% | 10% | Hay un efecto medido: cada repetición extra del estribillo sube 14,5% la chance de llegar al #1. Pero en nuestra prueba la letra **casi no separa** a las premiadas de los hits, y un estudio de la Universidad de Nueva York encontró que para los Grammy predice menos que el sonido. Por eso le damos menos que al sonido |
| **El contexto** | 25% | 35% | Quién es el artista, qué sello lo empuja, cuánta plata hay en la campaña. Es lo que queda. Pesa más para llegar alto: llegar al top 10 sin un sello grande atrás es la excepción |

### Paso 3. Cómo leer los números

Los números exactos de las filas estimadas **no se pueden defender uno por uno**: nadie puede probar que las redes son 20% y no 25%. Lo que sí se puede defender es **el orden**:

- **Para entrar:** sonido y contexto pesan parecido, la difusión junta (redes, playlists, radio, YouTube) pesa más que cada uno, y la letra es lo que menos pesa.
- **Para llegar alto:** el sonido casi no importa; mandan la difusión y el contexto.

Si en la presentación alguien pregunta *"¿por qué 20 y no 30?"*, la respuesta es: *"Es una estimación. El único número que medimos es el del sonido. Los otros los ordenamos según cuánta evidencia hay, y lo que defendemos es el orden, no el número exacto."*

## Factor por factor

### El sonido — ✅ lo usamos

**Cómo se evalúa:** 10 características de cómo suena la grabación (energía, alegría, acústica, duración, bailabilidad, volumen, habla, tempo, modo, instrumentalidad). En las canciones de la base las midió Spotify; en la canción que sube el usuario las miden ReccoBeats y Essentia, en el navegador.

**Por qué sí:** es lo único que se puede medir en **cualquier** canción, incluso en un demo que nadie escuchó todavía. Y es lo único que quien produce puede **cambiar**: el arreglo, la mezcla, la duración.

### La letra — ❌ no la usamos (pendiente)

**Si la usáramos, se evaluaría así:** se baja la letra de una fuente abierta, se mide y se tira el texto. Se guardan solo números: cuántas palabras, cuántas distintas, cuánto se repiten las líneas, cuánto habla de "yo". La herramienta para hacerlo ya está en el repositorio (`codigo/letra.js`). En la app, el usuario pegaría su letra en un campo opcional.

**Por qué no, por ahora:**

1. **Derechos de autor.** Las letras tienen dueño. Se pueden medir, pero no guardar ni mostrar. Hacerlo bien lleva tiempo.
2. **Casi no separa los dos mundos.** Lo probamos con 120 canciones nuestras: las premiadas tienen letras un poco más largas (419 palabras contra 380, igual que duran más), y en todo lo demás son casi iguales a los hits. Para lo que mide P&P, la letra aportaría poco.
3. **El idioma.** Las medidas de letra cambian con el idioma: Despacito no se puede comparar con una canción en inglés con la misma regla.
4. **Lo decidimos con los profesores:** queda para la etapa siguiente.

### YouTube — ❌ no lo usamos como dato aparte

**Si lo usáramos, se evaluaría así:** con la API oficial de YouTube, buscando el video de cada canción y anotando sus vistas.

**Por qué no:**

1. **Ya está adentro.** El Hot 100 cuenta las vistas de YouTube desde 2013. Nuestro eje de popularidad ya lo incluye.
2. **Da las vistas de hoy, no las de su momento.** Una canción de 2009 tuvo 17 años para juntar vistas; una de 2025, uno. No son comparables.
3. **Es lento.** La API gratis deja buscar unas 99 canciones por día: para las 9.497 que entraron al chart desde 2000 harían falta unos 96 días.
4. **Un demo tiene cero vistas.** La herramienta no tendría qué medir.

### TikTok, Instagram y redes sociales — ❌ no las usamos

**Si las usáramos, se evaluarían así:** con herramientas pagas que usan los sellos (Chartmetric, Luminate), que guardan el historial de cada canción en redes desde 2015–2017.

**Por qué no:**

1. **No hay datos abiertos.** TikTok solo da acceso a investigadores de universidades de Estados Unidos y Europa (San Andrés no califica). Instagram no publica nada de música. Las herramientas que lo tienen son pagas.
2. **Son circulares.** Que una canción explote en TikTok no es una *causa* de que sea popular: es *otra forma de que sea popular*. Usarlo para predecir la popularidad sería como predecir la altura de alguien con el talle del pantalón: acierta, pero no explica nada.
3. **No existían en todo el período.** TikTok es de 2016 e Instagram Reels de 2020. Las canciones de 2000 a 2015 tendrían cero no por falta de éxito sino porque no había dónde. El modelo aprendería "tener redes = canción nueva".
4. **Un demo no tiene redes.**

**Lo que sí hicimos:** una prueba con Wikipedia, el único dato abierto de "atención" con historia. En 60 hits desde 2016, las visitas se relacionan con el puesto que alcanzaron (0,30), mucho más que el sonido. Confirma que lo de *alrededor* de la canción pesa mucho, y a la vez muestra el problema: ¿la buscaron porque llegó alto, o llegó alto porque la buscaron?

### Playlists y radio — ❌ no las usamos como dato aparte

**Por qué no:** igual que YouTube, **ya están adentro del Hot 100**, que cuenta radio y streaming. Y no hay datos abiertos de en qué playlists estuvo cada canción ni cuánto sonó en cada radio. Spotify cerró además, en 2026, el dato de popularidad que daba a proyectos como el nuestro.

### El contexto — ❌ no lo usamos

Quién es el artista, qué sello tiene, cuánta plata hubo en la campaña, qué pasaba ese año.

**Por qué no:** no hay datos abiertos de nada de esto. Y aunque los hubiera, no es algo que quien produce pueda cambiar desde el estudio, que es para lo que sirve P&P. La primera pantalla de la app ya lo dice: *"No medimos la letra, ni el sello, ni quién sos. Solo cómo suena."*

## Cómo decirlo en la presentación

Un minuto, en cuatro frases:

> **"Que una canción sea popular depende de muchas cosas: cómo suena, las redes, las playlists, la letra, quién la canta. Nosotros medimos la única que se puede medir en cualquier canción, incluso en un demo: el sonido.**
>
> **Y medimos cuánto pesa: explica alrededor de un cuarto de que una canción entre al Hot 100, y casi nada de cuán alto llega. Por eso P&P nunca te dice en qué puesto vas a caer.**
>
> **Las redes, YouTube y la letra no entran a la herramienta: no hay datos abiertos de 2000 a hoy, un demo no tiene vistas, y las redes no son una causa de la popularidad sino otra forma de medirla. Pero no las ignoramos: les dimos un peso aproximado en el racional, con las fuentes.**
>
> **Y encontramos algo: el peso del sonido viene bajando. En la era de TikTok explica menos que hace quince años."**

La última frase es la que conviene remarcar: no es una excusa, es un hallazgo.

## Lo que falta confirmar

- [ ] **¿Estamos de acuerdo con que nada de esto entre a la herramienta?**
- [ ] **¿Nos cierran los porcentajes?** Se puede cambiar cualquiera de los estimados: lo importante es que la fila sume 100 y que el orden se pueda defender. El del sonido no se cambia: es medido.
- [ ] **¿Separamos la "difusión" en tres filas en el racional** (redes, playlists y radio, YouTube), como acá?
- [ ] **¿La letra queda como está (pendiente, con la prueba hecha) o la volvemos a abrir?**
