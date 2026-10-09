// Regenera assets/descargas/ a partir de tools/descargas.html con Chrome sin interfaz.
// Uso (desde la raiz del repo, con Node 22+ y google-chrome en el PATH):
//   python3 -m http.server 8642 &   # la plantilla carga ../assets por HTTP
//   node tools/render-descargas.mjs [http://127.0.0.1:8642]
import { spawn } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
const base = (process.argv[2] || 'http://127.0.0.1:8642') + '/tools/descargas.html';
const out = 'assets/descargas/';
const FORMATOS = { escritorio: [2560, 1440], tableta: [2048, 2732], movil: [1179, 2556] };
const trabajos = [];
for (const d of ['cosmos', 'iridiscente', 'ecuestre']) {
  for (const [f, [w, h]] of Object.entries(FORMATOS)) trabajos.push({ d, w, h, file: `fondo-${d}-${f}.jpg` });
  trabajos.push({ d, w: 640, h: 360, file: `vista-${d}.jpg`, q: 78 });
}
trabajos.push({ d: 'bandera', w: 3000, h: 2000, file: 'bandera-la-iridiscente.png' });
trabajos.push({ d: 'logo-oscuro', w: 1600, h: 480, file: 'logotipo-horizontal-oscuro.png' });
trabajos.push({ d: 'logo-claro', w: 1600, h: 480, file: 'logotipo-horizontal-claro.png', transparente: true });

const port = 9400 + Math.floor(Math.random() * 400);
const perfil = '/tmp/pavel-descargas-' + port;
const chrome = spawn('google-chrome', ['--headless=new', `--remote-debugging-port=${port}`, '--no-first-run', '--hide-scrollbars', `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let lista; for (let i = 0; i < 50 && !lista; i++) { try { lista = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch { await sleep(200); } }
const ws = new WebSocket(lista.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let n = 0; const pend = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++n; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
for (const t of trabajos) {
  await send('Emulation.setDeviceMetricsOverride', { width: t.w, height: t.h, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setDefaultBackgroundColorOverride', t.transparente ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
  await send('Page.navigate', { url: `${base}?d=${t.d}` });
  for (let i = 0; i < 100; i++) { const r = await send('Runtime.evaluate', { expression: "document.body && document.body.getAttribute('data-listo')", returnByValue: true }); if (r.result.value) break; await sleep(100); }
  await sleep(300);
  const png = t.file.endsWith('.png');
  const shot = await send('Page.captureScreenshot', png ? { format: 'png' } : { format: 'jpeg', quality: t.q || 86 });
  writeFileSync(out + t.file, Buffer.from(shot.data, 'base64'));
  console.log('✓', t.file, `${t.w}×${t.h}`);
}
ws.close(); chrome.kill(); await sleep(300); rmSync(perfil, { recursive: true, force: true });
process.exit(0);
