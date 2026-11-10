# La letra de las canciones: qué sabemos y qué falta medir

2 de noviembre de 2026

Este documento explica por qué nuestro análisis todavía no mira la letra de las canciones, qué se sabe hasta hoy sobre cuánto influye, y qué nos queda por hacer en la entrega que viene.

Está escrito para alguien que no conoce el proyecto.

---

## De qué va el proyecto, en dos párrafos

Comparamos dos mundos de la música: **el que premia la Academia de los Grammy** y **el que triunfa comercialmente** en el ranking de Billboard. Armamos una base con miles de canciones de los últimos veinticinco años, cada una con valores que describen **cómo suena** —si es acústica o eléctrica, cuánta energía tiene, si es alegre o melancólica, cuánto dura— y con la etiqueta de si fue nominada al Grammy, si entró al ranking, o ninguna de las dos cosas.

Con eso, nuestra herramienta toma una canción nueva y dice a cuál de los dos mundos se parece más.

**Hasta ahora medimos solo el sonido. No la letra.** Y resulta que la letra importa en los dos lados. Este documento explica cuánto, y cómo.

---

## Primera parte: cómo influye la letra en el éxito comercial

Hay tres cosas medidas, y la primera es la más contundente.

### Repetir el estribillo funciona, y está cuantificado

Un estudio analizó **todas las canciones del Billboard Hot 100 entre 1958 y 2012**. El resultado:

> **Por cada vez más que se repite el estribillo, la canción tiene un 14,5% más de probabilidad de llegar al puesto 1** en lugar de quedarse en el fondo del ranking.

Y hay más: las canciones más repetitivas **llegan más rápido** al número 1, y tienen más chances de **entrar directamente al Top 40** en su primera semana.

**Por qué pasa esto.** No es que repetir sea artísticamente mejor. Es que una letra repetitiva es **más fácil de procesar para el cerebro**, y lo que entendemos sin esfuerzo nos resulta más agradable. Los investigadores lo llaman "fluidez de procesamiento": cuanto menos trabajo cuesta entender algo, más nos gusta.

Eso sí, tiene un techo. Repetir demasiado las mismas palabras termina jugando en contra.

### Las letras simples llegan más alto

Otro estudio, sobre **14.661 canciones** de seis décadas del ranking estadounidense, encontró que **las canciones con letras más simples que logran entrar al ranking terminan llegando a puestos más altos**.

Y acá hay un detalle que conecta con algo que medimos nosotros: **ese efecto es más fuerte en los años donde se publica más música.**

Hoy se suben **106.000 canciones nuevas por día** a las plataformas de streaming. Cuanta más música compite por la atención de la gente, más ventaja saca la letra que se entiende enseguida.

### Las letras se simplificaron, y mucho

Un tercer estudio midió **más de 350.000 canciones del Top 40 entre 1970 y 2020**. Comparando las de los setenta con las de hoy:

| Qué midieron | Qué pasó |
|---|---|
| Repetición de versos | **Casi se duplicó** en el pop, y creció todavía más en el rap |
| Facilidad para entenderlas | Aumentó |
| Variedad de palabras usadas | Bajó |
| Tono emocional | Más negativo |
| Cuánto hablan de uno mismo | Aumentó |

**Esto es exactamente el mismo movimiento que encontramos nosotros en el sonido.** Las canciones exitosas pasaron de durar 4 minutos 18 segundos en los noventa a 3 minutos 11 hoy, y los temas de menos de dos minutos y medio volvieron a aparecer después de haber desaparecido.

La música y la letra se simplificaron al mismo tiempo, y por la misma razón: la competencia por la atención.

### Un detalle que confirma algo que ya sabíamos

Un estudio de 2025 sobre el ranking británico encontró que lo común o previsible que sea una letra **predice cuántas semanas se queda** la canción arriba, **pero no predice qué puesto máximo alcanza**.

Nosotros llegamos a la misma conclusión por otro camino al analizar Billboard: **cuán alto llega una canción y cuánto dura arriba son dos cosas distintas**, y no las explica lo mismo.

---

## Segunda parte: cómo influye la letra en el Grammy

Acá hay que separar dos premios, porque **no juzgan lo mismo**, y nosotros usamos los dos.

### Los dos premios que usamos

| Premio | A quién se lo dan | Qué juzga | ¿Mira la letra? |
|---|---|---|---|
| **Record of the Year** | Al intérprete, al productor y a los ingenieros de sonido | **La grabación**: cómo quedó tocada, cantada y producida | **No directamente** |
| **Song of the Year** | **A quienes la compusieron** | **La composición**: la melodía y la letra | **Sí, explícitamente** |

El reglamento de la Academia dice que, para competir en Song of the Year, la canción **"debe contener melodía y letra"**. Y aclara que "canción" significa **la obra en sí**, no una grabación en particular.

**Esto tiene una consecuencia directa sobre nuestro trabajo.** La mitad de nuestro grupo de canciones premiadas viene de un premio que se entrega por la melodía y la letra — y nosotros lo estamos midiendo con las características sonoras de la grabación.

Dicho sin vueltas: **para Song of the Year estamos midiendo justamente lo que ese premio no mira.**

### Qué encontramos al investigar si la letra predice un Grammy

Buscamos estudios que hayan medido esto. Lo que hay es poco, pero apunta todo en la misma dirección.

**Un estudio de la Universidad de Nueva York** entrenó un sistema para identificar qué caracteriza a las canciones que ganan el Grammy. Sus resultados:

- Para **Rap Song of the Year**, lo más predictivo fue **la variedad de vocabulario**, la cantidad de palabras y qué tan alegre es la letra.
- Para **Song of the Year y Record of the Year**, en cambio, la letra resultó **menos predictiva que el sonido** — pesaron más la energía, la acústica y la cantidad de palabra hablada.

O sea: en las categorías que nosotros usamos, el sonido explica más que la letra. Eso es una buena noticia para la validez de lo que venimos haciendo, aunque no significa que la letra no importe.

**Un estudio sobre hip-hop de 2025** comparó el reconocimiento de la crítica con el éxito comercial, y encontró algo importante:

> Las canciones con **más reconocimiento de la crítica** tienen **más variedad de vocabulario y rimas más complejas**. El éxito comercial, en cambio, no sigue ese patrón.

Los autores lo resumen así: **la crítica premia la innovación en el lenguaje más de lo que lo hace el mercado.**

**Un estudio sobre el Billboard de 1973 a 2023** llegó al mismo lugar desde el otro lado: las letras más simples tienden a funcionar mejor comercialmente.

### Lo que esto sugiere

Juntando las dos partes, aparece un patrón:

| | Letra simple y repetitiva | Letra compleja y variada |
|---|---|---|
| **Éxito comercial** | **Ayuda** | No especialmente |
| **Reconocimiento** | No especialmente | **Ayuda** |

**Si esto se confirma, la letra reproduce exactamente el mismo conflicto que encontramos en el sonido:** lo que acerca al público aleja del reconocimiento, y viceversa.

En el sonido ya lo medimos nosotros. Las canciones que la Academia reconoce son más acústicas, menos enérgicas y más largas que las que triunfan comercialmente. No hay una sola dirección que mejore las dos cosas a la vez.

Si la letra funciona igual, no sería un agregado suelto: sería **una segunda confirmación de la tesis central del proyecto**.

---

## Lo que no sabemos, y es importante decirlo

**Nadie midió todavía la letra de las nominadas a Song of the Year contra la letra de los hits comerciales del mismo período.** Lo buscamos y no existe.

Lo que hay son estudios por separado: cómo cambiaron las letras populares, qué distingue al reconocimiento de la crítica en hip-hop, qué predice un Grammy mirando sonido y letra juntos. Pero la comparación directa que necesita nuestro proyecto no está hecha.

**Eso significa que es investigación original.** Y es, probablemente, lo más valioso que podemos agregar en la entrega siguiente.

---

## Qué nos queda por hacer

**Para esta entrega:** dejamos declarado que el análisis mide solo el sonido, y que la letra es una dimensión que influye y que todavía no incorporamos. Eso ya está dicho en la aplicación: *"no medimos la letra, ni el sello, ni quién sos. Solo cómo suena."*

**Para la entrega siguiente**, el trabajo concreto sería:

1. **Conseguir las letras** de las canciones que ya tenemos en la base.
2. **Medir tres cosas** en cada una: cuánto se repite, qué tan variado es el vocabulario y qué tan fácil es de entender.
3. **Comparar** las nominadas a Song of the Year contra los hits del mismo período, igual que hicimos con el sonido.
4. **Ver si aparece el mismo conflicto**: si la letra simple acerca al público y la compleja al reconocimiento.
5. Si aparece, **sumarla como tercera dimensión** de la herramienta.

El paso 3 es el que nadie hizo. Los otros cuatro son trabajo conocido.

---

## De dónde sacamos cada cosa

- [Nunes y colegas — la repetición y el éxito comercial](https://myscp.onlinelibrary.wiley.com/doi/abs/10.1016/j.jcps.2014.12.004), *Journal of Consumer Psychology*
- [Las letras se volvieron más simples y repetitivas](https://www.nature.com/articles/s41598-024-55742-x), *Scientific Reports*, 350.000 canciones
- [Cobertura del estudio en la revista Science](https://www.science.org/content/article/popular-songs-are-simpler-and-more-repetitive-they-used-be)
- [Qué tan común es una letra y cuánto dura en el ranking](https://journals.sagepub.com/doi/10.1177/03057356251384301)
- [Estudio de la Universidad de Nueva York sobre qué predice un Grammy](https://www.futurity.org/grammy-awards-songs-artificial-intelligence-3243692-2/)
- [Complejidad del lenguaje y reconocimiento de la crítica en hip-hop](https://arxiv.org/pdf/2505.00035)
- [Letras del Billboard entre 1973 y 2023](https://www.nature.com/articles/s41598-025-28327-5)
- [Criterios del Grammy para Song of the Year](https://en.wikipedia.org/wiki/Grammy_Award_for_Song_of_the_Year)
