# Prototipo funcional · Diogenes

Versión navegable del prototipo de baja fidelidad (las 8 pantallas), pasada a código.

**Cómo abrirlo:** doble click en `index.html`. No necesita servidor ni instalar nada.

## Qué es real y qué es provisorio

| Parte | Estado |
|---|---|
| Navegación entre pantallas, cuenta, formulario | Funciona. La cuenta se guarda en el navegador (localStorage) |
| Puntajes de prestigio y popularidad | **Reales**: dos regresiones logísticas entrenadas con `corpus_v2` + `control_v2`. El puntaje es el percentil dentro de las 53.577 canciones |
| Margen de error | 20 remuestreos (bootstrap), con un piso de ±4 puntos |
| Mapa | 700 canciones al azar del corpus + 17 de referencia, ubicadas con el mismo modelo |
| Buscar por nombre | 1.825 canciones reales (las que lograron las dos cosas + las que llegaron al #1) |
| Subir un audio | Se mide en el navegador: duración, volumen y tempo; energía, acústica y bailabilidad son estimaciones. Valencia, habla, modo e instrumentalidad quedan en el promedio del corpus. **Pendiente: librosa** |
| Qué suma y qué resta | Real: cuántos puntos aporta cada rasgo frente a una canción promedio |
| Simulador | Real: recalcula con el modelo en cada movimiento |
| Asistente | Respuestas armadas con reglas, pero los números siempre salen del modelo. **Pendiente: conectar un LLM** |

## Límites del modelo de prototipo

- No normaliza por época ni separa por género.
- Prestigio se entrena solo dentro de `corpus_v2` (nominadas vs. hits), para que aprenda qué separa a la Academia dentro de la música publicada.
- El tempo casi no pesa en ninguno de los dos ejes.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Las pantallas |
| `estilos.css` | Estilos (paleta del prototipo: azul = el modelo calcula, ámbar = la IA traduce) |
| `app.js` | Navegación, modelo, análisis de audio, simulador y asistente |
| `modelo.js` | Coeficientes y datos del mapa. **Generado**, no editar a mano |
| `generar_modelo.py` | Regenera `modelo.js` desde `datasets/`. Uso, desde la raíz del repo: `python3 diseno/prototipos/prototipo_diogenes/generar_modelo.py` (necesita numpy) |
