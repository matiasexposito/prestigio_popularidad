# Las decisiones de diseño

La página la escribió una IA, pero el diseño lo decidimos nosotros. Acá está lo que le pedimos y por qué.

---

## Los colores

Le pedimos dos colores y nada más: un azul (`#1b4fd8`) y un ámbar (`#b45309`). Todo lo demás, blanco, negro y gris.

Los dos colores son los dos ejes. El azul es el prestigio; el ámbar es la popularidad. Son los mismos en todas las pantallas: en la portada, en los dos puntajes y en el mapa. Al principio se usaban poco y la app se veía casi toda en blanco y negro, así que le pedimos que los hiciera aparecer más, siempre con el mismo significado.

Pedimos que el resto fuera monocromo a propósito. Si hubiera cinco colores más, el ámbar no significaría nada.

También le pedimos que cada color quiera decir una sola cosa. En una versión anterior el azul era a la vez "tu canción", "lo que suma" y "las nominadas", y el ámbar era "lo que resta" y "la lectura de la IA". Lo ordenamos: en el desglose las barras llevan el color del puntaje que se mira (llena si suma, rayada si resta), y todo lo que no es de un eje va en negro.

---

## Las tipografías

Pedimos tres, cada una para una cosa:

- **Fraunces** para los títulos. Nos gustó porque es de revista, no de informe. La sacamos de Google Fonts.
- **Inter** para los textos. Es la más común para leer en pantalla y no compite con el título.
- **IBM Plex Mono** para todos los números, sin excepción.

Lo de la monoespaciada en los números fue un pedido nuestro. Nos gustó que queden alineados en columna y se comparen de un vistazo. Y es la letra de los aparatos que miden, que es lo que hace la app.

---

## El fondo y las esquinas

Primero probamos un fondo crema. Lo cambiamos a blanco: el crema hacía que pareciera un documento, y los puntos del mapa se leen mejor sobre blanco.

Pedimos esquinas redondeadas de 12 píxeles en las tarjetas, y los botones en forma de píldora. Todo recto quedaba muy duro para una app de música.

---

## El mapa grande

Le pedimos que en la pantalla de resultado el mapa ocupe casi todo y los números queden al costado.

Lo discutimos, porque lo lógico sería poner los números arriba. Pero dos porcentajes sueltos no dicen nada: "88 de prestigio" recién significa algo cuando ves que estás al lado de *Hello* y lejos de *Blinding Lights*.

Al principio el mapa tenía 700 puntos grises elegidos al azar. Parecía una mancha y no se entendía que cada punto era una canción. Pedimos que mostrara menos canciones y que fueran reales y reconocibles: quedaron 100, cada una con el color de su grupo, y cualquiera se puede tocar para escucharla.

---

## Los rasgos en vertical

Esta pantalla primero era una tabla, una fila por rasgo. Le pedimos que la diera vuelta.

Ahora son columnas verticales: el nombre arriba, una barra que sube o baja desde el centro, y abajo cuánto suma o resta. Lo pedimos así porque **se parece a una consola de mezcla**, que es el aparato que un músico ya conoce. Y porque en vertical comparás las diez de un golpe.

---

## El margen de error a la vista

Pedimos que los dos puntajes muestren siempre su margen, no un número solo.

El prestigio se entrena con unas doscientas canciones, que son pocas. Mostrar "88" solo sería fingir una precisión que no tenemos. "88, margen: 84 a 92" dice la verdad.

Después pedimos algo más: cuando la canción se sube como archivo, el margen tiene que ser más ancho. Lo pedimos al ver que la misma canción, subida desde dos archivos distintos, daba dos resultados distintos, y la pantalla mostraba un margen chico como si el número fuera firme.

---

## La pantalla del conflicto

Esta no estaba planeada. La pedimos cuando vimos que la acústica suma prestigio y resta popularidad.

Si la app diera dos números nada más, el usuario podría pensar que tiene que subir los dos. Esta pantalla le dice que tiene que elegir.

Le pusimos una condición: solo se habla de conflicto si el rasgo mueve 5 puntos o más en los dos puntajes. Antes la pantalla anunciaba "tu conflicto" con un rasgo que restaba 2 puntos de un lado, y eso no es un conflicto.

---

## El simulador tenía que calcular de verdad

Le pedimos que cuando movés un control, los puntajes se recalculen con el mismo modelo, no con una animación inventada.

Si la app dice "bajá la energía y subís 5 puntos", esos 5 puntos tienen que salir del modelo. Y en el mapa queda marcado dónde estabas antes: esa diagonal explica el conflicto mejor que cualquier texto.

---

## Sacamos el chatbot

Había un asistente al costado del resultado. Lo sacamos.

No era una IA de verdad: era una lista de preguntas previstas con sus respuestas escritas. Si le preguntabas con otras palabras, no entendía. Un cuadro de chat promete que del otro lado hay alguien que entiende, y el nuestro no cumplía esa promesa.

Decidimos que o es una IA de verdad, o no va.

---

## La lectura: una oración y tres etiquetas

En lugar del chatbot pusimos una IA que hace una sola cosa: poner en palabras los números de la canción. No conversa y no sabe qué canción es.

Primero escribía tres párrafos. Era mucho texto al lado del mapa y repetía números que ya estaban en la pantalla. Le pedimos que lo resumiera, y quedó en una o dos oraciones. Debajo van tres etiquetas con los rasgos que más pesan. Esas etiquetas las calcula el modelo, no la IA: lo que es número no pasa por la IA.

---

## Cada número, con su explicación al lado

Los docentes nos pidieron que se entienda qué quiere decir cada número. Primero pusimos un "¿Cómo se calcula?" que se desplegaba con tres párrafos. Era demasiado: no le podemos explicar todo el proyecto a alguien que solo quiere entender su resultado.

Ahora cada puntaje tiene una palabra y una frase: "Muy parecida al sonido de las nominadas al Grammy. Le gana a 88 de cada 100 canciones." El detalle quedó en el racional.

---

## Todo en una pantalla

Pedimos que ninguna pantalla obligue a bajar para ver lo que falta. La de subir la canción era una columna larga: el título se cortaba arriba y los tres pasos quedaban abajo. La pasamos a dos columnas. En el resultado sacamos texto hasta que entró entero.

---

## La portada

La portada tenía puntos sueltos de colores como adorno. Pedimos que fueran canciones de verdad: ahora son 240 canciones de la base que giran despacio, azules las nominadas y ámbar los hits. Si pasás el mouse por una, dice cuál es.

También pedimos que sonaran. La primera versión tocaba una nota al azar por cada canción y se pisaban. Pedimos que sonara armónico: quedó una melodía lenta, una nota por vez.

---

## Sin texto en mayúsculas

Los rótulos chicos ("PASO 1 DE 3", "LECTURA") estaban todos en mayúsculas. Los pasamos a minúsculas: no hay ningún motivo para gritar.

---

## Lo que dejamos afuera a propósito

- **Modo oscuro.** En oscuro los puntos del mapa se mezclan.
- **Degradés sobre los datos.** Ningún número ni ningún punto del mapa lleva degradé: la app muestra mediciones, y un adorno que sugiera algo que el dato no dice es un problema. Los únicos degradés son fondos muy suaves que van del azul al ámbar.
- **Íconos decorativos.** Están solo los dos que dicen algo rápido: la flecha de subir y el candado de privacidad.
