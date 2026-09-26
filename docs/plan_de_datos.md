# P&P — Plan de datos completo

> Todo lo relacionado con los datos del proyecto: de dónde sale cada cosa, por qué elegimos esa fuente y no otra, qué problemas tiene, cómo los resolvimos, qué encontramos y para qué se usa después.
>
> Escrito para que se entienda sin saber nada de datos ni de programación. Los términos técnicos están explicados la primera vez que aparecen, y hay un glosario al final.
>
> **Los dos archivos finales son `corpus_v2.csv` (26.577 canciones etiquetadas) y `control_v2.csv` (27.000 canciones comunes).** Tienen el mismo esquema y se apilan: 53.577 canciones para entrenar.
>
> Actualizado: 7 de septiembre de 2026 — **etapa de datos terminada**.

---

## Resumen en diez líneas

Si hay poco tiempo, esto es todo el capítulo de datos:

1. La app necesita aprender cómo suenan dos mundos: el que premia el Grammy y el que triunfa comercialmente.
2. Se le enseña mostrándole miles de canciones del pasado con la respuesta puesta.
3. Todo termina en **una sola tabla**: una fila por canción, las características del sonido a la izquierda, las respuestas a la derecha.
4. Esa tabla se armó con tres fuentes: **Billboard** (32.702 canciones, el eje comercial), **Grammy** (2.513 nominaciones, el eje del prestigio) y un **dump de características de sonido** (56 millones de canciones).
5. Cruzarlas fue el trabajo difícil, porque la misma canción está escrita distinto en cada una. **Cruzó el 81,6%** — ese número decidía si el proyecto era viable.
6. Hizo falta un cuarto grupo que casi nadie ve venir: **27.000 canciones comunes**, que no ganaron nada ni fueron hit. Sin ellas los puntajes no significan nada.
7. Usamos **diez características** del sonido. Sacamos dos que metían ruido y agregamos una nuestra, la rareza.
8. Aparecieron **siete problemas**, cuatro de ellos errores nuestros. Los siete están documentados con su solución.
9. **Los dos perfiles existen y son distintos**: las premiadas son menos enérgicas, más melancólicas, más acústicas y más largas.
10. Y el hallazgo que corrige la hipótesis original: los dos mundos **convergieron** en carácter emocional y **divergieron** en formato.

---

## 1. Qué teníamos que lograr en esta etapa

La app promete una cosa concreta: **el usuario sube una canción y le decimos qué tan parecida es al perfil que premia el Grammy y qué tan parecida al perfil que triunfa comercialmente.**

Para poder decir eso, primero hay que enseñarle al sistema cómo suena cada uno de esos dos mundos. Y para enseñarle, hay que mostrarle miles de canciones del pasado con la respuesta ya puesta: *esta ganó un Grammy, esta fue un hit, esta no fue ninguna de las dos.*

Esta etapa consistía en **conseguir esas miles de canciones**. Está terminada. Los resultados están en la sección 8.

---

## 2. La idea central: todo termina en una sola tabla

Es fácil imaginarse que necesitamos cuatro bases de datos separadas. No. Necesitamos **una sola tabla, donde cada fila es una canción**, así:

| título | artista | año | energía | valencia | acústica | ... | ¿Grammy? | ¿puesto en Billboard? |
|---|---|---|---|---|---|---|---|---|
| Bohemian Rhapsody | Queen | 1975 | 0.40 | 0.23 | 0.29 | ... | no | 9 |
| Rolling in the Deep | Adele | 2011 | 0.77 | 0.51 | 0.14 | ... | **ganó** | 1 |
| Smells Like Teen Spirit | Nirvana | 1991 | 0.91 | 0.72 | 0.02 | ... | nominada | 6 |
| (una canción cualquiera) | ... | 1998 | 0.55 | 0.44 | 0.31 | ... | no | — |

Las columnas del medio (energía, valencia, acústica...) son **las características del sonido**. Las dos últimas son **las respuestas**: qué le pasó a esa canción en el mundo de los premios y en el mundo comercial.

El sistema mira miles de filas como estas y encuentra solo qué combinaciones de características acompañan a cada respuesta. **Eso** es el "perfil que premia la Academia". No se descarga de ningún lado: aparece al mirar los datos.

Esta distinción es la más importante del proyecto. Las características son **lo que le damos** al sistema; los perfiles son **lo que el sistema nos devuelve**.

---

## 3. Las tres fuentes

Esa tabla única se armó juntando tres fuentes distintas. Ninguna sirve sola. **Las tres están bajadas y verificadas.**

### 3.1 Billboard Hot 100 — el eje de la popularidad ✅

**Qué es.** El ranking semanal de las 100 canciones más escuchadas en Estados Unidos. Existe sin interrupción **desde agosto de 1958**.

**De dónde lo sacamos.** Del repositorio público [utdatasets/rwd-billboard-data](https://github.com/utdatasets/rwd-billboard-data). Descarga directa, gratis, sin cuenta.

**Qué trae.** Una fila por canción y por semana: título, artista, en qué puesto estuvo esa semana, cuál fue su mejor puesto histórico y cuántas semanas llevaba en el ranking.

**Por qué esta fuente y no la cantidad de reproducciones en Spotify.** Es la decisión más importante de las tres, y la razón es la hipótesis del proyecto: queremos comparar **seis décadas**. Los datos de reproducciones existen desde 2015 más o menos. No hay forma de saber cuántas veces se "reprodujo" una canción en 1967. Billboard es la única medida de éxito comercial que existe en las seis décadas, medida siempre de la misma manera.

Y da una medida **gradual**, no un sí o no. Llegar al puesto 3 y quedarse 20 semanas no es lo mismo que asomar al 87 durante dos semanas, y esa diferencia queda registrada.

**Qué hicimos.** El archivo original tiene 355.001 filas, pero son la misma canción repetida semana a semana. Lo colapsamos a **una fila por canción: 32.702 canciones únicas**, cada una con su mejor puesto, sus semanas totales y el año de su primera aparición.

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

> `datasets/raw/billboard_hot100.csv` (19 MB) → `datasets/billboard_canciones.csv` · script `preparar_billboard.js`

---

### 3.2 Premios Grammy — el eje del prestigio ✅

**Qué es.** Las canciones nominadas y ganadoras del Grammy, desde la primera entrega en 1959 hasta la de 2026.

**De dónde lo sacamos.** Lo armamos nosotros, parseando Wikipedia.

**Por qué nos lo armamos en vez de bajar uno hecho.** Buscamos datasets ya hechos y ninguno servía:

- Los de **Kaggle** exigen crear una cuenta, y varios traen solo ganadores.
- Encontramos un repositorio (`music-mining`) que parecía ideal porque ya venía cruzado con características de sonido y con premios. Lo descartamos: **solo cubre del 2000 al 2022**, con 457 nominados. Sin las seis décadas, la hipótesis del proyecto no se puede ni probar ni refutar.

Wikipedia tiene una página por cada categoría del Grammy, con una tabla de todos los años y todos los nominados. Gratis, sin cuenta, y es la fuente más completa que existe para los años viejos. Escribimos un programa que baja esas páginas y las convierte en tabla.

**Qué conseguimos.** **2.513 nominaciones, de las cuales 488 ganaron**, entre 1959 y 2026, en 14 categorías: Record of the Year y Song of the Year completas, más rock, pop, R&B, country, rap, metal y alternativo.

**Por qué nominados y no solo ganadores.** Esto es clave. Ganadores de Canción del Año hay unos 60 en toda la historia. Con 60 ejemplos un sistema no aprende: memoriza esos 60 y falla con todo lo demás. Sumando nominados pasamos de 60 a más de 2.500 — cuarenta veces más material.

Y es más correcto conceptualmente. La hipótesis habla del **perfil de sonido que la Academia reconoce**, y una nominación ya es reconocimiento: un comité de la industria la eligió entre miles. Que gane una de las cinco finalistas depende de campaña, sello y política, cosas que ningún dato sobre el sonido puede capturar.

**Cómo verificamos.** Revisamos ganadores de todas las décadas: 1959 Volare de Modugno, 1965 The Girl from Ipanema, 1972 It's Too Late de Carole King, 1984 Beat It de Michael Jackson, 2000 Smooth de Santana, 2010 Use Somebody de Kings of Leon, 2020 Bad Guy de Billie Eilish, 2026 Luther de Kendrick Lamar y SZA. Todos correctos.

> **Un error que costó encontrar.** En la tabla de Record of the Year, la última columna no es el intérprete sino el equipo de producción. La primera versión del programa devolvía *"It's Too Late — Lou Adler, producer"* en vez de *"It's Too Late — Carole King"*. Con el productor en lugar del artista, el cruce con la tercera fuente habría fallado casi entero y no habríamos sabido por qué. Se arregló leyendo los encabezados de cada tabla para identificar la columna correcta, porque las categorías no comparten estructura: Record of the Year es `Año | Grabación | Artista | Equipo de producción`, y Song of the Year es `Año | Canción | Compositores | Artista`.

> `datasets/grammy_nominaciones.csv` · script `fetch_grammy.js` (re-corrible cada año)

---

### 3.3 Características del sonido — las variables ✅

**Qué es.** Una tabla gigante donde cada fila es una canción y las columnas son **números que describen cómo suena**: qué tan intensa, qué tan alegre, qué tan acústica, a qué velocidad va, cuánto dura.

**De dónde lo sacamos.** Del dataset público [GildasLeDrogoff/spotify-huge-track-analysis-dataset](https://huggingface.co/datasets/GildasLeDrogoff/spotify-huge-track-analysis-dataset) en HuggingFace: **56.277.664 canciones, 4,1 GB**, sin cuenta ni credenciales. Verificado: todas las filas tienen sus características completas.

**Importante: no contiene música.** Nadie nos manda 56 millones de canciones. Nos manda los números que ya estaban calculados a partir de ellas. Por eso son 4 GB y no varios petabytes.

**¿Quién analizó las canciones? Spotify, no nosotros.** Es la pregunta que más se hace sobre el proyecto. La cadena: (1) Spotify procesó cada canción de su catálogo y calculó automáticamente estos valores, para sus propias recomendaciones; (2) los publicaba por su API; (3) un usuario de HuggingFace le pidió a esa API los datos de millones de canciones y armó la tabla; (4) en noviembre de 2024 Spotify cerró el acceso, y el archivo quedó como una foto previa al cierre.

> **Precisión:** los 56 millones son el tamaño de la fuente, no del trabajo. Usamos **8,9 millones** como referencia de época y **53.577** para entrenar. Decir "analizamos 56 millones de canciones" sería falso.

**La limitación que arrastra:** nunca pudimos verificar ese algoritmo — es una **caja negra**, Spotify nunca publicó el método. No podemos reproducir esos números desde cero, y de ahí viene la necesidad de calibrar contra librosa (sección 7).

**Por qué no se lo pedimos directamente a Spotify.** Porque ya no se puede. En noviembre de 2024 Spotify **cerró el acceso** a estos datos para las aplicaciones nuevas. Una app creada hoy no se los puede pedir. Los datasets como este se armaron antes de ese cierre.

Y aunque estuviera abierto, no alcanzaría: la canción que sube el usuario puede ser un demo sin publicar que no está en Spotify. Eso se resuelve aparte (sección 7).

**Por qué este dataset y no otro.** Comparamos varios:

| Candidato | Por qué no |
|---|---|
| `maharshipandya/spotify-tracks-dataset` | Cómodo (13 MB) pero **no tiene el año**. Sin año no se puede comparar 1965 con 2025, que es exactamente lo que la hipótesis necesita |
| `ozefe/spotify_audio_features` | 12 GB y 255 millones de canciones: más de lo necesario y mucho más pesado de manejar |
| **GildasLeDrogoff** ✅ | Tiene año, artista, título y todas las características. Tamaño manejable |

> `datasets/raw/spotify_features.parquet` (4,1 GB)

---

## 4. Las diez características que usamos

Casi todas van de **0 a 1**, donde 0 es nada y 1 es el máximo. No las inventamos nosotros: son las que usaba Spotify, calculadas automáticamente analizando el audio.

Están ordenadas por **cuánto separan** a las premiadas de los hits. Ese número está medido sobre el corpus, no supuesto:

| Característica | Qué mide, en criollo | Separación |
|---|---|---|
| **Energía** | Qué tan intensa y activa suena | **0,473** |
| **Valencia** | Qué tan alegre suena. **No es la letra, es el sonido** | **0,461** |
| **Acústica** | Probabilidad de que use instrumentos reales en vez de electrónicos | **0,349** |
| **Duración** | Cuánto dura | **0,344** |
| Bailabilidad | Qué tan regular y marcado es el ritmo | 0,215 |
| Volumen | Nivel promedio en decibeles (negativo: cuanto más cerca de 0, más fuerte) | 0,171 |
| Habla | Cuánta palabra hablada tiene, en vez de cantada | 0,164 |
| Tempo | Velocidad, en pulsos por minuto | 0,061 |
| Modo | Mayor (suele sonar alegre) o menor (suele sonar triste) | 0,037 |
| Instrumentalidad | Probabilidad de que no tenga voz cantada | 0,036 |
| **Rareza** *(calculada por nosotros)* | Cuán lejos está del centro de su propio año | 0,077 |

**Las cuatro primeras explican el resultado.** Son las que la app le muestra primero al usuario cuando le dice "tu energía te suma en popularidad y te resta en prestigio". Las tres últimas aportan casi nada por separado, pero se mantienen porque pueden rendir cruzadas con otras.

### Dos que sacamos

**Tonalidad.** Venía como un número del 0 al 11 (Do es 0, Do# es 1, y así). El modelo lo leería como una **cantidad** y creería que el 11 está lejos del 0, cuando musicalmente Si y Do son vecinos. No aportaba información: metía ruido.

**En vivo.** Al deduplicar sacamos a propósito las tomas en vivo, así que en el corpus casi no varía — solo el 0,8% pasa de 0,8. Separaba 0,128.

### Una que agregamos, y la hipótesis que se cayó

**La rareza** mide cuán lejos está una canción del centro de su propio año, en las nueve características continuas a la vez. La referencia son las 8,9 millones del pozo agrupadas por año: **toda la música publicada ese año**, no solo los hits.

La agregamos como hipótesis propia: quizá la Academia premia lo que se sale de la norma y el público lo que se le parece.

**No se sostiene.** Separación 0,077, y en dirección contraria a lo esperado: las premiadas generales son *ligeramente menos* raras (0,768) que los hits (0,785). Por década no hay tendencia.

> **La Academia no premia lo que se sale de la norma.** Resultado negativo, y se reporta como tal.

La medida en sí funciona: las canciones que salieron como más raras son coherentes — *Baile Inolvidable* de Bad Bunny (una salsa en el Hot 100), *Honeycomb* de Deafheaven (blackgaze), *Junk Food Junkie* de Larry Groce (novelty). Mide rareza de verdad; la rareza no predice premios.

**Probablemente sea un problema de diseño de la métrica: es ciega a la dirección.** Mide distancia al centro sin importar hacia dónde, así que una canción muy acústica y una muy electrónica dan la misma rareza alta siendo opuestas. Si las premiadas son raras hacia lo acústico y los hits hacia lo enérgico, esas dos rarezas se cancelan al colapsarlas en una sola distancia.

Se queda en el corpus igual: ya está calculada, puede rendir combinada, y como información al usuario sirve — *"tu canción es más rara que el 90% de lo que se publicó este año"* es algo que un músico quiere saber aunque no prediga premios.

> **Una corrección sobre algo que propusimos antes.** En un documento anterior sugerimos agregar el **rango dinámico** (la distancia entre las partes suaves y las fuertes) porque es el mejor indicador de la diferencia entre "grabación que la crítica valora" y "grabación pensada para la radio". La idea sigue siendo buena, pero **no se puede usar**: el dump no lo trae, y calcularlo exigiría tener el audio de las 50.000 canciones del corpus, cosa que no tenemos ni podemos tener legalmente. Nos queda el **volumen promedio**, que captura parte del mismo fenómeno. Vale mencionarlo en la presentación: muestra que entendemos qué mide y qué no mide la herramienta.

---

## 5. El grupo de control ✅

Con Grammy y Billboard tenemos las canciones que ganaron y las que fueron hits. Parece completo. **No lo es.**

Falta el tercer grupo: **canciones que no ganaron nada y nunca fueron hit**. Las comunes.

**Por qué es imprescindible.** Si al sistema solo le mostramos ganadoras y exitosas, nunca ve cómo suena una canción normal, y entonces no tiene contra qué comparar. Todo lo que le entre va a puntuar alto en algo.

Es como enseñarle a alguien a reconocer caras famosas mostrándole únicamente fotos de famosos: cuando le muestres a un desconocido va a decir que también es famoso, porque no sabe cómo se ve alguien que no lo es.

Sin este grupo, los dos puntajes de la app **no significan nada**. Y lo peor es que no se nota: los números salen, se ven razonables, el gráfico se dibuja bien. El error es invisible desde la pantalla.

**Qué armamos.** Del dump salieron **8.893.628 canciones candidatas** (las que no están ni en Grammy ni en Billboard). De ahí se filtró lo que no es música (sección 6.4) y se tomaron **27.000: 4.500 por década, de 1970 a hoy**, para que ninguna época domine.

**Por qué desde 1970 y no desde 1958.** Porque las canciones del control no están ni en Billboard ni en Grammy, así que **no tienen año por ningún otro lado** que la fecha del dump — y esa fecha falla en las décadas viejas. Lo medimos (sección 6.1).

**Y una que sale de regalo:** las canciones que están en Grammy **y** en Billboard son las que lograron las dos cosas. Esa es directamente la funcionalidad "casos que lograron las dos cosas" de la app, y además es la prueba de qué tan rara es esa combinación. No hubo que recolectarla: apareció sola al cruzar. Son **1.071**.

> Archivo final: **`datasets/control_v2.csv`** — 27.000 canciones, mismo esquema que el corpus · pozo completo `datasets/pozo_control.parquet` · scripts `armar_control.js` + `armar_control_v2.js`

---

## 6. Los siete problemas y cómo los resolvimos

Ninguno de estos es un riesgo teórico. **Todos aparecieron al tocar los datos de verdad**, y cuatro son errores que cometimos y corregimos. Contarlos en la presentación juega a favor: muestra que el trabajo se auditó, no que salió bien de casualidad.

### 6.1 El año del dump no es el año de la canción

Al buscar Bohemian Rhapsody, el dump devolvió esto:

```
Bohemian Rhapsody - Remastered 2011 | Queen | fecha: 2024-07-19
Bohemian Rhapsody - Remastered 2011 | Queen | fecha: 2025-07-11
```

Bohemian Rhapsody es de **1975**. Esa fecha es la de la *edición* en Spotify: remasterizaciones, recopilatorios, reediciones.

**Por qué importa tanto.** La pantalla "Explorar la historia" sostiene toda la tesis del proyecto. Si armamos la línea de tiempo con ese campo, las canciones viejas aparecen como si fueran de 2024 y el gráfico queda amontonado en los últimos cinco años.

**Lo medimos** en vez de suponer. Comparamos la fecha del dump contra el año real de Billboard, década por década:

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

**La fecha sirve desde 1970 y falla antes.** El motivo: las grabaciones anteriores a 1970 llegaron a Spotify como reediciones digitales hechas décadas después.

**Cómo lo resolvimos.** Dos caminos distintos según para qué:

- **Canciones etiquetadas** (premiadas y hits): el año lo dan Billboard y Grammy, que lo tienen exacto. Cubren de 1958 a 2026 sin problema.
- **Grupo de control y entrenamiento**: dependen de la fecha del dump, así que arrancan en **1970**.

Consecuencia práctica: la pantalla de historia puede arrancar en 1958, y el modelo se entrena desde 1970. Y 1970-2026 **siguen siendo seis décadas** (70s, 80s, 90s, 2000s, 2010s, 2020s), así que la hipótesis no necesita reescribirse.

### 6.2 Cada canción aparece muchas veces

La misma consulta devolvió tres versiones de Bohemian Rhapsody: dos remasterizaciones idénticas y una grabación en vivo. Los números son completamente distintos: **energía 0,85 en vivo contra 0,40 en estudio**.

Si dejamos las tres, la misma canción entra tres veces con datos contradictorios.

**Cómo lo resolvimos.** Una sola versión por canción: descartamos las que dicen "live", "remix", "karaoke", "cover", "instrumental" o "demo" en el título, y entre las que quedan elegimos la más popular, que es la grabación de estudio original. De 56 millones de filas quedaron **43.618.889 canciones únicas**.

### 6.3 Juntar las tres fuentes es el trabajo real

Bajar los archivos es fácil. Cruzarlos es donde se cae este tipo de proyecto, porque la misma canción está escrita distinto en cada fuente:

```
en Billboard:  "Blinding Lights"                — The Weeknd
en Grammy:     "Blinding Lights"                — Abel Tesfaye
en el dump:    "Blinding Lights - Remastered"   — The Weeknd
```

Son la misma canción y una comparación literal no las une. Multiplicado por 50.000 filas y 60 años de variantes de escritura.

**Cómo lo resolvimos.** Antes de comparar, "limpiamos" cada título y cada artista con reglas fijas: todo a minúsculas, sin acentos, sin puntuación, sacando los agregados tipo "- Remastered 2011" o "(Radio Edit)", y quedándonos con el artista principal (cortando en "feat.", "&", "with").

**Funcionó**: 81,6% de las nominaciones al Grammy encontraron sus características (sección 8).

### 6.4 El grupo de control venía lleno de cosas que no son música ⚠️ error nuestro

Al mirar una muestra al azar del primer grupo de control apareció esto:

```
'028 - und die geheimnisvolle Stadt - Teil 36'  — Fünf Freunde       (1991)
'Uterine Sounds'                                 — Relaxing Radiance  (2020)
```

La primera es un **audiolibro infantil alemán**. La segunda es **ruido blanco para dormir**. Spotify está lleno de eso.

**Por qué es grave.** Si el grupo de control tiene audiolibros, el modelo aprende que "no ser un hit" significa "ser palabra hablada". Eso es facilísimo de detectar, así que el modelo se vería muy preciso **y sería completamente inútil**: estaría respondiendo "¿esto es música?" en vez de "¿esto suena a hit?".

Lo medimos: **5,8% del control era palabra hablada, contra 0,05% de los hits.** Ciento dieciséis veces más.

**Cómo lo resolvimos.** Cuatro filtros deliberadamente conservadores: palabra hablada por encima de 0,66 (el umbral que Spotify define como "enteramente hablado"), duración menor a un minuto, duración mayor a quince minutos, y nombres de artista de fábrica de contenido ("White Noise Baby Sleep", "Womb Sounds Heartbeat"). Se descarta el **8,9%** del pozo.

### 6.5 El filtro que casi borra la música clásica ⚠️ error nuestro

El primer intento de filtrar el ruido blanco fue la regla obvia: *"muy instrumental y con poca energía"*. Al revisar qué agarraba:

```
London Symphony Orchestra  — banda sonora de Indiana Jones
La Petite Bande            — Lully, Le Bourgeois Gentilhomme
Erik Satie                 — Gnossienne No. 2
```

Eso no es ruido: es **música clásica**. La regla describe igual de bien a un generador de ruido blanco que a una pieza de piano de Satie.

**Por qué habría sido grave.** Sacaba del grupo de control toda la música tranquila e instrumental, y el modelo habría aprendido que "no ser un hit" significa "tener voz y ser movida". Sesgo puro, invisible en pantalla.

**Cómo lo resolvimos.** Se descartó esa regla y se filtra por **nombre de artista**, no por características del sonido. Auditado: de las 384.814 canciones instrumentales y tranquilas del pozo, el filtro toca solo el **8%**. Lo que borra es *"Box Fan - Loopable"* de "Vacuum Cleaner White Noise"; lo que deja son grabaciones de piano de baja repercusión, que **corresponde** que estén en el control porque efectivamente no son hits ni ganaron nada.

### 6.6 Medir el prestigio con las categorías de género no mide prestigio ⚠️ error nuestro

Al calcular por primera vez el perfil de las premiadas, la energía daba **más alta** que la de los hits — lo contrario de la hipótesis. El motivo apareció al abrir por categoría:

| Categoría | Energía media |
|---|---|
| Best Metal Performance | 0,93 |
| Best Rock Song | 0,76 |
| Best Rap Song | 0,71 |
| **Record of the Year** | **0,55** |
| Best Country Song | 0,48 |
| **Song of the Year** | **0,44** |

El metal es ruidoso **por definición**. Meterlo en la bolsa de "lo que premia la Academia" no mide prestigio: mide que el metal es ruidoso.

**Cómo lo resolvimos.** El perfil de prestigio se calcula **solo con Record of the Year y Song of the Year**, que premian una canción sin importar el género. Las categorías de género quedan disponibles para otra cosa: comparar dentro de un mismo estilo.

### 6.7 Las grabaciones viejas suenan distinto por razones técnicas, no artísticas

La hipótesis dice que los dos mundos **se separaron a lo largo de seis décadas**. Pero una grabación de 1965 y una de 2024 no son comparables sin más: en el medio cambió la forma de grabar y masterizar, sobre todo la *loudness war*, la carrera por sacar discos cada vez más fuertes.

Parte de la diferencia que midamos **puede ser tecnología de grabación, no decisión artística**. Sin tratarlo, es la primera objeción que nos van a hacer.

**Cómo lo resolvimos.** En vez de comparar números crudos, comparamos la posición de cada canción **respecto de lo que sonaba en su propio año**. Una canción de 1975 se mide contra las de 1975. La referencia son las 8,9 millones del pozo agrupadas por año: **40.000 canciones por año** en promedio, una base sólida.

**Y de paso evita un error grave en la app.** Sin esto el sistema aprende que "prestigio = suena a grabación vieja" —porque la Academia es conservadora— y le pone puntaje bajo a cualquier canción de 2026 por cómo está producida, no por cómo está compuesta.

---

## 7. El otro camino: la canción que sube el usuario ⏹️ pendiente

Todo lo anterior arma el corpus histórico. Pero hay un segundo camino de datos, completamente distinto: **el archivo que sube el usuario**.

Ahí no hay dataset que valga. Puede ser un demo que no existe en ningún lado. Hay que **analizar el audio directamente**, en nuestro servidor, con **librosa** o **Essentia**: programas gratuitos y de código abierto que abren un archivo de audio y calculan las mismas características.

**Qué falta.** librosa funciona con **Python**, que hoy no está instalado en la máquina. Para bajar y cruzar los datos alcanzó con otra herramienta, pero antes de que la app pueda analizar una canción de verdad hay que instalarlo.

**El problema técnico que queda abierto — el más importante de los pendientes.** Los números del corpus los calculó el algoritmo de Spotify; los del usuario los va a calcular librosa. Son programas distintos: su "energía" y la "energía" de Spotify miden cosas parecidas de maneras distintas.

Si entrenamos con una escala y medimos con otra, la app devuelve números mal calibrados. Otra vez: se ven razonables, están mal.

**Cómo se resuelve.** Tomar unas cien canciones que estén en el dump y de las que tengamos el audio, analizarlas con librosa, y medir cómo se traduce una escala a la otra. Con esa equivalencia se ajustan los números del usuario antes de pasarlos al modelo. Es una tarea acotada, **no se puede saltear**, y hay que dejarla escrita en la página de racional.

**Qué pasa con el archivo.** Se sube, se procesa, se descarta. Hay que decirlo en la pantalla: nadie sube un demo inédito a una web sin saber qué pasa con él, y decirlo genera confianza en usuarios que son muy cuidadosos con su material.

---

## 8. Qué encontramos

Esta sección es nueva: son los resultados de correr todo lo anterior.

### 8.1 El cruce funcionó

| | Encontraron sus características | Tasa |
|---|---|---|
| Canciones nominadas al Grammy | 1.656 de 2.029 | **81,6%** |
| Solo las ganadoras | 330 de 416 | 79,3% |
| Canciones de Billboard | 25.984 de 32.702 | 79,5% |

Este era **el número que decidía el proyecto**. Si hubiéramos cruzado 300 nominaciones no habría modelo posible con estas fuentes y había que replantear todo. Con 1.656, el proyecto va como estaba planteado.

La tasa se mantiene pareja en todas las décadas (entre 73% y 94%), así que ninguna época quedó desabastecida.

### 8.2 El corpus

**26.577 canciones etiquetadas**, ninguna sin año:

| Grupo | Canciones | Qué son |
|---|---|---|
| `hit` | 24.913 | Entraron al Billboard, nunca fueron nominadas |
| `ambas` | 1.071 | **Premio y éxito a la vez** |
| `premiada` | 593 | Nominadas al Grammy, nunca entraron al ranking |
| **Total corpus** | **26.577** | |
| `control` | 27.000 | Ni premio ni éxito. Archivo aparte |
| **Total para entrenar** | **53.577** | Apilando los dos archivos |

| Década | Canciones | Nominadas |
|---|---|---|
| 1950s | 705 | 15 |
| 1960s | 5.451 | 97 |
| 1970s | 4.115 | 150 |
| 1980s | 3.525 | 160 |
| 1990s | 2.878 | 222 |
| 2000s | 2.963 | 297 |
| 2010s | 3.745 | 415 |
| 2020s | 3.195 | 308 |

### Cómo leer los archivos

Los dos archivos finales —`corpus_v2.csv` y `control_v2.csv`— tienen **las mismas 21 columnas en el mismo orden**, así que se apilan directamente para entrenar.

| Columna | Qué es |
|---|---|
| `titulo`, `artista`, `anio` | Identidad. El año es el de la primera aparición en Billboard, o el de la premiación |
| `grammy_gano`, `grammy_nominada` | 1 o 0 |
| `grammy_categorias` | En qué categorías fue nominada |
| `mejor_puesto`, `semanas_en_chart`, `fue_hit` | Su paso por el Billboard Hot 100 |
| **`grupo`** | `premiada` · `hit` · `ambas` · `control`. **Dice de un vistazo qué es cada canción** |
| Las 10 características | `danceability`, `energy`, `valence`, `acousticness`, `instrumentalness`, `speechiness`, `loudness`, `tempo`, `mode`, `duration_ms` |
| `rareza` | Cuán lejos está del centro de su año |

**Al abrirlos en Excel se ven celdas en blanco. Ninguna es un error**, pero conviene saber por qué:

| Columna | Vacía en | Por qué |
|---|---|---|
| `grammy_categorias` | 100% del control, 93,7% del corpus | Nunca fueron nominadas. No hay categoría que poner |
| `mejor_puesto` | 100% del control, 2,2% del corpus | Nunca entraron al ranking. Dejarlo vacío es lo correcto: poner 0 o 101 sería **inventar una posición que no existe** |
| `rareza` | 23,2% del corpus | Son las anteriores a 1970, donde el año del dump no es confiable (ver 6.1). Como el modelo se entrena desde 1970, esas filas quedan fuera igual |

> **Una que sí estaba mal y se corrigió.** `semanas_en_chart` aparecía vacía para las canciones que nunca charteaban. Ahora dice **0**. La diferencia importa: vacío significa "no sabemos", cero significa "sabemos que fue ninguna".

### 8.3 La hipótesis se sostiene

Con la corrección por época aplicada, comparando cada canción contra lo que sonaba su propio año. **Cero significa "suena como la música típica de su época"**:

| Respecto de su propio año | Premiadas | Hits |
|---|---|---|
| Energía | −0,02 | **+0,39** |
| Valencia (alegría) | **−0,12** | +0,16 |
| Acústica | −0,22 | **−0,60** |
| Duración | **+0,18** | 0,00 |

Las premiadas son menos enérgicas, más melancólicas, más acústicas y más largas que los hits. **Los tres ejemplos que estaban en la propuesta original resultaron ciertos**, y ahora sin contaminación de la época:

> *"Energía alta → te suma en popularidad, te resta en prestigio"* ✓
> *"Duración de 5:40 → te suma en prestigio, te resta en popularidad"* ✓
> *"Poca presencia acústica → te resta en prestigio"* ✓

### 8.4 El hallazgo que reformula la hipótesis

La hipótesis original decía que la distancia entre ambos mundos **se amplió**. Los datos dicen algo más específico. La brecha entre premiadas y hits, década por década:

| Década | Valencia | Energía | Acústica | Duración |
|---|---|---|---|---|
| 1970s | **−0,74** | −0,81 | +0,64 | +0,14 |
| 1980s | −0,36 | −0,37 | +0,30 | +0,20 |
| 1990s | −0,45 | −0,35 | +0,46 | −0,01 |
| 2000s | −0,28 | −0,32 | +0,32 | +0,09 |
| 2010s | **+0,04** | −0,32 | +0,24 | +0,15 |
| 2020s | **+0,15** | −0,19 | +0,31 | **+0,54** |

La valencia se cierra de −0,74 a +0,15: **converge y se cruza**. La duración hace lo contrario: se abre de +0,14 a +0,54, con el salto en los 2020s.

**Y quién se movió:**

| Década | Valencia: premiadas | Valencia: hits |
|---|---|---|
| 1970s | −0,33 | **+0,41** |
| 1990s | −0,27 | +0,18 |
| 2010s | −0,02 | −0,06 |
| 2020s | +0,10 | **−0,05** |

La columna de las premiadas se mueve poco. La de los hits se desploma de +0,41 a −0,05. **La Academia premió siempre más o menos lo mismo; el que se movió fue el público**, que pasó de consumir música notablemente más alegre que el promedio a consumir música ligeramente más triste que el promedio.

En duración pasa algo simétrico: en los 2020s las premiadas saltan a +0,51 — se volvieron mucho más largas que la música de su tiempo — mientras los hits se quedaron en el promedio. La brecha de formato no se abre solo porque los hits se acortaron, sino porque las premiadas se estiraron.

### 8.5 La hipótesis reformulada

> **Los dos mundos convergieron en carácter emocional —porque el público se movió hacia el gusto que la Academia siempre tuvo— y al mismo tiempo divergieron en formato, más que nunca en sesenta años.**

Es más específica que la original y sale enteramente de los datos.

**La advertencia honesta:** son unas 65 canciones premiadas por década. Es poco. La dirección es consistente en seis décadas seguidas, lo cual da confianza, pero en la presentación conviene decir el tamaño de muestra antes de que lo pregunten.

---

## 9. Para qué se usa cada dato en la app

| Pantalla | Qué datos usa | Cómo |
|---|---|---|
| **Los dos puntajes** | Todo el corpus | El sistema aprendió qué características acompañan a cada resultado. Le pasamos las de la canción del usuario y devuelve dos probabilidades |
| **El margen de error** ("32%, entre 24% y 41%") | El corpus | Sale de medir cuánto se equivoca el sistema con canciones que nunca vio. Es la promesa de honestidad de la app y **no es opcional** |
| **El gráfico de dos ejes** | Corpus + canción del usuario | Cada canción histórica es un punto. La del usuario es otro punto en el mismo plano |
| **Lista de qué suma y qué resta** | El modelo entrenado | Se calcula cuánto cambia cada puntaje al mover una sola característica dejando el resto igual |
| **"Tu conflicto principal es la energía"** | El modelo entrenado | Es la característica que más empuja los dos puntajes **en direcciones opuestas**. Es el corazón de la app: la tensión |
| **Canciones de referencia** | El corpus | Buscamos las más parecidas dentro de cada grupo (premiadas, exitosas, ambas). No hace falta ningún dataset extra |
| **Simular cambios** | El modelo entrenado | Cada vez que el usuario mueve un control, se recalculan los dos puntajes |
| **Modo álbum** | El modelo entrenado | Lo mismo para varias canciones, ordenadas |
| **Explorar la historia** | Corpus por año | Dos líneas: el promedio de las premiadas y el de las exitosas. La distancia entre ellas es la hipótesis hecha gráfico |
| **El asistente conversacional** | Resultados + acceso al modelo | Recibe los números ya calculados y los traduce a lenguaje de músico. Cuando el usuario pregunta "¿y si bajo la energía?", **le pide al modelo que recalcule** y responde con el número real |

**La regla que atraviesa todo:** los números los calcula el modelo, siempre igual. La inteligencia artificial conversacional **interpreta y traduce, nunca calcula ni decide**. Todo número que aparezca en pantalla se puede reproducir sin llamar a un modelo de lenguaje.

Esto importa por dos razones prácticas. Una: en una demo en vivo, los resultados dan siempre lo mismo. Dos: cuando pregunten "¿y esto no lo inventa la IA?", la respuesta es no, y se puede demostrar.

---

## 10. Qué NO recolectamos, y por qué

- **Las letras.** La app mide sonido, no texto. Está declarado como límite y el asistente tiene instrucciones de decir "eso está fuera de lo que el análisis mide".
- **Sello discográfico, presupuesto, campaña de prensa.** Pesan muchísimo en un Grammy real, pero no son características del sonido. Reconocerlo abiertamente es lo que hace honesta a la herramienta.
- **Cantidad de reproducciones.** Redundante con Billboard y no existe antes de 2015.
- **Un dataset de "canciones de referencia".** Salen del mismo corpus.
- **Datos de los usuarios.** No hacen falta para que la app funcione.

---

## 11. Estado y qué falta

| | Estado | Volumen |
|---|---|---|
| Billboard Hot 100 | ✅ | 32.702 canciones, 1958–2026 |
| Nominaciones al Grammy | ✅ | 2.513 (488 ganadoras), 1959–2026, 14 categorías |
| Características del sonido | ✅ | 56.277.664 canciones, 4,1 GB |
| Cruce de las tres | ✅ | 26.577 etiquetadas, 81,6% de matching |
| Grupo de control | ✅ | 27.000, 4.500 por década desde 1970 |
| Análisis normalizado por época | ✅ | Hipótesis confirmada y reformulada |
| Selección de características | ✅ | 10 características + rareza. Fuera: tonalidad y en vivo |
| **Corpus final** | ✅ | `datasets/corpus_v2.csv` — 26.577 canciones |
| Análisis del audio del usuario | ⏹️ | Falta instalar Python + librosa |
| Calibración entre las dos escalas | ⏹️ | El pendiente técnico más importante |
| Modelo de los dos puntajes | ⏹️ | Siguiente paso |

**Lo que falta, en orden:**

1. **Entrenar el modelo** que convierte el corpus en los dos puntajes, con sus márgenes de error.
2. **Instalar Python** y probar librosa con tres canciones conocidas.
3. **Calibrar las dos escalas** (sección 7). Sin esto la app devuelve números mal calibrados.
4. La interfaz.

---

## 12. Los scripts

Todos en `pyp/scripts/`, todos re-corribles.

| Script | Qué hace | Cuánto tarda |
|---|---|---|
| `fetch_grammy.js` | Baja las categorías de Wikipedia y las convierte en tabla | ~30 s |
| `preparar_billboard.js` | Colapsa las 355.001 filas semanales a una por canción | segundos |
| `cruzar.js` | Une las tres fuentes y arma el corpus etiquetado | ~4 min |
| `validar_anio.js` | Mide si la fecha del dump sirve como año, contra Billboard | ~12 s |
| `armar_control.js` | Arma el grupo de control y guarda el pozo completo | ~1 min |
| `analisis_normalizado.js` | El análisis por época: perfiles, brecha y quién se movió | ~1 min |
| `armar_corpus_v2.js` | Saca tonalidad y en vivo, calcula la rareza, arma el corpus final | ~1 min |
| `generar_imagenes.js` | Exporta los mockups de la app como PNG | ~20 s |
| `md_a_pdf.js` | Convierte cualquier documento de esta carpeta a PDF | ~10 s |

> Nota de rendimiento: la primera versión de estos scripts agrupaba los 43 millones de canciones de una sola vez y se quedaba sin memoria, volcando 22 GB a disco. Filtrar **antes** de agrupar bajó el tiempo de "se cuelga" a 11 segundos. Es la diferencia entre pedirle a la base que ordene toda la biblioteca y pedirle que ordene solo el estante que nos interesa.

---

## 13. Glosario

**Dataset** — un archivo con datos ordenados en filas y columnas, como una planilla de Excel pero mucho más grande.

**Dump** — una copia completa de una base de datos, publicada como archivo para que otros la usen.

**Feature / característica** — una columna que describe algo medible de una canción. "Energía = 0,73" es una característica.

**Parquet** — un formato de archivo pensado para tablas enormes. Ocupa mucho menos que un CSV y se consulta más rápido.

**Matching / cruce** — juntar dos tablas identificando qué fila de una corresponde a qué fila de la otra.

**Normalizar** — dos sentidos distintos en este documento. Con textos: dejarlos en forma estándar (minúsculas, sin acentos) para poder compararlos. Con números: medir cuánto se aparta un valor de su referencia, en vez de usar el valor crudo.

**Grupo de control** — el conjunto de ejemplos "comunes", los que no tienen nada especial. Sirve para que el sistema sepa contra qué comparar.

**Entrenar un modelo** — mostrarle al sistema miles de ejemplos con la respuesta puesta, para que aprenda solo qué combinaciones llevan a cada resultado.

**Margen de error** — cuánto puede equivocarse una estimación. "32%, entre 24% y 41%" dice que el valor real probablemente esté en ese rango.

**API** — la forma en que un programa le pide datos a otro por internet. Spotify tenía una para las características de sonido; la cerró en 2024.

**librosa** — programa gratuito que abre un archivo de audio y calcula sus características.

**Loudness war** — la tendencia de la industria, desde los 90, a masterizar los discos cada vez más fuerte. Hace que las grabaciones de distintas épocas no sean comparables sin ajuste.
