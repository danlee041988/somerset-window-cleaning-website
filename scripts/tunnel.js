import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import localtunnel from 'localtunnel';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startTunnel() {
  const port = process.env.PORT ? Number(process.env.PORT) : 4321;
  const outFile = path.join(__dirname, '..', 'tunnel-url.txt');

  try {
    const tunnel = await localtunnel({ port });

    const url = tunnel.url;
    try {
      fs.writeFileSync(outFile, url, 'utf8');
    } catch (_) {
      // ignore file write errors
    }
    // eslint-disable-next-line no-console
    console.log(`Live preview: ${url}`);

    process.on('SIGINT', () => {
      tunnel.close();
      process.exit(0);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start tunnel:', err);
    process.exit(1);
  }
}

startTunnel();


