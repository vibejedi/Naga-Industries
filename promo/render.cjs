// node promo/render.cjs <promo.html> <out.mp4>
// Renders a promo page frame by frame in headless Chromium, encodes H.264 and
// mixes the soundtrack described by window.PROMO.audio.
const { chromium } = require(process.env.PW || '/opt/node-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const [page, out] = process.argv.slice(2);
const FONTS = process.env.FONT_CACHE;            // optional offline Google Fonts cache
const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.mp4':'video/mp4' };
const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  const st = fs.statSync(p), type = MIME[path.extname(p)] || 'application/octet-stream', range = req.headers.range;
  if (range) { const [a, b] = range.replace('bytes=', '').split('-'); const s = +a, e = b ? +b : st.size - 1;
    res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${s}-${e}/${st.size}`, 'accept-ranges': 'bytes', 'content-length': e - s + 1 }); return fs.createReadStream(p, { start: s, end: e }).pipe(res); }
  res.writeHead(200, { 'content-type': type, 'content-length': st.size, 'accept-ranges': 'bytes' }); fs.createReadStream(p).pipe(res);
}).listen(0);
(async () => {
  const port = srv.address().port, tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'promo-'));
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  if (FONTS) {
    const css = fs.readFileSync(FONTS + '/site.css', 'utf8');
    await ctx.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
    await ctx.route('https://fonts.gstatic.com/**', (r) => { const f = FONTS + '/' + crypto.createHash('md5').update(r.request().url()).digest('hex').slice(0, 16) + '.woff2'; return fs.existsSync(f) ? r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f), headers: { 'access-control-allow-origin': '*' } }) : r.fulfill({ status: 404 }); });
  }
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.error('page error:', e.message));
  await p.goto(`http://localhost:${port}/promo/${page}`, { waitUntil: 'load' });
  await p.evaluate(() => window.PROMO.ready());
  const { fps, duration, audio } = await p.evaluate(() => ({ fps: PROMO.fps, duration: PROMO.duration, audio: PROMO.audio }));
  const frames = Math.round(fps * duration);
  for (let f = 0; f < frames; f++) {
    await p.evaluate((t) => window.PROMO.seek(t), f / fps);
    await p.screenshot({ path: path.join(tmp, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    if (f % 60 === 0) process.stdout.write(`\r${page}: frame ${f}/${frames}`);
  }
  await b.close(); srv.close();
  const silent = path.join(tmp, 'video.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(fps), '-i', path.join(tmp, '%05d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', silent]);
  if (!audio) { fs.copyFileSync(silent, out); return console.log(`\n${out} (silent)`); }
  // Soundtrack: music bed from an offset, plus hits at given times; fade, then loudness to -14 LUFS.
  const A = (f) => path.join(ROOT, 'promo', 'audio', f);
  const inputs = ['-i', silent, '-ss', String(audio.music.from), '-t', String(duration), '-i', A(audio.music.src)];
  (audio.hits || []).forEach((h) => inputs.push('-i', A(h.src)));
  const fadeOut = audio.fadeOut ?? 1.2;
  let fc = `[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${audio.music.gain ?? 1},afade=t=in:d=${audio.fadeIn ?? 0.05},afade=t=out:st=${(duration - fadeOut).toFixed(2)}:d=${fadeOut}[m]`;
  const mixIn = ['[m]'];
  (audio.hits || []).forEach((h, i) => { const ms = Math.round(h.at * 1000); fc += `;[${i + 2}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${h.gain ?? 1},adelay=${ms}|${ms}[h${i}]`; mixIn.push(`[h${i}]`); });
  fc += `;${mixIn.join('')}amix=inputs=${mixIn.length}:normalize=0:duration=first,atrim=0:${duration},loudnorm=I=-14:TP=-1.5:LRA=11[a]`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-shortest', out]);
  console.log(`\n${out}`);
})().catch((e) => { console.error(e); process.exit(1); });
