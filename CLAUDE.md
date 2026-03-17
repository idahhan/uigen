# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # First-time setup: install deps, generate Prisma client, run migrations
npm run dev            # Start dev server (Turbopack) at http://localhost:3000
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Run all Vitest tests
npx vitest run <file>  # Run a single test file
npm run db:reset       # Reset SQLite database (destructive)
```

All `dev`/`build`/`start` commands require the `node-compat.cjs` shim, which is handled automatically via `NODE_OPTIONS` in the scripts.

## Environment

- `ANTHROPIC_API_KEY` in `.env` — optional. Without it, the app uses a `MockLanguageModel` that returns hardcoded Counter/Form/Card components.

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in chat; Claude generates/edits files in a virtual file system; a sandboxed iframe renders a live preview.

### Request Flow

```
User chat message
  → POST /api/chat  (Vercel AI SDK streamText, up to 40 tool steps, 120s max)
  → Claude uses tools: str_replace_editor (view/create/str_replace/insert/undo) and file_manager (rename/delete)
  → FileSystemProvider applies tool calls to VirtualFileSystem
  → PreviewFrame re-renders: Babel transpiles JSX → import map → sandboxed iframe HTML
  → If authenticated + projectId: project saved to Prisma (SQLite)
```

### Key Modules

| Path | Role |
|---|---|
| `src/app/api/chat/route.ts` | Streaming AI endpoint; wires tools to VirtualFileSystem |
| `src/lib/file-system.ts` | In-memory VirtualFileSystem (Map-based, serializable) |
| `src/lib/contexts/file-system-context.tsx` | React context that owns VirtualFileSystem state; executes AI tool calls |
| `src/lib/contexts/chat-context.tsx` | Wraps Vercel AI SDK `useChat`; routes tool results to FileSystemContext |
| `src/lib/transform/jsx-transformer.ts` | Babel standalone transpilation → import map → preview HTML; uses esm.sh CDN for third-party packages |
| `src/components/preview/PreviewFrame.tsx` | Sandboxed iframe; auto-detects entry point (App.jsx/tsx, index.jsx/tsx) |
| `src/lib/provider.ts` | Returns Anthropic Claude (claude-haiku-4-5) or MockLanguageModel |
| `src/lib/prompts/generation.tsx` | System prompt (instructs Claude to use Tailwind, virtual FS, App.jsx as entry) |
| `src/lib/auth.ts` | JWT sessions via HttpOnly cookies (7-day expiry) |
| `src/actions/` | Next.js Server Actions for project CRUD |

### Database

Prisma + SQLite (`prisma/dev.db`). Two models: `User` (email/password) and `Project` (name, messages JSON, data JSON). Projects are soft-owned — userId is optional, supporting anonymous use.

### Testing

Tests live in `__tests__/` directories colocated with source. The largest suite is `src/lib/__tests__/file-system.test.ts`. Test environment is jsdom via Vitest.
