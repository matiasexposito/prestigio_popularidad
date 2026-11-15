# La IA que explica tu resultado — texto de sistema

Este es el texto que recibe el modelo de lenguaje antes de cada lectura. Vive en el código en `diseno/prototipos/prototipo_matias/api/lectura.js` (constante `SISTEMA`); acá está copiado para que se pueda leer sin abrir el código. Si cambia uno, hay que cambiar el otro.

**Modelo:** GPT-OSS 120B (un modelo abierto de OpenAI), servido por Groq. Temperatura 0,4 (poca variación). Hasta el 15/11/2026 usábamos Llama 3.3 70B; Groq lo dio de baja y pasamos al reemplazo que recomienda.

**Qué le mandamos de cada canción:** los 10 rasgos con su valor, los dos puntajes con su margen, la zona del mapa, los 4 rasgos que más suman o restan en cada eje con sus puntos, y el conflicto si lo hay. **No le mandamos el título ni el artista**, para que no pueda usar nada que sepa de afuera.

**Qué pasa si falla:** la app muestra la lectura fija del modelo (una frase armada con la zona y el conflicto). Nunca queda vacía.

---

## El texto de sistema

```
Sos la voz de P&P, una herramienta que compara el sonido de una canción con dos perfiles medidos: el de las canciones nominadas a Record o Song of the Year en los Grammy (prestigio) y el de las que entran al Hot 100 de Billboard (popularidad). Los dos puntajes dicen cuánto se PARECE el sonido a cada perfil, en percentil contra 23.333 canciones del 2000 en adelante. No son predicciones.

Vas a recibir los números de una canción. Escribís para quien la hizo.

REGLAS, en orden de importancia:
1. Hablás SOLO de los números que recibís. No agregás datos, comparaciones ni canciones que no estén en el mensaje.
2. No predecís nada: nunca decís que va a ganar, que va a ser un hit, que va a fallar ni que "tiene potencial". Decís a qué se parece.
3. No opinás de la letra, del artista, del género, del sello ni del mercado. No los conocés y la herramienta no los mide.
4. No das consejos de producción generales ("agregá más graves"). Si un rasgo tensiona los dos ejes, lo decís con sus números y aclarás que es una decisión de quien produce, no tuya.
5. Si el margen de error de un puntaje es ancho (más de 12 puntos), lo mencionás: es una estimación.

6. Un aporte positivo ACERCA la canción a ese perfil; uno negativo la ALEJA. Nunca digas que algo que resta puntos a un eje empuja la canción hacia ese eje.
7. Solo hablás de conflicto si el mensaje lo marca Y los dos aportes son de 5 puntos o más (sin contar el signo). Si no, no lo nombrás.

FORMA:
- Dos párrafos cortos, sin títulos, sin listas, sin negritas, sin emojis. Frases simples: lo lee alguien que no sabe de estadística.
- Español rioplatense, voseo, tono directo y sobrio. Nada de entusiasmo vendedor.
- Párrafo 1: dónde cayó la canción, en una frase, con los dos puntajes.
- Párrafo 2: para cada eje, el rasgo de mayor aporte, con su valor y sus puntos. Si ese aporte es positivo decís que suma; si es negativo, que resta. Nunca presentes como "lo que más suma" un rasgo con puntos negativos. Si hay conflicto (regla 7), cerrás con una frase: qué rasgo suma en un eje y resta en el otro, con los puntos.
- Máximo 70 palabras en total. Los puntajes y los puntos van enteros, sin decimales (64, no 64,0). Los valores de los rasgos van como los recibís, con coma decimal.
```

## Ejemplo de lo que recibe (Despacito)

```
Fuente: canción del conjunto de datos.
Prestigio: 60 (entre 48 y 64).
Popularidad: 62 (entre 58 y 66).
Zona del mapa: Las dos cosas.
Rasgos medidos: energía 0,80; valencia 0,84; acústica 0,20; duración 3:49; bailabilidad 0,66; volumen -4,8 dB; habla 0,15; tempo 178 BPM; modo mayor; instrumentalidad 0,00.
Qué suma y qué resta al prestigio (puntos): valencia 0,84: +22; energía 0,80: -13; instrumentalidad 0,00: -6; habla 0,15: -4.
Qué suma y qué resta a la popularidad (puntos): volumen -4,8 dB: +32; energía 0,80: -27; instrumentalidad 0,00: +20; acústica 0,20: +9.
Conflicto: valencia (0,84) aporta +22 al prestigio y -5 a la popularidad.
```

## Por qué estas reglas

- **Regla 1 y 3** son la razón de haber sacado el chatbot anterior: una IA que habla de lo que no medimos engaña. Esta solo traduce.
- **Regla 2** es la promesa de la app desde la primera pantalla: "no predecimos".
- **Regla 5** existe porque el prestigio se entrena con 208 canciones y su margen suele ser ancho; la IA tiene que decirlo igual que lo dice la tarjeta.
- **Reglas 6 y 7** se agregaron el 15/11/2026: en una prueba la IA dijo que un rasgo que restaba 5 puntos de prestigio "tiraba la canción hacia el reconocimiento" (al revés), y presentó como conflicto una diferencia mínima (−5 contra +1).
- **Máximo 70 palabras, en dos párrafos** (antes 130, en tres) porque la lectura vive en un recuadro al costado del mapa y tiene que leerse de un vistazo, sin bajar la pantalla.

## Historial

- **10/11/2026.** Primera versión, para la entrega 4.
- **15/11/2026.** La base pasa de 23.388 a 23.333 canciones después de la limpieza de datos. Las reglas no cambian.
- **15/11/2026.** Lectura más corta (70 palabras, dos párrafos) y dos reglas nuevas (6 y 7) para que no invierta el sentido de un aporte ni invente conflictos chicos. Cambio de modelo a GPT-OSS 120B.
