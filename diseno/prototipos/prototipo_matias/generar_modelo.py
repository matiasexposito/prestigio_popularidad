"""
Genera modelo.js para la app (prototipo_matias; nacio en el de Diogenes).

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

  POPULARIDAD — dos preguntas encadenadas, cada una con su propio modelo:
    1. ¿Entra al Hot 100?  Regresión logística (pesos balanceados) sobre todas las
       canciones: hits contra las que nunca entraron (grupo de control). Da P(entra).
    2. Si entra, ¿hasta dónde llega?  Regresión lineal aprendida SOLO entre los hits,
       sobre la escala estirada del puesto:
       100·(1 − ln(puesto)/ln(100)) → #1=100, #2=85, #5=65, #10=50, #50=15, #100=0.
       El top 10 se lleva la mitad del puntaje.
    Puntaje = P(entra) × hasta dónde llega (acotado a 0–100).
    Antes (hasta el 02/11/2026) era UNA sola regresión lineal sobre ese puntaje con
    0 para las que no entraron. Como la mayoría son ceros, la recta se gastaba en
    "entra / no entra" y aplastaba las diferencias entre hits: Despacito daba 42 de
    popularidad y Shape Of You 44. Encadenando: 62 y 82. Mejora en todo lo medido
    (AUC 0,752→0,762; correlación con el chart 0,263→0,316; entre hits 0,066→0,121).
    Lo que NO arregla: filas con datos rotos (Havana figura con instrumentalidad 0,92
    y −12 dB, que es una versión instrumental mal cruzada). Eso es limpieza de datos.

  Volumen: se queda en el modelo. Sacarlo baja el acierto de popularidad (0,75 → 0,72)
  y no cambia las conclusiones de prestigio, donde ahora casi no pesa (+0,16).

  Limpieza: se sacan las canciones de Billboard/Grammy con volumen menor a −25 dB. Son
  cruces rotos con otra versión (ej. "Baile Inolvidable" de Bad Bunny figuraba con
  energía 0,00 y −46 dB). En el grupo de control un volumen bajo es real (música
  clásica, ambient), así que ahí no se filtra.

Los puntajes que muestra la app son el PERCENTIL de la canción dentro de las canciones
del 2000 en adelante. El margen sale de 20 remuestreos (bootstrap).

  EL VIAJE EN EL TIEMPO (la "pirueta", 10/11/2026): además del modelo de hoy, se entrena
  el mismo par de modelos con las canciones de cada período (2000-04, 05-09, 10-14, 15-19,
  20-26). Así la app puede mostrar cómo habría leído a una canción la Academia y el chart
  de cada época. Cada período tiene entre 35 y 67 reconocidas, así que su margen es más
  ancho que el de hoy (12 remuestreos, se muestra siempre). Medido antes de incluirlo:
  el acierto por período se mantiene (prestigio 0,68-0,78; popularidad 0,75-0,80).

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

# ---------- Popularidad: dos preguntas encadenadas ----------
chart = np.where(hit == 1, escala, 0.0)                         # 0 si no entra (para medir)
eh = hit == 1
b_entra = logistica(Z, hit)                                     # 1. ¿entra?
b_llega = lineal(Z[eh], escala[eh])                             # 2. si entra, ¿hasta dónde?

def puntaje_pop(Am, b1, b2):
    p1 = 1 / (1 + np.exp(-(Am @ b1)))
    return p1 * np.clip(Am @ b2, 0, 100)

boots_pop = []                                                  # pares [entra, llega]
for _ in range(20):
    i = remuestreo(len(filas))
    ih = i[eh[i]]
    boots_pop.append([logistica(Z[i], hit[i]).round(4).tolist(),
                      lineal(Z[ih], escala[ih]).round(4).tolist()])

s_pres, s_pop = A @ b_pres, puntaje_pop(A, b_entra, b_llega)
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
# [popularidad, prestigio, grupo, título, artista, año]: el nombre sirve para que el
# punto se pueda clickear y escuchar la canción
fondo = [[round(pct(s_pop[i], q_pop), 1), round(pct(s_pres[i], q_pres), 1),
          filas[i]['grupo'], filas[i]['titulo'], filas[i]['artista'], int(filas[i]['anio'])]
         for i in idx]

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

# ---------- El viaje en el tiempo: un par de modelos por período ----------
PERIODOS = [(2000, 2004), (2005, 2009), (2010, 2014), (2015, 2019), (2020, 2026)]
anio_f = np.array([int(r['anio']) for r in filas])
periodos = []
for a_, b_ in PERIODOS:
    m = (anio_f >= a_) & (anio_f <= b_)
    mp_ = m & (general | nunca)
    bp_ = logistica(Z[mp_], general[mp_].astype(int))
    b1_ = logistica(Z[m], hit[m])
    eh_ = m & (hit == 1)
    b2_ = lineal(Z[eh_], escala[eh_])
    sp_, so_ = A @ bp_, puntaje_pop(A, b1_, b2_)
    qp_ = np.quantile(sp_[m], np.linspace(0, 1, 201)).round(4).tolist()
    qo_ = np.quantile(so_[m], np.linspace(0, 1, 201)).round(4).tolist()
    bpres_, bpop_ = [], []
    idx_m = np.where(m)[0]
    for _ in range(12):
        i = idx_m[rng.integers(0, len(idx_m), len(idx_m))]
        ip = i[(general | nunca)[i]]
        ih = i[hit[i] == 1]
        bpres_.append(logistica(Z[ip], general[ip].astype(int)).round(4).tolist())
        bpop_.append([logistica(Z[i], hit[i]).round(4).tolist(), lineal(Z[ih], escala[ih]).round(4).tolist()])
    muestra = rng.choice(idx_m, min(300, len(idx_m)), replace=False)
    fondo_p = [[round(pct(so_[i], qo_), 1), round(pct(sp_[i], qp_), 1), filas[i]['grupo'],
                filas[i]['titulo'], filas[i]['artista'], int(filas[i]['anio'])] for i in muestra]
    periodos.append({
        'desde': a_, 'hasta': b_, 'n': int(m.sum()), 'n_reconocidas': int((m & general).sum()),
        'n_hits': int(eh_.sum()),
        'prestigio': {'coef': bp_.round(4).tolist(), 'boots': bpres_, 'cuantiles': qp_},
        'popularidad': {'coef': b1_.round(4).tolist(), 'coef2': b2_.round(4).tolist(), 'boots': bpop_, 'cuantiles': qo_},
        'fondo': fondo_p,
        'auc': {'prestigio': round(auc(sp_[mp_], general[mp_].astype(int)), 3), 'popularidad': round(auc(so_[m], hit[m]), 3)},
    })

modelo = {
    'rasgos': FEATS, 'media': media.round(5).tolist(), 'desv': desv.round(5).tolist(),
    'prestigio': {'coef': b_pres.round(4).tolist(), 'boots': boots_pres, 'cuantiles': q_pres},
    'popularidad': {'coef': b_entra.round(4).tolist(), 'coef2': b_llega.round(4).tolist(),
                    'boots': boots_pop, 'cuantiles': q_pop,
                    'objetivo': 'P(entra al Hot 100) × hasta dónde llega: 100·(1 − ln(puesto)/ln(100)), aprendido entre los hits'},
    'fondo': fondo, 'referencias': refs, 'buscables': buscables, 'grupos': grupos,
    'n': len(filas), 'anio_min': ANIO_MIN,
    'n_reconocidas': int(general.sum()), 'n_nunca': int(nunca.sum()),
    'periodos': periodos,
}
with open(os.path.join(AQUI, 'modelo.js'), 'w', encoding='utf-8') as f:
    f.write('// Generado por generar_modelo.py — no editar a mano\n')
    f.write('window.MODELO = ' + json.dumps(modelo, ensure_ascii=False) + ';\n')

print(f'canciones desde {ANIO_MIN}: {len(filas)}  (descartadas por cruce roto: {len(descartadas)})')
print(f'prestigio: {general.sum()} reconocidas (Record/Song of the Year) contra {nunca.sum()} hits nunca nominados')
print(f'popularidad: {hit.sum()} hits contra {len(filas) - hit.sum()} que no entraron')
print('acierto (AUC) prestigio:', round(auc(Zp @ b_pres[1:], yp), 3),
      '| popularidad, separa hits del resto:', round(auc(s_pop, hit), 3),
      '| correlación con el puntaje de chart:', round(np.corrcoef(s_pop, chart)[0, 1], 3),
      '| entre hits, con el puesto:', round(np.corrcoef(s_pop[eh], escala[eh])[0, 1], 3))
for nom, b in [('prestigio', b_pres), ('popularidad 1 (entra)', b_entra), ('popularidad 2 (llega)', b_llega)]:
    print(nom, {f: round(c, 2) for f, c in zip(FEATS, b[1:])})
# Promedios que usa la pantalla de bienvenida: reconocidas (Record/Song) contra hits nunca nominados
print('reconocidas vs nunca nominadas (desde 2000):')
for f_ in FEATS:
    j = FEATS.index(f_)
    print(f'  {f_:17s} reconocidas {X[general, j].mean():7.3f} | nunca {X[nunca, j].mean():7.3f}')
print('ambas (premio + hit) desde 2000:', sum(r['grupo'] == 'ambas' for r in filas), 'de', len(filas))
print('buscables:', len(buscables))
print('períodos:', [(p_['desde'], p_['hasta'], p_['n'], p_['n_reconocidas'], p_['auc']) for p_ in periodos])
print('referencias:', len(refs), [(r['titulo'], r['pop'], r['pres']) for r in refs])
