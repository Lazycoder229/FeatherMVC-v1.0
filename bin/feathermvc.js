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

// ---------- AUTH TEMPLATES ----------
const jwtControllerTemplate = `import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config/auth.js";

export default {
  async login(req, res) {
    const { username, password } = req.body;
    const user = { id: 1, username: "admin", passwordHash: await bcrypt.hash("password", 10) };

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    res.json({ token });
  },

  async register(req, res) {
    if (!config.allowRegistration) return res.status(403).json({ message: "Registration disabled" });
    res.json({ message: "User registered (example)" });
  }
};
`;

const jwtMiddlewareTemplate = `import jwt from "jsonwebtoken";
import config from "../config/auth.js";

export default function (req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
}
`;

const sessionControllerTemplate = `export default {
  async login(req, res) {
    const { username, password } = req.body;
    if (username === "admin" && password === "password") {
      req.session.user = { id: 1, username };
      res.json({ message: "Logged in" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  },
  async logout(req, res) {
    req.session.destroy(() => res.json({ message: "Logged out" }));
  }
};
`;

const sessionMiddlewareTemplate = `export default function (req, res, next) {
  if (!req.session.user) return res.status(401).json({ message: "Not logged in" });
  next();
}
`;

const authRouteTemplate = `import { Router } from "express";
import AuthController from "../controllers/AuthController.js";

const router = Router();
router.post("/login", AuthController.login);
router.post("/register", AuthController.register || ((req,res)=>res.status(404).end()));
router.post("/logout", AuthController.logout || ((req,res)=>res.status(404).end()));

export default router;
`;
// ------------------------------------

if (!cmd) {
  console.log('Usage: feather <make:controller|make:model|make:route|make:page|make:auth|run> <Name>');
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

    const pagePath = path.join('src', 'views', 'pages', `${n}.js`);
    ensure(path.dirname(pagePath));
    writeFileSync(pagePath, templates.page(n));
    console.log('✅ Created', pagePath);

    const ctrlPath = path.join('src', 'controllers', `${Name}Controller.js`);
    ensure(path.dirname(ctrlPath));
    writeFileSync(ctrlPath, templates.controller(Name));
    console.log('✅ Created', ctrlPath);

    const routePath = path.join('src', 'routes', `${n}.js`);
    ensure(path.dirname(routePath));
    writeFileSync(routePath, templates.route(n));
    console.log('✅ Created', routePath);

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
  case 'make:auth': {
    const type = (name || 'jwt').toLowerCase();
    ensure(path.join('src', 'controllers'));
    ensure(path.join('src', 'routes'));
    ensure(path.join('src', 'middleware'));
    ensure(path.join('src', 'config'));

    const configPath = path.join('src', 'config', 'auth.js');
    const configContent = `export default {
  method: "${type}",
  jwtSecret: process.env.JWT_SECRET || "changeme",
  jwtExpiresIn: "1h",
  sessionSecret: process.env.SESSION_SECRET || "changeme",
  allowRegistration: true
};
`;
    writeFileSync(configPath, configContent);
    console.log('✅ Created', configPath);

    const ctrlPath = path.join('src', 'controllers', 'AuthController.js');
    writeFileSync(ctrlPath, type === 'jwt' ? jwtControllerTemplate : sessionControllerTemplate);
    console.log('✅ Created', ctrlPath);

    const mwPath = path.join('src', 'middleware', 'authMiddleware.js');
    writeFileSync(mwPath, type === 'jwt' ? jwtMiddlewareTemplate : sessionMiddlewareTemplate);
    console.log('✅ Created', mwPath);

    const routePath = path.join('src', 'routes', 'auth.js');
    writeFileSync(routePath, authRouteTemplate);
    console.log('✅ Created', routePath);

    const indexPath = path.join('src', 'routes', 'index.js');
    if (existsSync(indexPath)) {
      let content = readFileSync(indexPath, 'utf8');
      const importLine = `import authRoutes from './auth.js';`;
      const useLine = `router.use('/auth', authRoutes);`;
      if (!content.includes(importLine)) {
        content = importLine + '\n' + content;
      }
      if (!content.includes(useLine)) {
        content = content.replace(/(export default router;)/, `${useLine}\n$1`);
      }
      writeFileSync(indexPath, content);
      console.log('🔗 Added auth routes to index.js');
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
  make:page <name>       → Create page, controller, route, auto-register
  make:controller <name> → Create only a controller
  make:model <name>      → Create a model
  make:route <name>      → Create a route
  make:auth [jwt|session]→ Create auth scaffold
  run dev                → Run dev server using nodemon
  help                   → Show this help

Examples:
  feather make:page about
  feather make:controller blog
  feather make:auth jwt
  feather run dev
    `);
  }
}
