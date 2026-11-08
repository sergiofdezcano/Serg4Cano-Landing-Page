// Levanta el preview, saca las capturas de escritorio y móvil y lo para.
// Lo usa la AI Software Factory como evidencia. Requiere `npm run build` antes.
// Las capturas van a $FACTORY_EVIDENCE_DIR o, si no existe, a .impeccable/review.
import { spawn, execFileSync, execFile } from 'node:child_process';

const port = 4323;
const url = `http://localhost:${port}/Serg4Cano-Landing-Page/`;
const out = process.env.FACTORY_EVIDENCE_DIR ?? '.impeccable/review';

const server = spawn(`npx astro preview --port ${port}`, { shell: true, stdio: 'ignore' });
const stop = () => {
  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    } catch {}
  } else {
    server.kill('SIGTERM');
  }
};

try {
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {}
    if (Date.now() > deadline) throw new Error(`El preview no respondió en ${url}`);
    await new Promise((r) => setTimeout(r, 500));
  }
  await new Promise((resolve, reject) =>
    execFile(process.execPath, ['scripts/screenshot.mjs', url, out], (err, stdout, stderr) => {
      process.stdout.write(stdout);
      process.stderr.write(stderr);
      err ? reject(err) : resolve();
    }),
  );
  console.log(`Capturas en ${out}`);
} finally {
  stop();
}
