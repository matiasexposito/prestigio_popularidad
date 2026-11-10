# Nuevos puntos — definición del eje de popularidad

20 de octubre de 2026

Lo que definimos sobre cómo medir la popularidad, y los hallazgos que respaldan cada decisión. Todas las cifras están **medidas sobre los archivos**, no estimadas.

---

## Las decisiones

### 1. Qué variables forman el eje

| Variable | Papel |
|---|---|
| `fue_hit` | Si entró al Hot 100 alguna vez |
| `mejor_puesto` | El puesto más alto alcanzado, de 1 a 100 |
| `anio` | **No es popularidad.** Es el contexto para normalizar |

**Descartadas, con el motivo medido:**

| Descartada | Por qué |
|---|---|
| `semanas_en_chart` | Cambió tanto de significado por época que no es comparable. Mediana de 17 semanas en los 2000s contra **2 en los 2020s** |
| Semanas en el pico | **Mediana 1.** Para la mitad de las canciones el valor es exactamente 1: no distingue nada |
| Puesto de debut | Decisión del equipo. Aportaba información independiente pero se dejó afuera para no complicar el eje |

### 2. Dos preguntas encadenadas, no un solo puntaje

En vez de un número que mezcle todo:

1. **¿Entra al chart o no?** → sí o no
2. **Si entra, ¿hasta dónde llega?** → puntaje de 1 a 100

**Por qué así y no un solo número:** el 51,5% de las canciones del corpus apilado nunca entró al chart, así que en un puntaje único todas quedarían empatadas en cero. El modelo gastaría la mitad de su esfuerzo aprendiendo a reconocer ceros en vez de distinguir un puesto 60 de un puesto 5.

**Y además es lo que el usuario realmente pregunta.** "¿Tiene chance de entrar?" y "si entra, ¿cuán arriba?" son dos preguntas distintas que un músico se hace por separado. Cada una puede mostrar su propio margen de error, que es más honesto que un solo número con la incertidumbre promediada.

### 3. La escala del puntaje: invertida y estirada en la punta

El chart da el puesto del 1 al 100, donde 1 es lo mejor. Para un puntaje hace falta lo contrario, así que se invierte. Y además se **estira la punta**, porque los puestos de arriba no valen lo mismo que los de abajo:

| Puesto | Inversión simple | **Escala estirada** |
|---|---|---|
| 1 | 100 | **100** |
| 2 | 99 | **85** |
| 5 | 96 | **65** |
| 10 | 91 | **50** |
| 50 | 51 | 15 |
| 100 | 1 | 0 |

Con la escala estirada, **el top 10 se lleva la mitad del puntaje**. Con la inversión simple, llegar al puesto 10 daba 91 — casi lo mismo que llegar al 1, lo cual no distingue nada.

**Por qué la estirada refleja mejor la realidad.** Medimos cuántas canciones tuvieron su pico en cada puesto, sobre las 32.702 de la historia del chart:

| Tramo | Canciones | Por cada puesto |
|---|---|---|
| **#1** | 1.194 | **1.194** |
| #2–5 | 2.016 | 504 |
| #6–10 | 2.101 | 420 |
| #11–20 | 3.272 | 327 |
| #21–40 | 5.903 | 295 |
| #41–70 | 9.131 | 304 |
| #71–100 | 9.085 | 303 |

Del puesto 11 al 100 está planchado —unas 300 por puesto— y se dispara en el top 10. El #1 tiene cuatro veces la densidad del #2 al 5: la canción que tiene envión para llegar al 2 generalmente termina en el 1.

### 4. Normalización por época: el puesto no la necesita

**Hallazgo central:** el puesto del chart **ya viene normalizado de fábrica**, porque el Hot 100 siempre tuvo exactamente 100 lugares.

El puesto 20 de 1965 significa "la vigésima mejor de esa semana de 1965". El puesto 20 de 2025, lo mismo para su semana. **Es una posición relativa a su propia época por construcción**, no una medición absoluta como el volumen o la energía.

Así que el problema que resolvimos normalizando el sonido **no existe en el puesto**.

**Donde sí queda algo es en la pregunta 1**, porque entrar al chart no costó lo mismo siempre. Pero medido en nuestros datos, resultó chico:

| Década | Entraron | No entraron | % que entró |
|---|---|---|---|
| 1970s | 4.091 | 4.524 | 47,5% |
| 1980s | 3.491 | 4.534 | 43,5% |
| 1990s | 2.765 | 4.613 | **37,5%** |
| 2000s | 2.878 | 4.585 | 38,6% |
| 2010s | 3.596 | 4.649 | 43,6% |
| 2020s | 3.038 | 4.657 | 39,5% |

Entre 37,5% y 47,5% — diez puntos de diferencia en seis décadas.

**Decisión: dejarlo como está y medirlo después del entrenamiento.** Una vez entrenado el modelo, se le muestran canciones de distintas décadas y se mira si predice sistemáticamente más alto para unas que para otras. Si lo hace, se empareja la mezcla a 50/50 por década. Si no, no se gastó trabajo arreglando algo que no estaba roto.

---

## Lo que cambió en el chart, medido

Estos hallazgos no cambian una decisión por sí solos, pero son los que hay que declarar como límites.

### La dinámica se dio vuelta

**Canciones que entraron, duraron 2 semanas o menos y desaparecieron:**

| Década | % del total |
|---|---|
| 1960s | 13,7% |
| **1980s** | **2,1%** |
| 2010s | 36,2% |
| **2020s** | **52,7%** |

**Puesto de debut (mediana) y entradas directas al top 40:**

| Década | Debuta en | Directo al top 40 |
|---|---|---|
| 1960s | **#89** | **28** |
| 1990s | #84 | 297 |
| **2020s** | **#63** | **1.222** |

Antes entrabas por abajo y trepabas. Hoy entrás alto y caés. La causa mecánica: sale un disco y **todos sus temas chartean una semana** por el volumen de streaming del lanzamiento. En la era del single era imposible — había que fabricar y vender un disco físico por canción.

### "Popular" no mide lo mismo en las dos épocas

| | 1958–1991 | 2014– |
|---|---|---|
| **Qué se cuenta** | Personas que decidieron comprar | Veces que se reprodujo |
| **Qué le cuesta al oyente** | ~$0,98 el single de 45 rpm | Cero en el margen |
| **Cuándo se decide** | Apuesta previa: comprabas tras oírlo 2 o 3 veces | Consumo posterior: reproducís lo que ya te gusta |
| **Umbral** | Compra completa | **30 segundos**, sin crédito parcial ni bonus por escuchar más |
| **Dónde está el filtro** | La distribución: radio y disquerías | La atención: playlists y algoritmo |
| **Cómo se medía** | **Preguntándoles** a comerciantes y locutores, hasta nov. 1991 | Conteo automático |

**La asimetría de fondo:** una venta cuenta **personas** —compraste una vez, lo escuchaste 500 veces, cuenta uno—. Una reproducción cuenta **escuchas**, y una sola persona puede generar miles. Hoy una canción con 100.000 fans que la escuchan 50 veces cada uno le gana a una que le gustó una vez a 2 millones. En la era del single ganaban siempre los 2 millones.

### El formato manda sobre la duración

Duración mediana de los hits, y qué porcentaje bajaba de 2:30:

| Década | Mediana | Menos de 2:30 |
|---|---|---|
| 1950s | 2:26 | **56,4%** |
| 1970s | 3:34 | 4,6% |
| **1990s** | **4:18** | 0,5% |
| 2010s | 3:35 | 4,4% |
| **2020s** | **3:11** | **13,1%** |

Las canciones se alargaron hasta los noventa y desde entonces se acortan. Los dos extremos son restricciones del canal: en los cincuenta el disco de 7 pulgadas no aguantaba mucho más por lado; hoy el pago por reproducción premia temas cortos, porque dos de 2:30 generan el doble de reproducciones que uno de 5:00.

**Consistente con el incentivo, no probado.** Con nuestros datos no se puede demostrar la causa, solo que la tendencia coincide.

### ¿Era más difícil antes o ahora?

**Por lugares disponibles, lo más difícil fueron los noventa.** Canciones nuevas que entraron por año: ~685 en los 60s, **~342 en los 90s**, ~424 en los 2020s. Cuando las canciones duran 15 semanas, el chart se tapa.

**Por proporción de la música publicada, hoy es incomparablemente más difícil.** En 2025 se subieron **106.000 temas por día** —unos 38,7 millones al año— y entraron al Hot 100 unos 424: el **0,001%**. El catálogo total es de 253 millones, y el **88% recibió 1.000 reproducciones o menos** en el año; 120,5 millones no llegaron a diez.

**Dato que falta:** cuántos singles se publicaban por año en los sesenta. No lo encontramos en ninguna fuente confiable. Sin ese denominador la comparación queda abierta — habría que buscarlo en los reportes anuales de la RIAA o la IFPI.

---

## Límites nuevos para declarar

Tres encontrados en estos días, del mismo tipo: **la etiqueta se llama igual a lo largo de seis décadas pero no mide lo mismo.**

**1. El Hot 100 cambió cómo medía.** Hasta noviembre de 1991 Billboard armaba el ranking con encuestas a disquerías y listas de DJs, auto-reportadas. Recién ahí pasó a medición electrónica. **El 54% de nuestro eje de popularidad viene de la era de las encuestas.**

**2. El Grammy cambió quién nomina.** Hasta 2021 los nominados finales los elegían comités secretos de 15 a 20 miembros anónimos, incluidas las categorías del Campo General que son las nuestras. Se disolvieron en abril de 2021. **El 88,3% de nuestro perfil de prestigio viene del sistema viejo** — 651 nominaciones de 737.

**3. "Popular" cambió de constructo**, no solo de escala. Normalizar arregla que un puesto 20 sea comparable; no arregla que antes midiera intención de compra y ahora volumen de atención.

**Qué se puede afirmar y qué no.** El modelo puede decir *"esta canción se parece al perfil de lo que entró al chart en su época"*, que es defendible. No puede decir *"esta canción habría sido igual de popular en 1965 y en 2025"*.

---

## Pendiente

- Aplicar la escala estirada y partir el modelo en las dos preguntas. Hoy el prototipo entrena con `fue_hit` binario y pierde toda la gradación.
- Medir, después de entrenar, si el modelo predice sistemáticamente distinto por década.
- Buscar el denominador de lanzamientos por año de los sesenta (RIAA, IFPI).
- Pasar estos tres límites al readme y al diccionario.

**Fuentes de los datos externos:** [Ask Billboard — composición del Hot 100](https://www.billboard.com/pro/ask-billboard-how-does-the-hot-100-work/) · [Luminate 2025, vía Hypebot](https://www.hypebot.com/luminate-reports-music-streaming-saturation-2025-2026/) · [Music Business Worldwide — 253 millones de temas](https://www.musicbusinessworldwide.com/quarter-of-a-billion-tracks-now-sit-on-music-streaming-services-where-does-it-end/) · [Regla de los 30 segundos](https://dynamoi.com/learn/playlist-pitching/spotify-30-second-rule-explained) · [Precios de lista 1948–1988](https://www.ratherrarerecords.com/retail-price/) · [Grammy.com — proceso de votación](https://www.grammy.com/awards/voting-process/) · [The Hollywood Reporter — disolución de los comités](https://www.hollywoodreporter.com/news/general-news/grammys-recording-academy-cuts-nomination-review-committees-4176889/)
