# Qué hace cada pantalla

Guía corta de la aplicación, para alguien que la abre por primera vez.

**Qué es.** Una herramienta web donde subís una canción y te dice a cuál de dos mundos se parece: el que premia la Academia del Grammy y el que triunfa en el ranking de Billboard. No predice si vas a ganar un premio ni si vas a ser un éxito. Te dice dónde estás parado.

**Cómo abrirla.** Doble clic en `index.html`. No necesita servidor ni instalar nada.

---

## El recorrido, pantalla por pantalla

### 1 · Ingresar

El logo, dos líneas de color y un botón. Nada más.

Las dos líneas —una azul y una ámbar— son el código de color de toda la app: **azul es el eje de la popularidad y lo que te suma, ámbar es el eje del prestigio y lo que te resta.** Aparecen acá para que el ojo ya las reconozca cuando las vuelva a ver.

### 2 · Los dos mundos

Antes de pedirte nada, te mostramos qué vamos a medir.

Dos tarjetas enfrentadas: lo que premia la Academia —más largo, menos enérgico, más acústico— y lo que escucha el público —más enérgico, más fuerte, más corto—. Cada una con tres canciones de ejemplo que vas a reconocer.

Abajo, el dato que explica por qué el proyecto existe: **de 23.388 canciones desde el año 2000, solo 627 lograron las dos cosas.** Un 3%.

### 3 · Crear cuenta

Dos campos: cómo querés que te llamemos y tu email. Sirve para guardar tus análisis.

No te pedimos el género ni a qué te dedicás, y está dicho en la pantalla: el análisis mide solo cómo suena la canción, así que esos datos no cambiarían el resultado.

### 4 · Subir la canción

Arrastrás un archivo o elegís una canción que ya analizamos.

Puede ser un demo sin publicar. **Tu archivo no sale de tu computadora**: se analiza en el navegador y se descarta.

Si en vez de subir algo preferís probar con una canción conocida, el buscador tiene las que ya analizamos. Son todas **del 2000 en adelante**, que es la ventana con la que trabaja la herramienta.

El archivo es lo único importante de esta pantalla, así que está en el centro y grande. Debajo, el proceso en tres pasos, para que sepas qué va a pasar: ReccoBeats y Essentia miden 10 rasgos del sonido, el modelo calcula los dos puntajes con su margen, y te mostramos qué suma y qué resta en cada eje.

### 5 · Resultado

La pantalla principal.

**Los dos puntajes**, cada uno con su margen de error. El margen no es un detalle: con 213 canciones premiadas, el puntaje de prestigio es una estimación y la app lo dice.

**El mapa**, que ocupa la mayor parte de la pantalla. Cada punto es una canción, ubicada según sus dos puntajes. Abajo del mapa hay una leyenda que dice qué significa cada marca: tu canción, ganó un Grammy, nominada, nunca nominada, y las canciones de la base. Tu canción aparece marcada entre canciones conocidas, así ves de un vistazo en qué compañía caíste.

**Cómo se calcula cada cosa.** Debajo de cada puntaje hay un "¿Cómo se calcula?" que se despliega ahí mismo: contra qué canciones se compara, qué quiere decir ese número para tu canción y de dónde sale el margen. Debajo del mapa, "¿Cómo está hecho este mapa?" explica los ejes, los puntos y las zonas.

**La lectura**, en el recuadro ámbar, que pasa los dos números a una frase: en qué zona del mapa caíste y qué rasgo te está tensionando los dos ejes.

### 6 · Qué suma y qué resta

Diez columnas, una por cada rasgo del sonido, como los controles de una consola de mezcla.

En cada columna: el nombre del rasgo arriba con su valor, una barra vertical en el medio, y abajo cuántos puntos aporta. **La barra sube en azul si ese rasgo te suma, y baja en ámbar si te resta.**

Al costado, **tu conflicto**: el rasgo que te empuja hacia un mundo y te aleja del otro. Casi siempre hay uno.

### 7 · Simular cambios

Movés los controles y los dos puntajes se recalculan en vivo con el mismo modelo.

Es la pantalla donde se entiende el proyecto: **no hay una sola dirección que mejore los dos puntajes.** Subir la acústica te acerca al premio y te saca del chart.

---

## Tres cosas que la app nunca hace

**No predice.** Dice cuánto se parece tu canción a cada perfil. Un Grammy depende además del sello, la campaña y el momento, y un hit también.

**No inventa lo que no mide.** No mira la letra, ni quién sos, ni cuántos seguidores tenés. Solo cómo suena.

**No conversa.** No hay un chat. Todo lo que la app dice sale de un número que calculó, y está escrito al lado de ese número.
