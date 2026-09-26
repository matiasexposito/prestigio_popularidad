# P&P — Prestigio & Popularidad
## Plan completo del proyecto

> Documento de entrada. Explica el proyecto entero desde cero, para alguien que nunca lo escuchó nombrar: qué queremos hacer, por qué, qué ya está hecho, de dónde salió cada cosa y qué falta.
>
> No hace falta saber nada de datos ni de programación. Cada término técnico se explica la primera vez que aparece, y hay un glosario al final.
>
> **Equipo:** Matías, Tomás y Diógenes
> **Documentos relacionados:** `datos_y_referencias.md` (el detalle de cada fuente de datos), `plan_de_datos.md` (los problemas técnicos y los resultados del análisis), `referentes.md` (los ocho referentes de diseño).
> Actualizado: 3 de septiembre de 2026

---

# PARTE 1 — QUÉ QUEREMOS HACER

## 1.1 El proyecto en un párrafo

**P&P (Prestigio & Popularidad)** es una web app donde un músico sube su canción y recibe dos puntajes: **cuánto se parece al perfil de sonido que la Academia del Grammy premia**, y **cuánto al perfil que el público consume masivamente**. La ubica en un mapa de esos dos ejes, rodeada de canciones conocidas que le sirven de referencia, y le explica qué la acerca y qué la aleja de cada uno.

El resultado no es una orden ni una predicción: **es un diagnóstico con una tensión adentro**. Casi siempre, moverse hacia el premio implica alejarse del público. La app no dice "hacé esto", dice "estás acá, y si querés ir para allá, esto es lo que ganás y esto lo que perdés".

## 1.2 Por qué este tema

Es una discusión que existe hace décadas en la industria y en la conversación pública: **hay canciones que ganan premios y otras que llenan estadios, y casi nunca son las mismas**. Se da por sentado que existe "un sonido Grammy" distinto de "un sonido comercial", pero nadie lo verificó con datos de forma pública.

Ahí está el hueco que llena el proyecto: no proponemos una opinión sobre música, proponemos **medirlo**.

## 1.3 La hipótesis

**La original, como la formulamos:**

> Existe un tipo de perfil sonoro medible asociado al reconocimiento de la Academia, distinto del perfil asociado al éxito comercial masivo, y la distancia entre ambos se amplió a lo largo de las últimas décadas. Por lo tanto, la canción que gana un Grammy no necesariamente alcanza el éxito comercial, y viceversa.

**Lo que dijeron los datos** (el análisis ya está hecho, ver 3.4):

La primera parte se confirmó: **los dos perfiles existen y son distintos**, de forma medible. Pero la segunda parte resultó ser más específica de lo que suponíamos. Los dos mundos no simplemente "se separaron":

> **Convergieron en carácter emocional —porque el público se movió hacia el gusto que la Academia siempre tuvo— y al mismo tiempo divergieron en formato, más que nunca en sesenta años.**

Esto es un resultado mejor que el original, porque es más específico y sale enteramente de nuestros datos. **Que una hipótesis se corrija con la evidencia no es un fracaso del proyecto: es el proyecto funcionando.**

## 1.4 Lo que la app NO hace

Es importante decirlo desde el principio, porque define el producto:

- **No predice** si vas a ganar un Grammy ni si vas a pegar.
- **No te dice qué hacer.** Muestra dónde estás y qué implica cada camino.
- **No mide la letra**, ni el sello discográfico, ni la campaña de prensa, ni quién es el artista. Solo mide **cómo suena**.

Ese último punto es una limitación real y la declaramos abiertamente. Un Grammy depende muchísimo de factores que ningún dato acústico captura. Reconocerlo es lo que separa una herramienta honesta de una que promete magia.

---

# PARTE 2 — PARA QUIÉN Y QUÉ HACE

## 2.1 Quién lo usa

**Usuario principal: el artista.** Emergente o consagrado, en cualquier etapa. Tiene una canción o un disco terminado y necesita decidir qué hacer con él.

**Usuario secundario: manager o productor independiente.** Su decisión real casi nunca es *"¿esta canción gana un Grammy?"*. Es **"¿cuál de estas diez mando, y a dónde?"**. Por eso existe el modo álbum.

**Usuario terciario: periodista o analista cultural.** Le interesa la pantalla de historia más que el análisis individual: quiere el argumento sobre la industria, no el diagnóstico de un tema.

**Un caso concreto:** un productor recibe el pedido de un cantante —"quiero que esta suene a premio"— y necesita entender qué significa eso en decisiones de arreglo y mezcla. Puede usar la herramienta **sin el cantante presente**, porque el análisis no depende de la letra.

## 2.2 Las pantallas

| Pantalla | Qué ve el usuario | Para qué sirve |
|---|---|---|
| **Inicio** | El mapa de dos ejes **ya poblado** con canciones históricas conocidas | Aprende a leer el gráfico antes de tener su propio resultado |
| **Resultado** | Su canción como un punto en el mapa, rodeada de referencias. Al costado, los dos puntajes con su margen de error | En cinco segundos sabe qué tipo de canción tiene entre manos |
| **Qué suma y qué resta** | Lista de características ordenadas por cuánto influyen. Cada una muestra si suma o resta en cada eje | Convierte un número en un argumento que puede repetir en una reunión |
| **El conflicto** | La app señala explícitamente dónde está la contradicción: *"tu conflicto principal es la energía — bajarla te acerca al premio pero te aleja del público"* | Es el corazón del producto: no existe una dirección que mejore las dos cosas |
| **Canciones de referencia** | Tres grupos de canciones reales: hacia el premio, hacia el público, y las que lograron ambas | Es lo más accionable de toda la app. A un músico no le servís diciéndole "bajá la valencia 0,15"; le servís diciéndole "apuntá a que suene como estas tres" |
| **Simular cambios** | Controles deslizantes. Al moverlos, el punto se desplaza y los puntajes cambian en tiempo real | Explorar escenarios antes de decidir una mezcla. Y es donde el trade-off deja de ser un concepto y **se siente con la mano** |
| **Modo álbum** | Varias canciones en el mismo mapa, más una tabla que las ordena y recomienda destino | Responde la pregunta real del manager. Ventaja escondida: aunque el modelo se equivoque en los números absolutos, **el orden entre canciones del mismo disco se sostiene** |
| **Explorar la historia** | Línea de tiempo de 1958 a hoy con dos trayectorias: lo que la Academia premia y lo que el público escucha | Es lo que sostiene la tesis. Sin esta pantalla la app es una calculadora; con ella, es un argumento sobre la industria |
| **El asistente** | Un chat al costado que ya sabe qué canción analizaste y qué dio | Convierte el resultado en una conversación donde se puede preguntar hasta entender |
| **Página de racional** | La hipótesis, el tratamiento de los datos y el rol de la IA | Requisito de la Entrega 3 |

## 2.3 El asistente conversacional

No es un chatbot genérico pegado al costado. Arranca solo, apenas termina el análisis, con un resumen en lenguaje natural:

> *Tu canción cayó en la zona de "hit puro": buen potencial comercial (68%) pero lejos del perfil que premia la Academia (19%). El problema principal es la energía —está muy arriba para lo que se premió en los últimos diez años— y la duración, más corta que el promedio de los ganadores. ¿Querés que te explique alguna de las dos?*

**Cómo funciona, en tres pasos:**

1. **Recibe el contexto completo** del análisis: características, puntajes, qué pesó más, canciones de referencia.
2. **Puede consultar el modelo en vivo.** Si el usuario pregunta *"¿qué pasa si bajo la energía?"*, no adivina: le pide al modelo que recalcule y responde con el número real.
3. **Traduce.** Nunca le pide al usuario que piense en números. Si tiene que recomendar bajar la energía, lo dice como lo diría un productor: *"probá una versión más contenida, menos capas de percusión, batería menos presente en la mezcla"*.

**Los límites que respeta.** Si le preguntan algo que los datos no pueden responder —*"¿le va a gustar mi letra a la Academia?"*, *"¿tengo chances si mi sello es independiente?"*— contesta que eso está fuera de lo que el análisis mide, y explica por qué. **Preferimos un asistente que diga "no puedo saberlo" a uno que suene seguro y se equivoque.**

---

# PARTE 3 — QUÉ YA HICIMOS

## 3.1 Cómo funciona por dentro

```
   Billboard  ─┐
   Grammy     ─┤──→  UNA TABLA  ──→  MODELO  ──→  LOS DOS PUNTAJES
   Sonido     ─┤    (26.577          entrenado         ↓
   Control    ─┘     canciones)                    ASISTENTE (Claude)
                                                    traduce a
   Canción del usuario ──→ librosa ────────────────→ lenguaje de músico
```

Todo termina en **una sola tabla donde cada fila es una canción**: las columnas del medio son las características del sonido, y las últimas dos son las respuestas (qué le pasó en el mundo de los premios y en el comercial).

> **La distinción más importante del proyecto:** "el perfil que premia la Academia" **no es un dato que se descarga**. Es lo que el sistema deduce mirando miles de filas. Si se pudiera bajar de algún lado, no habría proyecto.

## 3.2 Las cinco fuentes de datos

*(El detalle completo está en `datos_y_referencias.md`. Acá va el resumen.)*

| # | Fuente | De dónde | Qué conseguimos | Estado |
|---|---|---|---|---|
| 1 | **Billboard Hot 100** | [github.com/utdatasets/rwd-billboard-data](https://github.com/utdatasets/rwd-billboard-data) — descarga directa, gratis | **32.702 canciones únicas**, 1958-2026, con su mejor puesto, semanas en el ranking y año de primera aparición | ✅ |
| 2 | **Premios Grammy** | Lo armamos nosotros parseando Wikipedia, porque ningún dataset público cubría las décadas viejas con nominados | **2.513 nominaciones, 488 ganadoras**, 1959-2026, en 14 categorías | ✅ |
| 3 | **Características del sonido** | [HuggingFace — GildasLeDrogoff](https://huggingface.co/datasets/GildasLeDrogoff/spotify-huge-track-analysis-dataset), sin cuenta | **56.277.664 canciones** con sus características cada una, 4,1 GB | ✅ |
| 4 | **Grupo de control** | Sale de la fuente 3: las que no están ni en Grammy ni en Billboard | **27.000 canciones**, 4.500 por década desde 1970 | ✅ |
| 5 | **La canción del usuario** | Se analiza el audio en el momento con **librosa** | — | ⏹️ pendiente |

**Por qué Billboard y no las reproducciones de Spotify:** los datos de reproducciones existen desde 2015. No hay forma de saber cuántas veces se "reprodujo" una canción en 1967. Billboard es la única medida de éxito comercial que existe en todas las décadas que comparamos, medida siempre igual.

**Por qué nominados y no solo ganadores:** ganadores de Canción del Año hay unos 60 en toda la historia. Con 60 ejemplos un sistema no aprende, memoriza. Con nominados pasamos a 2.513 — cuarenta veces más material. Y es más correcto: la hipótesis habla del *perfil que la Academia reconoce*, y una nominación ya es reconocimiento.

**Por qué el grupo de control es imprescindible:** si al sistema solo le mostramos ganadoras y exitosas, nunca ve cómo suena una canción normal y no tiene contra qué comparar. Es como enseñar a reconocer caras famosas mostrando únicamente fotos de famosos. **Sin él, los dos puntajes no significan nada** — y lo peor es que no se nota, porque los números salen y se ven razonables.

## 3.3 El número que decidía el proyecto

Bajar los datos es fácil. **Cruzarlos es donde este tipo de proyecto se cae**, porque la misma canción está escrita distinto en cada fuente:

```
en Billboard:  "Blinding Lights"              — The Weeknd
en Grammy:     "Blinding Lights"              — Abel Tesfaye
en el dump:    "Blinding Lights - Remastered" — The Weeknd
```

Si de las 2.029 canciones nominadas solo cruzábamos 300, no había modelo posible y había que replantear todo. Por eso lo medimos **antes** de programar una sola pantalla.

| | Cruzaron | Tasa |
|---|---|---|
| Canciones nominadas al Grammy | 1.656 de 2.029 | **81,6%** |
| Solo las ganadoras | 330 de 416 | 79,3% |
| Canciones de Billboard | 25.984 de 32.702 | 79,5% |

**Corpus final: 26.577 canciones etiquetadas**, ninguna sin año. De ellas, **1.071 lograron las dos cosas** — premio y éxito. Esa es directamente la funcionalidad "casos que lograron ambas", y no hubo que recolectarla: apareció sola al cruzar.

## 3.4 Qué encontramos

Comparando cada canción **contra lo que sonaba en su propio año** (para que la diferencia no sea tecnología de grabación sino música). Cero significa "suena como la música típica de su época":

| Respecto de su propio año | Premiadas | Hits |
|---|---|---|
| Energía | −0,02 | **+0,39** |
| Valencia (qué tan alegre suena) | **−0,12** | +0,16 |
| Acústica | −0,22 | **−0,60** |
| Duración | **+0,18** | 0,00 |

**Los dos perfiles existen y son distintos.** Las premiadas son menos enérgicas, más melancólicas, más acústicas y más largas. La primera mitad de la hipótesis quedó confirmada.

**Y la brecha a lo largo del tiempo:**

| Década | Valencia | Duración |
|---|---|---|
| 1970s | **−0,74** | +0,14 |
| 1980s | −0,36 | +0,20 |
| 1990s | −0,45 | −0,01 |
| 2000s | −0,28 | +0,09 |
| 2010s | **+0,04** | +0,15 |
| 2020s | **+0,15** | **+0,54** |

La valencia converge y **se cruza**. La duración se abre hasta el máximo histórico. Mirando quién se movió: la columna de las premiadas casi no cambia; la de los hits se desploma. **La Academia premió siempre lo mismo; el que se movió fue el público.**

## 3.5 Lo que salió mal y cómo lo arreglamos

Cuatro errores nuestros, encontrados y corregidos. **Contarlos en la presentación juega a favor**: muestra que el trabajo se auditó, no que salió bien de casualidad.

**1. El año del dump no era el año de la canción.** Bohemian Rhapsody (1975) figuraba como 2024, porque esa fecha es la de la *reedición* en Spotify. Lo medimos contra Billboard: la fecha acierta el 98% en los 2020s y **el 0% en los 50s**. Solución: el año lo ponen Billboard y Grammy; el dump aporta solo el sonido. Y el grupo de control arranca en 1970, que es donde la fecha empieza a ser confiable.

**2. Cada canción aparecía muchas veces.** Tres versiones de Bohemian Rhapsody con números contradictorios — energía 0,85 en vivo contra 0,40 en estudio. Solución: una sola versión por canción, la grabación de estudio original.

**3. El grupo de control venía lleno de cosas que no son música.** Audiolibros infantiles alemanes y ruido blanco para dormir: **5,8% del control era palabra hablada, contra 0,05% de los hits**. Si lo dejábamos, el modelo aprendía que "no ser un hit" significa "ser palabra hablada" — se vería muy preciso y sería inútil.

**4. El filtro que casi borra la música clásica.** Al intentar filtrar el ruido blanco con la regla "muy instrumental y con poca energía", agarraba a Erik Satie y a la London Symphony Orchestra. Esa regla describe igual de bien a un generador de ruido que a una pieza de piano. Si la aplicábamos, el modelo aprendía que "no ser hit" significa "tener voz y ser movida". Solución: filtrar por nombre de artista, no por características del sonido.

**5. Medir el prestigio con las categorías de género no mide prestigio.** Al principio la energía de las premiadas daba *más alta* que la de los hits. El motivo: Best Metal Performance tiene energía media 0,93 y Song of the Year, 0,44. Meter metal en la bolsa de "lo que premia la Academia" no mide prestigio, mide que el metal es ruidoso. Solución: el perfil se calcula **solo con Record of the Year y Song of the Year**.

---

# PARTE 4 — QUÉ FALTA HACER

## 4.1 Los tres pendientes técnicos

**1. Entrenar el modelo.** Es lo que convierte el corpus en los dos puntajes con sus márgenes de error. Todo lo demás depende de esto.

**2. Instalar Python y librosa.** Python no está instalado en la máquina. Para bajar y cruzar los datos alcanzó con otra herramienta, pero **sin esto la app no puede analizar el archivo que sube el usuario**, que es su función principal.

**3. Calibrar las dos escalas** ← *el pendiente más importante y el más fácil de pasar por alto.*

Los números del corpus los calculó el algoritmo de Spotify. Los del usuario los va a calcular librosa. **Son programas distintos**: su "energía" y la "energía" de Spotify miden cosas parecidas de maneras distintas. Si entrenamos con una escala y medimos con otra, la app devuelve números mal calibrados — que se ven razonables y están mal.

Se resuelve tomando unas cien canciones que estén en el dump y de las que tengamos el audio, analizándolas con librosa, y midiendo cómo se traduce una escala a la otra. Es acotado, pero **no se puede saltear**.

## 4.2 Qué hay que hacer para cada entrega

### Entrega 1 — Hipótesis y contexto
| | |
|---|---|
| Tópico e hipótesis | ✅ |
| Datasets presentados | ✅ las cinco fuentes, bajadas y verificadas |
| Perfil de usuario | ✅ |
| Funcionalidades | ✅ |
| Referentes | ✅ ocho, en `referentes.md` |
| **Informe escrito de 2 páginas** | ⏹️ falta |
| **Presentación de 7 minutos** | ⏹️ falta |

> El **cliente real** que menciona la consigna general no está en la lista de la Entrega 1 — queda para una entrega posterior. Ver 4.3.

### Entrega 2 — Prototipo de baja fidelidad
Hay que mostrar el flujo de la app, dónde interviene la IA y por qué el diseño responde a la hipótesis.

- Dibujar las diez pantallas de 2.2, en orden de recorrido
- Marcar en el flujo **dónde calcula el modelo y dónde interpreta la IA** (es lo que la consigna pide "evidenciar")
- Señalar en cada pantalla **qué descubrimiento de los datos la justifica** — acá tenemos ventaja: los hallazgos ya están medidos, no son suposiciones
- Definir qué gráfico va en la pantalla de historia

### Entrega 3 — Prototipo online funcional
- Modelo entrenado y funcionando
- Backend que reciba un archivo de audio, lo analice y devuelva los dos puntajes
- Frontend con el mapa, los puntajes y las canciones de referencia
- **Asistente con IA en tiempo real** conectado a los resultados del análisis
- **Página de racional**: la hipótesis, el procesamiento de datos y el rol de la IA
- Publicada en internet y funcionando en vivo

### Entrega 4 — Versión final
- Demo en vivo
- Poder explicar las decisiones de **diseño, datos y prompting**

Para esa última parte, este documento y los tres relacionados tienen todo el material: las decisiones están escritas con su justificación y con los números que las sostienen.

## 4.3 Lo que hay que conseguir aparte del código

**Un cliente real.** La consigna pide trabajar con uno y todavía no lo tenemos. Alcanza con **un músico, manager o productor independiente** que acepte una entrevista de treinta minutos. Es barato de conseguir y es lo que sostiene el perfil de usuario: sin eso, los perfiles son suposiciones nuestras.

**Una cuenta de API de Claude** ([console.anthropic.com](https://console.anthropic.com)) para el asistente. Es la única cosa del proyecto que cuesta plata, y son centavos por consulta.

## 4.4 Riesgos abiertos

| Riesgo | Qué hacemos |
|---|---|
| **La muestra por década es chica** (~65 canciones premiadas) | Decirlo en la presentación antes de que lo pregunten. La dirección es consistente en seis décadas seguidas, lo cual da confianza, pero el número hay que declararlo |
| **La calibración entre escalas** | Es el pendiente técnico crítico. Hasta que esté hecho, los puntajes de canciones subidas no son confiables |
| **El modelo podría dar demasiado bien** | Si diera 95% de acierto, sería señal de que algo está mal, probablemente contaminación del grupo de control. Una herramienta comparable ([Hitwizard](https://www.oxmag.co.uk/articles/predicting-music-hits-with-ai/)) reporta ~66%: ese es el orden de magnitud esperable |
| **Sesgo del corpus hacia Estados Unidos** | Billboard y el Grammy son instituciones estadounidenses. La app mide "prestigio y popularidad **en el mercado estadounidense**", no en el mundo. Hay que declararlo en el racional |

---

# PARTE 5 — CUATRO COSAS A CORREGIR EN EL BORRADOR

Al revisar el texto de la Entrega 1 encontré estas inconsistencias con lo que efectivamente tenemos:

**1. "Desde la entrega en 1970".** Los datos de Grammy que tenemos arrancan en **1959**, no en 1970. Lo que se limita a 1970 es **el grupo de control**, por el problema de la fecha (3.5, punto 1). Conviene decirlo bien: *"nominaciones desde 1959; el modelo se entrena desde 1970, porque antes de esa fecha no se puede fechar de forma confiable a las canciones que no están en Billboard ni en Grammy"*.

**2. "Las últimas 5 décadas".** Si el corpus etiquetado va de 1958 a 2026 son casi siete décadas; si contamos desde 1970 son seis (70s, 80s, 90s, 2000s, 2010s, 2020s). **Conviene decir "seis décadas"** y que sea consistente en todo el documento.

**3. "La IA ya aprendió cómo suena cada tipo de canción".** Esto mezcla dos cosas que conviene separar, porque la consigna pide poder explicar el rol de la IA:

- **El modelo** (estadístico) es el que aprende de los datos y calcula los puntajes. Da siempre el mismo resultado.
- **La IA conversacional** (Claude) no aprende nada de nuestros datos: recibe los números ya calculados y **los traduce e interpreta**.

La frase correcta sería: *"el modelo aprende y calcula; la IA conversacional interpreta y traduce, nunca calcula ni decide"*. Es exactamente lo que hace que el asistente no sea "un ChatGPT pegado al costado", y es defendible frente a cualquier pregunta.

**4. "Librossa"** se escribe **librosa**, con una sola s.

---

# Glosario

**API** — la forma en que un programa le pide datos a otro por internet. Spotify tenía una para las características de sonido; la cerró en 2024.

**Corpus** — el conjunto completo de canciones con las que el sistema aprende.

**Dataset** — un archivo con datos ordenados en filas y columnas, como una planilla pero mucho más grande.

**Dump** — una copia completa de una base de datos, publicada como archivo para que otros la usen.

**Entrenar un modelo** — mostrarle al sistema miles de ejemplos con la respuesta puesta, para que aprenda solo qué combinaciones llevan a cada resultado.

**Característica (o *feature*)** — una columna que describe algo medible de una canción. "Energía = 0,73" es una característica.

**Grupo de control** — el conjunto de ejemplos comunes, los que no tienen nada especial. Sirve para que el sistema sepa contra qué comparar.

**librosa** — programa gratuito que abre un archivo de audio y calcula sus características.

**Margen de error** — cuánto puede equivocarse una estimación. "32%, entre 24% y 41%" dice que el valor real probablemente esté en ese rango.

**Modelo** — el sistema estadístico que aprendió de los datos y calcula los puntajes. Distinto de la IA conversacional.

**Cruce (o *matching*)** — juntar dos tablas identificando qué fila de una corresponde a qué fila de la otra.

**Valencia** — qué tan alegre suena una canción. No la letra: el sonido. Va de 0 a 1.
