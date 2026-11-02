# Prototipo funcional · Diogenes

Versión navegable del prototipo de baja fidelidad (las 8 pantallas), pasada a código.

**Cómo abrirlo:** doble click en `index.html`. No necesita servidor ni instalar nada. Para analizar un audio con Essentia.js hace falta internet la primera vez (baja 2,6 MB del CDN de jsDelivr); sin internet usa la medición básica del navegador.

## Qué es real y qué es provisorio

| Parte | Estado |
|---|---|
| Navegación entre pantallas, cuenta, formulario | Funciona. La cuenta se guarda en el navegador (localStorage) |
| Puntajes de prestigio y popularidad | **Reales**, entrenados con las 23.388 canciones del 2000 en adelante. Prestigio: 212 nominadas a Record/Song of the Year contra 8.870 hits nunca nominados (regresión logística). Popularidad: puntaje de chart = 0 si no entra al Hot 100, escala estirada del puesto si entra (regresión lineal). El puntaje es el percentil dentro de las 23.388 |
| Margen de error | 20 remuestreos (bootstrap), con un piso de ±4 puntos |
| Mapa | 700 canciones al azar (desde 2000) + 19 de referencia, ubicadas con el mismo modelo |
| Buscar por nombre | 785 canciones reales desde 2000 (las que lograron las dos cosas + las que llegaron al #1) |
| Subir un audio | **ReccoBeats** (paso 2) mide energía, valencia, acústica, bailabilidad, habla, volumen e instrumentalidad: tramos de 30 s en MP3 estéreo, promediados y calibrados contra Spotify (ver `analisis_reccobeats.js`). **Essentia.js** mide tempo y modo. Duración, en el navegador |
| Valores medidos | Botón en el resultado: muestra los 10 valores con su fuente y los exporta en JSON (copiar o descargar) |
| Qué suma y qué resta | Real: cuántos puntos aporta cada rasgo frente a una canción promedio |
| Simulador | Real: recalcula con el modelo en cada movimiento |
| Asistente | Respuestas armadas con reglas, pero los números siempre salen del modelo. **Pendiente: conectar un LLM** |

## Límites del modelo de prototipo

- Solo usa canciones desde 2000: la herramienta mide dónde está parada una canción hoy. Mezclar épocas hacía que el volumen sumara prestigio (las mezclas recientes son más fuertes), que era "canción nueva", no "Grammy".
- Prestigio se compara contra hits publicados, no contra el grupo de control, para que aprenda qué separa a la Academia dentro de la música publicada y no "suena a disco profesional".
- Se descartan 15 hits con volumen menor a −25 dB: cruces rotos con otra versión.
- No separa por género (el dump no lo trae).

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Las pantallas |
| `estilos.css` | Estilos (paleta del prototipo: azul = el modelo calcula, ámbar = la IA traduce) |
| `app.js` | Navegación, modelo, análisis de audio, simulador y asistente |
| `analisis_essentia.js` | Análisis de audio con Essentia.js en un Web Worker (tempo, tonalidad, volumen, bailabilidad) |
| `modelo.js` | Coeficientes y datos del mapa. **Generado**, no editar a mano |
| `generar_modelo.py` | Regenera `modelo.js` desde `datasets/`. Uso, desde la raíz del repo: `python3 diseno/prototipos/prototipo_diogenes/generar_modelo.py` (necesita numpy) |

## Essentia.js (paso 1)

| Característica | Algoritmo | Sobre qué parte del audio |
|---|---|---|
| tempo | `RhythmExtractor2013` (método degara) | 90 s del centro, a 44,1 kHz |
| modo | `KeyExtractor` (perfil bgate) | tema entero, a 11.025 Hz |
| volumen | `LoudnessEBUR128` (integrado, LUFS) | tema entero, a 11.025 Hz |
| bailabilidad | `Danceability` (DFA) | 90 s del centro, a 44,1 kHz |

- Un tema de 4 minutos tarda unos 4–5 s. Bajar a 11.025 Hz cambia el volumen en menos de 0,2 dB y no cambia la tonalidad.
- **Escalas provisorias:** el modelo se entrenó con valores de Spotify. La bailabilidad de Essentia (≈0,5–2,5) se convierte con una fórmula lineal provisoria y el volumen en LUFS se toma igual que el de Spotify. El paso 2 las reemplaza por una calibración medida.
- Licencia: Essentia.js es AGPL-3.0 (uso académico libre; uso comercial requiere licencia del MTG).
