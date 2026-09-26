# P&P — Referentes

> Ocho referentes que cubren las cuatro áreas que pide la consigna: **visualización de datos, diseño visual, interfaz y utilidad**.
>
> De cada uno se indica **qué se toma prestado concretamente** — jerarquía visual, tipo de gráfico o patrón de interacción — y **qué no se toma**, porque decidir qué descartar es parte de la decisión de diseño.
>
> Actualizado: 3 de septiembre de 2026

---

## Resumen

| # | Referente | Área | Qué se toma | Dónde se aplica |
|---|---|---|---|---|
| 1 | Every Noise at Once | Visualización | El plano de dos ejes como interfaz principal, no como gráfico de apoyo | Pantalla de resultado |
| 2 | Gapminder | Visualización | Barra de tiempo con reproducción y estelas de trayectoria | Explorar la historia |
| 3 | Pronósticos electorales de FiveThirtyEight | Diseño visual | Jerarquía tipográfica de "número grande + intervalo dibujado" | Los dos puntajes |
| 4 | Datawrapper | Diseño visual | Anotación directa sobre el gráfico en vez de leyenda aparte | Todos los gráficos |
| 5 | iZotope Tonal Balance Control | Interfaz | Superposición "tu track contra la banda de referencia" + respuesta en tiempo real | Simular cambios |
| 6 | Linear | Interfaz | Densidad sin ruido, navegación por teclado, estados vacíos que enseñan | Toda la app |
| 7 | Chartmetric | Utilidad | Ficha de entidad con procedencia visible de cada dato | Detalle de canción |
| 8 | Musiio / "hit song science" | Utilidad | **Contraejemplo**: qué NO hacer | Posicionamiento |

---

# Visualización de datos

## 1. Every Noise at Once

**[everynoise.com](https://everynoise.com)** — de Glenn McDonald, ingeniero de datos que trabajó en Spotify

**Qué es.** Un mapa de casi seis mil géneros musicales ubicados en un plano de dos dimensiones según cómo suenan. Cada punto es un género y se puede clickear para escuchar un ejemplo. El eje vertical va de lo orgánico y acústico a lo eléctrico y mecánico; el horizontal, de lo denso y atmosférico a lo rítmico y saltarín.

**Por qué es nuestro referente principal.** Es **exactamente la estructura del gráfico central de P&P** —música ubicada en un plano de dos ejes— y demuestra que funciona como interfaz para gente que no lee gráficos. Alguien que nunca vio un diagrama de dispersión entiende ese mapa en diez segundos.

### Qué tomamos, puntualmente

**Patrón de interacción — el gráfico ES la interfaz.** En Every Noise el mapa no es un gráfico dentro de un tablero: es la pantalla entera y todo se navega desde ahí. En P&P, apenas termina el análisis, **el plano ocupa la pantalla completa**, no una tarjeta al costado de una lista de números. Los puntajes van al margen; el mapa manda.

**Jerarquía visual — orientarse por reconocimiento, no por números.** Every Noise no tiene números en los ejes. Uno entiende dónde está parado porque **reconoce los géneros vecinos**. En P&P los ejes tampoco se rotulan con escalas numéricas: alrededor del punto del usuario aparecen **canciones conocidas como anclas**. El usuario no lee "0,62 en el eje X", ve que su canción cayó cerca de *Rolling in the Deep* y lejos de *Bad Guy*.

**Interacción — clic para escuchar.** Cada punto reproduce un ejemplo. En P&P, clickear una canción de referencia **reproduce veinte segundos**. Es lo que convierte un dato en algo verificable con el oído, que es como piensa el usuario objetivo.

### Qué NO tomamos

Su densidad extrema. Seis mil puntos simultáneos funcionan para explorar sin objetivo, pero P&P responde una pregunta concreta. Mostramos **entre veinte y cuarenta canciones de referencia**, elegidas por cercanía a la del usuario, no el corpus entero.

---

## 2. Gapminder

**[gapminder.org/tools](https://www.gapminder.org/tools/)** — de Hans Rosling

**Qué es.** Un gráfico de burbujas con una barra de tiempo arrastrable, que muestra cómo cambiaron los países en riqueza y expectativa de vida a lo largo de dos siglos. Cada burbuja es un país, su tamaño es la población, y al mover el tiempo las burbujas se desplazan.

**Por qué.** Es **el modelo exacto de la pantalla "Explorar la historia"**, que es la que sostiene la tesis del proyecto. Sin esa pantalla la app es una calculadora; con ella, es un argumento sobre la industria musical.

### Qué tomamos, puntualmente

**Patrón de interacción — el tiempo se arrastra y se reproduce.** Gapminder tiene una barra con botón de *play*: se puede mirar la animación o detenerse en un año concreto. En P&P, la línea de tiempo va de **1958 a 2026** con las dos nubes —premiadas y exitosas— moviéndose por el plano. El usuario puede reproducirla o frenar en cualquier año.

**Tipo de gráfico — estelas de trayectoria.** Gapminder deja un rastro que se desvanece detrás de cada burbuja, y eso es lo que hace visible el *movimiento*, no solo la posición. En P&P las estelas son lo que muestra el hallazgo central: **la nube de los éxitos viajando hacia la de las premiadas** entre los 70 y los 2010, hasta cruzarla.

**Codificación por tamaño.** En Gapminder el tamaño de la burbuja es la población. En P&P, **el tamaño es la magnitud comercial** — semanas en el ranking. Así el gráfico dice tres cosas a la vez sin agregar un cuarto eje.

### Qué NO tomamos

Su cantidad de controles simultáneos (elegir qué variable va en cada eje, filtros por región, escalas logarítmicas). Gapminder es una herramienta de exploración abierta; nuestra pantalla de historia **cuenta un argumento específico**, así que los ejes están fijos.

---

# Diseño visual

## 3. Los pronósticos electorales de FiveThirtyEight

**[Pronóstico presidencial 2020, archivado](https://web.archive.org/web/20201102030346/https://projects.fivethirtyeight.com/2020-election-forecast/)** · continúa en **[Silver Bulletin](https://www.natesilver.net)**

> ⚠️ El sitio original **ya no existe**. Disney cerró FiveThirtyEight en marzo de 2025 y en mayo de 2026 borró el archivo entero: `fivethirtyeight.com` redirige hoy a ABC News. Para mostrarlo en la presentación hay que usar la copia del Archivo de Internet enlazada arriba. Nate Silver se llevó los modelos y los sigue publicando en Silver Bulletin.

**Qué es.** El trabajo que estableció el estándar de comunicar pronósticos como **probabilidades con rango** en vez de anunciar un ganador. Su aporte no fue el modelo estadístico sino la forma de presentarlo: una distribución visible, no una sentencia.

**Por qué es clave acá.** La propuesta de P&P ya llegó por intuición a la misma decisión —*"32%, con un margen entre 24% y 41%"*— y citarlos la convierte en una **decisión de diseño fundamentada** con antecedente conocido, que es justo lo que pide la consigna.

### Qué tomamos, puntualmente

**Jerarquía visual — el número y su intervalo son un solo bloque.** No es "32%" en grande y el margen en letra chica abajo, como una advertencia legal. Es un bloque tipográfico único: el número en cuerpo grande, y **inmediatamente debajo, en la misma columna y con el mismo peso visual, el rango**. Nunca aparecen separados, en ninguna pantalla.

**Tipo de gráfico — el intervalo se dibuja, no solo se escribe.** Debajo de cada puntaje va una **banda horizontal** que muestra el rango, con el valor central marcado. Ver el ancho de la banda comunica la incertidumbre mucho más rápido que leer dos números.

**Lenguaje — nunca el futuro afirmativo.** Ni la interfaz ni el asistente dicen "tu canción va a". Dicen "se parece a", "está en la zona de", "es probable que". Es una regla de redacción que atraviesa todos los textos de la app y también el *prompt* del asistente.

### Qué NO tomamos

Sus gráficos de distribución completos (histogramas de simulaciones). Son correctos pero exigen alfabetización estadística. Nosotros comprimimos eso a **una banda simple**.

---

## 4. Datawrapper

**[blog.datawrapper.de](https://blog.datawrapper.de)** — artículos de Lisa Charlotte Muth

**Qué es.** Una herramienta de gráficos, y sobre todo un blog muy práctico sobre decisiones concretas de color, escala y anotación.

### Qué tomamos, puntualmente

**Anotación directa en vez de leyenda.** Su principio central: si podés escribir la etiqueta **al lado de la cosa**, no hagas una leyenda aparte que obligue a ir y volver con la mirada. En P&P los grupos se rotulan sobre el gráfico —"premiadas" y "éxitos" escritos junto a cada nube, en el color de cada una— y **no hay leyenda**.

**Color con significado, no decorativo.** Dos colores para los dos mundos, sostenidos idénticos en todas las pantallas: el mismo color que identifica "prestigio" en el gráfico es el del puntaje de prestigio, el de su banda de error y el de su lista de canciones de referencia.

**Escalas que no engañan.** Los ejes arrancan donde corresponde y no se recortan para exagerar diferencias. En una herramienta cuyo argumento es la honestidad, un eje truncado sería contradictorio.

---

# Interfaz

## 5. iZotope Ozone — Tonal Balance Control

**[izotope.com](https://www.izotope.com/en/products/ozone.html)**

**Qué es.** Una herramienta profesional de mezcla que compara el balance tonal de tu tema contra la curva típica de un género y te muestra dónde te desviás.

**Por qué es el referente de interfaz más valioso.** Es **la misma idea de P&P aplicada a la mezcla**, y es una herramienta que **los músicos ya usan y entienden**. Valida que el formato "tu material contra un perfil de referencia" es legible para exactamente el usuario que buscamos, sin necesidad de enseñarle a leerlo.

### Qué tomamos, puntualmente

**Patrón visual — superposición contra una banda, no contra una línea.** Ozone no dibuja "la curva correcta": dibuja una **banda sombreada** que representa el rango donde cae la mayoría de los temas del género, y encima tu curva. Se ve de un vistazo dónde estás adentro y dónde te salís.

En P&P, la lista de características usa exactamente eso: cada una es una fila con **la banda de lo que fue premiado** y un marcador con tu valor. No decimos "tu duración está mal", mostramos que las premiadas caen entre 3:40 y 5:20 y tu tema está en 2:55.

**Patrón de interacción — sin botón de "calcular".** En Ozone movés un control y la comparación se actualiza mientras lo movés. En P&P, los deslizadores de "Simular cambios" **actualizan el punto en el gráfico y los dos puntajes en tiempo real**, sin confirmar nada.

Esto no es un detalle cosmético: es **lo que convierte el conflicto en algo que se siente**. Subir la energía y ver un puntaje subir mientras el otro baja, con el movimiento pegado a la mano, comunica la tensión mejor que cualquier explicación escrita.

### Qué NO tomamos

Su cantidad de parámetros y su vocabulario técnico. Ozone habla para ingenieros de mezcla. P&P traduce todo a lenguaje de músico, y esa traducción es trabajo del asistente.

---

## 6. Linear

**[linear.app](https://linear.app)**

**Qué es.** Una herramienta de gestión de proyectos para equipos de software, reconocida por su terminación.

**Por qué.** Es nuestra referencia de **acabado**: cómo se ve una app que se siente profesional sin ser fría ni recargada.

### Qué tomamos, puntualmente

**Jerarquía visual — densidad sin ruido.** Linear muestra mucha información por pantalla usando tipografía chica, espaciado ajustado, **un solo color de acento** y jerarquía por peso y tamaño en lugar de por cajas y bordes. En P&P eso significa que la ficha de resultado entra completa sin scroll: los dos puntajes, el gráfico y las características principales conviven sin sentirse apretadas.

**Patrón de interacción — teclado primero.** Atajos para todo y un buscador de comandos. En P&P: **flechas para moverse entre canciones** en modo álbum, y una barra para buscar canciones de referencia sin usar el mouse.

**Estados vacíos que enseñan.** Cuando no hay nada que mostrar, Linear explica qué poner ahí y cómo. En P&P, la pantalla inicial —antes de subir nada— **muestra el gráfico ya poblado con canciones históricas conocidas**. El usuario entiende cómo se lee el mapa *antes* de tener su propio resultado, así que cuando aparece su punto ya sabe interpretarlo.

### Qué NO tomamos

Su paleta oscura y su estética de herramienta de ingeniería. El usuario de P&P es músico, no programador.

---

# Utilidad

## 7. Chartmetric

**[chartmetric.com](https://chartmetric.com)**

**Qué es.** Una plataforma de analítica musical que usan managers y cazatalentos de sellos para seguir artistas y canciones.

**Por qué.** Es el **contexto profesional** de nuestro usuario secundario. Muestra a qué está acostumbrado alguien que trabaja en la industria.

### Qué tomamos, puntualmente

**Estructura de ficha de entidad.** Cada artista tiene una página con la misma estructura siempre: identidad arriba, métricas principales, y detalle desplegable abajo. En P&P la ficha de canción sigue ese orden fijo: **título y artista → los dos puntajes con sus bandas → las características ordenadas por influencia → las canciones de referencia**. Siempre igual, así se aprende una sola vez.

**Procedencia visible.** Cada número indica de dónde salió y de cuándo es. En P&P, cada característica muestra si vino del análisis del archivo subido o de la base histórica, y contra qué período se comparó.

### Qué NO tomamos

Su cantidad de métricas simultáneas. Chartmetric le habla a un analista con tiempo. P&P responde una pregunta en cinco segundos.

---

## 8. Musiio, Music Xray y la "hit song science" — el contraejemplo

**Qué son.** Empresas que venden predicción de éxito comercial. Te dicen *"tu canción tiene 74% de chances de ser un hit"*. **Musiio** fue comprada por SoundCloud; **Sodatone**, por Warner. **Hitwizard** reporta alrededor de 66% de acierto comparando contra radios y charts holandeses.

**Por qué está en la lista.** Porque es el **contraejemplo deliberado**, y es el mejor argumento de posicionamiento del proyecto.

### Qué tomamos — por oposición

| Ellos | P&P |
|---|---|
| Predicen **un solo eje**: el comercial | Muestra **dos ejes en tensión** |
| Venden una **certeza** | Entrega un **diagnóstico con margen de error** |
| Le hablan a **sellos** | Le habla al **artista** |
| Dicen qué va a pasar | Dice **dónde estás parado** y qué implica cada camino |

**La diferencia de producto, en una frase:** ellos responden *"¿va a pegar?"*. P&P responde *"¿qué tenés entre manos, y qué perdés si vas para cada lado?"*.

**Y algo que sí les tomamos:** ese 66% de acierto de Hitwizard es una **referencia útil de calibración**. Si nuestro modelo diera 95%, sería señal de que algo está mal —probablemente el grupo de control contaminado— y no de que funciona bien.

---

## Referentes de investigación previa

No son referentes de diseño, pero la consigna pide referentes de datos y estos sostienen la hipótesis.

**Interiano et al. (2018), [Royal Society Open Science](https://royalsocietypublishing.org/doi/full/10.1098/rsos.171274)** — analizaron 500.000 canciones del Reino Unido entre 1985 y 2015. Encontraron una caída clara en "felicidad" y "brillo", y que las canciones exitosas tienden a ser más alegres y más "de fiesta" que el promedio.

*Por qué importa:* confirma independientemente dos cosas que encontramos en nuestros datos. Y como su ventana termina en 2015, **nuestro aporte es mostrar que eso se invierte después**: en los 2010s los éxitos dejan de ser más alegres que el promedio.

**NYU (2024), [What Makes a Grammy Winner?](https://www.nyu.edu/about/news-publications/news/2024/july/what-makes-a-grammy-winner--researchers-turn-to-ai-to-provide-so.html)** — algoritmo que predice ganadores de Song of the Year, Record of the Year y Rap Song of the Year entre 2021 y 2023. Encontraron que **cada categoría se predice con características distintas**.

*Por qué importa:* valida nuestra decisión de calcular el perfil de prestigio **solo con las categorías generales**, y coincide en que energía y acústica son los ejes relevantes. Nuestra diferencia: ellos cubren tres años, nosotros seis décadas.
