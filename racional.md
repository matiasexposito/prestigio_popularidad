# Racional — por qué P&P es como es

**P&P (Prestigio & Popularidad)** · Matías Expósito, Tomás Kelly y Diógenes Ustariz · Universidad de San Andrés · noviembre de 2026

App: https://pyp-ashy.vercel.app · Repositorio: https://github.com/matiasexposito/prestigio_popularidad

Este documento explica por qué la herramienta es como es. No describe la interfaz: justifica decisiones. Está escrito para alguien que no vio la cursada y quiere entender el problema, los datos, el modelo y el diseño, y poder repetir el razonamiento.

**Cómo leer los números.** Todo número que dice "medimos" sale de los archivos del repositorio y se puede volver a calcular. Todo número que viene de afuera tiene su fuente al final. Y cuando un número es una estimación nuestra y no una medición, lo decimos en el mismo lugar.

---

## 1. Problema y contexto

### A quién le sirve, cuándo y para decidir qué

P&P es para **una persona que hace música y está terminando una canción**: quien la produce, quien la compone o quien la canta.

**El momento:** cuando la canción todavía se puede cambiar. Ya existe una grabación —un demo, una mezcla— pero todavía no salió.

**La decisión:** cosas del arreglo y la mezcla. ¿La hago más acústica o más eléctrica? ¿La acorto? ¿La mezclo más fuerte? Cada una de esas decisiones acerca la canción a un mundo y la aleja de otro, y hoy esa persona decide a oído, sin ver hacia dónde la lleva.

**Lo que P&P le muestra:** a cuál de dos mundos se parece el sonido de su canción —el que nomina la Academia del Grammy y el que entra al ranking de Billboard— y qué pasa con ese parecido si cambia algo.

### Cómo se decide hoy en la industria

Buscamos si hoy existe una herramienta que haga esto. Lo que encontramos:

- **Los sellos sí deciden con tableros de datos.** Usan herramientas como Chartmetric, Soundcharts y Luminate para elegir a qué artistas contratar. Un informe de la publicación Water & Music (octubre de 2020) cuenta qué miran: el crecimiento de seguidores, la cantidad de oyentes por mes, en cuántas playlists está cada canción. La autora estima, por sus conversaciones con gente del rubro, que alrededor de la mitad del descubrimiento de artistas ya pasa por esas herramientas.
- **Pero esos tableros miran a la audiencia, no al sonido.** Miden qué pasó con una canción **después** de salir. No dicen nada de una canción que todavía no salió, que es justo el momento en que se decide cómo va a sonar.
- **Y la competencia es enorme.** En 2025 se subieron unas 106.000 canciones por día a las plataformas, y el 88% de todo el catálogo recibió 1.000 reproducciones o menos en el año (datos de Luminate).

**El hueco que encontramos:** hay muchas herramientas para medir a la audiencia de una canción publicada, y ninguna que compare el **sonido** de una canción sin publicar con lo que premia la Academia y con lo que entra al ranking.

### La voz de un productor

> **Pendiente.** Acá va lo que nos diga un productor musical después de probar la app: qué entendió, qué no, qué le serviría y qué le parece inútil. Lo pidió la devolución de la entrega 3 y todavía no lo hicimos.

---

## 2. Hipótesis

### En una frase

> **El sonido de las canciones que la Academia nomina es distinto, de forma medible, del sonido de las canciones que entran al ranking; y esa diferencia cambió con las décadas.**

### Qué dijeron los datos

**La primera parte se confirma.** Los dos perfiles existen y se distinguen con números. Desde el año 2000, las canciones nominadas a Record o Song of the Year, comparadas con los éxitos que nunca fueron nominados:

| | Nominadas | Éxitos nunca nominados | Diferencia |
|---|---|---|---|
| Duración | 3:59 | 3:36 | **23 segundos más largas** |
| Acústica (de 0 a 1) | 0,27 | 0,19 | **una vez y media más acústicas** |
| Energía (de 0 a 1) | 0,61 | 0,67 | **menos enérgicas** |
| Volumen | −6,9 dB | −6,2 dB | un poco más suaves |

**La segunda parte se confirma a medias, y en una dirección que no esperábamos.** Los dos mundos **se acercaron en el ánimo y se alejaron en la duración**. Durante cincuenta años los éxitos fueron más alegres que las nominadas; esa diferencia se achicó hasta desaparecer en los 2010 y se dio vuelta en los 2020. Lo que se movió fue el público, no la Academia. Al mismo tiempo, la diferencia de duración pasó de un segundo en los noventa a 43 segundos hoy.

### Qué asumimos y qué no podemos afirmar

| Asumimos | No podemos afirmar |
|---|---|
| Que diez características del **sonido** alcanzan para describir un perfil | Que el sonido explique por qué una canción gana un premio o entra al ranking. Medimos cuánto explica, y es una parte (sección 5) |
| Que estar **nominada** a Record o Song of the Year ya es reconocimiento de la Academia | Que ganar suene distinto de estar nominada. Lo medimos y no (sección 3.7) |
| Que **entrar al Hot 100** y el **mejor puesto** son una medida comparable de éxito | Que "popular" signifique lo mismo en 1965 y en 2025. Antes medía compras; hoy, reproducciones (sección 3.2) |
| Que la **letra**, las **redes sociales** y **YouTube** influyen en los dos mundos | Que podamos medirlos canción por canción. No los incluimos, y la sección 5 explica cuánto pesan y por qué quedaron afuera |

**Lo que la app dice y lo que no.** Dice **cuánto se parece el sonido de tu canción** a cada perfil. No predice si vas a ganar un premio ni si vas a tener un éxito.

---

## 3. Datos y trazabilidad

### 3.1 Las fuentes

| Fuente | Qué aporta | Quién la produce | Cada cuánto se actualiza | Licencia | Limitaciones |
|---|---|---|---|---|---|
| **Billboard Hot 100** | La popularidad: si la canción entró al ranking, su mejor puesto y en qué año entró | Billboard publica el ranking. Lo recopila un repositorio público de la Universidad de Texas en Austin (Christian McDonald) | Todas las semanas | MIT (uso libre con atribución) | Solo mide Estados Unidos. Hasta 1991 se armaba con encuestas |
| **Premios Grammy** | El prestigio: qué canciones fueron nominadas y cuáles ganaron, de 1959 a 2026, en 14 categorías | Wikipedia, una página por categoría. Lo extrajimos nosotros con un programa propio | Nuestra copia es del 18 de agosto de 2026 | CC BY-SA 4.0 (uso libre con atribución) | Lo armamos nosotros porque ningún archivo público tenía las décadas viejas. Tuvo errores de extracción que corregimos |
| **Características del sonido** | Las 10 medidas de cómo suena cada canción | Las calculó **Spotify** para su sistema de recomendaciones. Las recopiló Gildas Le Drogoff antes de que Spotify cerrara ese dato en noviembre de 2024 | No se actualiza más | **CC BY-NC 4.0: solo uso no comercial** | Spotify nunca publicó cómo las calcula. Pesa 4,1 GB y no está en el repositorio. Si el proyecto se vendiera, habría que reemplazarla |
| **ReccoBeats** | Mide 7 características del audio que sube la persona | La empresa ReccoBeats, con un servicio en línea | Servicio en línea | Gratuito | Solo acepta un formato de audio; la app convierte el archivo antes de mandarlo |
| **Essentia.js** | Mide el tempo y el modo del audio que sube la persona, sin salir de su computadora | Music Technology Group, Universitat Pompeu Fabra | Versión 0.1.3 | AGPL-3.0 (código abierto) | Acierta el tempo exacto en unas 3 de cada 4 canciones (sección 4.2) |

### 3.2 Cómo se producen los dos rankings que usamos

La devolución de la entrega 3 pidió que podamos explicar cada cuánto se evalúa, quiénes lo hacen y cómo se obtienen las valoraciones en las dos instituciones.

**El Hot 100 de Billboard**

- **Qué es.** La lista de las 100 canciones más populares de Estados Unidos. Sale **todas las semanas**, sin interrupción desde el 4 de agosto de 1958.
- **Cómo se arma hoy.** Suma tres cosas: las **ventas** (descargas y discos), la **radio** (cuánta gente escuchó cada canción en las emisoras) y el **streaming** (reproducciones en plataformas). Los datos los junta la empresa Luminate. Billboard no publica cuánto pesa cada parte; sí dijo que hoy lo que más pesa es el streaming, después la radio y después las ventas.
- **Cómo cambió.** Hasta noviembre de 1991 se armaba preguntándoles a las disquerías y a las radios qué se vendía y qué sonaba. Desde ahí se mide de forma electrónica. El streaming se sumó en 2007 y las vistas de YouTube en 2013.
- **Qué significa para nosotros.** La herramienta usa solo canciones desde el año 2000, cuando ya se medía de forma electrónica.

**Los premios Grammy**

- **Quién vota.** Los miembros votantes de la Recording Academy: personas que trabajan haciendo discos (artistas, compositores, productores, ingenieros de sonido). El público no vota.
- **Cada cuánto.** Una vez por año.
- **Cómo se vota.** En dos rondas. La primera define las canciones **nominadas**; la segunda elige la **ganadora** entre ellas. Cada miembro vota solo en los géneros donde trabaja, **más** las categorías generales, que votan todos. Record of the Year y Song of the Year son generales.
- **Cómo cambió.** Hasta 2021, las nominadas finales de las categorías generales las elegía un comité de 15 a 20 personas anónimas. La Academia disolvió esos comités en abril de 2021.
- **Qué significa para nosotros.** Usamos **solo Record of the Year y Song of the Year** por dos razones: son las únicas que vota toda la Academia, y existen desde 1959 sin interrupción.

**La diferencia entre los dos premios, que importa más adelante.** Record of the Year premia **la grabación**: cómo suena, cómo está producida. Song of the Year premia **la composición**: la melodía y la letra, y se entrega a quienes la escribieron.

### 3.3 Cómo se relacionan las fuentes entre sí

Las tres fuentes principales no comparten ningún código. Lo único que tienen en común es **el título y el artista**. Los cruzamos por ahí, después de emparejar la escritura: todo en minúsculas, sin tildes y sin lo que va entre paréntesis.

```
Billboard (32.702 canciones)  ─┐
                               ├─ título + artista ─►  sonido medido por Spotify  ─►  nuestra base
Grammy (2.049 canciones)      ─┘
```

**Dos problemas que tuvimos al cruzar**, y que explican por qué no todas las canciones cruzan:

1. En Wikipedia, la columna del artista a veces traía al **productor**. Lo corregimos leyendo el encabezado de cada tabla.
2. En los datos de Spotify, cada canción aparece **varias veces**: en vivo, remezclada, remasterizada. Nos quedamos con una sola por canción: descartamos las que dicen "live", "remix", "karaoke", "cover", "instrumental" o "demo" y, entre las que quedan, elegimos la más escuchada.

**El grupo de control.** Además de las canciones premiadas y exitosas, sumamos 27.000 canciones comunes que no están ni en Billboard ni en los Grammy: 4.500 por década desde 1970. Sin ellas, el modelo nunca vería cómo suena una canción común y no tendría contra qué comparar.

### 3.4 El embudo: cuántas canciones hay en cada paso

Medido el 15 de noviembre de 2026.

| Paso | Cuántas | Qué pasa en este paso |
|---|---|---|
| Datos de Spotify | 56.277.664 filas | Hay varias versiones de cada canción |
| Una versión por canción | 43.618.889 | Se descartan las versiones en vivo, remix, karaoke, cover, instrumental y demo |
| Billboard, listas semanales | 355.001 filas | Una fila por canción por semana |
| Billboard, canciones | **32.702** | Una fila por canción |
| Grammy, nominaciones | 2.513 | 14 categorías; 488 ganaron |
| Grammy, canciones | **2.049** | Una canción nominada en tres categorías cuenta una vez |
| **Cruzan con el sonido** | **26.577** | Cruzó el 79% de las canciones de Billboard y el 81% de las del Grammy |
| + Grupo de control | 27.000 | Canciones comunes |
| **Total, para probar la hipótesis** | **53.577** | Las seis décadas |
| Desde el año 2000 | 23.403 | Es la ventana que usa la herramienta |
| − Volumen imposible | −15 | Sección 3.5 |
| − Figuran como instrumentales y no lo son | −36 | Sección 3.5 |
| − Repetidas | −19 | Sección 3.5 |
| **Con esto se entrena la herramienta** | **23.333** | |

**Cómo se reparten esas 23.333:**

| Grupo | Cuántas | Para qué se usa |
|---|---|---|
| Nominadas a Record o Song of the Year | **208** | Son el perfil de **prestigio** |
| Éxitos que nunca fueron nominados a nada | **8.833** | Contra ellos se compara el prestigio |
| Nominadas solo en categorías de género | 792 | No se usan para el prestigio (sección 3.7); sí para la popularidad |
| Entraron al Hot 100 | **9.450** | Son el perfil de **popularidad** |
| No entraron al Hot 100 | **13.883** | Contra ellas se compara la popularidad |
| Lograron las dos cosas | 617 | Es el 3% que muestra la pantalla "Los dos mundos" |

*(Los grupos se superponen: una canción nominada que además entró al Hot 100 está en dos filas.)*

### 3.5 Las canciones con datos rotos: qué sacamos y cómo lo decidimos

Encontramos tres tipos de error en los datos y sacamos **70 canciones** en total.

**1. Volumen imposible: 15 canciones.** Tenían un volumen menor a −25 decibeles, que es más bajo que casi cualquier disco. Al mirarlas, eran canciones cruzadas con otra versión: una figuraba con energía cero. Las sacamos.

**2. Canciones cantadas que figuraban como instrumentales: 36 canciones.** Las encontramos porque *Havana*, de Camila Cabello, que llegó al puesto 1, salía con 6 de popularidad y 97 de prestigio. Su dato decía que era casi seguro instrumental (0,92 sobre 1).

Había 98 canciones así. **No las sacamos todas**, porque varias son instrumentales de verdad (*Sandstorm*, de Darude, por ejemplo). Lo que hicimos fue **volver a medir cada una con nuestras propias herramientas**, usando los 30 segundos de muestra de cada canción:

| Resultado de volver a medir | Canciones | Qué hicimos |
|---|---|---|
| Nuestra medición también dice que es instrumental | 34 | Se quedan: el dato está bien |
| Nuestra medición queda en el medio | 16 | Se quedan: no hay prueba de error |
| No hay muestra de audio para medir | 12 | Se quedan: no hay prueba de error |
| **Nuestra medición dice que tiene voz** | **36** | **Se sacan** |

En *Havana*, por ejemplo, el dato decía 0,92 de instrumentalidad y −12,1 dB; nuestra medición dio 0,01 y −4,7 dB. Era otra versión de la canción. La lista completa de las 36, con los dos valores de cada una, está en `datasets_procesados/excluidas.csv`.

*Límite de este método:* medimos solo 30 segundos. Si justo en ese tramo hay voz en una canción casi toda instrumental, la sacamos por error. Preferimos ese riesgo: perder una canción buena cuesta poco, y dejar una rota distorsiona el resultado de quien la busque.

**3. Repetidas: 19 canciones.** La misma canción aparecía dos veces, por lo general porque entró al ranking en un año y fue nominada en otro. Dejamos una.

**Lo que miramos y decidimos no sacar.** Canciones muy largas (de más de 8 minutos), canciones casi todas habladas (rap) y canciones grabadas muy bajo. Son raras, pero son reales.

**Qué cambió al limpiar.** El modelo se volvió a entrenar. Los números generales casi no se movieron, y las canciones rotas dejaron de aparecer en el buscador.

### 3.6 Diccionario de variables

El diccionario completo, con las 21 columnas y sus valores medidos, está en `datasets/diccionario.md`. Estas son las que usa la herramienta.

**Las 10 características del sonido.** Conservan el nombre original en inglés, que es el de Spotify, para que cada valor se pueda rastrear hasta su fuente.

| Variable | En la app | Qué mide | Unidad y valores | Cómo se obtiene |
|---|---|---|---|---|
| `energy` | energía | Qué tan intensa es: rápida, fuerte, ruidosa | De 0 a 1 | Spotify / ReccoBeats |
| `valence` | valencia | Qué tan alegre suena. 1 es alegre, 0 es triste | De 0 a 1 | Spotify / ReccoBeats |
| `acousticness` | acústica | Qué tan probable es que esté hecha con instrumentos acústicos y no eléctricos | De 0 a 1 | Spotify / ReccoBeats |
| `duration_ms` | duración | Cuánto dura | Milisegundos. La app la muestra en minutos y segundos | Se lee del archivo |
| `danceability` | bailabilidad | Qué tan bailable: pulso parejo, ritmo regular | De 0 a 1 | Spotify / ReccoBeats |
| `loudness` | volumen | Qué tan fuerte está grabada, en promedio | Decibeles, de −60 a 0. Los éxitos rondan −6 | Spotify / ReccoBeats |
| `speechiness` | habla | Cuánta palabra hablada tiene. El rap da alto; el canto, bajo | De 0 a 1 | Spotify / ReccoBeats |
| `tempo` | tempo | Qué tan rápida es | Pulsos por minuto (BPM), en general entre 60 y 200 | Spotify / Essentia |
| `mode` | modo | Si está en modo mayor (suele sonar más luminoso) o menor | 1 mayor, 0 menor | Spotify / Essentia |
| `instrumentalness` | instrumentalidad | Qué tan probable es que no tenga voz cantada | De 0 a 1 | Spotify / ReccoBeats |

*("Spotify / ReccoBeats" quiere decir: en las canciones de la base lo midió Spotify; en la canción que sube la persona lo mide ReccoBeats.)*

**Las etiquetas** con las que se arman los dos ejes:

| Variable | Qué es | Cómo se calcula |
|---|---|---|
| `fue_hit` | Si entró alguna vez al Hot 100 | Vale 1 si la canción está en el archivo de Billboard |
| `mejor_puesto` | El puesto más alto que alcanzó | El menor de sus puestos semanales. Vacío si nunca entró |
| `grammy_categorias` | En qué categorías fue nominada | Lista de categorías. Vacía si nunca fue nominada |
| `anio` | Año de la canción | El año en que entró a Billboard o en que fue nominada |

**Variables que probamos y dejamos afuera**, con el motivo medido:

| Variable | Por qué quedó afuera |
|---|---|
| Semanas en el ranking | Cambió de significado: la mediana pasó de 17 semanas en los 2000 a 2 en los 2020, porque hoy muchas canciones entran una semana y desaparecen |
| Semanas en el mejor puesto | Para la mitad de las canciones vale 1. No distingue nada |
| Si ganó el Grammy | Ganar no suena distinto de estar nominada (sección 3.7) |
| Reproducciones y seguidores | Sería predecir el éxito con el éxito. Lo descartamos en septiembre y es el mismo motivo por el que no entran las redes (sección 5) |
| Tonalidad, "en vivo", rareza | Descartadas en septiembre: no aportaban o no se podían medir bien |

### 3.7 Cómo se construye cada puntaje

**El paso previo, igual para los dos.** Cada característica se convierte a **cuánto se aleja del promedio** de las 23.333 canciones. Así se pueden comparar cosas que se miden distinto: 20 pulsos por minuto de diferencia en el tempo y 0,2 de diferencia en la acústica quedan en la misma escala.

#### Prestigio: una pregunta

**¿El sonido se parece al de las canciones que la Academia nomina a Record o Song of the Year?**

- **Qué se compara.** Las 208 nominadas contra los 8.833 éxitos que nunca fueron nominados a nada.
- **Por qué contra los éxitos y no contra las canciones comunes.** Lo probamos contra las canciones comunes y el modelo aprendía "suena a disco profesional" en lugar de "suena a Grammy".
- **Con qué cuenta.** Una regresión logística: una fórmula que aprende cuánto empuja cada característica hacia un grupo o hacia el otro. Las dos partes pesan lo mismo, aunque una tenga 208 canciones y la otra 8.833.
- **Por qué no entran las 792 nominadas solo por género.** Las nominadas a Mejor Interpretación de Metal tienen energía 0,94 y acústica casi cero: sumarlas mediría "suena a metal", no prestigio. Pero tampoco van del otro lado, porque 123 de ellas ganaron un Grammy. Quedan afuera de este eje.
- **Por qué es sí o no, y no una escalera.** Quisimos armar escalones: nunca nominada, nominada en una categoría, nominada en las dos, ganadora. Medimos la acústica de cada escalón y dio 0,19 → 0,33 → 0,21 → 0,25. Sube, baja y vuelve a subir: los escalones no están ordenados. Con 70 ganadoras, distinguirlas sería inventar una precisión que los datos no tienen.

#### Popularidad: dos preguntas encadenadas

**¿El sonido se parece al de las canciones que entran al Hot 100? Y si entra, ¿al de las que llegan alto?**

1. **¿Entra?** Las 9.450 que entraron contra las 13.883 que no. Misma cuenta que en el prestigio.
2. **¿Hasta dónde llega?** Se aprende **solo con las que entraron**, mirando su mejor puesto.
3. **El puntaje es la primera por la segunda.**

**Cómo se convierte el puesto en puntaje.** En el ranking, el 1 es lo mejor; para un puntaje hace falta lo contrario. Además, los puestos no valen lo mismo:

| Puesto | Puntaje |
|---|---|
| 1 | 100 |
| 2 | 85 |
| 10 | 50 |
| 50 | 15 |
| 100 | 0 |

Los diez primeros puestos se llevan la mitad del puntaje. Lo hicimos así porque medimos cuántas canciones tuvieron su mejor puesto en cada lugar: del 11 al 100 hay unas 300 por puesto, y en el puesto 1 hay 1.194. Llegar arriba es mucho más raro que estar en el medio.

**Por qué dos preguntas y no una.** Hasta el 3 de noviembre era una sola cuenta, que les ponía cero a todas las canciones que no entraron. Como la mayoría son ceros, la cuenta se gastaba en distinguir "entró o no entró" y aplastaba las diferencias entre los éxitos. *Despacito* daba 42 de popularidad y *Shape Of You*, 44. Con las dos preguntas separadas dan 62 y 81.

#### Qué número ve la persona

**Un percentil.** El puntaje que muestra la app no es la salida directa de la cuenta: es **en qué lugar queda la canción entre las 23.333**. Un prestigio de 88 quiere decir que el sonido se parece más al perfil nominado que el 88% de las canciones de la base.

**El margen.** Al lado de cada puntaje dice, por ejemplo, "entre 84 y 92". Sale de volver a entrenar el modelo 20 veces, cada vez con una muestra distinta de las mismas canciones, y ver cuánto cambia el puntaje. El margen del prestigio es más ancho porque se aprende de 208 canciones; el de la popularidad, de 9.450.

**Qué suma y qué resta.** Para cada característica, la app calcula el puntaje con el valor real y lo vuelve a calcular como si esa característica fuera promedio. La diferencia son los puntos que esa característica aporta.

**Qué tan bien separa cada eje.** Tomamos una canción de cada grupo al azar y miramos si el modelo le da más puntaje a la que corresponde. Acierta el **77%** de las veces en popularidad y el **68%** en prestigio. Al azar sería 50%.

#### Las cuatro zonas del mapa

El mapa tiene la popularidad de izquierda a derecha y el prestigio de abajo hacia arriba, los dos de 0 a 100.

| Zona | Prestigio | Popularidad | Qué quiere decir |
|---|---|---|---|
| **Las dos cosas** | 50 o más | 50 o más | Se parece a lo nominado y a lo que entra al ranking |
| **Prestigio sin público** | 50 o más | menos de 50 | Se parece a lo nominado, no a lo que entra |
| **Hit puro** | menos de 50 | 50 o más | Se parece a lo que entra, no a lo nominado |
| **Ni una cosa ni la otra** | menos de 50 | menos de 50 | Donde está la mayoría de la música |

**No son grupos calculados: son cuadrantes.** Cortamos en 50 porque 50 es la mitad de la base: cada eje deja la mitad de las canciones de cada lado.

**Qué es cada punto y qué significa cada color:**

| En el mapa | Qué es |
|---|---|
| Punto negro grande con aro | Tu canción |
| Punto azul lleno | Una canción que ganó el Grammy |
| Aro azul | Una canción que fue nominada |
| Punto ámbar | Un hit que nunca fue nominado |
| Punto gris | Una canción que no entró al ranking |

**El mapa muestra 100 canciones reales, no todas.** Con 700 puntos grises el mapa parecía una mancha y no se entendía que cada punto era una canción. Ahora son 100, y cada una está ubicada con sus dos puntajes, calculados con el mismo modelo que se usa para tu canción:

- **30 nominadas o ganadoras** del Grammy (las 11 que llevan nombre y 19 más).
- **40 hits que nunca fueron nominados** (los 8 que llevan nombre y 32 más).
- **30 canciones que no entraron al ranking.**

Las que no llevan nombre se eligen al azar entre las canciones conocidas de la base, siempre las mismas, para que el mapa no cambie cada vez que se abre. Los colores son los de toda la app: **azul es prestigio, ámbar es popularidad.** Tu canción va en negro para que no se confunda con ninguno de los dos.

La leyenda está dibujada debajo del mapa, y cualquier punto se puede tocar para escuchar esa canción. La agregamos después de la devolución de la entrega 3.

### 3.8 El repositorio

Todo está en https://github.com/matiasexposito/prestigio_popularidad

| Dónde | Qué hay |
|---|---|
| `readme.md` | La puerta de entrada: fuentes, licencias, cómo está armado todo |
| `decisiones.md` | Todo lo que probamos, descartamos y por qué, con fecha, desde agosto |
| `datasets/` | Los datos completos, de 1958 a 2026, y el diccionario |
| `datasets_procesados/` | Los datos desde el año 2000, que son los que usa la app, y la lista de canciones excluidas |
| `codigo/` | Los programas que bajan, cruzan y revisan los datos |
| `analisis/` | Los análisis de la popularidad, de la letra y de las redes |
| `diseno/` | El borrador de pantallas y la app |
| `prompts/` | Las instrucciones que recibe la IA de la app |

---

## 4. El modelo

### 4.1 Qué entra, qué se calcula y qué sale

```
ENTRA                          SE CALCULA                               SALE
─────────────────────────      ─────────────────────────────────────    ──────────────────────────────
Un archivo de audio            1. Se miden las 10 características       Prestigio, de 0 a 100, con margen
(mp3, wav o m4a)               2. Cada una se compara con el promedio   Popularidad, de 0 a 100, con margen
                                  de las 23.333 canciones               En qué zona del mapa cae
        o                      3. Prestigio: ¿se parece a las           Qué característica suma y cuál resta
                                  208 nominadas?                        El conflicto: la característica que
Una canción conocida           4. Popularidad: ¿se parece a las que       acerca a un mundo y aleja del otro
(773 para buscar)                 entran? ¿y a las que llegan alto?     Una lectura escrita por una IA
                               5. Se ubica entre las 23.333               a partir de esos números
                               6. Se calcula el margen
```

### 4.2 Cómo se mide una canción nueva, y qué tan bien

Las canciones de la base las midió Spotify. La canción que sube la persona no está en Spotify —puede ser un demo—, así que la medimos nosotros con dos herramientas:

- **ReccoBeats** mide energía, valencia, acústica, bailabilidad, habla, volumen e instrumentalidad. La app corta la canción en tramos de 30 segundos, mide cada tramo y promedia.
- **Essentia** mide el tempo y el modo, en la computadora de la persona.
- **La duración** se lee del archivo.

**¿Miden parecido a Spotify?** Lo verificamos dos veces.

*Con canciones enteras* (10 canciones, 64 tramos, en octubre): el parecido entre nuestra medición y la de Spotify fue de 0,89 a 0,97 en energía, valencia, acústica, bailabilidad y habla, en una escala donde 1 es idéntico. Essentia acertó el tempo en 8 de 10.

*Con solo 30 segundos* (38 canciones al azar, el 15 de noviembre):

| Característica | Parecido con Spotify (1 = idéntico) |
|---|---|
| Bailabilidad | 0,83 |
| Acústica | 0,70 |
| Energía | 0,68 |
| Habla | 0,67 |
| Valencia | 0,62 |
| Volumen | 0,47 |
| Tempo | El mismo en 28 de 38. En otras 6 dio el doble, la mitad u otro múltiplo, un error conocido de estos programas |
| Modo | El mismo en 28 de 38 |

**Qué nos dice esto.** Con un solo tramo de 30 segundos el parecido es mediano; con la canción entera, alto. Por eso la app mide todos los tramos y promedia, y por eso conviene subir la canción completa.

**La prueba que nos hizo corregir la medición (16 de noviembre).** Subimos una canción de trap y dio cero en los dos puntajes. Eso nos hizo preguntarnos algo que no habíamos medido: *la misma canción, ¿da el mismo puntaje con el dato de la base que midiendo su audio?*

Volvimos a medir las 38 canciones. Lo primero que encontramos fue un error nuestro: en 7 de las 38, la muestra de audio **no era la misma grabación** que la de la base. Eran una versión en vivo, una acústica, un cover, una pista sin voz, dos canciones distintas con el mismo nombre y una con el dato roto. Las sacamos y quedaron 31.

Con esas 31, calculamos el puntaje de cada una de las dos formas y miramos la diferencia:

| | Con la calibración de octubre (10 canciones) | Con la calibración nueva (31 canciones) |
|---|---|---|
| Popularidad: diferencia típica | 12,7 puntos | **8,0 puntos** |
| Popularidad: canciones que se mueven más de 20 puntos | 7 de 31 | 5 de 31 |
| Prestigio: diferencia típica | 8,9 puntos | **6,5 puntos** |

"Calibrar" es corregir la medición de ReccoBeats para que se parezca a la de Spotify, con la que aprendió el modelo. La calibración de octubre estaba hecha con 10 canciones; la nueva, con 31. Para no engañarnos, la corrección de cada canción se calculó con las otras 30, sin usarla a ella.

**Qué más probamos y no sirvió.** Medir el volumen con Essentia en vez de ReccoBeats (no mejora). Cambiar el modelo: probamos 11 variantes, sacando el volumen, la instrumentalidad o la energía, y ninguna baja el error sin perder acierto.

**El límite que queda.** Aun con la calibración nueva, el puntaje de una canción subida se mueve unos 8 puntos en popularidad y unos 6 en prestigio respecto del que tendría con el dato de Spotify. Y depende de **qué archivo** se sube: el audio de un video oficial trae introducciones y finales que el tema de estudio no tiene, y dura distinto. La misma canción subida desde dos archivos distintos puede dar resultados distintos. El margen que muestra la app no incluye este error.

### 4.3 Qué quedó afuera del modelo

| Qué | Por qué |
|---|---|
| **La letra, las redes sociales y YouTube** | Es la sección que sigue, completa |
| **Comparar dentro de cada género** | No tenemos el género de las canciones. La app llegó a preguntarlo en el formulario; lo sacamos porque pedir un dato que no se usa es una promesa falsa |
| **El chatbot** | El que teníamos no era una IA: era una lista de preguntas previstas. Lo reemplazamos por una IA que solo pone en palabras los números (sección 9) |
| **Las canciones anteriores al 2000** | El análisis las usa; la herramienta no. Antes del 2000 los éxitos eran más alegres que las nominadas, y después se dio vuelta: son dos reglas opuestas. Además, las grabaciones nuevas suenan más fuerte, y el modelo confundía "fuerte" con "reciente" |

---

## 5. Lo que no medimos: la letra, las redes sociales y YouTube

La devolución de la entrega 3 marcó que el análisis quedaba incompleto sin la letra y sin las redes y YouTube. Lo hablamos con los docentes y definimos tres cosas:

1. **No las incluimos en la herramienta.** La herramienta mide el sonido.
2. **Sí explicamos cómo impactan** en la popularidad y en el prestigio.
3. **Les damos un peso aproximado**: si alguien quisiera analizar la popularidad y el prestigio completos, cuánto habría que darle a cada cosa.

### 5.1 Lo que sí medimos: cuánto pesa el sonido

Nuestro modelo usa solo el sonido. Entonces, lo que el modelo logra explicar es lo que explica el sonido, y lo que no logra explicar es lo que depende de todo lo demás.

| Pregunta | Cuánto explica el sonido | En palabras |
|---|---|---|
| ¿Entra al Hot 100? | **24%** | Alrededor de un cuarto |
| Si entra, ¿hasta dónde llega? | **3%** | Casi nada |
| ¿La nominan a Record o Song of the Year? | **10%** | Una décima parte |

*(Cómo se mide: para las dos preguntas de sí o no, se mira qué probabilidad le da el modelo, en promedio, a las canciones que sí y a las que no, y se restan. Si no distinguiera nada daría 0; si distinguiera perfecto, 100%. Para el puesto, se mide qué parte de las diferencias de puesto entre los éxitos coincide con lo que dice el sonido.)*

**El peso del sonido viene bajando.** Calculamos lo mismo con las canciones de cada período por separado:

| Período | Cuánto explica el sonido de entrar al Hot 100 |
|---|---|
| 2000–2004 | 27% |
| 2005–2009 | **32%** |
| 2010–2014 | 28% |
| 2015–2019 | 26% |
| 2020–2026 | **23%** |

El punto más alto es 2005–2009, la época de las descargas y la radio. El más bajo es el más reciente, la época de TikTok. No prueba que TikTok sea la causa, pero es coherente: cuando el sonido explica menos, otra cosa explica más.

### 5.2 Lo que también medimos: cuánto pesa el éxito en el prestigio

Esto no lo esperábamos, y sale de nuestros datos. **Para que nominen una canción, haber sido un éxito pesa mucho más que cómo suena.**

| | Nominadas | Todos los éxitos |
|---|---|---|
| Entraron al Hot 100 | **86%** (178 de 208) | — |
| Llegaron a los diez primeros puestos | **62%** | 14% |
| Llegaron al puesto 1 | **38%** | 3% |

- De las canciones que llegaron a los diez primeros puestos, fue nominada el **10%**. De las que entraron pero no llegaron tan alto, el **0,6%**. Es **16 veces más**.
- Entre los éxitos, el puesto que alcanzó una canción explica el **47%** de que la nominen. El sonido, el **8%**. Los dos juntos, el 52%.

**Por qué importa para esta sección.** Las redes, YouTube, las playlists y la radio hacen popular a una canción. Y ser popular es, de lejos, lo que más pesa para que la nominen. O sea: **las redes impactan en el prestigio, pero de forma indirecta.** El público no vota en los Grammy; lo que hacen las redes es volver conocida a la canción entre quienes votan.

### 5.3 Cómo impacta cada cosa

#### La letra

**En la popularidad.** Hay estudios que lo midieron:

- Por cada vez más que se repite el estribillo, una canción tiene un 14,5% más de probabilidad de llegar al puesto 1 en lugar de quedarse en el fondo del ranking (estudio sobre el Hot 100 de 1958 a 2012).
- Un estudio de 353.320 canciones, de 1970 a 2020, encontró que las letras se volvieron más repetitivas, con menos palabras distintas, más negativas y más centradas en uno mismo, y que las más simples tendían a ser más populares.

**En el prestigio.** Depende de cuál de los dos premios:

- **Song of the Year** premia la composición, y su reglamento exige que la canción tenga melodía y letra. Acá la letra cuenta por regla.
- **Record of the Year** premia la grabación. Acá cuenta el sonido.
- Un estudio de la Universidad de Nueva York encontró que, para estos dos premios, la letra predice **menos** que el sonido.

**Nuestra propia prueba.** Conseguimos y medimos la letra de 120 canciones de nuestra base: 60 nominadas y 60 éxitos nunca nominados.

| | Nominadas | Éxitos |
|---|---|---|
| Cantidad de palabras | 419 | 380 |
| Variedad de palabras (1 = ninguna se repite) | 0,34 | 0,35 |
| Líneas que se repiten | 33% | 32% |
| Palabras en primera persona ("yo", "me", "mi") | 8,2% | 7,8% |

Las nominadas tienen letras un poco más largas —igual que duran más— y **en todo lo demás son casi iguales a los éxitos**. Son pocas canciones para afirmarlo con seguridad, pero coincide con el estudio de Nueva York.

#### Las redes sociales (TikTok, Instagram)

**En la popularidad.** Hoy son el camino más corto al ranking:

- En 2021, más de 175 canciones que fueron tendencia en TikTok entraron al Hot 100: el doble que en 2020 (informe anual de la empresa que mide el ranking, junto con Billboard).
- En 2024, el 84% de las canciones que entraron al ranking mundial de Billboard ya habían tenido un pico en TikTok **antes** de entrar (informe de TikTok con esa misma empresa). Hay que leerlo con cuidado: los datos de TikTok los aportó TikTok.

**En el prestigio.** De forma indirecta, como se explicó en 5.2: vuelven popular a la canción, y las canciones populares son las que más se nominan.

#### YouTube

**En la popularidad.** YouTube está **adentro** del Hot 100: sus vistas cuentan para el ranking desde 2013. No es algo que influye desde afuera; es parte de cómo se mide el éxito.

**En el prestigio.** Igual que las redes: de forma indirecta.

#### Las playlists y la radio

**En la popularidad.** Entrar a la lista de reproducción más grande de Spotify le suma a una canción cerca de 20 millones de reproducciones (estudio de 2018). Y la radio sigue siendo una de las tres partes del Hot 100.

#### El contexto

Quién es el artista, qué sello lo respalda, cuánto se invirtió en la campaña, qué pasaba ese año. En el prestigio pesa más todavía: los sellos hacen campaña entre los miembros de la Academia, y la trayectoria del artista cuenta.

### 5.4 Los pesos: cuánto habría que darle a cada cosa

Si alguien quisiera analizar la popularidad y el prestigio completos, y no solo el sonido, este es el peso aproximado que le daríamos a cada cosa.

| Factor | **Popularidad:** entrar al ranking | **Popularidad:** llegar alto | **Prestigio:** ser nominada | ¿Lo medimos? |
|---|---|---|---|---|
| **El sonido** | **25%** | **5%** | **10%** | **Sí, medido** |
| Redes sociales | 20% | 25% | 10% | No. Estimado |
| YouTube | 5% | 5% | 5% | No. Estimado |
| Playlists y radio | 15% | 20% | 10% | No. Estimado |
| La letra | 10% | 10% | 15% | No. Estimado, con una prueba chica |
| El contexto: artista, sello, campaña | 25% | 35% | 50% | No. Es lo que queda |
| **Total** | **100%** | **100%** | **100%** | |

**De dónde sale cada número:**

- **El sonido (25%, 5% y 10%).** Es lo único medido: 24%, 3% y 10%, redondeados. El 3% lo subimos a 5% porque, entre los éxitos, el sonido sí ayuda un poco a distinguir a los que llegan a los diez primeros.
- **Lo que queda** (75%, 95% y 90%) **no lo podemos medir**. Lo repartimos con un criterio: **más peso a lo que tiene más evidencia publicada.**
- **Redes sociales (20% y 25%).** Son lo que más evidencia tiene hoy de mover el ranking (el 84% y las 175 canciones). No les damos más porque TikTok existe desde 2016 y nuestro período empieza en 2000.
- **Playlists y radio (15% y 20%).** Tienen evidencia medida (los 20 millones de reproducciones) y la radio es una parte fija del ranking. Pesan más para llegar alto: a los diez primeros se llega con radio y con las listas grandes.
- **YouTube (5%).** Es una parte del streaming que cuenta el ranking. Le damos poco peso propio porque casi no hay evidencia de que mueva el ranking por sí solo.
- **La letra (10% en popularidad, 15% en prestigio).** En popularidad hay un efecto medido (la repetición), pero más chico que el del sonido. En prestigio le damos más porque Song of the Year premia la composición por reglamento.
- **El contexto (25%, 35% y 50%).** Es lo que queda después de todo lo demás. En prestigio es la mitad, porque ahí pesan la campaña ante la Academia y la trayectoria.
- **En el prestigio, redes más YouTube más playlists y radio suman 25%.** Sale de lo que medimos en 5.2: el éxito explica cerca de la mitad de una nominación, y de ese éxito, cerca de la mitad se debe a la difusión.

**Cómo hay que leer esta tabla.** La fila del sonido es una **medición**. Las demás son una **estimación razonada**: nadie puede probar que las redes pesan 20% y no 25%. Lo que sí defendemos es **el orden**:

- **Para entrar al ranking:** el sonido y el contexto pesan parecido; la difusión junta (redes, YouTube, playlists y radio) pesa más que cualquiera de los dos; la letra es lo que menos pesa.
- **Para llegar alto:** el sonido casi no importa. Mandan la difusión y el contexto.
- **Para el prestigio:** manda el contexto; el sonido pesa poco; la letra pesa más que en la popularidad.

### 5.5 Por qué no las incluimos en la herramienta

**Lo primero: porque la herramienta mide el sonido.** Es lo único que se puede medir en **cualquier** canción, incluso en un demo que nadie escuchó. Y es lo único que quien hace música puede **cambiar** desde el estudio.

Además, cada una tiene sus motivos.

#### La letra

| Motivo | Explicación |
|---|---|
| **Derechos de autor** | Las letras tienen dueño. Se pueden medir, pero no se pueden guardar ni mostrar. Hay que bajar cada letra, medirla y borrar el texto |
| **Tiempo** | Habría que conseguir y medir la letra de 23.333 canciones, volver a entrenar el modelo y volver a verificar todo. No entraba en esta entrega |
| **Errores** | Las letras que se consiguen gratis las escribe gente, no los sellos: traen errores, versiones distintas y secciones mal marcadas. Con el sonido ya encontramos 70 canciones rotas; con la letra esperamos más |
| **El idioma** | Las medidas cambian con el idioma. *Despacito* no se puede comparar con una canción en inglés con la misma regla |
| **Aporta poco a lo que medimos** | En nuestra prueba con 120 canciones, la letra casi no separa a las nominadas de los éxitos |
| **La persona tendría que escribirla** | De un demo no hay letra en ningún lado: habría que pedírsela |

**Lo que dejamos preparado.** En el repositorio hay un programa (`codigo/letra.js`) que busca la letra de una canción, la mide y guarda solo los números, nunca el texto. Con él hicimos la prueba de las 120.

#### Las redes sociales y YouTube

| Motivo | Explicación |
|---|---|
| **No hay datos abiertos** | TikTok solo les da datos a investigadores de universidades de Estados Unidos y de Europa. Instagram no publica nada sobre música. Spotify cerró en 2026 su dato de popularidad. Las herramientas que tienen todo (las que usan los sellos) son pagas |
| **Tiempo** | YouTube deja consultar gratis unas 99 canciones por día. Para las 9.450 canciones que entraron al ranking harían falta unos 95 días |
| **Errores** | YouTube da las vistas de **hoy**, no las del momento en que la canción estaba en el ranking. Una canción de 2009 tuvo 17 años para juntar vistas; una de 2025, uno. No se pueden comparar |
| **No existían en todo el período** | YouTube es de 2005 y TikTok de 2016. Las canciones del 2000 al 2005 tendrían cero en todo, no por falta de éxito sino porque no había dónde. El modelo aprendería "tener redes = canción nueva" |
| **Es dar vueltas en círculo** | Las vistas no son una causa de la popularidad: **son** popularidad, medida de otra forma. Usarlas para explicar el éxito es explicar el éxito con el éxito. Ya lo habíamos decidido en septiembre con las reproducciones |
| **Un demo no tiene redes** | La canción que sube la persona todavía no salió: tiene cero vistas y cero videos. No habría nada que medir |

**Lo que sí probamos.** Wikipedia es el único dato abierto y con historia que se parece a "cuánta atención recibió una canción". Lo probamos con 60 éxitos desde 2016: 45 tienen artículo propio, y las visitas al artículo acompañan al puesto que alcanzó la canción (0,30 en una escala donde 0 es nada y 1 es perfecto). Es mucho más que lo que explica el sonido (3%). Confirma que lo que pasa alrededor de la canción pesa mucho, y a la vez muestra el problema: ¿la buscaron porque llegó alto, o llegó alto porque la buscaron? Con estos datos no se puede saber.

**Cómo se podría hacer, si se quisiera.** Con una herramienta paga de las que usan los sellos se puede tener la actividad en redes de cada canción desde 2016. Serviría para un análisis de los últimos diez años, no para la herramienta: seguiría siendo dar vueltas en círculo, y un demo seguiría sin tener redes.

### 5.6 En resumen

**P&P mide el sonido, y el sonido es una parte.** Explica un cuarto de que una canción entre al ranking, una décima parte de que la nominen y casi nada de cuán alto llega. Por eso la app nunca dice "vas a llegar al puesto tal" ni "vas a ganar": dice a qué se parece lo que hiciste, que es lo que se puede cambiar antes de publicar.

---

## 6. Usuario y recorrido

### Quién usa P&P

**Una persona que hace música y está terminando una canción.** Puede ser quien la produce, quien la compone o quien la canta. Lo que tienen en común: la canción todavía se puede cambiar.

| | |
|---|---|
| **Qué tiene** | Un archivo de audio: un demo, una mezcla, una versión casi final |
| **Qué quiere saber** | A qué se parece lo que hizo: ¿suena como lo que nomina la Academia, como lo que entra al ranking, como las dos cosas o como ninguna? |
| **Qué decide con eso** | Cosas del arreglo y la mezcla: hacerla más o menos acústica, más corta o más larga, más fuerte o más suave |
| **Qué no sabe** | Estadística. Por eso todo número de la app tiene al lado, en palabras, qué quiere decir |

### El recorrido, paso a paso

| Paso | Pantalla | Qué hace la persona | Por qué está ahí |
|---|---|---|---|
| 1 | **Portada** | Toca "Ingresar" | Presenta el nombre y los dos colores que va a ver en toda la app |
| 2 | **Los dos mundos** | Lee qué premia la Academia y qué escucha el público | Antes de pedirle nada, le contamos qué vamos a medir y qué no. Abajo de todo dice: "No predecimos… Solo cómo suena" |
| 3 | **Crear cuenta** | Pone su nombre y su mail | Para guardar sus análisis. No le pedimos género ni profesión, porque no cambian el resultado |
| 4 | **Subir la canción** | Arrastra un archivo, o busca una canción conocida | Es el único paso que exige algo de la persona, así que el archivo está en el centro y grande |
| 5 | **Resultado** | Mira dónde cayó en el mapa y lee los dos puntajes | Es la respuesta. El mapa ocupa casi toda la pantalla |
| 6 | **Qué suma y qué resta** | Mira qué rasgos la acercan y cuáles la alejan de cada mundo | Explica el porqué del resultado, y muestra el conflicto |
| 7 | **Simular** | Mueve controles y ve el punto moverse | Convierte el resultado en una decisión: "si cambio esto, ¿qué pasa?" |

### Las bifurcaciones, y por qué existen

- **Subir un archivo o buscar una canción conocida (paso 4).** Hay dos caminos porque hay dos momentos. Quien tiene su canción, la sube. Quien todavía está mirando si la herramienta le sirve, prueba con una que conoce —Uptown Funk, Hello— y entiende cómo se lee el resultado antes de arriesgar la suya.
- **Saltar la introducción (paso 2).** Quien ya la usó no tiene por qué leer de nuevo los dos mundos: hay un "Saltar".
- **Con la IA o sin la IA (paso 5).** Si la IA que escribe la lectura no responde, la pantalla muestra una lectura armada por el modelo y avisa. El resultado nunca depende de que la IA funcione.
- **Prestigio o popularidad (paso 6).** Un selector cambia cuál de los dos ejes se desglosa. No se muestran los dos juntos porque son veinte columnas y no se leen.
- **Volver al original (paso 7).** En el simulador siempre se puede deshacer todo con un botón, para que nadie tenga miedo de mover.
- **Explicaciones cortas y a la vista (paso 5).** Al lado de cada puntaje hay una sola frase que dice qué significa ("suena más parecida a las nominadas al Grammy que el 88% de las canciones que medimos"). Antes había un "¿Cómo se calcula?" desplegable con tres párrafos: era demasiado para alguien que solo quiere entender su número. El detalle completo quedó en este racional.

---

## 7. Decisiones de diseño

La app la programó una IA, pero qué va en cada pantalla, en qué orden y con qué peso lo decidimos nosotros. Acá está cada decisión con su motivo.

### Lo más importante de cada pantalla, y cómo lo jerarquizamos

| Pantalla | Lo más importante | Cómo se nota |
|---|---|---|
| **Portada** | El nombre | Es lo único grande. Alrededor, 240 canciones reales de la base giran despacio como una galaxia: azules las nominadas, ámbar los hits, grises el resto. Si se pasa el mouse por una, dice cuál es. Con el sonido activado suena una melodía lenta, una nota por vez y siempre dentro del mismo acorde, y cada nota enciende una canción. La primera versión tocaba notas al azar y se pisaban; por eso la pasamos a una melodía ordenada |
| **Los dos mundos** | Que hay dos perfiles distintos | Dos tarjetas del mismo tamaño, una al lado de la otra, con el mismo orden adentro: una frase, un dato, tres canciones |
| **Crear cuenta** | Que es rápido | Dos campos y un botón, en el centro. Alrededor, las mismas canciones de la portada, más suaves |
| **Subir la canción** | El archivo | Dos columnas que entran en una sola pantalla, sin bajar. A la izquierda, el título y los tres pasos del proceso; a la derecha, el recuadro para arrastrar (lo más grande) y el buscador |
| **Resultado** | El mapa | Ocupa toda la columna ancha. Los dos números van al costado, en una columna fija de 404 píxeles |
| **Qué suma y qué resta** | Comparar los rasgos entre sí | Columnas verticales del mismo ancho, con la barra saliendo de una línea central: arriba suma, abajo resta |
| **Simular** | Ver el punto moverse | El mapa en el medio, los controles a la izquierda y los números a la derecha: la mano mueve a un lado, el ojo mira al centro |

**Por qué el mapa manda y no los números.** Lo discutimos, porque lo lógico sería poner los puntajes arriba. Pero un "88 de prestigio" suelto no dice nada. Recién significa algo cuando ves que caíste al lado de *Hello* y lejos de *Blinding Lights*. El mapa convierte dos números en un lugar.

**Por qué los rasgos van en vertical.** Esa pantalla primero era una tabla, una fila por rasgo. La dimos vuelta por dos motivos: en vertical se comparan las diez de un vistazo, sin leer ningún número; y se parece a una consola de mezcla, que es el aparato que una persona que hace música ya conoce.

### El color

Usamos **dos colores y nada más**. Todo lo demás es blanco, negro y gris.

| Color | Código | Qué significa |
|---|---|---|
| **Azul** | `#1b4fd8` | El **prestigio**, siempre: el puntaje de prestigio, las canciones nominadas y ganadoras del Grammy, y las barras del desglose cuando se mira el prestigio |
| **Ámbar** | `#b45309` | La **popularidad**, siempre: el puntaje de popularidad, los hits, y las barras del desglose cuando se mira la popularidad |
| Tinta | `#12110f` | Todo lo que no es de un eje: textos, botones, enlaces, controles y **tu canción** en el mapa |
| Gris | `#c4c1ba` | Las canciones que no entraron al ranking |

**De dónde viene.** La primera regla de color del proyecto, de septiembre, era: azul para lo que calcula el modelo, ámbar para lo que interpreta la IA. Después sumamos otro uso: azul lo que suma, ámbar lo que resta. El resultado era que cada color quería decir tres cosas distintas según la pantalla.

**La regla de ahora: un solo significado por color.** Azul es prestigio y ámbar es popularidad, en todas las pantallas, sin excepciones. De ahí salen tres decisiones:

- **En el desglose**, las barras ya no son azules si suman y ámbar si restan. Toman el color del puntaje que se está mirando. Si el rasgo suma, la barra va llena y hacia arriba; si resta, va rayada y hacia abajo. El número de abajo lleva el signo.
- **El recuadro de la lectura** ya no es ámbar. Como habla de los dos puntajes, lleva los dos colores juntos, muy suaves.
- **Lo que no es de ningún eje** (enlaces, controles del simulador, el recuadro para subir el archivo) va en negro o gris.

**Qué cambiamos el 15/11.** Mirando la app entera, casi todo era blanco y negro: los dos colores aparecían poco y no quedaba claro qué quería decir cada uno. Decidimos que cada eje tenga el suyo en todas las pantallas: **azul es prestigio, ámbar es popularidad**. Así se ve desde la portada (el punto azul al lado de "Prestigio" y el ámbar al lado de "Popularidad"), en las dos tarjetas de la bienvenida, en los dos puntajes y en el mapa. Tu canción pasó de azul a negro para no confundirse con las nominadas.

**Por qué solo dos.** Los dos ejes del proyecto están en tensión, y queríamos que esa tensión se viera antes de leerla. Si hubiera cinco colores más, ninguno significaría nada. Con dos, cada vez que aparece uno la persona ya sabe qué quiere decir.

**Cómo se leen en el mapa.** Como el mapa tiene varios tipos de punto, abajo lleva una leyenda fija: tu canción (negro con aro), ganó el Grammy (azul lleno), fue nominada (aro azul), hit nunca nominado (ámbar), no entró al ranking (gris). La agregamos después de la devolución de la entrega 3, que pidió aclarar los colores.

**Lo que dejamos afuera.** No hay modo oscuro: en oscuro los puntos del mapa se mezclan. Los únicos degradés son fondos muy suaves que van del azul al ámbar (en la barra de arriba y en algunas tarjetas), para que los dos colores estén presentes sin tapar los datos. Ningún número ni ningún punto del mapa lleva degradé.

### La tipografía

Tres familias, cada una con un trabajo:

| Familia | Dónde | Por qué |
|---|---|---|
| **Fraunces** | Títulos | Tiene carácter de revista, no de informe. Queríamos que la app tuviera una voz |
| **Inter** | Textos | Está pensada para leer en pantalla y no compite con el título. Tamaño base: 15 píxeles |
| **IBM Plex Mono** | **Todos los números** | Es monoespaciada: los números quedan alineados en columna y se comparan de un vistazo. Y es la letra de los aparatos que miden, que es lo que hace la app |

La regla de los números no tiene excepciones: puntajes, márgenes, valores de cada rasgo y aportes van todos en la misma letra. Así se distingue a simple vista **lo que se midió** de **lo que se dice sobre lo medido**.

### La grilla

- **Márgenes laterales** que se adaptan al ancho de la pantalla: entre 24 y 56 píxeles.
- **Resultado:** dos columnas. El mapa toma todo el ancho libre; el panel de puntajes mide 404 píxeles fijos, para que los números no cambien de tamaño cuando cambia la ventana.
- **Simular:** tres columnas. Controles (entre 300 y 400 píxeles), mapa (todo lo libre), puntajes (entre 250 y 290).
- **Subir la canción:** dos columnas centradas, de 1.180 píxeles como máximo entre las dos. Tuvo tres versiones: primero el archivo estaba en un panel lateral chico; después de la devolución de la entrega 3 lo pasamos a una sola columna, pero quedó tan larga que había que bajar para ver los tres pasos y el título se cortaba arriba; el 15/11 la partimos en dos para que todo se vea de una vez.
- **En pantallas chicas** (menos de 1.100 píxeles) todo pasa a una columna, con el mapa primero.
- **Esquinas** de 12 píxeles en las tarjetas y botones en forma de píldora. Todo recto quedaba muy duro para una app de música.

### El margen de error, siempre a la vista

Los dos puntajes muestran su margen ("entre 84 y 92") en la misma tarjeta, y dibujado sobre la barra. El prestigio se aprende de unas doscientas canciones: mostrar un número solo sería fingir una precisión que no tenemos.

---

## 8. El recorte: qué abarca y qué no

No trabajamos con un territorio físico, pero sí con un recorte, y conviene decirlo con las palabras exactas.

| Recorte | Qué abarca | Qué deja afuera |
|---|---|---|
| **Mercado** | Estados Unidos. El Hot 100 mide lo que se escucha y se compra en Estados Unidos, y la Recording Academy es una institución estadounidense | No dice nada del éxito en Argentina, en América Latina ni en ningún otro país. Una canción puede ser un fenómeno en español y no aparecer en nuestros datos |
| **Tiempo** | La herramienta: canciones del año 2000 al 2026. El análisis de la hipótesis: de 1958 a 2026 | La herramienta no sirve para decir cómo habría sonado una canción en 1975 |
| **Premio** | Solo dos categorías del Grammy: Record of the Year y Song of the Year | Las categorías de género (rock, metal, country, rap) y Album of the Year. No hablamos de "ganar un Grammy" en general |
| **Éxito** | Entrar al Billboard Hot 100 y el mejor puesto alcanzado | Reproducciones, ventas, vistas, giras, cantidad de seguidores |
| **Qué se mide** | El **sonido** de la grabación: diez características | La letra, el artista, el sello, la campaña, las redes |

**Las palabras que usamos y las que no.** Decimos "nominada a Record o Song of the Year", no "ganadora del Grammy". Decimos "entró al Hot 100", no "fue un éxito mundial". Decimos "se parece al perfil", no "va a ganar" ni "va a pegar".

---

## 9. Proceso y uso de la IA

### Qué IA usamos y para qué

| Herramienta | Qué hace en el proyecto | Quién decide |
|---|---|---|
| **Claude** (Anthropic), desde Claude Code | Escribió el código de la app y de los scripts de datos, hizo las mediciones que le pedimos y redactó borradores de los documentos | Nosotros: qué se hace, qué se acepta y qué se tira |
| **GPT-OSS 120B** (modelo abierto de OpenAI), servido por Groq | Dentro de la app: escribe la lectura del resultado, a partir de los números de la canción | Le fijamos nosotros qué puede decir y qué no (ver más abajo) |
| **ReccoBeats** | Dentro de la app: mide 7 características del audio que sube la persona | — |
| **Essentia.js** | Dentro de la app: mide el tempo y el modo, en el navegador | — |
| **El sistema de Spotify** | Midió las 10 características de las canciones de la base, antes de que Spotify cerrara ese dato en 2024 | — |

### Los bocetos

**No tenemos bocetos anteriores a la IA.** El primer diseño lo armamos en Figma conversando con Claude, y preferimos decirlo antes que inventar un antes.

Lo que sí tenemos, y está en el repositorio en `diseno/borrador/`, son las dos versiones del borrador de pantallas:

- **9 de septiembre de 2026:** seis pantallas (inicio, principal, resultado, desglose, simulador, asistente).
- **13 de septiembre de 2026:** sumamos la portada, la pantalla de los dos mundos y crear cuenta.

El 2 de noviembre la app se rehízo **a partir de ese borrador**. Ese día es el mejor ejemplo de quién decide: la IA había tomado nuestro diseño y se lo había aplicado por encima a un prototipo anterior, cambiando pantallas que nosotros habíamos definido. Lo rechazamos y pedimos que la construyera de cero desde el borrador.

### Qué le pedimos, qué aceptamos, qué corregimos y qué rechazamos

| Fecha | Qué pasó | Qué hicimos |
|---|---|---|
| Septiembre | Probamos dos veces poner siluetas de artistas en la portada, generadas con IA | **Descartado.** Quedaban como dibujos de cartel, y una silueta reconocible habría inclinado el proyecto hacia un artista. La portada quedó solo con el nombre |
| Septiembre | Pedimos que el color significara una sola cosa por color | **Aceptado**, y es la base del sistema de dos colores |
| Septiembre | La IA subió 52 archivos al repositorio cuando habíamos pedido 4 | **Corregido.** Se sacaron, y desde ahí pregunta antes de decidir cuánto abarca un pedido |
| 20 de octubre | La IA afirmó que hoy es más difícil entrar al Hot 100 que antes | **Corregido con datos.** Lo medimos: lo más difícil fueron los noventa (unas 342 canciones nuevas por año contra 424 hoy) |
| 26 de octubre | Propusimos una "escalera" de prestigio: nominada, nominada en dos, ganadora | **Descartado por nosotros** después de medirlo: ganar no suena distinto de estar nominada |
| 2 de noviembre | La IA aplicó nuestro diseño encima de un prototipo anterior | **Rechazado.** La app se rehízo desde nuestro borrador |
| 2 de noviembre | El chatbot no entendía preguntas con otras palabras. La IA propuso agregarle más reglas | **Rechazado.** Decidimos: o es una IA de verdad, o no va. Lo sacamos |
| 2 de noviembre | Pedimos los rasgos en columnas verticales, como una consola | **Pedido nuestro**, aceptado tal cual |
| 2 de noviembre | El texto de las decisiones de diseño sonaba a ensayo escrito por una IA | **Rechazado.** Se reescribió corto, en plural y con nuestras palabras |
| 3 de noviembre | Notamos que Despacito daba más prestigio que popularidad | **Encontrado por nosotros.** La IA buscó la causa: el eje de popularidad estaba armado con una sola cuenta. Se corrigió |
| 3 de noviembre | La IA dijo que el modelo tenía un error de signo | **Era un error de la IA** al leer una tabla. Lo reconoció y lo corrigió |
| 3 de noviembre | La pantalla de los dos mundos usaba cifras de toda la historia y ejemplos de antes del 2000 | **Corregido**, verificando cada cifra contra los datos |
| 10 de noviembre | La IA propuso incluir la letra en una versión chica | **Rechazado por ahora**, por decisión nuestra con los docentes |
| 10 de noviembre | Pedimos que la IA bajara y nos diera la letra de una canción | **La IA se negó**: las letras tienen derechos de autor. En cambio armó una herramienta que la mide sin guardarla |
| 15 de noviembre | Había canciones con datos rotos. Lo más simple era sacar todas las que figuraban como instrumentales | **Descartado.** Al mirar la lista, varias eran instrumentales de verdad. Pedimos volver a medir cada una, y se sacaron solo las 36 que estaban mal |

### Cómo manejamos las instrucciones de la IA que escribe la lectura

La IA de la app recibe, antes de cada lectura, un texto fijo con las reglas. Está en el repositorio, en `prompts/lectura_ia.md`, con fecha, para que cualquier cambio quede registrado.

**Qué le mandamos de cada canción:** los 10 rasgos con su valor, los dos puntajes con su margen, la zona del mapa, los rasgos que más suman o restan en cada eje, y el conflicto si lo hay.

**Qué no le mandamos: el título ni el artista.** Así no puede usar nada que "sepa" de afuera. Solo puede hablar de lo que medimos.

**Las reglas, en orden de importancia:**

1. Hablar **solo** de los números que recibe. No agregar datos, comparaciones ni canciones.
2. **No predecir.** Nunca decir que va a ganar, que va a ser un éxito o que "tiene potencial".
3. No opinar de la letra, del artista, del género, del sello ni del mercado.
4. No dar consejos generales de producción. Si un rasgo empuja para los dos lados, decirlo con sus números y aclarar que la decisión es de quien produce.
5. Si el margen de un puntaje es ancho, mencionarlo.

**La forma:** dos párrafos cortos, 70 palabras como máximo, en español rioplatense y sin entusiasmo vendedor. Al principio eran tres párrafos y 130 palabras; la acortamos para que se lea de un vistazo.

**Qué pasa si la IA falla:** la app muestra una lectura armada por el modelo con la zona y el conflicto, y avisa que la versión escrita por IA no está disponible. La clave del servicio está guardada en el servidor y nunca llega al navegador ni al repositorio.

**Por qué estas reglas.** Son la respuesta al chatbot que sacamos. Aquel prometía entender y no entendía. Esta IA no conversa: traduce. Todo lo que dice sale de un número que calculó el modelo y que está en la misma pantalla.

---

## Fuentes

**Los datos**

- Billboard Hot 100: [repositorio de la Universidad de Texas en Austin](https://github.com/utdata/rwd-billboard-data), licencia MIT
- Premios Grammy: Wikipedia, una página por categoría, licencia CC BY-SA 4.0
- Características del sonido: [Gildas Le Drogoff, en Hugging Face](https://huggingface.co/datasets/GildasLeDrogoff/spotify-huge-track-analysis-dataset), licencia CC BY-NC 4.0; valores calculados por Spotify
- [ReccoBeats](https://reccobeats.com) y [Essentia.js](https://mtg.github.io/essentia.js/)

**Las dos instituciones**

- Recording Academy, [cómo se vota](https://www.grammy.com/awards/voting-process)
- The Hollywood Reporter, [la disolución de los comités de nominación](https://www.hollywoodreporter.com/news/general-news/grammys-recording-academy-cuts-nomination-review-committees-4176889/), abril de 2021
- Wikipedia, [Billboard Hot 100](https://en.wikipedia.org/wiki/Billboard_Hot_100): primera edición, streaming desde 2007, YouTube desde 2013
- Billboard, [cambios en el peso del streaming](https://www.billboard.com/articles/news/8427967/billboard-changes-streaming-weighting-hot-100-billboard-200)

**Cómo se decide hoy en la industria**

- Water & Music, [How A&Rs use data to scout and evaluate artists](https://www.waterandmusic.com/how-ars-use-data-to-scout-and-evaluate-artists), octubre de 2020
- Luminate, [informe 2025, vía Hypebot](https://www.hypebot.com/luminate-reports-music-streaming-saturation-2025-2026/): 106.000 canciones por día

**Redes, YouTube y playlists**

- MRC Data (hoy Luminate), [informe de fin de año 2021](https://luminatedata.com/wp-content/uploads/2022/01/MRC_YEAREND_2021_US_FNL-1.pdf), y TikTok, [informe de música 2021](https://newsroom.tiktok.com/en-us/year-on-tiktok-music-report-2021): las 175 canciones
- TikTok y Luminate, [Music Impact Report](https://newsroom.tiktok.com/tiktok-and-luminate-release-latest-music-impact-report), febrero de 2025: el 84%
- Aguiar y Waldfogel, [Platforms, Promotion, and Product Discovery](https://www.nber.org/papers/w24713.pdf), NBER, 2018: los 20 millones de reproducciones
- Google, [límites de la API de YouTube](https://developers.google.com/youtube/v3/getting-started) · Spotify, [cambios de febrero de 2026](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide) · TikTok, [quién puede pedir sus datos](https://developers.tiktok.com/doc/research-api-codebook)

**La letra**

- Nunes, Ordanini y Valsesia, [The power of repetition](https://myscp.onlinelibrary.wiley.com/doi/abs/10.1016/j.jcps.2014.12.004), *Journal of Consumer Psychology*, 2015: el 14,5%
- Parada-Cabaleiro y otros, [Song lyrics have become simpler and more repetitive over the last five decades](https://www.nature.com/articles/s41598-024-55742-x), *Scientific Reports*, 2024: las 353.320 canciones
- Universidad de Nueva York, [qué predice un Grammy](https://www.futurity.org/grammy-awards-songs-artificial-intelligence-3243692-2/)

**En el repositorio:** [`decisiones.md`](decisiones.md) · [`datasets/diccionario.md`](datasets/diccionario.md) · [`analisis/`](analisis/) · [`prompts/lectura_ia.md`](prompts/lectura_ia.md) · [`diseno/borrador/`](diseno/borrador/)
