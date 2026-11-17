# Racional — P&P (versión corta)

P&P (Prestigio & Popularidad) · Matías Expósito, Tomás Kelly y Diógenes Ustariz · Universidad de San Andrés · noviembre de 2026

App: https://pyp-ashy.vercel.app · Repositorio: https://github.com/matiasexposito/prestigio_popularidad

La versión completa, con todas las mediciones y el detalle de cada decisión, está en [`racional.md`](racional.md).

---

## 1. El problema

P&P es para alguien que hace música y está terminando una canción: ya tiene un demo o una mezcla, pero todavía la puede cambiar. En ese momento decide cosas como hacerla más acústica, acortarla o mezclarla más fuerte, y hoy lo decide a oído. Lo que le mostramos es a cuál de dos mundos se parece el sonido de su canción, el que nomina la Academia del Grammy y el que entra al ranking de Billboard, y qué pasa con ese parecido si cambia algo.

Buscamos si ya existía algo así. Los sellos usan tableros de datos para decidir a quién contratar, pero esos tableros miran a la audiencia de una canción que ya salió: seguidores, oyentes, playlists. Ninguno mira el sonido de una canción que todavía no se publicó.

## 2. La hipótesis

> Existe un tipo de perfil sonoro medible asociado al reconocimiento de la Academia, distinto del perfil asociado al éxito comercial masivo, y la distancia entre ambos se amplió a lo largo de las últimas décadas.

Es la hipótesis con la que arrancamos el proyecto, tal como la escribimos.

La primera parte se confirma. Desde el año 2000, las nominadas a Record o Song of the Year duran 21 segundos más que los éxitos que nunca fueron nominados (3:57 contra 3:36), son una vez y media más acústicas y tienen menos energía. La segunda parte se confirma a medias, y en una dirección que no esperábamos: la distancia no se amplió en todo. Los dos mundos se acercaron en el ánimo y se alejaron en la duración. Durante cincuenta años los éxitos fueron más alegres que las nominadas, y en los 2020 eso se dio vuelta. Lo que se movió fue el público, no la Academia. Al mismo tiempo, la diferencia de duración pasó de un segundo en los noventa a 43 segundos hoy.

Lo que no podemos afirmar:

- Que el sonido explique por qué una canción gana un premio o entra al ranking. Explica una parte, y la medimos (punto 5).
- Que ganar suene distinto de estar nominada. Lo medimos y no.
- Que "popular" signifique lo mismo en 1965 y hoy. Antes se medían compras y ahora reproducciones.

La app dice cuánto se parece una canción a cada perfil. No predice si va a ganar un premio ni si va a ser un éxito.

## 3. Los datos

| Fuente | Qué aporta | Licencia | Límite |
|---|---|---|---|
| Billboard Hot 100 | La popularidad: si la canción entró al ranking y su mejor puesto | MIT | Solo mide Estados Unidos |
| Premios Grammy (Wikipedia) | El prestigio: qué canciones fueron nominadas | CC BY-SA 4.0 | Lo armamos nosotros, categoría por categoría |
| Características del sonido (Spotify) | Las 10 medidas de cómo suena cada canción | CC BY-NC 4.0, solo uso no comercial | Spotify cerró ese dato en 2024 y nunca publicó cómo lo calcula |
| ReccoBeats y Essentia.js | Miden el audio que sube la persona | Gratuito / código abierto | Miden parecido a Spotify, no igual |

El Hot 100 sale todas las semanas y suma ventas, radio y streaming. Los Grammy se votan una vez por año entre la gente que trabaja haciendo discos. Usamos solo Record of the Year y Song of the Year porque son las dos categorías que vota toda la Academia.

Las tres fuentes no comparten ningún código, así que las cruzamos por título y artista, usando siempre la versión original de cada canción. Sumamos además un grupo de canciones comunes, que no están ni en Billboard ni en los Grammy, para que el modelo tenga contra qué comparar.

**Por qué cortamos en el año 2000.** Para probar la hipótesis usamos todo, de 1958 a 2026. Para la herramienta usamos solo canciones desde el 2000, por dos motivos: antes de esa fecha los éxitos eran más alegres que las nominadas y después se dio vuelta, así que son dos reglas opuestas; y las grabaciones nuevas suenan más fuerte, con lo cual el modelo confundía "fuerte" con "reciente".

**Cuántas canciones.** Desde el 2000 quedaban 23.403. Sacamos 124 que tenían datos mal: duplicadas, cruzadas con otra versión de la canción o con valores imposibles. No sacamos nada a ojo: cada caso lo volvimos a medir con nuestras propias herramientas. La herramienta se entrena con 23.279 canciones, de las cuales 202 son nominadas y 9.397 entraron al ranking.

## 4. El modelo

Medimos 10 características del sonido: energía, valencia (qué tan alegre suena), acústica, duración, bailabilidad, volumen, habla, tempo, modo e instrumentalidad.

**Prestigio.** Comparamos las 202 nominadas contra los 8.788 éxitos que nunca fueron nominados. Lo hacemos contra los éxitos y no contra las canciones comunes porque, si no, el modelo aprendía "suena a disco profesional" en vez de "suena a Grammy".

**Popularidad.** La medimos con dos preguntas, una después de la otra:

1. **¿Entra al Hot 100?** Comparamos las 9.397 canciones que entraron al ranking contra las 13.882 que no entraron. De ahí sale qué tan parecida es una canción a las que entran.
2. **Si entra, ¿hasta dónde llega?** No es lo mismo entrar en el puesto 95 que llegar al puesto 1. Para esta pregunta miramos solo las canciones que entraron, y comparamos las que llegaron arriba con las que se quedaron abajo. De ahí sale qué tan parecida es una canción a las que llegan a los primeros puestos.

El puntaje de popularidad junta las dos respuestas: una canción da alto si suena como las que entran **y además** como las que llegan arriba. Para la segunda pregunta, el puesto se pasa a una escala donde el 1 vale 100, el 10 vale 50 y el 100 vale 0. Los diez primeros puestos se llevan la mitad de la escala, porque llegar ahí es mucho más raro que quedar en el medio.

Al principio hacíamos una sola cuenta, que les ponía cero a todas las canciones que no entraron. Como la mayoría de las canciones no entra, esa cuenta se gastaba en separar "entró" de "no entró" y casi no distinguía un éxito enorme de uno chico: *Despacito* y *Shape Of You* daban casi lo mismo. Con las dos preguntas separadas, eso se arregló.

**El número que ve la persona** es un percentil. Un prestigio de 88 quiere decir que la canción se parece más al perfil nominado que 88 de cada 100 canciones de la base. Al lado va el margen de error, que es más ancho en el prestigio porque se aprende de solo 202 canciones.

**El mapa** pone la popularidad de izquierda a derecha y el prestigio de abajo hacia arriba. Cortando cada eje en 50 quedan cuatro zonas: las dos cosas, prestigio sin público, hit puro, y ni una cosa ni la otra. Muestra la canción de la persona entre 100 canciones reales, para que el resultado se entienda por comparación y no como dos números sueltos.

**Cómo medimos una canción nueva.** Las canciones de la base las midió Spotify, pero Spotify cerró ese dato en 2024, así que para la canción que sube la persona tuvimos que buscar otra forma. La resolvimos con dos herramientas. **Essentia** mide el tempo y el modo adentro del navegador, sin que el archivo salga de la computadora. **ReccoBeats** es un servicio gratuito que devuelve las mismas características que daba Spotify y en la misma escala: energía, valencia, acústica, bailabilidad, habla, volumen e instrumentalidad. Como ReccoBeats analiza solo 30 segundos por vez, la app corta la canción en tramos de 30 segundos, los mide todos y saca el promedio. Después corrige el resultado para que se parezca al de Spotify, con una corrección que sacamos comparando 31 canciones.

**El límite.** Esa medición es parecida a la de Spotify, pero no igual. Por eso un archivo subido muestra un margen más ancho.

## 5. Lo que no medimos: la letra, las redes sociales y YouTube

La herramienta mide solo el sonido, y lo primero que hicimos fue medir cuánto explica: el sonido explica el 24% de que una canción entre al Hot 100, el 3% de cuán alto llega y el 10% de que la nominen. O sea que la mayor parte depende de otras cosas. Las redes sociales son hoy el camino más corto al ranking: en 2024, el 84% de las canciones que entraron al ranking mundial de Billboard ya habían tenido un pico en TikTok antes. YouTube directamente forma parte del ranking, porque sus vistas cuentan desde 2013. La letra también influye: hay estudios que muestran que las canciones con más repetición llegan más alto, y Song of the Year premia la composición, que incluye la letra. En el prestigio, las redes y YouTube pesan de forma indirecta: vuelven popular a la canción, y encontramos que el 86% de las nominadas había entrado al Hot 100 y el 61% había llegado a los diez primeros puestos. Para que nominen una canción, haber sido un éxito pesa mucho más que cómo suena.

Si alguien quisiera analizar todo, y no solo el sonido, este es el peso aproximado que le daríamos a cada cosa:

| Factor | Entrar al ranking | Llegar alto | Ser nominada |
|---|---|---|---|
| El sonido (medido) | 25% | 5% | 10% |
| Redes sociales | 20% | 25% | 10% |
| YouTube | 5% | 5% | 5% |
| Playlists y radio | 15% | 20% | 10% |
| La letra | 10% | 10% | 15% |
| El contexto: artista, sello, campaña | 25% | 35% | 50% |

Solo la fila del sonido es una medición nuestra. Las demás son una estimación apoyada en estudios publicados: lo que defendemos es el orden, no el número exacto.

**Por qué no las incluimos.** Porque la herramienta está pensada para una canción que todavía no salió: un demo no tiene redes, ni vistas, ni letra cargada en ningún lado, y el sonido es lo único que se puede medir siempre y lo único que se puede cambiar desde el estudio. Además, no hay datos abiertos de redes para todo el período; las vistas de YouTube son las de hoy y no las del momento en que la canción estaba en el ranking; usar las vistas para explicar el éxito es explicar el éxito con el éxito; y las letras tienen derechos de autor, así que se pueden medir pero no guardar. Hicimos una prueba chica con la letra de 120 canciones y casi no separa a las nominadas de los éxitos.

## 6. Usuario y recorrido

La persona tiene un archivo de audio y quiere saber a qué se parece lo que hizo. No sabe de estadística, así que cada número lleva al lado, en palabras, qué quiere decir.

El recorrido tiene ocho pantallas: la portada, los dos mundos (qué vamos a medir y qué no), crear cuenta, subir la canción, el resultado con el mapa y los dos puntajes, qué suma y qué resta en cada puntaje, un simulador donde se mueve un control y el punto se mueve en el mapa, y The Engineer, un asistente al que se le pregunta qué hacer con el resultado. Quien todavía no tiene su canción puede probar con una conocida. Desde cualquier pantalla se puede entrar a Historia, Cómo lo hicimos y Nosotros.

## 7. Decisiones de diseño

- **El mapa manda.** Ocupa casi toda la pantalla del resultado y los números van al costado, porque un "88 de prestigio" suelto no dice nada hasta que se ve al lado de qué canciones cayó.
- **Dos colores y un solo significado para cada uno.** Azul es prestigio y ámbar es popularidad, en todas las pantallas. Todo lo demás es blanco, negro y gris.
- **Tres tipografías.** Una para los títulos, una para los textos y una monoespaciada para todos los números, así se distingue lo que se midió de lo que se dice sobre lo medido.
- **Los rasgos en vertical**, como una consola de mezcla, que es el aparato que alguien que hace música ya conoce.
- **El margen de error siempre a la vista.** Mostrar un número solo sería fingir una precisión que no tenemos.
- **Todo entra en una pantalla**, sin bajar, y con explicaciones de una frase.

## 8. El recorte

Medimos el mercado de Estados Unidos, con canciones del 2000 al 2026, dos categorías del Grammy (Record y Song of the Year) y el sonido de la grabación. Quedan afuera el éxito en otros países, las categorías de género, la letra, el artista y la campaña. Por eso decimos "nominada a Record o Song of the Year" y no "ganadora del Grammy", y "se parece al perfil" y no "va a pegar".

## 9. Uso de la IA

La app y los programas de datos los escribió una IA (Claude). Qué se hace, qué se acepta y qué se tira lo decidimos nosotros. Algunos ejemplos:

- La IA aplicó nuestro diseño encima de un prototipo anterior. Lo rechazamos y pedimos rehacer la app desde nuestro borrador.
- Había un chatbot que no entendía preguntas con otras palabras. Lo sacamos: o es una IA de verdad, o no va. Después lo rehicimos como una IA de verdad, The Engineer.
- Notamos que Despacito daba más prestigio que popularidad. De ahí salió el cambio a las dos preguntas encadenadas.
- Lo más simple para limpiar los datos era borrar todas las canciones sospechosas. Pedimos volver a medir cada una y se sacaron solo las que estaban mal.
- Pedimos que bajara letras y canciones para probar. Se negó, por los derechos de autor.

No tenemos bocetos anteriores a la IA: el primer diseño lo armamos en Figma conversando con Claude, y preferimos decirlo antes que inventar un antes. Las dos versiones del borrador están en el repositorio.

Dentro de la app hay dos usos de IA, y los dos reciben solo los números de la canción, sin el título ni el artista.

**La lectura** es una frase que pone el resultado en palabras: a qué perfil se parece más la canción y a cuál menos. Tiene prohibido predecir u opinar de lo que no medimos. Las instrucciones que recibe están en el repositorio, con fecha. Los puntos de cada rasgo no los escribe la IA: los explica la app en la pantalla "Qué suma y qué resta", con una frase por rasgo armada con los números del modelo.

**The Engineer** es un asistente con el que se conversa. Lo armamos con Claude Haiku. El nombre viene del ingeniero de sonido, la persona que en un estudio escucha la canción y dice qué tocar. Explica el resultado, arma un plan si alguien quiere subir un puntaje, y también da ideas para una canción o ayuda con una letra. Lo importante es que los números no los inventa la IA: si alguien pregunta "¿y si bajo la energía?", la cuenta la hace el modelo y la IA solo explica el resultado. La pantalla separa lo que es medido de lo que es una idea. Si la IA no responde, el asistente sigue contestando con reglas simples y lo avisa. Sus instrucciones están en el repositorio, en `api/asistente.js`.

---

## Fuentes

- Billboard Hot 100: repositorio de la Universidad de Texas en Austin, https://github.com/utdata/rwd-billboard-data
- Premios Grammy: Wikipedia, una página por categoría
- Características del sonido: Gildas Le Drogoff, https://huggingface.co/datasets/GildasLeDrogoff/spotify-huge-track-analysis-dataset
- ReccoBeats, https://reccobeats.com · Essentia.js, https://mtg.github.io/essentia.js/
- Recording Academy, cómo se vota: https://www.grammy.com/awards/voting-process
- TikTok y Luminate, Music Impact Report, febrero de 2025 (el 84%): https://newsroom.tiktok.com/tiktok-and-luminate-release-latest-music-impact-report
- Nunes, Ordanini y Valsesia, "The power of repetition", 2015 (la repetición en las letras): https://myscp.onlinelibrary.wiley.com/doi/abs/10.1016/j.jcps.2014.12.004
- Water & Music, cómo usan datos los sellos, 2020: https://www.waterandmusic.com/how-ars-use-data-to-scout-and-evaluate-artists
