"""
Genera modelo.js para el prototipo funcional de Diogenes.

Sigue las decisiones del grupo (ver entregas y decisiones.md):

  Recorte: solo canciones desde el año 2000. El análisis histórico necesita las seis
  décadas porque mide un cambio; la herramienta mide dónde está parada una canción HOY.
  Además, mezclar épocas hacía que el modelo premiara el volumen (las mezclas recientes
  son más fuertes y las nominadas se concentran en años recientes): "fuerte = Grammy"
  era en realidad "fuerte = canción nueva".

  PRESTIGIO — ¿suena parecido a lo que reconoce la Academia?
    Reconocidas: nominadas a Record of the Year o Song of the Year (las únicas que vota
    la Academia entera). 213 canciones.
    No reconocidas: canciones PUBLICADAS que entraron al Hot 100 y nunca fueron nominadas a
    nada (~8.900). No se usa el grupo de control en este eje: sus canciones (demos,
    autoediciones, música clásica, ambient) suenan menos "producidas", y el modelo
    aprendía que "volumen alto = prestigio" cuando en realidad era "volumen alto = disco
    profesional". Contra los hits, la comparación es la de la Entrega: las reconocidas
    son más acústicas (0,28 contra 0,19), menos enérgicas (0,60 contra 0,67) y más largas
    (3:57 contra 3:36).
    Las nominadas solo en categorías de género (807) quedan FUERA de este eje: no son
    "no reconocidas", pero tampoco miden prestigio (Best Metal Performance mide metal).
    Regresión logística con pesos balanceados.

  POPULARIDAD — dos preguntas encadenadas, en un solo puntaje de chart:
    1. ¿Entra al Hot 100?  Si no entra, el puntaje es 0.
    2. Si entra, ¿hasta dónde llega?  Escala estirada del puesto:
       100·(1 − ln(puesto)/ln(100)) → #1=100, #2=85, #5=65, #10=50, #50=15, #100=0.
       El top 10 se lleva la mitad del puntaje.
    El modelo (regresión lineal) aprende ese puntaje esperado = P(entra) × hasta dónde
    llega, sobre todas las canciones (hits + grupo de control). Es lineal en las
    características, así que la app puede decir cuánto aporta cada rasgo.
    Se probó combinar dos modelos separados (logística + lineal) con el mismo peso: le
    daba demasiada voz a la pregunta 2, que es la más débil (correlación 0,18), y la
    duración terminaba sumando en los dos ejes a la vez.

  Volumen: se queda en el modelo. Sacarlo baja el acierto de popularidad (0,75 → 0,72)
  y no cambia las conclusiones de prestigio, donde ahora casi no pesa (+0,16).

  Limpieza: se sacan las canciones de Billboard/Grammy con volumen menor a −25 dB. Son
  cruces rotos con otra versión (ej. "Baile Inolvidable" de Bad Bunny figuraba con
  energía 0,00 y −46 dB). En el grupo de control un volumen bajo es real (música
  clásica, ambient), así que ahí no se filtra.

Los puntajes que muestra la app son el PERCENTIL de la canción dentro de las canciones
del 2000 en adelante. El margen sale de 20 remuestreos (bootstrap).

Uso (desde la raiz del repo):  python3 diseno/prototipos/prototipo_diogenes/generar_modelo.py
"""
import csv, json, os
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))
FEATS = ['energy', 'valence', 'acousticness', 'duration_ms', 'danceability',
         'loudness', 'speechiness', 'tempo', 'mode', 'instrumentalness']
ANIO_MIN = 2000
VOLUMEN_ROTO = -25.0

filas, descartadas = [], []
for f in ['corpus_v2.csv', 'control_v2.csv']:
    for r in csv.DictReader(open(os.path.join(RAIZ, 'datasets', f), encoding='utf-8')):
        if int(r['anio']) < ANIO_MIN:
            continue
        if r['grupo'] != 'control' and float(r['loudness']) < VOLUMEN_ROTO:
            descartadas.append(f"{r['titulo']} — {r['artista']} ({r['anio']})")
            continue
        filas.append(r)

X = np.array([[float(r[c]) for c in FEATS] for r in filas])
X[:, FEATS.index('duration_ms')] /= 60000.0          # minutos
media, desv = X.mean(0), X.std(0)
Z = (X - media) / desv
A = np.hstack([np.ones((len(Z), 1)), Z])

def es_general(r):
    c = r['grammy_categorias']
    return 'Record of the Year' in c or 'Song of the Year' in c

general = np.array([es_general(r) for r in filas])
nunca = np.array([r['grammy_nominada'] == '0' and r['grupo'] != 'control' for r in filas])
hit = np.array([int(r['fue_hit']) for r in filas])
puesto = np.array([float(r['mejor_puesto']) if r['mejor_puesto'] else np.nan for r in filas])
escala = 100 * (1 - np.log(puesto) / np.log(100))     # solo tiene sentido en los hits

def logistica(Zm, y, iters=25):
    """Newton-Raphson con pesos balanceados por clase."""
    Am = np.hstack([np.ones((len(Zm), 1)), Zm])
    w = np.where(y == 1, 0.5 / y.mean(), 0.5 / (1 - y.mean()))
    b = np.zeros(Am.shape[1])
    for _ in range(iters):
        p = 1 / (1 + np.exp(-Am @ b))
        g = Am.T @ (w * (y - p)) - 1e-3 * b
        H = (Am * (w * p * (1 - p))[:, None]).T @ Am + 1e-3 * np.eye(len(b))
        b += np.linalg.solve(H, g)
    return b

def lineal(Zm, y):
    Am = np.hstack([np.ones((len(Zm), 1)), Zm])
    return np.linalg.solve(Am.T @ Am + 1e-3 * np.eye(Am.shape[1]), Am.T @ y)

rng = np.random.default_rng(7)

def remuestreo(n):
    return rng.integers(0, n, n)

# ---------- Prestigio ----------
m_pres = general | nunca
Zp, yp = Z[m_pres], general[m_pres].astype(int)
b_pres = logistica(Zp, yp)
boots_pres = []
for _ in range(20):
    i = remuestreo(len(Zp))
    boots_pres.append(logistica(Zp[i], yp[i]).round(4).tolist())

# ---------- Popularidad ----------
chart = np.where(hit == 1, escala, 0.0)                         # 0 si no entra
b_pop = lineal(Z, chart)
boots_pop = []
for _ in range(20):
    i = remuestreo(len(filas))
    boots_pop.append(lineal(Z[i], chart[i]).round(4).tolist())

s_pres, s_pop = A @ b_pres, A @ b_pop
q_pres = np.quantile(s_pres, np.linspace(0, 1, 201)).round(4).tolist()
q_pop = np.quantile(s_pop, np.linspace(0, 1, 201)).round(4).tolist()

def pct(s, q):
    return float(np.interp(s, q, np.linspace(0, 100, 201)))

def auc(s, y):
    """Probabilidad de que una positiva al azar tenga más puntaje que una negativa al azar."""
    orden = s.argsort().argsort() + 1
    n1, n0 = y.sum(), len(y) - y.sum()
    return (orden[y == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * n0)

# Puntos de fondo para el mapa: muestra al azar
idx = rng.choice(len(filas), 700, replace=False)
fondo = [[round(pct(s_pop[i], q_pop), 1), round(pct(s_pres[i], q_pres), 1),
          filas[i]['grupo']] for i in idx]

# Canciones de referencia con nombre (todas del 2000 en adelante)
REF = [('Hello', 'Adele'), ('Rolling in the Deep', 'Adele'), ('Someone Like You', 'Adele'),
       ('Holocene', 'Bon Iver'), ('Royals', 'Lorde'), ('Rehab', 'Amy Winehouse'),
       ('This Is America', 'Childish Gambino'), ('Not Like Us', 'Kendrick Lamar'),
       ('Bad Guy', 'Billie Eilish'), ('Birds of a Feather', 'Billie Eilish'),
       ('Uptown Funk', 'Mark Ronson'), ('Despacito', 'Luis Fonsi'), ('Espresso', 'Sabrina Carpenter'),
       ('Blinding Lights', 'The Weeknd'), ('Shape Of You', 'Ed Sheeran'), ('Gangnam Style', 'PSY'),
       ('Happy', 'Pharrell Williams'), ('Toxic', 'Britney Spears'), ("Hips Don't Lie", 'Shakira')]
refs = []
for t, a in REF:
    for i, r in enumerate(filas):
        if r['titulo'].lower() == t.lower() and r['artista'].lower().startswith(a.lower()):
            refs.append({'titulo': r['titulo'], 'artista': r['artista'], 'anio': int(r['anio']),
                         'gano': int(r['grammy_gano']), 'nominada': int(r['grammy_nominada']),
                         'pop': round(pct(s_pop[i], q_pop), 1), 'pres': round(pct(s_pres[i], q_pres), 1),
                         'rasgos': dict(zip(FEATS, X[i].round(4).tolist()))})
            break

# Canciones que se pueden buscar por nombre en el prototipo:
# todas las que lograron las dos cosas + las que llegaron al puesto 1
buscables = []
for i, r in enumerate(filas):
    if r['grupo'] == 'ambas' or r['mejor_puesto'] == '1':
        buscables.append([r['titulo'], r['artista'], int(r['anio']), int(r['grammy_gano']),
                          int(r['grammy_nominada'])] + [round(v, 3) for v in X[i].tolist()])

# Promedios por grupo, para que el asistente compare
grupos = {}
for g in ['hit', 'ambas', 'premiada', 'control']:
    m = np.array([r['grupo'] == g for r in filas])
    grupos[g] = dict(zip(FEATS, X[m].mean(0).round(3).tolist()))

modelo = {
    'rasgos': FEATS, 'media': media.round(5).tolist(), 'desv': desv.round(5).tolist(),
    'prestigio': {'coef': b_pres.round(4).tolist(), 'boots': boots_pres, 'cuantiles': q_pres},
    'popularidad': {'coef': b_pop.round(4).tolist(), 'boots': boots_pop, 'cuantiles': q_pop,
                    'objetivo': 'puntaje de chart: 0 si no entra; si entra, 100·(1 − ln(puesto)/ln(100))'},
    'fondo': fondo, 'referencias': refs, 'buscables': buscables, 'grupos': grupos,
    'n': len(filas), 'anio_min': ANIO_MIN,
    'n_reconocidas': int(general.sum()), 'n_nunca': int(nunca.sum()),
}
with open(os.path.join(AQUI, 'modelo.js'), 'w', encoding='utf-8') as f:
    f.write('// Generado por generar_modelo.py — no editar a mano\n')
    f.write('window.MODELO = ' + json.dumps(modelo, ensure_ascii=False) + ';\n')

print(f'canciones desde {ANIO_MIN}: {len(filas)}  (descartadas por cruce roto: {len(descartadas)})')
print(f'prestigio: {general.sum()} reconocidas (Record/Song of the Year) contra {nunca.sum()} hits nunca nominados')
print(f'popularidad: {hit.sum()} hits contra {len(filas) - hit.sum()} que no entraron')
print('acierto (AUC) prestigio:', round(auc(Zp @ b_pres[1:], yp), 3),
      '| popularidad, separa hits del resto:', round(auc(Z @ b_pop[1:], hit), 3),
      '| correlación con el puntaje de chart:', round(np.corrcoef(s_pop, chart)[0, 1], 3))
for nom, b in [('prestigio', b_pres), ('popularidad', b_pop)]:
    print(nom, {f: round(c, 2) for f, c in zip(FEATS, b[1:])})
print('buscables:', len(buscables))
print('referencias:', len(refs), [(r['titulo'], r['pop'], r['pres']) for r in refs])
