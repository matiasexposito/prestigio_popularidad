const {Database} = require('duckdb-async');
const D = 'datasets/';
const L = (s) => console.log(s);

(async () => {
  const db = await Database.create(':memory:');
  const cols = {};

  for (const f of ['corpus_v2','control_v2','billboard_canciones','grammy_nominaciones']) {
    const d = await db.all(`DESCRIBE SELECT * FROM read_csv_auto('${D}${f}.csv')`);
    cols[f] = d.map(r => ({n: r.column_name, t: r.column_type}));
  }

  L('=== ESQUEMAS ===');
  for (const f of Object.keys(cols)) L(`${f}: ${cols[f].length} columnas`);

  L('\n=== corpus_v2 vs control_v2: mismo esquema? ===');
  const a = cols.corpus_v2.map(c => c.n), b = cols.control_v2.map(c => c.n);
  L(a.length === b.length && a.every((x,i) => x === b[i])
    ? 'IDENTICO, mismo orden -> se apilan directo'
    : `DIFIEREN\n  corpus:  ${a.join(', ')}\n  control: ${b.join(', ')}`);

  L('\n=== COLUMNAS DE corpus_v2 (tipo | nulos | vacios | ejemplo) ===');
  for (const c of cols.corpus_v2) {
    const q = `SELECT
      sum(CASE WHEN "${c.n}" IS NULL THEN 1 ELSE 0 END) nul,
      sum(CASE WHEN CAST("${c.n}" AS VARCHAR) = '' THEN 1 ELSE 0 END) vac,
      max(CAST("${c.n}" AS VARCHAR)) ej
      FROM read_csv_auto('${D}corpus_v2.csv')`;
    const r = (await db.all(q))[0];
    const marca = (Number(r.nul) || Number(r.vac)) ? '  <-- REVISAR' : '';
    L(`  ${c.n.padEnd(22)} ${String(c.t).padEnd(9)} ${String(r.nul).padStart(6)} ${String(r.vac).padStart(6)}  ${String(r.ej).slice(0,28)}${marca}`);
  }

  L('\n=== COLUMNAS DE control_v2 (nulos | vacios) ===');
  for (const c of cols.control_v2) {
    const q = `SELECT sum(CASE WHEN "${c.n}" IS NULL THEN 1 ELSE 0 END) nul,
      sum(CASE WHEN CAST("${c.n}" AS VARCHAR) = '' THEN 1 ELSE 0 END) vac
      FROM read_csv_auto('${D}control_v2.csv')`;
    const r = (await db.all(q))[0];
    const marca = (Number(r.nul) || Number(r.vac)) ? '  <-- REVISAR' : '';
    L(`  ${c.n.padEnd(22)} ${String(r.nul).padStart(6)} ${String(r.vac).padStart(6)}${marca}`);
  }

  for (const [f, col] of [['corpus_v2','grupo'],['control_v2','grupo']]) {
    L(`\n=== ${f}: reparto por ${col} ===`);
    for (const r of await db.all(`SELECT ${col}, count(*) n FROM read_csv_auto('${D}${f}.csv') GROUP BY 1 ORDER BY 2 DESC`))
      L(`  ${String(r[col]).padEnd(12)} ${String(r.n).padStart(7)}`);
  }

  L('\n=== COBERTURA POR DECADA ===');
  const dec = await db.all(`
    SELECT (anio/10)*10 AS decada,
      sum(CASE WHEN o='c' THEN 1 ELSE 0 END) corpus,
      sum(CASE WHEN o='k' THEN 1 ELSE 0 END) control
    FROM (SELECT anio,'c' o FROM read_csv_auto('${D}corpus_v2.csv')
          UNION ALL SELECT anio,'k' FROM read_csv_auto('${D}control_v2.csv'))
    GROUP BY 1 ORDER BY 1`);
  for (const r of dec) L(`  ${r.decada}s  corpus ${String(r.corpus).padStart(6)}   control ${String(r.control).padStart(6)}`);

  L('\n=== DUPLICADOS (titulo+artista) ===');
  for (const f of ['corpus_v2','control_v2']) {
    const r = (await db.all(`SELECT count(*) n FROM (SELECT titulo,artista FROM read_csv_auto('${D}${f}.csv') GROUP BY 1,2 HAVING count(*)>1)`))[0];
    L(`  ${f}: ${r.n}`);
  }

  L('\n=== RANGOS DE LAS CARACTERISTICAS (corpus_v2) ===');
  for (const c of cols.corpus_v2.filter(c => /INT|DOUBLE|FLOAT|DECIMAL|BIGINT/.test(c.t))) {
    const r = (await db.all(`SELECT min("${c.n}") mn, max("${c.n}") mx, round(avg("${c.n}"),3) pr FROM read_csv_auto('${D}corpus_v2.csv')`))[0];
    L(`  ${c.n.padEnd(22)} min ${String(r.mn).padStart(10)}   max ${String(r.mx).padStart(10)}   prom ${r.pr}`);
  }

  await db.close();
})();
