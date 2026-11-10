/* =========================================================
   P&P — la IA que explica tu resultado (función del servidor)

   Corre en Vercel, no en el navegador. Es la única parte de la app
   que ve la clave de Groq: la lee de la variable de entorno
   GROQ_API_KEY. Si no hay clave, responde que la lectura no está
   disponible y la app muestra la lectura fija del modelo.

   Recibe por POST los números de UNA canción (nunca el nombre ni el
   artista) y devuelve tres párrafos cortos que hablan solo de esos
   números. El texto de sistema está también en prompts/lectura_ia.md.
   ========================================================= */

const MODELO = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const SISTEMA = `Sos la voz de P&P, una herramienta que compara el sonido de una canción con dos perfiles medidos: el de las canciones nominadas a Record o Song of the Year en los Grammy (prestigio) y el de las que entran al Hot 100 de Billboard (popularidad). Los dos puntajes dicen cuánto se PARECE el sonido a cada perfil, en percentil contra 23.388 canciones del 2000 en adelante. No son predicciones.

Vas a recibir los números de una canción. Escribís para quien la hizo.

REGLAS, en orden de importancia:
1. Hablás SOLO de los números que recibís. No agregás datos, comparaciones ni canciones que no estén en el mensaje.
2. No predecís nada: nunca decís que va a ganar, que va a ser un hit, que va a fallar ni que "tiene potencial". Decís a qué se parece.
3. No opinás de la letra, del artista, del género, del sello ni del mercado. No los conocés y la herramienta no los mide.
4. No das consejos de producción generales ("agregá más graves"). Si un rasgo tensiona los dos ejes, lo decís con sus números y aclarás que es una decisión de quien produce, no tuya.
5. Si el margen de error de un puntaje es ancho (más de 12 puntos), lo mencionás: es una estimación.

FORMA:
- Tres párrafos cortos, sin títulos, sin listas, sin negritas, sin emojis.
- Español rioplatense, voseo, tono directo y sobrio. Nada de entusiasmo vendedor.
- Párrafo 1: dónde cayó la canción (los dos puntajes y la zona) en una o dos frases.
- Párrafo 2: qué rasgos explican eso, con sus valores y sus aportes, los dos o tres más fuertes de cada eje.
- Párrafo 3: el conflicto si lo hay (qué rasgo empuja hacia un lado y saca del otro, con los puntos), o si no lo hay, qué rasgo mueve más los dos ejes en la misma dirección.
- Máximo 130 palabras en total. Los números van con coma decimal y sin más decimales de los que recibís.`;

function texto(d) {
  const f = x => (x > 0 ? '+' : '') + Math.round(x);
  const lista = a => a.map(x => `${x.nombre} ${x.valor}: ${f(x.pts)}`).join('; ');
  return [
    `Fuente: ${d.fuente === 'medido' ? 'archivo de audio medido en el navegador' : 'canción del conjunto de datos'}.`,
    `Prestigio: ${Math.round(d.pres.v)} (entre ${Math.round(d.pres.lo)} y ${Math.round(d.pres.hi)}).`,
    `Popularidad: ${Math.round(d.pop.v)} (entre ${Math.round(d.pop.lo)} y ${Math.round(d.pop.hi)}).`,
    `Zona del mapa: ${d.zona}.`,
    `Rasgos medidos: ${d.rasgos.map(r => `${r.nombre} ${r.valor}`).join('; ')}.`,
    `Qué suma y qué resta al prestigio (puntos): ${lista(d.aportesPres)}.`,
    `Qué suma y qué resta a la popularidad (puntos): ${lista(d.aportesPop)}.`,
    d.conflicto
      ? `Conflicto: ${d.conflicto.nombre} (${d.conflicto.valor}) aporta ${f(d.conflicto.ap)} al prestigio y ${f(d.conflicto.aq)} a la popularidad.`
      : 'Conflicto: ninguno marcado.',
  ].join('\n');
}

function valido(d) {
  const num = x => x && typeof x.v === 'number' && typeof x.lo === 'number' && typeof x.hi === 'number';
  return d && num(d.pres) && num(d.pop) && typeof d.zona === 'string'
    && Array.isArray(d.rasgos) && d.rasgos.length <= 12
    && Array.isArray(d.aportesPres) && Array.isArray(d.aportesPop);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'metodo' });

  const clave = process.env.GROQ_API_KEY;
  if (!clave) return res.status(200).json({ disponible: false, motivo: 'sin_clave' });

  let d = req.body;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = null; } }
  if (!valido(d)) return res.status(400).json({ error: 'datos' });

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clave}` },
      body: JSON.stringify({
        model: MODELO,
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          { role: 'system', content: SISTEMA },
          { role: 'user', content: texto(d) },
        ],
      }),
    });
    if (!r.ok) {
      const cuerpo = await r.text().catch(() => '');
      console.error('[P&P] Groq respondió', r.status, cuerpo.slice(0, 300));
      return res.status(200).json({ disponible: false, motivo: 'groq_' + r.status });
    }
    const j = await r.json();
    const contenido = j.choices?.[0]?.message?.content?.trim();
    if (!contenido) return res.status(200).json({ disponible: false, motivo: 'vacio' });
    return res.status(200).json({ disponible: true, texto: contenido, modelo: MODELO });
  } catch (e) {
    console.error('[P&P] error llamando a Groq:', e.message);
    return res.status(200).json({ disponible: false, motivo: 'red' });
  }
};

module.exports.SISTEMA = SISTEMA;
module.exports.texto = texto;
