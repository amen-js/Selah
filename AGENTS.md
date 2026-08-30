# AGENTS.md — Team & AI Agent Conventions

Shared rules for humans and AI coding agents working on this repo. Read this before writing code.

## Project

- **Name:** Selah
- **Stack:**
  - **Frontend / Engine:** Vite + React 19 + TypeScript + Tailwind CSS 4
  - **3D & Physics:** Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`, Rapier (`@react-three/rapier`), character controller `ecctrl`
  - **State & Audio:** `zustand`, `howler`
  - **Backend Proxy:** `hono` + `@hono/node-server` (running on `:8787` for API key protection and SSE streaming)
  - **AI & Integrations:** OpenRouter API (via official `openai` SDK), YouVersion API (multilingual scripture delivery)
  - **Dev & Debug:** `leva` (in-game parameter tuning)
- **One-liner:** Jogo 3D bíblico de mundo aberto no navegador com exploração, grounding bíblico via API da YouVersion e momentos de pausa reflexiva guiada por IA (*Momento Selah*).

## Setup

```bash
# Instalação de dependências
npm install

# Execução em desenvolvimento (frontend + proxy Hono via concurrently)
npm run dev

# Executar somente frontend
npm run dev:client

# Executar somente backend proxy
npm run dev:server

# Build de produção
npm run build
```

## Git Workflow

Lightweight **trunk-based** flow — not full Gitflow. A hackathon timebox doesn't justify a `develop` branch plus release branches.

- `main` is always demoable.
- Every change goes on a short-lived branch off `main`:
  - `feat/<short-name>` — new feature
  - `fix/<short-name>` — bug fix
  - `chore/<short-name>` — tooling, config, docs
- Open a PR into `main` as soon as it works. Branches shouldn't live more than a few hours.
- Delete the branch after merge.
- Need a stable snapshot for submission while dev keeps going? Tag it (`git tag submission-v1`) instead of a release branch.

## Commits — Conventional Commits

`<type>(<scope>): <description>`

Types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `chore`

```
feat(auth): add JWT login endpoint
fix(api): handle empty payload on POST /items
chore(deps): add axios
```

- One logical change per commit.
- Imperative mood ("add", not "added").
- Breaking change → `!` after type/scope, or a `BREAKING CHANGE:` footer.

## Pull Requests

Keep it light — the goal is visibility, not ceremony.

- PR title follows the commit format above.
- Description: what changed, why, how to test (2–4 bullets is plenty).
- Self-merge once it's verified (CI green, or manually tested) — but always through a PR, never a direct push to `main`, so teammates and their AI agents can see what changed.
- Touching the same area as a teammate? Ping before merging to avoid silent overwrites.

## Rules for AI coding agents

- Read this file first. Match existing patterns instead of introducing a new library or approach for something the repo already solves.
- Small, reviewable commits — one task per commit (or a short series), following the convention above.
- Never commit `.env`, keys, or credentials. Confirm `.gitignore` covers them.
- Branch + PR — never push straight to `main`.
- Run lint/build/tests before calling a task done, if the project has them configured.
- Introducing a new convention (folder structure, naming)? Add it here so every agent and teammate picks it up.
- On ambiguous requirements, note the assumption in the PR description instead of silently guessing.

## Code Style & Structure

- **Language:** TypeScript with strict mode enabled.
- **Formatting:** Prettier / ESLint standard conventions.
- **Directory Layout:**
  - `src/components/` — React UI and 3D scene components
  - `src/stores/` — Zustand global stores (game progress, audio, player language)
  - `src/services/` — clientes HTTP do proxy Hono (`selahGateway`) e TTS (`tts.ts`)
  - `public/models/` — CC0 3D models and assets (.glb)
  - `server/` — proxy Hono (`app.ts`, rotas em `index.ts`)
  - `server/data/` — allowlist de passagens, snapshot de versículos e quizzes de fallback
  - `server/services/` — YouVersion, OpenRouter (ZDR), validação, sessão de quiz e métricas agregadas

## Claude Code specifically

Claude Code reads `CLAUDE.md`, not `AGENTS.md`, directly. Keep one source of truth with a one-line `CLAUDE.md` at the repo root:

```
@AGENTS.md
```

This works cross-platform (including Windows, no admin needed). A symlink (`ln -s AGENTS.md CLAUDE.md`) also works, but only on macOS/Linux. Either way, Claude Code ends up reading the exact same rules as everything else pointed at this file.
