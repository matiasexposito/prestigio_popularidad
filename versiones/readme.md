# Versiones

Los cambios de los datasets y del modelo quedan en el historial de git, con su motivo en [`decisiones.md`](../decisiones.md). Los más importantes:

| Fecha | Qué cambió |
|---|---|
| 26/09/2026 | Archivo de nominaciones corregido (20 artistas recuperados, una fila fantasma eliminada) |
| 02/11/2026 | La herramienta pasa a entrenar solo desde el año 2000 |
| 03/11/2026 | El eje de popularidad pasa a dos preguntas encadenadas |
| 10/11/2026 | `datasets_procesados/` pasa a tener solo el recorte desde 2000 |
| 15/11/2026 | Limpieza de datos: el modelo pasa de 23.403 a 23.333 canciones (15 con volumen imposible, 36 cantadas que figuraban como instrumentales, 19 repetidas) |
| 15/11/2026 | La lectura de la IA pasa de Llama 3.3 70B a GPT-OSS 120B, porque Groq dio de baja el primero |
| 16/11/2026 | Revisión del repositorio: nombres en minúsculas y con guion bajo, documentos puestos al día |
