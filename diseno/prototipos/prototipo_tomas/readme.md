# Prototipo de Tomás Kelly

Propuesta de visualización para el proyecto Prestigio y Popularidad.

## Objetivo

Explorar la relación entre el reconocimiento de los premios musicales
y la popularidad de los artistas.

## Qué hay en esta carpeta

Una copia de la app de [`prototipo_matias`](../prototipo_matias/) con otra paleta de color.
El código, el modelo y las siete pantallas son los mismos; solo cambia cómo se ve.

**Qué cambia:**

- **Colores más vivos**: azul `#1f3ff0` para prestigio y naranja `#ff6a13` para popularidad,
  en toda la app (galaxia, mapa, títulos, botones). Para texto chico sobre blanco se usa
  un naranja más oscuro (`#c24e00`), porque el naranja puro no se lee como letra.
- **Puntajes en recuadros llenos de color**: azul con letra blanca (prestigio) y naranja
  con letra negra (popularidad), con el número grande en Anton. Se repiten en el resultado,
  el simulador y las cifras del conflicto en el desglose.

**Qué no cambia:** la portada con la galaxia, las tipografías, los bordes redondeados,
los textos y el orden de las pantallas.

## Cómo está hecho

- `colores_b.css` se carga después de `estilos.css` y es lo único nuevo: ahí está todo el cambio visual.
- `galaxia.js`: solo cambian los dos colores de los puntos.
- `estilos.css`: solo cambian los colores fijos de los destellos y sombras.
- `index.html`: suma la fuente Anton y la hoja `colores_b.css`; el enlace al racional apunta a la app publicada.

Para pasar el cambio a la app principal alcanza con copiar `colores_b.css`, sumarlo al
`index.html` y actualizar los colores de `galaxia.js`.

## Cómo probarla

Abrir `index.html` con un servidor local (por ejemplo `npx serve .`). La búsqueda de
canciones conocidas, el mapa, el desglose y el simulador funcionan sin conexión. La lectura
escrita por IA necesita el servidor de Vercel (`/api/lectura`); sin él aparece la lectura fija del modelo.
