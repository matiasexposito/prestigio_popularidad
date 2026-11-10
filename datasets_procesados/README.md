# datasets_procesados — la ventana de la herramienta

Los mismos cuatro archivos de `datasets/`, **recortados al año 2000 en adelante**. Son los que usa la app. Mismas columnas, mismo orden; el significado de cada columna está en `../datasets/diccionario.md`.

| Archivo | Filas | Criterio |
|---|---|---|
| `corpus_v2.csv` | 9.903 | `anio` ≥ 2000 |
| `control_v2.csv` | 13.500 | `anio` ≥ 2000 |
| `billboard_canciones.csv` | 12.089 | `anio_primera_aparicion` ≥ 2000 |
| `grammy_nominaciones.csv` | 1.620 | `anio` de la ceremonia ≥ 2000 |

El modelo de la app descarta además 15 canciones de `corpus_v2` con volumen menor a −25 dB (cruces rotos con otra versión), así que entrena con **23.388** canciones. Ese filtro vive en `diseno/prototipos/prototipo_matias/generar_modelo.py`, no acá, para que estos archivos sean el recorte puro.

Por qué el corte en 2000 está explicado en `../decisiones.md` (2 de noviembre de 2026).

Se regeneran desde `datasets/` con el script de `../codigo/` o, a mano, filtrando por año.
