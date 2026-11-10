# Racional — por qué P&P es como es

Este documento explica por qué la herramienta es como es. No describe la interfaz: justifica decisiones. Está escrito para alguien que no vio la cursada y quiere entender el problema, los datos, el modelo y el diseño, y poder repetir el razonamiento.

Todos los números están medidos sobre los archivos del repositorio. Donde un número viene de afuera, está la fuente.

> **Estado: borrador del 10 de noviembre de 2026.** Las secciones 1 a 6 están escritas. Las secciones 7 a 9 (usuario, diseño, proceso con la IA) se escriben el viernes 13.

---

## 1. Problema y contexto

*(Se completa el viernes 13 con la evidencia real: cómo decide hoy un productor o un sello, y la devolución de un productor al que vamos a visitar.)*

Lo que sí está definido: la herramienta es para **quien hace música y está decidiendo cómo terminar una canción**: un productor, una artista, alguien con un demo. La decisión que tiene adelante es de arreglo y mezcla —más o menos acústico, más o menos largo, más o menos fuerte— y P&P le muestra hacia cuál de dos mundos lo lleva cada decisión.

---

## 2. Hipótesis

**La hipótesis original**, de agosto de 2026:

> Existe un tipo de perfil sonoro medible asociado al reconocimiento de la Academia, distinto del perfil asociado al éxito comercial masivo, y la distancia entre ambos se amplió a lo largo de las últimas décadas.

**Lo que dijeron los datos.** La primera mitad se confirma: los dos perfiles existen y se distinguen con números. La segunda se confirma a medias y en una dirección que no esperábamos: los dos mundos **se acercaron en el ánimo y se alejaron en la duración**. Durante cincuenta años los éxitos fueron más alegres que las premiadas; esa diferencia se achicó hasta desaparecer en los 2010 y se dio vuelta en los 2020. Lo que se movió fue el público, no la Academia. Al mismo tiempo, la diferencia de duración pasó de un segundo en los noventa a 43 segundos hoy.

**Lo que asumimos y lo que no podemos afirmar:**

| Asumimos | No afirmamos |
|---|---|
| Que el **sonido** de una canción —diez características medidas por Spotify— alcanza para describir un perfil | Que el sonido explique por qué una canción gana un premio o entra al ranking. Un Grammy depende del sello, la campaña y el momento; un hit también |
| Que ser **nominada** a Record o Song of the Year es reconocimiento de la Academia, sin necesidad de ganar | Que ganar suene distinto de estar nominada: lo medimos y no (sección 3.5) |
| Que **entrar al Hot 100** y el **mejor puesto** son una medida comparable de éxito desde 1958 | Que "popular" signifique lo mismo en 1965 y en 2025: antes medía compras, hoy mide reproducciones (sección 5) |
| Que la **letra**, las **redes sociales** y **YouTube** influyen en los dos ejes | Que podamos medirlos: no los incluimos, y en la sección 6 está el porqué |

**La frase que resume lo que la app dice y lo que no:** la herramienta dice **cuánto se parece el sonido de tu canción** a cada uno de los dos perfiles. No predice si vas a ganar ni si vas a ser un éxito.

---

## 3. Datos y trazabilidad

### 3.1 Las fuentes

| Fuente | Qué aporta | Quién la produce | Cada cuánto se actualiza | Licencia | Limitaciones |
|---|---|---|---|---|---|
| **Billboard Hot 100** (vía `utdata/rwd-billboard-data`) | El eje de **popularidad**: si entró al ranking, mejor puesto, año de primera aparición | Billboard publica el ranking; el repositorio de la Universidad de Texas en Austin (Christian McDonald) lo recopila | Billboard, semanal; el repositorio, cada semana | MIT | Hasta noviembre de 1991 el ranking se armaba con encuestas a disquerías y radios, no con medición electrónica. Solo mide Estados Unidos |
| **Premios Grammy** (Wikipedia, 14 categorías) | El eje de **prestigio**: nominaciones y ganadoras 1959–2026 | Los colaboradores de Wikipedia; lo extrajimos nosotros con `codigo/fetch_grammy.js` | Wikipedia se edita en continuo; nuestra copia es del 18 de agosto de 2026 | CC BY-SA 4.0 | Lo armamos nosotros porque ningún dataset público tenía las décadas viejas; tuvo errores de extracción que corregimos el 26 de septiembre |
| **Características del sonido** (`GildasLeDrogoff/spotify-huge-track-analysis-dataset`, Hugging Face) | Las 10 variables de cómo suena cada canción | **Spotify** calculó los valores para su propio sistema de recomendación; Gildas Le Drogoff los recopiló antes de que Spotify cerrara el acceso en noviembre de 2024 | No se actualiza: Spotify cerró la API | **CC BY-NC 4.0** (no comercial) | El algoritmo de Spotify es una caja negra. Pesa 4,1 GB y no está en el repositorio. Si el proyecto se quisiera monetizar habría que reemplazar la fuente |
| **ReccoBeats** (API) | Mide 7 de las 10 variables del audio que sube el usuario | ReccoBeats | Servicio en línea | Gratuito; sin licencia publicada | Solo acepta MP3 estéreo; lo armamos en el navegador. Calibrado contra Spotify con 10 canciones (correlación 0,89–0,97) |
| **Essentia.js** | Mide tempo y modo del audio que sube el usuario, en el navegador | Music Technology Group, Universitat Pompeu Fabra | Versión 0.1.3 | AGPL-3.0 | Acertó el tempo en 8 de 10 canciones de prueba |

### 3.2 Cómo se cruzan

Las tres fuentes principales no comparten ningún código. La única clave en común es **título + artista**, normalizados (minúsculas, sin tildes, sin lo que va entre paréntesis).

```
Billboard (32.702 canciones)  ─┐
                               ├─ título + artista ─►  dump de Spotify (43,6 M canciones únicas)  ─►  corpus_v2.csv
Grammy (2.049 canciones)      ─┘
```

Dos problemas del cruce que están documentados en `decisiones.md` y que explican por qué no todo cruza: la columna de artista de Wikipedia a veces traía al **productor** (lo corregimos leyendo los encabezados de cada tabla), y el dump de Spotify tiene **varias versiones de cada canción** (en vivo, remix, remaster). Nos quedamos con una sola por canción: se descartan las que dicen "live", "remix", "karaoke", "cover", "instrumental" o "demo", y entre las que quedan, la más popular.

El **grupo de control** no viene de un cruce: son 27.000 canciones del dump que no están ni en Billboard ni en el Grammy, 4.500 por década desde 1970. Sin ese grupo el modelo nunca vería cómo suena una canción común y no tendría contra qué comparar.

### 3.3 El embudo: cuántas canciones entran y salen en cada paso

Medido el 10 de noviembre de 2026 sobre los archivos del repositorio.

| Paso | Cuántas | Qué pasa |
|---|---|---|
| Dump de Spotify | 56.277.664 filas | Varias versiones por canción |
| Una versión por canción | 43.618.889 | Se descartan en vivo, remix, karaoke, cover, instrumental, demo |
| Billboard, filas semanales | 355.001 | Una por canción por semana, desde el 4 de agosto de 1958 |
| Billboard, canciones | **32.702** | Una fila por canción: mejor puesto, semanas, año de entrada |
| Grammy, nominaciones | 2.513 | 14 categorías, 1959–2026; 488 ganaron |
| Grammy, canciones | **2.049** | Una canción nominada en tres categorías es una canción |
| **Cruce con el sonido → `corpus_v2`** | **26.577** | 25.984 de las 32.702 de Billboard cruzaron (79%); 1.664 de las 2.049 del Grammy (81%) |
| &nbsp;&nbsp;↳ `hit` | 24.913 | Entró al ranking, nunca nominada |
| &nbsp;&nbsp;↳ `ambas` | 1.071 | Premio y éxito a la vez |
| &nbsp;&nbsp;↳ `premiada` | 593 | Nominada, nunca entró al ranking |
| **Grupo de control → `control_v2`** | **27.000** | 4.500 por década, 1970–2020 |
| **Todo, para el análisis** | **53.577** | Las seis décadas: con esto se prueba la hipótesis |
| Ventana desde 2000 | 23.403 | 9.903 del corpus + 13.500 del control |
| Cruces rotos (volumen < −25 dB) | −15 | Canciones cruzadas con otra versión, p. ej. con energía 0,00 |
| **Lo que entrena la herramienta** | **23.388** | |
| &nbsp;&nbsp;↳ reconocidas (Record o Song of the Year) | **212** | El perfil de prestigio |
| &nbsp;&nbsp;↳ hits nunca nominados | **8.870** | El grupo contra el que se compara el prestigio |
| &nbsp;&nbsp;↳ nominadas solo por género | 806 | Fuera del eje de prestigio; sí en el de popularidad |
| &nbsp;&nbsp;↳ entraron al Hot 100 (`fue_hit`) | 9.497 | El perfil de popularidad |
| &nbsp;&nbsp;↳ no entraron (control) | 13.500 | El grupo contra el que se compara la popularidad |

Dos aclaraciones sobre números que aparecen distintos en otros documentos del repositorio:

- El readme y el diccionario dicen **213 reconocidas y 8.883 hits**: es la cuenta antes de descartar los 15 cruces rotos. Después del filtro quedan 212 y 8.870. Es la misma población.
- En el archivo del Grammy hay **247 canciones** nominadas a Record o Song of the Year desde 2000; en el entrenamiento quedan 212. Las 35 que faltan no cruzaron con el dump de Spotify o cayeron en el filtro de volumen. Es el costo de depender de un cruce por nombre.

**Un límite encontrado el 3 de noviembre:** 98 canciones de Billboard o del Grammy, desde 2000, figuran con instrumentalidad mayor a 0,5. Algunas son cruces rotos seguros —*Havana*, de Camila Cabello, aparece como instrumental a −12 dB— y otras pueden ser mediciones reales de Spotify en voces susurradas. No las filtramos todavía porque no tenemos una regla que separe las dos cosas sin mirarlas una por una. Está en la lista de pendientes.

### 3.4 Diccionario de variables

El diccionario completo, con los rangos medidos de las 21 columnas, está en [`datasets/diccionario.md`](datasets/diccionario.md). Acá van las que usa la herramienta.

**Las 10 características del sonido.** Las calculó Spotify. Conservan el nombre original en inglés para que cada valor se pueda rastrear hasta la fuente.

| Variable | Qué mide, en criollo | Unidad y rango | En la app se llama |
|---|---|---|---|
| `energy` | Cuánta intensidad tiene: rápida, fuerte, ruidosa | 0 a 1 | energía |
| `valence` | Qué tan alegre suena: 1 alegre, 0 triste | 0 a 1 | valencia |
| `acousticness` | Qué tan probable es que sea acústica y no eléctrica | 0 a 1 | acústica |
| `duration_ms` | Cuánto dura | milisegundos; la app lo muestra en min:seg y el modelo lo usa en minutos | duración |
| `danceability` | Qué tan bailable: pulso estable, ritmo regular | 0 a 1 | bailabilidad |
| `loudness` | Volumen promedio de la grabación | decibeles, de unos −60 a 0; los hits rondan −6 | volumen |
| `speechiness` | Cuánta palabra hablada tiene (rap alto, canto bajo) | 0 a 1 | habla |
| `tempo` | Pulsos por minuto | BPM, típicamente 60–200 | tempo |
| `mode` | Si está en modo mayor o menor | 1 mayor, 0 menor | modo |
| `instrumentalness` | Qué tan probable es que no tenga voz cantada | 0 a 1 | instrumentalidad |

**Las etiquetas** que arman los dos ejes:

| Variable | Qué es | Cómo se calcula |
|---|---|---|
| `fue_hit` | Si entró alguna vez al Hot 100 | 1 si la canción está en el archivo de Billboard |
| `mejor_puesto` | El puesto más alto que alcanzó | Mínimo de los puestos semanales; vacío si nunca entró |
| `grammy_categorias` | En qué categorías fue nominada | Lista separada por `\|`; vacía si nunca fue nominada |
| `anio` | Año de referencia | Primera aparición en Billboard, o año de la nominación; en el control, el del dump |

**Qué quedó afuera y por qué** (todo medido, en `decisiones.md`): `semanas_en_chart`, porque su mediana pasó de 17 semanas en los 2000 a 2 en los 2020 y ya no mide lo mismo; semanas en el mejor puesto, porque la mediana es 1 y no distingue nada; el puesto de debut, por decisión del equipo de no complicar el eje; `grammy_gano`, porque ganar no suena distinto de estar nominada (sección 3.5); la tonalidad, "en vivo" y la rareza, descartadas en septiembre.

### 3.5 Cómo se construye cada puntaje, y las zonas del mapa

Los dos puntajes salen de una misma preparación: cada una de las 10 características se convierte a **desvíos respecto del promedio** de las 23.388 canciones (lo que se llama puntaje z). Así una diferencia de 20 BPM de tempo y una de 0,2 de acústica se comparan en la misma escala.

**Prestigio: una pregunta.** ¿Suena como lo que la Academia nomina a Record o Song of the Year?

- Qué compara: las 212 reconocidas contra los 8.870 hits nunca nominados. **No** contra el grupo de control: cuando lo probamos, el modelo aprendía "suena a disco profesional" en vez de "suena a Grammy".
- Algoritmo: regresión logística con pesos balanceados (las dos clases pesan igual aunque una tenga 212 y la otra 8.870), 25 iteraciones de Newton-Raphson, regularización 0,001.
- Las 806 nominadas solo en categorías de género **no entran** a este eje: ni como reconocidas (Best Metal Performance tiene energía 0,94 y acústica 0,002: medirían "metal", no prestigio) ni como no reconocidas (126 de ellas ganaron un Grammy).
- Por qué es binario y no una escalera: medimos si ganar suena distinto de estar nominada. La acústica va 0,187 (nunca nominada) → 0,330 (nominada en una general) → 0,212 (en las dos) → 0,253 (ganó). Sube, baja y vuelve a subir: no está ordenada. Con 71 ganadoras, distinguirlas sería inventar una precisión que los datos no tienen.

**Popularidad: dos preguntas encadenadas.** ¿Suena como lo que entra al Hot 100? Y si entra, ¿como lo que llega alto?

1. **¿Entra?** Regresión logística balanceada: las 9.497 que entraron contra las 13.891 que no.
2. **¿Hasta dónde llega?** Regresión lineal aprendida **solo entre las que entraron**, sobre el mejor puesto convertido a una escala estirada: 100·(1 − ln(puesto)/ln(100)). El puesto 1 vale 100, el 2 vale 85, el 10 vale 50, el 50 vale 15, el 100 vale 0. Se estira así porque medimos cuántas canciones tienen su mejor puesto en cada tramo: del 11 al 100 hay unas 300 por puesto, y en el #1 hay 1.194. El top 10 se lleva la mitad del puntaje.
3. **Puntaje = probabilidad de entrar × hasta dónde llega.**

Hasta el 3 de noviembre era una sola regresión lineal sobre ese puntaje, con 0 para las que no entraron. Como la mayoría son ceros, la recta se gastaba en "entra / no entra" y aplastaba a los hits: Despacito daba 42 de popularidad y Shape Of You 44. Con las dos preguntas separadas dan 62 y 82, y mejora todo lo que medimos: separa hits del resto 0,752 → 0,762 (AUC); acierta el puesto entre los hits 0,066 → 0,121 (correlación).

**Lo que la app muestra: percentiles, con margen.** El número que ve el usuario no es la salida cruda del modelo: es el **percentil** de su canción dentro de las 23.388. Un prestigio de 84 quiere decir que su sonido se parece más al perfil premiado que el 84% de las canciones de la base. El margen (por ejemplo, "entre 78 y 89") sale de reentrenar el modelo 20 veces con muestras distintas de las mismas canciones (bootstrap) y tomar los percentiles 10 y 90, con un piso de ±4 puntos. El margen del prestigio es más ancho que el de la popularidad porque se entrena con 212 canciones contra 9.497.

**Qué suma y qué resta.** Para cada característica, la app calcula el puntaje con el valor real y el puntaje con esa característica puesta en el promedio; la diferencia son los puntos que esa característica aporta. Es lo que se ve en la pantalla de las columnas.

**Las cuatro zonas del mapa.** El mapa tiene la popularidad en el eje horizontal y el prestigio en el vertical, los dos de 0 a 100. Las zonas se cortan en 50:

| Zona | Prestigio | Popularidad | Qué quiere decir |
|---|---|---|---|
| **Las dos cosas** | ≥ 50 | ≥ 50 | Perfil de premio y de público a la vez. Es la zona más chica |
| **Prestigio sin público** | ≥ 50 | < 50 | Suena a lo que la Academia nomina, no a lo que entra al ranking |
| **Hit puro** | < 50 | ≥ 50 | Suena a lo que entra al ranking, lejos del perfil premiado |
| **Ni una cosa ni la otra** | < 50 | < 50 | Donde está la mayoría de la música publicada |

No son clusters calculados: son cuadrantes. Elegimos cortar en 50 porque 50 es la mediana de la base, así que cada eje divide a las canciones en dos mitades iguales.

**Los colores.** La app usa dos colores y nada más, con un significado fijo:

| Color | Significa |
|---|---|
| **Azul** | Tu canción. Y, en las columnas, lo que te **suma** |
| **Ámbar** | Las premiadas. Y, en las columnas, lo que te **resta** |
| Gris | Las 700 canciones de fondo del mapa (una muestra al azar de las 23.388), sin distinguir grupo |
| Azul lleno / azul vacío / gris vacío | En las canciones con nombre del mapa: ganó un Grammy / fue nominada / nunca nominada |

La devolución de la entrega 3 pidió aclarar la identificación de colores en el mapa. Se corrige el viernes 13 con una leyenda visible en el mapa mismo.

---

## 4. El modelo, en un esquema

```
ENTRA                           PROCESO                                   SALE
───────────────────────────     ──────────────────────────────────────    ─────────────────────────────
Un archivo de audio             1. ReccoBeats mide 7 características,     Prestigio: 0–100 con margen
(mp3, wav, m4a)                    Essentia mide tempo y modo,            Popularidad: 0–100 con margen
                                   el navegador mide la duración          La zona del mapa
        o                       2. Cada valor → desvíos respecto del      Qué suma y qué resta en cada eje
                                   promedio de las 23.388                 El conflicto: el rasgo que empuja
Una canción conocida            3. Prestigio: logística (212 vs 8.870)      hacia un lado y saca del otro
(785 buscables de la base)      4. Popularidad: logística (entra) ×       Una lectura escrita por IA a partir
                                   lineal (hasta dónde)                      de esos números, nada más
                                5. Puntaje → percentil entre las 23.388
                                6. 20 remuestreos → margen
```

**Qué quedó afuera y por qué:**

- **La comparación dentro del género.** Prometía dos lecturas (contra toda la música y dentro de lo tuyo), pero no tenemos el género de las canciones y pedirlo en el formulario sin usarlo era una promesa falsa. Se sacó el 2 de noviembre.
- **El chatbot.** El que teníamos no era una IA: era una lista de preguntas previstas. Se sacó y se reemplazó por una IA que solo pone en palabras los números del modelo (sección 9).
- **La letra, las redes y YouTube.** Sección 6.

---

## 5. Las dos instituciones: cómo se arma el Hot 100 y quién vota el Grammy

La devolución de la entrega 3 pidió que podamos explicar cada cuánto se evalúa, quiénes lo hacen y cómo se obtienen las valoraciones. Acá está, con fuentes.

### El Hot 100 de Billboard

- **Qué es.** El ranking semanal de las 100 canciones más populares de Estados Unidos, sin interrupción desde el **4 de agosto de 1958**. Una canción por fila, una lista por semana.
- **Cómo se arma hoy.** Combina tres componentes: **ventas** (descargas y físico), **radio** (audiencia de las emisoras) y **streaming** (reproducciones en plataformas). Los datos los provee Luminate (antes Nielsen Music). Billboard no publica los porcentajes exactos; su propia nota sobre la última actualización dice que el streaming es hoy el factor dominante, seguido por la radio y después las ventas, y que las reproducciones pagas pesan más que las gratuitas.
- **Cómo cambió.** Hasta **noviembre de 1991** se armaba con encuestas a disquerías y listas de radios, reportadas a mano; ahí pasó a medición electrónica de ventas (SoundScan) y radio (BDS). El **streaming** se incorporó en agosto de 2007, y las vistas de **YouTube** en febrero de 2013.
- **Qué significa para nosotros.** En el análisis completo (1958–2026), el 54% de las canciones del eje de popularidad entró al ranking en la era de las encuestas. La herramienta, en cambio, se entrena solo desde el año 2000, ya con medición electrónica: medimos "se parece a lo que entró al chart en su época", no "habría sido igual de popular en 1965".

### Los premios Grammy

- **Quién vota.** Los **miembros votantes** de la Recording Academy: personas que trabajan en la creación o la técnica de las grabaciones (artistas, compositores, productores, ingenieros). La Academia no publica el total en su página de proceso; sí publicó que la camada 2025 sumó unos 2.900 votantes nuevos.
- **Cómo se vota.** Dos rondas: la **primera** define las cinco (u ocho, según la categoría) nominadas; la **final** elige la ganadora. Cada miembro vota solo donde es par: hasta diez categorías en hasta tres campos de género, **más las seis categorías del Campo General**, entre ellas Record of the Year y Song of the Year. Es decir: en las dos categorías que usamos vota la Academia entera; en las de género, solo quienes trabajan en ese género.
- **Cómo cambió.** Hasta 2021 las nominadas finales del Campo General las elegían **comités de revisión** de 15 a 20 miembros anónimos a partir de la primera ronda; la Academia los disolvió en abril de 2021. En el análisis completo, el 88% de las nominaciones de prestigio (651 de 737) son de la época de los comités; en la ventana de la herramienta, desde 2000, lo son todas menos las de 2022 en adelante.
- **Qué significa para nosotros.** Usamos **solo Record y Song of the Year** porque son las únicas categorías que vota toda la Academia y las únicas que existen desde 1959 sin interrupción. Y usamos **nominadas, no solo ganadoras**: ganadoras de Song of the Year hay unas 60 en toda la historia, y con 60 ejemplos un modelo memoriza en vez de aprender. Una nominación ya es reconocimiento; que gane una de las cinco depende de campaña y política, cosas que ningún dato acústico captura.

---

## 6. Lo que no medimos: la letra, las redes y YouTube

La devolución de la entrega 3 marcó dos huecos: la letra y la amplificación en redes y YouTube. Los dos influyen. Acá está cómo, y por qué no los incluimos.

**La herramienta mide el sonido.** Esa es la decisión de fondo: diez características de cómo suena la grabación. Todo lo demás —qué dice, quién la canta, cuánto la empujan— queda afuera y lo decimos en la primera pantalla.

### La letra

**Cómo influye, con lo que se sabe:**

- Del lado comercial está cuantificado: por cada repetición adicional del estribillo, una canción tiene un 14,5% más de probabilidad de llegar al puesto 1 en vez de quedarse en el fondo del ranking. Y un estudio sobre más de 350.000 canciones del Top 40 entre 1970 y 2020 midió que las letras se volvieron más repetitivas, más simples, más negativas y más centradas en uno mismo. Es el mismo movimiento que nosotros encontramos en el sonido.
- Del lado del Grammy hay que separar los dos premios. **Record of the Year** se da por la grabación: ahí medir el sonido es directo. **Song of the Year** se da a los compositores por la obra, y el reglamento exige que la canción "contenga melodía y letra". Para esa categoría medimos con el sonido algo que el premio juzga en parte por la letra.
- Lo que se sabe juega a favor de lo que hicimos: un estudio de la Universidad de Nueva York midió que, para Song y Record of the Year, la letra resulta **menos predictiva que el sonido**. Pesaron más la energía, la acústica y la cantidad de palabra hablada.

**Por qué no la incluimos:**

1. **Derechos.** Las letras tienen derechos de autor. No podemos guardarlas en el repositorio ni en la app. Solo podríamos guardar números calculados sobre ellas, tirando el texto, y eso exige un proceso de medición propio que no tuvimos tiempo de construir y validar.
2. **Cobertura.** Haría falta conseguir y medir la letra de 23.388 canciones, y además pedirle la letra al usuario, porque de un demo no la tenemos.
3. **Tiempo.** Evaluamos una versión chica —unas 1.000 canciones y un panel aparte en la app— y decidimos no hacerla para esta entrega: desplazaba trabajo del racional y de la demo, que son lo que la devolución marcó como más débil.

El detalle, con las fuentes, está en [`analisis/la_letra.md`](analisis/la_letra.md).

### Las redes sociales y YouTube

**Cómo influyen.** Hoy una canción puede entrar al Hot 100 empujada por TikTok antes de sonar en una radio, y el Hot 100 mismo cuenta las vistas de YouTube desde 2013. La amplificación en redes es parte de cómo se fabrica un hit en los 2020.

**Por qué no las incluimos:**

1. **No hay datos comparables en el tiempo.** Nuestra hipótesis compara décadas. YouTube existe desde 2005, Spotify desde 2008, TikTok desde 2016. Para 1965 no hay nada que medir, y para 2005 no hay datos abiertos de alcance en redes.
2. **No hay una fuente abierta ni estable.** Las cifras de reproducciones y de viralidad son de cada plataforma, cambian de definición y no se publican en bloque.
3. **Miden la campaña, no la canción.** Nuestra pregunta es qué suena; la amplificación es qué se hizo con eso después. Son preguntas distintas, y mezclarlas haría que el modelo aprendiera "tuvo presupuesto" en vez de "suena así".

**Lo que sí hacemos con esto:** el Hot 100 ya incorpora el streaming y YouTube en su conteo desde 2007 y 2013. Así que la amplificación en redes está adentro de nuestro eje de popularidad de forma indirecta, en la medida en que mueve el ranking. No la medimos aparte; la heredamos del chart.

---

## 6 bis. El peso de cada factor en la popularidad, desde 2000

Los docentes pidieron dos cosas: asignarle un peso aproximado a cada cosa que hace popular a una canción —el sonido, las redes, la letra, el contexto— y, donde no se pueda medir, decir por qué. Esta sección es eso.

Primero, una aclaración sobre qué quiere decir "popularidad" acá: **entrar al Hot 100** y, si entra, **hasta dónde llega**. Son las dos preguntas del eje. Y el período es **desde 2000**, que es la ventana de la herramienta.

### Lo que medimos nosotros: el sonido

Nuestro modelo usa solo las 10 características del sonido. Entonces lo que el modelo logra explicar es, por definición, **la parte que explica el sonido**. Lo medimos de dos maneras fáciles de leer:

| Pregunta | Qué medimos | Resultado | En criollo |
|---|---|---|---|
| ¿Entra al Hot 100? | Diferencia entre la probabilidad promedio que el modelo le da a las que entraron y a las que no (índice de Tjur; 0 = no distingue nada, 1 = perfecto) | **0,24** | El sonido explica alrededor de **un cuarto** de entrar o no entrar |
| Si entra, ¿hasta dónde llega? | Parte de la variación del puesto, entre los hits, que el sonido explica (R²) | **0,03** | El sonido explica apenas **un 3%** de cuán alto llega |
| Entre los hits, ¿llega al top 10 o no? | Separación entre las que llegaron al top 10 y las que no (AUC; 0,5 = azar, 1 = perfecto) | **0,63** | Distingue poco |

**Y el peso del sonido viene bajando.** El mismo índice, calculado con el modelo de cada período:

| Período | Cuánto de "entrar" explica el sonido |
|---|---|
| 2000–2004 | 0,27 |
| 2005–2009 | **0,31** |
| 2010–2014 | 0,27 |
| 2015–2019 | 0,26 |
| 2020–2026 | **0,22** |

El pico es 2005–2009, la era de iTunes y la radio. Desde ahí baja, y el valor más bajo es el de la era de TikTok. Es evidencia **indirecta**, medida con nuestros datos: cuando el sonido explica menos, es porque otras cosas explican más.

### Lo que no medimos nosotros, pero otros midieron: la difusión

No tenemos datos propios de redes, playlists ni radio. Pero hay cifras publicadas, y las usamos con su fuente y con sus límites:

- **TikTok.** En 2021, más de 175 canciones que fueron tendencia en TikTok entraron al Hot 100, el doble que en 2020 (informe de fin de año de MRC Data, hoy Luminate, con Billboard). En 2024, el **84%** de las canciones que entraron al Billboard Global 200 habían tenido antes un pico de actividad en TikTok (informe de TikTok con Luminate, febrero de 2025, sobre las semanas 1 a 39 del año). Límite: los datos de actividad en TikTok los aportó TikTok.
- **Playlists.** Entrar a *Today's Top Hits* de Spotify suma unos **20 millones** de reproducciones a una canción (Aguiar y Waldfogel, NBER, 2018, midiendo antes y después de entrar y salir de la lista).
- **El chart mismo.** El Hot 100 cuenta el streaming desde 2007 y YouTube desde 2013, y Billboard dice que el streaming es hoy el componente dominante. Así que la difusión en plataformas ya está adentro del ranking: no es algo aparte del éxito, es parte de cómo se mide.

**Lo que no se puede evaluar, y por qué.** No existe un dato abierto, comparable de 2000 a 2026, que diga cuánto se movió cada canción en redes. Las plataformas no lo publican, cambian de definición, y TikTok existe desde 2016. Se podría estimar para una muestra reciente con herramientas pagas (Chartmetric, Luminate), que es lo que usan los sellos; no lo hicimos por costo y porque solo cubriría los últimos años.

### La letra

Queda **pendiente** por decisión del equipo con los docentes. Lo que se sabe: por cada repetición adicional del estribillo, una canción tiene un 14,5% más de probabilidad de llegar al puesto 1 en vez de quedarse abajo; y para los Grammy generales, la letra resultó menos predictiva que el sonido (estudio de la Universidad de Nueva York). La herramienta para medirla ya está en el repositorio (`codigo/letra.js`): mide la letra y guarda solo números, nunca el texto, porque la letra tiene derechos de autor.

### El contexto

Quién es el artista, qué sello lo respalda, cuánta campaña hubo, qué pasaba ese año. **No se puede evaluar con datos abiertos** y no lo intentamos: es lo que queda cuando se descuenta todo lo demás.

### La tabla de pesos

Con todo lo anterior, esta es nuestra estimación. **El único número medido es el del sonido.** Los otros tres son una estimación razonada a partir de las fuentes de arriba, forzada a sumar 100, y hay que leerlos como órdenes de magnitud, no como mediciones.

| Factor | Peso aproximado en **entrar al chart** | Peso aproximado en **llegar alto** | De dónde sale |
|---|---|---|---|
| **El sonido** | **~25%** | **~5%** | Medido con nuestro modelo (0,24 y 0,03) |
| **La difusión**: redes, playlists, radio, YouTube | ~40% | ~50% | Estimado. El 84% de las entradas al Global 200 con viralidad previa en TikTok, y el peso dominante del streaming en el Hot 100, dicen que es el factor más grande hoy. Para llegar alto pesa más todavía |
| **La letra** | ~10% | ~10% | Estimado. Efecto medido de la repetición del estribillo; menos predictiva que el sonido en el Grammy |
| **El contexto**: artista, sello, campaña, momento | ~25% | ~35% | Lo que queda. No evaluable con datos abiertos |

**Cómo se lee.** Si una canción entra al Hot 100, alrededor de un cuarto de eso se explica por cómo suena, y ese cuarto es lo que P&P mide. El resto —la difusión, la letra, el contexto— la herramienta no lo ve, y lo decimos en la primera pantalla. Y para predecir cuán alto llega, el sonido casi no sirve: por eso la app dice "cuánto te parecés al perfil que entra" y nunca "vas a llegar al puesto tal".

---

## 7. Usuario y recorrido

*(Viernes 13.)*

## 8. Decisiones de diseño

*(Viernes 13. Por ahora, la versión corta está en [`diseno/prototipos/prototipo_matias/decisiones_de_diseno.md`](diseno/prototipos/prototipo_matias/decisiones_de_diseno.md).)*

## 9. Proceso y uso de la IA

*(Viernes 13. Lo que ya está definido: no hay bocetos previos a la IA —el primer diseño se hizo en Figma conversando con Claude— y el proceso humano se cuenta con lo que se decidió después: sacar el chatbot, rehacer la app desde nuestro borrador y no desde el prototipo de un compañero, los controles en vertical. El texto de sistema de la IA que explica el resultado está en [`prompts/lectura_ia.md`](prompts/lectura_ia.md).)*

---

## Fuentes externas citadas en este documento

- Recording Academy, [proceso de votación](https://www.grammy.com/awards/voting-process)
- The Hollywood Reporter, [disolución de los comités de nominación](https://www.hollywoodreporter.com/news/general-news/grammys-recording-academy-cuts-nomination-review-committees-4176889/) (abril de 2021)
- Recording Academy, [camada 2025 de miembros](https://musicrow.com/2025/11/recording-academy-welcomes-over-3800-new-members/)
- Wikipedia, [Billboard Hot 100](https://en.wikipedia.org/wiki/Billboard_Hot_100): primera edición, incorporación del streaming (2007) y de YouTube (2013)
- Billboard, [cambios en la ponderación del streaming](https://www.billboard.com/articles/news/8427967/billboard-changes-streaming-weighting-hot-100-billboard-200)
- Luminate, [equivalencias de los charts](https://support.luminatedata.com/portal/en/kb/articles/billboard-chart-equivalents)
- TikTok, [informe de música 2021](https://newsroom.tiktok.com/en-us/year-on-tiktok-music-report-2021) (175 canciones al Hot 100) y [Music Impact Report con Luminate](https://newsroom.tiktok.com/tiktok-and-luminate-release-latest-music-impact-report) (febrero de 2025, 84%)
- Aguiar y Waldfogel, [Platforms, Promotion, and Product Discovery](https://www.nber.org/papers/w24713.pdf), NBER 2018 (playlists)
- Las fuentes sobre la letra están en [`analisis/la_letra.md`](analisis/la_letra.md); las de "popular antes y ahora", en [`analisis/nuevos_puntos.md`](analisis/nuevos_puntos.md). El análisis de por qué no incluimos las redes ni la letra, con pruebas propias, está en [`analisis/redes_y_letra.md`](analisis/redes_y_letra.md).
