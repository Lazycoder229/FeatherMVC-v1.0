#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function ensure(dir) { mkdirSync(dir, { recursive: true }); }

const [,, cmd, name] = process.argv;

const templates = {
  controller: (Name) => `import { render } from '../lib/view.js';
export default {
  async index(req, res) { return render(res, 'pages/${Name.toLowerCase()}.js', { title: '${Name}' }); }
};
`,
  route: (name) => `import { Router } from 'express';
import Ctrl from '../controllers/${capitalize(name)}Controller.js';
const router = Router();
router.get('/', Ctrl.index);
export default router;
`,
  model: (Name) => `import { query } from '../config/db.js';
export const ${Name} = {
  async all(){ return query('SELECT * FROM ${Name.toLowerCase()}'); }
};
`,
  page: (name) => `export default function ${capitalize(name)}Page() {
  return {
    title: "${capitalize(name)}",
    content: \`
      <section>
        <h2>${capitalize(name)}</h2>
        <p>Scaffolded page.</p>
      </section>
    \`
  };
}
`
};

if (!cmd) {
  console.log('Usage: feather <make:controller|make:model|make:route|make:page|run> <Name>');
  process.exit(1);
}

switch (cmd) {
  case 'make:controller': {
    const Name = capitalize(name || 'Sample');
    const p = path.join('src', 'controllers', `${Name}Controller.js`);
    ensure(path.dirname(p));
    writeFileSync(p, templates.controller(Name));
    console.log('✅ Created', p);
    break;
  }
  case 'make:model': {
    const Name = capitalize(name || 'Sample');
    const p = path.join('src', 'models', `${Name}.js`);
    ensure(path.dirname(p));
    writeFileSync(p, templates.model(Name));
    console.log('✅ Created', p);
    break;
  }
  case 'make:route': {
    const n = (name || 'sample').toLowerCase();
    const p = path.join('src', 'routes', `${n}.js`);
    ensure(path.dirname(p));
    writeFileSync(p, templates.route(n));
    console.log('✅ Created', p);
    break;
  }
  case 'make:page': {
    const n = (name || 'sample').toLowerCase();
    const Name = capitalize(n);

    // 1. Create JS page instead of HTML
    const pagePath = path.join('src', 'views', 'pages', `${n}.js`);
    ensure(path.dirname(pagePath));
    writeFileSync(pagePath, templates.page(n));
    console.log('✅ Created', pagePath);

    // 2. Create controller
    const ctrlPath = path.join('src', 'controllers', `${Name}Controller.js`);
    ensure(path.dirname(ctrlPath));
    writeFileSync(ctrlPath, templates.controller(Name));
    console.log('✅ Created', ctrlPath);

    // 3. Create route
    const routePath = path.join('src', 'routes', `${n}.js`);
    ensure(path.dirname(routePath));
    writeFileSync(routePath, templates.route(n));
    console.log('✅ Created', routePath);

    // 4. Auto-register in routes/index.js
    const indexPath = path.join('src', 'routes', 'index.js');
    if (existsSync(indexPath)) {
      let content = readFileSync(indexPath, 'utf8');
      const importLine = `import ${n}Routes from './${n}.js';`;
      const useLine = `router.use('/${n}', ${n}Routes);`;

      if (!content.includes(importLine)) {
        content = importLine + '\n' + content;
      }
      if (!content.includes(useLine)) {
        content = content.replace(/(export default router;)/, `${useLine}\n$1`);
      }
      writeFileSync(indexPath, content);
      console.log('🔗 Added route to index.js');
    } else {
      console.warn('⚠ src/routes/index.js not found — skipping auto-register.');
    }
    break;
  }
  case 'run': {
    const target = name || 'dev';
    if (target === 'dev') {
      console.log('🚀 Starting dev server with nodemon...');
      const child = spawn('nodemon', ['src/index.js'], { stdio: 'inherit', shell: true });
      child.on('exit', code => process.exit(code));
    } else {
      console.error(`❌ Unknown run target: ${target}`);
    }
    break;
  }
  case 'help':
  default: {
    console.log(`
Feather CLI Commands:
  make:page <name>   → Create JS page, controller, route, and auto-register
  make:controller    → Create only a controller
  make:model         → Create a model
  make:route         → Create a route
  run dev            → Run development server using nodemon
  help               → Show this help message

Examples:
  feather make:page about
  feather make:controller blog
  feather run dev
    `);
  }
}
