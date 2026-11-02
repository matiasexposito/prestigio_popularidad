# Por qué la diseñé así

Las decisiones de diseño de la app, explicadas una por una.

---

## Dos colores, y nada más

Toda la interfaz es blanca, negra y gris. Los únicos dos colores vivos son un azul y un ámbar, y cada uno significa una sola cosa:

**Azul: el modelo calcula. Ámbar: la inteligencia artificial traduce.**

No los elegí por estética. Era el requisito de la entrega —mostrar dónde interviene la IA en el proceso— y me pareció que la forma más honesta de cumplirlo no era escribirlo, sino hacerlo visible. Si en una pantalla hay algo ámbar, ahí habló la IA. Si es azul, salió de una cuenta.

Por eso el resto es monocromo. Si hubiera cinco colores más, el ámbar dejaría de significar algo.

En la primera pantalla aparecen las dos líneas de color debajo del logo, sin explicación. Es para que el ojo las registre antes de necesitarlas.

---

## Tres tipografías, cada una con un trabajo

**Fraunces** para los títulos. Es una serif con carácter, de revista, no de documento. Quería que la app no se leyera como un panel de control sino como algo con una voz. La uso también en la versión itálica fina para los subtítulos, que es lo que le da el aire editorial.

**Inter** para el texto. Neutra, pensada para pantalla. No compite con el título.

**IBM Plex Mono para todos los números**, sin excepción: los puntajes, los valores de cada rasgo, los márgenes de error, los aportes. Esta es la que más me gusta de las tres decisiones.

Que los números estén en monoespaciada hace dos cosas. Una práctica: las cifras quedan alineadas en columna y se comparan de un vistazo. Y una de tono: la monoespaciada es la letra de los instrumentos de medición, y este proyecto mide. Separa visualmente **lo que se midió** de **lo que se dice sobre lo medido**.

---

## Fondo blanco, no crema

Al principio el fondo era un crema tibio. Lo cambié a blanco puro con la tinta casi negra.

El crema suaviza todo y hace que la app parezca un documento. El blanco con mucho contraste se parece más a tinta sobre papel, que es el registro de revista que buscaba. Y los puntos del mapa —que son cientos— se leen mejor sobre blanco que sobre cualquier tono.

Esquinas redondeadas de 12 píxeles en las tarjetas y forma de píldora en los botones. Lo recto se sentía demasiado severo para una herramienta sobre música.

---

## El mapa es el protagonista

En la pantalla de resultado, el mapa ocupa la mayor parte y los dos puntajes quedan al costado.

Me costó decidirlo, porque lo intuitivo es poner los números arriba de todo: son la respuesta a lo que el usuario preguntó. Pero dos porcentajes sueltos no dicen nada. **"83 de prestigio" no significa nada hasta que ves que estás al lado de Hello y lejos de Macarena.**

El mapa convierte dos números abstractos en una posición. Y además muestra el hallazgo del proyecto sin que haya que explicarlo: se ve que el cuadrante de arriba a la derecha está casi vacío.

---

## Los rasgos en vertical, como una consola

El desglose empezó siendo una tabla: una fila por rasgo, con el nombre a la izquierda y una barra horizontal.

Lo di vuelta. Ahora son diez columnas verticales, una al lado de la otra, cada una con el nombre arriba, una barra que sube o baja desde el centro, y el aporte abajo.

Lo cambié por dos razones. La primera es que **se lee mejor**: en vertical comparás las diez de un golpe, ves cuál está arriba y cuál abajo sin leer ningún número. En una tabla hay que recorrerla renglón por renglón.

La segunda es que **se parece a una mesa de mezcla**, que es el instrumento que un músico conoce. La app habla de música; que una de sus pantallas se vea como el equipo con el que se hace música no es un capricho, es hablarle en su idioma. Y lo conseguí sin cambiar un solo color: es puramente de disposición.

---

## El margen de error siempre a la vista

Los dos puntajes muestran su margen, no un número solo.

Es la decisión menos vistosa y la que más me importa. **El prestigio se entrena con 213 canciones**, que son pocas. Si mostrara solo "83" estaría fingiendo una precisión que no tengo. Mostrar "83, entre 78 y 87" dice la verdad: es una estimación.

Y hay algo más: el margen del prestigio es más ancho que el de la popularidad, y eso también se ve. El usuario puede notar que de un eje sabemos más que del otro.

---

## La pantalla del conflicto

Hay una pantalla dedicada a mostrar qué rasgo te empuja hacia un mundo y te aleja del otro.

No estaba en el plan original. La agregué cuando me di cuenta de que **la acústica suma prestigio y resta popularidad**, y que eso no era un detalle sino el hallazgo central: no existe una dirección que mejore los dos puntajes a la vez.

Si la app solo diera dos números, el usuario podría salir pensando que tiene que subir los dos. La pantalla del conflicto le dice que tiene que elegir.

---

## El simulador recalcula de verdad

Movés un control y los dos puntajes cambian en vivo, usando el mismo modelo que calculó el resultado.

Podría haber sido una animación simulada y nadie se habría dado cuenta. Pero entonces el consejo sería falso. Si la app dice "bajá la energía y tu prestigio sube 5 puntos", esos 5 puntos tienen que salir del modelo.

En el simulador el mapa también está, y el punto se mueve mientras arrastrás. Esa diagonal —subís en un eje y bajás en el otro— explica el conflicto mejor que cualquier texto.

---

## Lo que el asistente muestra de sí mismo

Al costado del chat hay una columna fija con dos listas: **qué sabe** y **qué no hace**.

La puse porque un chat invita a preguntar cualquier cosa, y este asistente solo puede hablar del análisis. En vez de dejar que el usuario descubra el límite chocándose, se lo muestro de entrada.

Y es coherente con el resto: el asistente está en ámbar porque traduce, no calcula. Los números que menciona salieron todos del modelo.

---

## Lo que dejé afuera a propósito

**No hay modo oscuro.** El mapa tiene cientos de puntos de cuatro colores y en oscuro se vuelven difíciles de distinguir. Preferí que el gráfico principal se lea bien.

**No hay degradés ni sombras de colores.** La app presenta mediciones; cualquier adorno que sugiera algo que el dato no dice me parecía un problema, no una mejora.

**No hay íconos decorativos.** Los pocos que hay —la flecha de subir archivo, el candado de privacidad— están porque dicen algo que la palabra sola no diría tan rápido.
