# datasets_procesados — la ventana de la herramienta

Los mismos cuatro archivos de `datasets/`, **recortados al año 2000 en adelante**. Son los que usa la app. Mismas columnas, mismo orden; el significado de cada columna está en `../datasets/diccionario.md`.

| Archivo | Filas | Criterio |
|---|---|---|
| `corpus_v2.csv` | 9.903 | `anio` ≥ 2000 |
| `control_v2.csv` | 13.500 | `anio` ≥ 2000 |
| `billboard_canciones.csv` | 12.089 | `anio_primera_aparicion` ≥ 2000 |
| `grammy_nominaciones.csv` | 1.620 | `anio` de la ceremonia ≥ 2000 |
| `excluidas.csv` | 36 | Canciones cantadas que figuraban como instrumentales. Trae el valor del dato y el de nuestra medición |
| `excluidas_version.csv` | 25 | Canciones cuyo dato era de otra versión. Trae la duración y el volumen de la base, y los de la versión original |

El modelo de la app descarta además 124 canciones de `corpus_v2`, así que entrena con **23.279**:

- **15** con volumen menor a −25 dB (cruces rotos con otra versión).
- **36** canciones cantadas que figuraban como instrumentales. El 15/11/2026 se volvieron a medir con ReccoBeats las 98 canciones con instrumentalidad mayor a 0,5; se sacaron solo las 36 en que la medición dio menos de 0,2. Están en `excluidas.csv`.
- **25** con el dato de otra versión. El 16/11/2026 se comparó la duración de las 817 canciones más conocidas con la de su versión original, y se midió la original de las 105 sospechosas. Se sacaron solo las 25 en que el volumen medido es 5,5 dB o más alto que el de la base, o la duración que figura es imposible. Están en `excluidas_version.csv`.
- **19** repetidas (mismo título y artista).
- **29** con la misma grabación cargada con otro nombre (mismo título, mismo artista principal y exactamente la misma duración). Queda la original, la más antigua.

Esos filtros viven en `diseno/prototipos/prototipo_matias/generar_modelo.py`, no acá, para que los CSV sean el recorte puro por año.

Por qué el corte en 2000 está explicado en `../decisiones.md` (2 de noviembre de 2026).

Se regeneran filtrando cada archivo de `datasets/` por el criterio de la tabla. Verificado el 16/11/2026: el filtro da exactamente estos cuatro archivos, fila por fila.
