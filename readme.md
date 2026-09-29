# P&P — readme del repositorio

Herramienta web que analiza una canción y la ubica entre dos perfiles de sonido medibles: **el que la Academia del Grammy premia** y **el que el público consume masivamente**.

Devuelve dos puntajes con su margen de error, ubica la canción en un mapa de esos dos ejes rodeada de canciones conocidas, y explica qué la acerca y qué la aleja de cada uno. No predice si una canción va a ganar un premio ni si va a ser un éxito: muestra dónde está parada y qué implica cada camino.

La idea de fondo es que **esos dos mundos casi nunca coinciden**. De las 26.577 canciones que analizamos, solo 1.071 lograron las dos cosas — un 4%.

## Integrantes

- Matías Expósito
- Tomás Kelly
- Diógenes Ustariz

Universidad de San Andrés · 2026

## Sitio

**Prototipo baja fidelidad:**

https://claude.ai/artifact/DoFVcgcU83Aha2U5JrXdjv

## Hipótesis

**La original:**

> Existe un tipo de perfil sonoro medible asociado al reconocimiento de la Academia, distinto del perfil asociado al éxito comercial masivo, y la distancia entre ambos se amplió a lo largo de las últimas décadas.

## Fuentes de datos

package.json es la lista de librerías que los scripts necesitan para funcionar, y está en el repo para que quien lo clone pueda escribir npm install y correr armar_control.js y auditar_datasets.js sin tener que adivinar qué le falta.

Archivo	Qué es
package.json	La lista de librerías que hacen falta
package-lock.json	Las versiones exactas de esas librerías, para que a todos les instale igual

### 1. Billboard Hot 100

Ranking semanal de las 100 canciones más escuchadas en Estados Unidos, sin interrupción desde agosto de 1958.

| | |
|---|---|
| **Origen** | github.com/utdatasets/rwd-billboard-data |
| **Archivo** | `data-out/hot-100-current.csv` |
| **Descargado** | 18 de agosto de 2026 |
| **Licencia** | MIT License |
| **Atribución** | Christian McDonald · School of Journalism and Media, University of Texas at Austin |
| **Volumen** | 355.001 filas semanales → **32.702 canciones únicas** |

Aporta el **eje de la popularidad**: mejor puesto alcanzado, semanas en el ranking y año de primera aparición.

### 2. Premios Grammy

Nominaciones y ganadoras entre 1959 y 2026, en 14 categorías.

| | |
|---|---|
| **Origen** | Wikipedia, una página por categoría |
| **Método** | Extraído con `codigo/fetch_grammy.js` vía la API pública de Wikipedia |
| **Descargado** | 18 de agosto de 2026 |
| **Licencia** | CC BY-SA 4.0 |
| **Atribución** | Wikipedia — Los colaboradores de Wikipedia |
| **Volumen** | **2.513 nominaciones**, de las cuales 488 ganaron |

Aporta el **eje del prestigio**. Lo armamos nosotros porque ningún dataset público tenía los nominados de las décadas viejas.

### 3. Características del sonido

Valores numéricos que describen cómo suena cada canción.

| | |
|---|---|
| **Origen** | huggingface.co/datasets/GildasLeDrogoff/spotify-huge-track-analysis-dataset |
| **Descargado** | 18 de agosto de 2026 |
| **Licencia** | **CC BY-NC 4.0** — atribución, **uso no comercial** |
| **Atribución** | Gildas Le Drogoff · datos originales calculados por Spotify |
| **Volumen** | 56.277.664 canciones · 4,1 GB |

⚠️ **La licencia es no comercial.** Sirve para este trabajo académico, pero si el proyecto se quisiera monetizar habría que reemplazar esta fuente.

**Quién analizó las canciones.** No fuimos nosotros: fue **Spotify**. Su sistema procesó su catálogo y calculó estos valores automáticamente para sus propias recomendaciones; los publicaba por su API hasta que **cerró el acceso en noviembre de 2024**. Alguien los había cosechado antes en este dataset, que es la única vía que queda.

**No está en el repositorio: pesa 4,1 GB.**

## Archivos de datos

Los cuatro CSV que están en el repositorio, en `datasets/`:

| Archivo | Filas | Qué es |
|---|---|---|
| `corpus_v2.csv` | 26.577 | **El principal.** Canciones con sus características y sus etiquetas |
| `control_v2.csv` | 27.000 | Canciones comunes: ni premiadas ni exitosas |
| `billboard_canciones.csv` | 32.702 | Billboard procesado, una fila por canción |
| `grammy_nominaciones.csv` | 2.513 | Las nominaciones al Grammy |

Los dos primeros tienen **las mismas 21 columnas en el mismo orden**, así que se apilan: **53.577 canciones** para entrenar.

El significado de cada columna, con sus rangos medidos y sus límites conocidos, está en [`datasets/diccionario.md`](datasets/diccionario.md).

## Composición del corpus

| Grupo | Canciones | Qué son |
|---|---|---|
| `hit` | 24.913 | Entraron al ranking, nunca fueron nominadas |
| `ambas` | 1.071 | **Premio y éxito a la vez** |
| `premiada` | 593 | Nominadas al Grammy, nunca entraron al ranking |
| `control` | 27.000 | Ni una cosa ni la otra |

## Límites declarados

- **Solo mide el sonido.** No la letra, ni el sello, ni la campaña, ni quién es el artista.
- **Mide el mercado estadounidense.** Billboard y el Grammy son instituciones de Estados Unidos.
- **En el grupo de control, el año 1970 hay que leerlo como "1970 o antes".** El dump de Spotify trae el año de la reedición, no el de la grabación original, así que 2.058 de las 4.500 canciones de esa década quedaron amontonadas en 1970 y varias son más viejas. Las otras cinco décadas no tienen este problema.

## Estructura del repositorio

```
prestigio_popularidad/
├── readme.md               # Este archivo
├── decisiones.md           # Registro fechado de lo que probamos, descartamos y por qué
├── .gitignore
├── package.json            # Librerías que necesitan los scripts (npm install)
├── datasets/               # Los CSV del proyecto + diccionario.md
├── datasets_procesados/    # Recortes o filtrados que se deriven de datasets/
├── diseno/
│   ├── referencias/        # Imágenes de referencia
│   └── prototipos/         # Una carpeta por versión o por integrante
│       ├── prototipo_v1/
│       ├── prototipo_diogenes/
│       ├── prototipo_matias/
│       └── prototipo_tomas/
├── prompts/                # Prompts usados con el LLM, versionados
├── codigo/                 # Scripts de descarga, cruce y auditoría
├── normalizacion/          # Normalización por época de las características
├── versiones/              # Versiones anteriores de los datasets y del modelo
├── entregas/
│   ├── entrega_1/          # Capturas + link al sitio en ese momento
│   └── entrega_2/
└── app/                    # Solo los archivos del sitio (lo que se publica)
```
