# Las decisiones de diseño

La página la escribió una IA, pero el diseño lo decidimos nosotros. Acá está lo que le pedimos y por qué.

---

## Los colores

Le pedimos dos colores y nada más: un azul (`#1b4fd8`) y un ámbar (`#b45309`). Todo lo demás, blanco, negro y gris.

Los dos colores son los dos ejes. El azul es la popularidad y lo que te suma; el ámbar es el prestigio y lo que te resta. Son los mismos en todas las pantallas.

Pedimos que el resto fuera monocromo a propósito. Si hubiera cinco colores más, el ámbar no significaría nada.

---

## Las tipografías

Pedimos tres, cada una para una cosa:

- **Fraunces** para los títulos. Nos gustó porque es de revista, no de informe. La sacamos de Google Fonts.
- **Inter** para los textos. Es la más común para leer en pantalla y no compite con el título.
- **IBM Plex Mono** para todos los números, sin excepción.

Lo de la monoespaciada en los números fue un pedido nuestro. Nos gustó que queden alineados en columna y se comparen de un vistazo. Y es la letra de los aparatos que miden, que es lo que hace la app.

---

## El fondo y las esquinas

Primero probamos un fondo crema. Lo cambiamos a blanco: el crema hacía que pareciera un documento, y el mapa tiene cientos de puntos que se leen mejor sobre blanco.

Pedimos esquinas redondeadas de 12 píxeles en las tarjetas, y los botones en forma de píldora. Todo recto quedaba muy duro para una app de música.

---

## El mapa grande

Le pedimos que en la pantalla de resultado el mapa ocupe casi todo y los números queden al costado.

Lo discutimos, porque lo lógico sería poner los números arriba. Pero dos porcentajes sueltos no dicen nada: "83 de prestigio" recién significa algo cuando ves que estás al lado de *Hello* y lejos de *Despacito*.

---

## Los rasgos en vertical

Esta pantalla primero era una tabla, una fila por rasgo. Le pedimos que la diera vuelta.

Ahora son columnas verticales: el nombre arriba, una barra que sube o baja desde el centro, y abajo cuánto suma o resta. Lo pedimos así porque **se parece a una consola de mezcla**, que es el aparato que un músico ya conoce. Y porque en vertical comparás las diez de un golpe.

---

## El margen de error a la vista

Pedimos que los dos puntajes muestren siempre su margen, no un número solo.

El prestigio se entrena con 213 canciones, que son pocas. Mostrar "83" solo sería fingir una precisión que no tenemos. "83, entre 78 y 87" dice la verdad.

---

## La pantalla del conflicto

Esta no estaba planeada. La pedimos cuando vimos que la acústica suma prestigio y resta popularidad.

Si la app diera dos números nada más, el usuario podría pensar que tiene que subir los dos. Esta pantalla le dice que tiene que elegir.

---

## El simulador tenía que calcular de verdad

Le pedimos que cuando movés un control, los puntajes se recalculen con el mismo modelo, no con una animación inventada.

Si la app dice "bajá la energía y subís 5 puntos", esos 5 puntos tienen que salir del modelo. Y en el mapa queda marcado dónde estabas antes: esa diagonal explica el conflicto mejor que cualquier texto.

---

## Sacamos el chatbot

Había un asistente al costado del resultado. Lo sacamos.

No era una IA de verdad: era una lista de preguntas previstas con sus respuestas escritas. Si le preguntabas con otras palabras, no entendía. Un cuadro de chat promete que del otro lado hay alguien que entiende, y el nuestro no cumplía esa promesa.

Decidimos que o es una IA de verdad que sabe de música, o no va. Por ahora no va.

---

## Lo que dejamos afuera a propósito

- **Modo oscuro.** El mapa tiene cientos de puntos de cuatro colores y en oscuro se mezclan.
- **Degradés y sombras de color.** La app muestra mediciones; un adorno que sugiera algo que el dato no dice es un problema, no una mejora.
- **Íconos decorativos.** Están solo los dos que dicen algo rápido: la flecha de subir y el candado de privacidad.
