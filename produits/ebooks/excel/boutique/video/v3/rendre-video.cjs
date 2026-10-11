#!/usr/bin/env node
// Rend la pub : ouvre src/pub.html à la bonne taille, appelle window.seek(t) puis capture chaque image (JPEG q92, 30 i/s),
// et envoie le flux à ffmpeg (stdin, image2pipe) avec la piste audio audio/mix.m4a (produite par mixer.sh).
// Usage : NODE_PATH=$(npm root -g) node rendre-video.cjs [9x16|4x5|tout|miniature|stills <fmt> <t1,t2,...> <dossier>]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');

const ICI = __dirname;
const RACINE = path.resolve(ICI, '../../../../..');   // .../produits : le serveur local sert tout l'arbre (polices, captures, logo)
const FPS = 30, DUREE = 30, N = Math.round(FPS * DUREE);
const TAILLES = { '9x16': [1080, 1920], '4x5': [1080, 1350] };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

function serveur() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RACINE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RACINE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
    }).listen(0, '127.0.0.1', () => ok(s));
  });
}
async function ouvrir(browser, srv, fmt, extra = '') {
  const [w, h] = TAILLES[fmt];
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('ERREUR PAGE', e.message); });
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  const rel = path.relative(RACINE, path.join(ICI, 'src/pub.html')).split(path.sep).join('/');
  await page.goto(`http://127.0.0.1:${srv.address().port}/${rel}${extra}`);
  await page.evaluate(() => window.pret);                   // polices (document.fonts.ready) + images chargées
  return page;
}
async function rendre(browser, srv, fmt) {
  const page = await ouvrir(browser, srv, fmt);
  const sortie = path.join(ICI, 'sortie', `pub-excel-v3-${fmt}.mp4`);
  const audio = path.join(ICI, 'audio/mix.m4a');
  const args = ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
  if (fs.existsSync(audio)) args.push('-i', audio);
  args.push('-map', '0:v', ...(fs.existsSync(audio) ? ['-map', '1:a'] : []),
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-r', String(FPS),
    ...(fs.existsSync(audio) ? ['-c:a', 'copy'] : []), '-t', String(DUREE), '-movflags', '+faststart', sortie);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const fini = new Promise(r => ff.on('close', r));
  const debut = Date.now();
  for (let i = 0; i < N; i++) {
    await page.evaluate(t => window.seek(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`${fmt} : image ${i}/${N} (${((Date.now() - debut) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end(); const code = await fini; await page.close();
  if (code !== 0) throw new Error('ffmpeg a échoué : ' + code);
  console.log('écrit', sortie);
}
(async () => {
  const [mode = 'tout', a, b, c] = process.argv.slice(2);
  const srv = await serveur(); const browser = await chromium.launch();
  try {
    if (mode === 'stills') {                                // captures de contrôle : stills <fmt> <t1,t2,...> <dossier>
      fs.mkdirSync(c, { recursive: true }); const page = await ouvrir(browser, srv, a);
      for (const t of b.split(',')) { await page.evaluate(x => window.seek(x), parseFloat(t)); await page.screenshot({ path: path.join(c, `t${parseFloat(t).toFixed(2)}.png`) }); }
    } else if (mode === 'miniature') {                      // image forte de l'accroche, sans sous-titres, avec « 15 000 F » en rappel
      const page = await ouvrir(browser, srv, '9x16', '');
      await page.evaluate(() => window.seek(4.9));
      await page.screenshot({ path: path.join(ICI, 'sortie/miniature-v3-9x16.jpg'), type: 'jpeg', quality: 94 });
    } else {
      for (const f of (mode === 'tout' ? ['9x16', '4x5'] : [mode])) await rendre(browser, srv, f);
    }
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
