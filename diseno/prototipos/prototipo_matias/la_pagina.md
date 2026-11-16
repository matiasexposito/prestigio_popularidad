# Qué hace cada pantalla

Guía corta de la aplicación, para alguien que la abre por primera vez.

**Qué es.** Una herramienta web donde subís una canción y te dice a cuál de dos mundos se parece: el que premia la Academia del Grammy y el que triunfa en el ranking de Billboard. No predice si vas a ganar un premio ni si vas a ser un éxito. Te dice dónde estás parado.

**Cómo abrirla.** Doble clic en `index.html`. No necesita servidor ni instalar nada.

---

## El recorrido, pantalla por pantalla

### 1 · Ingresar

El logo, un botón y, alrededor, una galaxia de canciones que gira despacio.

Cada punto es una canción real de la base: **azul si fue nominada al Grammy, ámbar si entró al Hot 100**, gris si no logró ninguna de las dos. Si pasás el mouse por un punto, te dice qué canción es. Con el botón "Activar sonido" suena una melodía lenta: una nota por vez, a ritmo parejo, y cada nota enciende una canción.

Esos dos colores son el código de toda la app: **azul es prestigio, ámbar es popularidad.** Aparecen acá para que el ojo ya los reconozca cuando los vuelva a ver.

### 2 · Los dos mundos

Antes de pedirte nada, te mostramos qué vamos a medir.

Dos tarjetas enfrentadas: lo que premia la Academia —más largo, menos enérgico, más acústico— y lo que escucha el público —más enérgico, más fuerte, más corto—. Cada una con tres canciones de ejemplo que vas a reconocer.

Abajo, el dato que explica por qué el proyecto existe: **de 23.279 canciones desde el año 2000, solo 609 lograron las dos cosas.** Un 3%.

### 3 · Crear cuenta

Dos campos: cómo querés que te llamemos y tu email. Sirve para guardar tus análisis. Alrededor del formulario siguen girando las canciones de la portada, para que la pantalla no quede en blanco.

No te pedimos el género ni a qué te dedicás, y está dicho en la pantalla: el análisis mide solo cómo suena la canción, así que esos datos no cambiarían el resultado.

### 4 · Subir la canción

Arrastrás un archivo o elegís una canción que ya analizamos.

Puede ser un demo sin publicar. **Tu archivo no sale de tu computadora**: se analiza en el navegador y se descarta.

Si en vez de subir algo preferís probar con una canción conocida, el buscador tiene las que ya analizamos. Son todas **del 2000 en adelante**, que es la ventana con la que trabaja la herramienta.

Toda la pantalla se ve de una vez, sin bajar. A la derecha, el recuadro para arrastrar el archivo, que es lo más grande, y el buscador. A la izquierda, el proceso en tres pasos, para que sepas qué va a pasar: medimos 10 rasgos del sonido con ReccoBeats y Essentia, calculamos los dos puntajes con su margen, y te mostramos qué suma y qué resta en cada uno.

### 5 · Resultado

La pantalla principal.

**Los dos puntajes**, cada uno con su margen de error. El margen no es un detalle: con 202 canciones premiadas, el puntaje de prestigio es una estimación y la app lo dice.

**El mapa**, que ocupa la mayor parte de la pantalla. Muestra tu canción entre **100 canciones reales**: 30 nominadas o ganadoras del Grammy (en azul), 40 hits que nunca fueron nominados (en ámbar) y 30 que no entraron al ranking (en gris). Cada una está ubicada según sus dos puntajes. Tu canción es el punto negro. Abajo hay una leyenda con los colores, y cualquier punto se puede tocar para escuchar esa canción.

**Qué significa cada número.** Al lado de cada puntaje hay una palabra y una frase: "Muy parecida al sonido de las nominadas al Grammy. Le gana a 88 de cada 100 canciones." Nada más. El detalle de cómo se calcula está en el racional.

**El margen.** Cada puntaje dice entre qué valores puede estar. Si la canción la subiste como archivo, el margen es más ancho, porque medir un audio es menos preciso que usar una canción de la base, y la pantalla lo avisa.

**La lectura**, en un recuadro con los dos colores: una o dos oraciones, escritas por una IA, que dicen a qué perfil se parece más tu canción. Debajo, tres etiquetas con los rasgos que más pesan, cada una con el color de su puntaje.

### 6 · Qué suma y qué resta

Diez columnas, una por cada rasgo del sonido, como los controles de una consola de mezcla.

En cada columna: el nombre del rasgo arriba con su valor, una barra vertical en el medio, y abajo cuántos puntos aporta. **La barra sube llena si ese rasgo te suma, y baja rayada si te resta.** El color es el del puntaje que estás mirando: azul para el prestigio, ámbar para la popularidad.

Al costado, **el conflicto**: el rasgo que te suma en un puntaje y te resta en el otro. Solo se marca si mueve 5 puntos o más en los dos; pasa en la mitad de las canciones, más o menos. Si no hay, la pantalla nombra el rasgo que más pesa.

### 7 · Simular cambios

Movés los controles y los dos puntajes se recalculan en vivo con el mismo modelo.

Es la pantalla donde se entiende el proyecto: **no hay una sola dirección que mejore los dos puntajes.** Subir la acústica te acerca al premio y te saca del chart.

---

## Tres cosas que la app nunca hace

**No predice.** Dice cuánto se parece tu canción a cada perfil. Un Grammy depende además del sello, la campaña y el momento, y un hit también.

**No inventa lo que no mide.** No mira la letra, ni quién sos, ni cuántos seguidores tenés. Solo cómo suena.

**No conversa.** No hay un chat. Todo lo que la app dice sale de un número que calculó, y está escrito al lado de ese número.
