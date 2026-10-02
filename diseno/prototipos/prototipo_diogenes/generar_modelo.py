"""
Genera modelo.js para el prototipo funcional de Diogenes.

Entrena dos regresiones logisticas simples sobre corpus_v2 + control_v2:
  - prestigio:   fue nominada al Grammy (grammy_nominada). Se entrena SOLO con
                 corpus_v2 (nominadas vs hits), para que aprenda que separa a la
                 Academia dentro de la musica publicada, y no "suena producido".
  - popularidad: entro al Hot 100 (fue_hit), corpus vs control.
Los puntajes que muestra la app son el PERCENTIL de la cancion dentro de las
53.577, no la probabilidad cruda. El margen sale de 20 remuestreos (bootstrap).

Es un modelo de prototipo: no normaliza por epoca ni separa por genero.
Uso (desde la raiz del repo):  python3 diseno/prototipos/prototipo_diogenes/generar_modelo.py
"""
import csv, json, os
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))
FEATS = ['energy', 'valence', 'acousticness', 'duration_ms', 'danceability',
         'loudness', 'speechiness', 'tempo', 'mode', 'instrumentalness']

filas = []
for f in ['corpus_v2.csv', 'control_v2.csv']:
    filas += list(csv.DictReader(open(os.path.join(RAIZ, 'datasets', f), encoding='utf-8')))

X = np.array([[float(r[c]) for c in FEATS] for r in filas])
X[:, FEATS.index('duration_ms')] /= 60000.0          # minutos
media, desv = X.mean(0), X.std(0)
Z = (X - media) / desv
y_pres = np.array([int(r['grammy_nominada']) for r in filas])
y_pop = np.array([int(r['fue_hit']) for r in filas])

def logistica(Z, y, iters=25):
    """Newton-Raphson con pesos balanceados por clase."""
    A = np.hstack([np.ones((len(Z), 1)), Z])
    w = np.where(y == 1, 0.5 / y.mean(), 0.5 / (1 - y.mean()))
    b = np.zeros(A.shape[1])
    for _ in range(iters):
        p = 1 / (1 + np.exp(-A @ b))
        g = A.T @ (w * (y - p)) - 1e-3 * b
        H = (A * (w * p * (1 - p))[:, None]).T @ A + 1e-3 * np.eye(len(b))
        b += np.linalg.solve(H, g)
    return b

rng = np.random.default_rng(7)
en_corpus = np.array([r['grupo'] != 'control' for r in filas])

def entrenar(y, mascara):
    Zm, ym = Z[mascara], y[mascara]
    base = logistica(Zm, ym)
    boots = []
    for _ in range(20):
        i = rng.integers(0, len(Zm), len(Zm))
        boots.append(logistica(Zm[i], ym[i]).round(4).tolist())
    s = np.hstack([np.ones((len(Z), 1)), Z]) @ base
    cuantiles = np.quantile(s, np.linspace(0, 1, 201)).round(4).tolist()
    return base, boots, cuantiles, s

b_pres, boots_pres, q_pres, s_pres = entrenar(y_pres, en_corpus)
b_pop, boots_pop, q_pop, s_pop = entrenar(y_pop, np.ones(len(filas), bool))

def pct(s, q):
    return float(np.interp(s, q, np.linspace(0, 100, 201)))

# Puntos de fondo para el mapa: muestra al azar
idx = rng.choice(len(filas), 700, replace=False)
fondo = [[round(pct(s_pop[i], q_pop), 1), round(pct(s_pres[i], q_pres), 1),
          filas[i]['grupo']] for i in idx]

# Canciones de referencia con nombre
REF = [('Bridge over Troubled Water', 'Simon & Garfunkel'), ('Hello', 'Adele'),
       ('Rolling in the Deep', 'Adele'), ('Hotel California', 'Eagles'),
       ('Uptown Funk', 'Mark Ronson'), ('Bad Guy', 'Billie Eilish'),
       ('Billie Jean', 'Michael Jackson'), ('Despacito', 'Luis Fonsi'),
       ('Gangnam Style', 'PSY'), ('Macarena', 'Los Del Rio'),
       ('Blinding Lights', 'The Weeknd'), ('Shape Of You', 'Ed Sheeran'),
       ('Someone Like You', 'Adele'), ('Imagine', 'Jack Johnson'),
       ('Bohemian Rhapsody', 'Queen'), ('Smells Like Teen Spirit', 'Nirvana'),
       ('Thriller', 'Michael Jackson')]
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
    'popularidad': {'coef': b_pop.round(4).tolist(), 'boots': boots_pop, 'cuantiles': q_pop},
    'fondo': fondo, 'referencias': refs, 'buscables': buscables, 'grupos': grupos, 'n': len(filas),
}
with open(os.path.join(AQUI, 'modelo.js'), 'w', encoding='utf-8') as f:
    f.write('// Generado por generar_modelo.py — no editar a mano\n')
    f.write('window.MODELO = ' + json.dumps(modelo, ensure_ascii=False) + ';\n')

print('canciones:', len(filas))
for nom, b in [('prestigio', b_pres), ('popularidad', b_pop)]:
    print(nom, {f: round(c, 2) for f, c in zip(FEATS, b[1:])})
print('buscables:', len(buscables))
print('referencias encontradas:', len(refs), [ (r['titulo'], r['pop'], r['pres']) for r in refs])
