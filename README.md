# LiteMVC-Express

Minimal MVC framework on Node.js (Express) + MySQL with plain HTML/CSS/JS.

## Requirements
- Node.js 18+
- MySQL 8+ (or MariaDB)

## Installation
```bash
npm install
cp .env.example .env
# edit .env with your DB credentials
```

## Commands

### Start development server
```bash
feather run dev
```
Starts with `nodemon` so it restarts on file changes.

### Start production server
```bash
feather start
```

### Run migrations
```bash
feather run migrate
```

### CLI (Scaffolding)
```bash
feather run cli -- <command> <Name>
```
Commands:


FeatherMVC CLI Commands:
- `make:page <name>`   → `Create HTML page, controller, route, and auto-register`
- `make:controller`    → `Create only a controller`
  -`make:model`         → `Create a model`
  -`make:route`         → `Create a route`
  -`help`               → `Show this help message`

Example:
```bash
feathermvc:page blog
```

## Add a new package
```bash
npm install package-name
```
Or for dev dependency:
```bash
npm install -D package-name
```

## Project Structure
```
myapp/
├─ bin/                # CLI scripts
├─ db/                 # migrations and runner
├─ public/             # static assets
├─ src/
│  ├─ config/          # DB config
│  ├─ controllers/     # request handlers
│  ├─ lib/             # view engine
│  ├─ middleware/      # custom middleware
│  ├─ models/          # DB models
│  ├─ routes/          # route definitions
│  ├─ views/           # layouts and pages
│  └─ server.js        # app entry
└─ .env.example        # environment template
```

## First Run
```bash
npm install
cp .env.example .env
# edit .env for DB settings
npm run migrate
npm run dev
# visit http://localhost:3000
```
