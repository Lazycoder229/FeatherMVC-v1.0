import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { notFound } from '../middleware/notFound.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIEWS_DIR = path.resolve(__dirname, '../views');

function interpolate(html, data = {}) {
  return html.replace(/{{\s*(\w+)\s*}}/g, (_, key) =>
    key in data ? String(data[key]) : ''
  );
}

export async function render(res, viewPath, data = {}, options = {}) {
  const layout = options.layout || 'layouts/main.html';

  try {
    // ✅ Detect JS pages
    if (viewPath.endsWith('.js')) {
      const pageFile = path.join(VIEWS_DIR, viewPath);
      const moduleUrl = pathToFileURL(pageFile).href;

      // Import JS page module
      const pageModule = await import(moduleUrl);
      const pageData = pageModule.default();

      // Merge data passed from controller with page data
      const mergedData = { ...pageData, ...data };

      // Load layout HTML
      const layoutFile = path.join(VIEWS_DIR, layout);
      const shell = await readFile(layoutFile, 'utf8');

      // Replace placeholders
      const html = shell.replace('{{content}}', mergedData.content);
      res.set('Content-Type', 'text/html; charset=UTF-8');
      return res.send(interpolate(html, mergedData));
    }

    // 📄 Default HTML page handling
    const pageFile = path.join(VIEWS_DIR, viewPath);
    const layoutFile = path.join(VIEWS_DIR, layout);

    const [page, shell] = await Promise.all([
      readFile(pageFile, 'utf8'),
      readFile(layoutFile, 'utf8')
    ]);

    const pageOut = interpolate(page, data);
    const html = shell.replace('{{content}}', pageOut);
    res.set('Content-Type', 'text/html; charset=UTF-8');
    return res.send(interpolate(html, data));

  } catch (err) {
    if (err.code === 'ENOENT') {
      return notFound({ url: viewPath }, res);
    }
    throw err;
  }
}
