import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIEWS_DIR = path.resolve(__dirname, '../views');

function interpolate(html, data = {}) {
  return html.replace(/{{\s*(\w+)\s*}}/g, (_, key) =>
    key in data ? String(data[key]) : ''
  );
}

export async function notFound(req, res) {
  const layoutFile = path.join(VIEWS_DIR, 'layouts/main.html');
  const pageFile = path.join(VIEWS_DIR, 'pages/404.html');

  const [page, shell] = await Promise.all([
    readFile(pageFile, 'utf8'),
    readFile(layoutFile, 'utf8')
  ]);

  const pageOut = interpolate(page, { title: '404 Not Found' });
  const html = shell.replace('{{content}}', pageOut);

  res.status(404).set('Content-Type', 'text/html; charset=UTF-8');
  res.send(interpolate(html, { title: '404 Not Found' }));
}
