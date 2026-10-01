---
name: verify-local
description: "Verify 2ndbrain changes using the repository-owned local verification recipe. Use for changes to the React Router app, SQLite data layer, or Node server before relying on staging."
user_invocable: true
codepress_generated: true
---

# Verify 2ndbrain locally

Use `.codepress/verify-local/recipe.json` as the source of required setup and static checks. This repository is a single React Router v7 application with a Node server and SQLite database; it has no separate frontend/backend packages, no test or lint script, and no committed test database fixture.

## 1. Inventory the change and define claims

Read the relevant project files and inspect the diff. Write one observable claim for each changed behavior before choosing probes. For example:

- A visible canvas change should render on `/` with the expected heading, controls, and composer.
- A loader or database change should return nodes and attributes from the expected SQLite columns.
- An API action should accept and reject the documented form fields without calling OpenAI in a test.

The home route is public and has no auth middleware. Chat generation calls the OpenAI Responses API through `OPENAI_API_KEY`; do not call it during local verification unless the change specifically requires the external integration. Use synthetic data and never put real credentials into a report or committed file.

## 2. Choose a supported execution path

### Developer device

Use Node 20, 22, 23, or 24 because the repository's `better-sqlite3` dependency does not support Node 25. From the repository root, run the recipe setup command (`npm ci`) and every recipe check: `npm run typecheck` and `npm run build`. These are required checks. The repository currently defines no `test` or `lint` script; do not report either as having run.

For UI or backend behavior that needs the local app, run `npm run dev -- --host 0.0.0.0` on the developer device with a disposable `DATABASE_URL` and a non-production placeholder `OPENAI_API_KEY` when needed to initialize the chat route. Use port 5173 and verify readiness with `GET /`. Do not use production data or a real OpenAI request.

The current fresh-database bootstrap has a known schema mismatch: `app/db/db.server.ts` creates legacy node column names and does not create the `attributes` table, while `app/db/schema.ts` and the route loader expect `next_node`, `prev_node`, and `attributes`. A fresh SQLite file therefore does not prove the UI path works. Before probing the loader, prepare a disposable database with the schema expected by `app/db/schema.ts`, point `DATABASE_URL` to it, and record that fixture in the report. If no safe fixture can be prepared, report the loader assertion as FAIL with the observed error; do not relabel it as a tooling block or use an app-shell screenshot as proof.

At the pinned base, `npm run typecheck` also fails on existing React Flow `NodeProps` typing in `IdeaNode.tsx`, `AttributeNode.tsx`, and `IdeaFlowCanvas.tsx`, plus `Fetcher.submit` typing in `ChatPrompt.tsx` and `CreateAttributeModal.tsx`. Keep `typecheck` as a required recipe check so the failure remains visible; do not weaken or remove it to obtain a green result. `npm run build` passes.

### CodePress cloud runner

The runner is a control plane and must not host this repository's app server. For self-contained commands, first use the coding workspace if the session exposes `start_coding` and `coding_workspace_operation`: call `start_coding` once, then perform setup, readiness, and bounded commands through `coding_workspace_operation` in the returned workspace. Never silently switch execution planes after a failed coding transition.

If coding-workspace execution is unavailable, use only the backend-issued `verify_environment` lifecycle that is authorized for the session. Operate on its returned opaque environment reference and attempt; run setup, services, and only check IDs returned in its manifest. Do not provide arbitrary commands to that tool. If neither supported execution path is available, report the exact capability gap and use the existing verification escape rather than starting a server in the runner or switching to an unsupported verification path.

## 3. Run the recipe checks and behavior probes

Run every required recipe check. Record its exact command, working directory, exit code, and concise output. Then probe each changed behavior with an assertion that exercises the actual application path. Typecheck and build results are useful static evidence but do not replace runtime evidence for changed routes, API actions, UI interactions, or database behavior.

Use a temporary SQLite database and synthetic rows for local node/attribute behavior. Avoid `/api/chat` for fixture creation because that route calls OpenAI. Do not treat an unchanged dependency install or a successful setup command as verification.

Use `verify-staging` only for effects that require a deployed environment, credentials unavailable locally, production-like service wiring, or external integrations. Keep locally provable Node, UI, route, and SQLite behaviors in local verification even when some unrelated claim needs staging. If staging has not been provisioned, name only the unsupported claim and its concrete prerequisite.

## 4. Preserve QA source and evidence

Keep reusable tests and fixtures in the repository's established package test layout. When standalone QA code is needed, add a `qa/<feature-slug>/README.md` catalog with stable scenario IDs, source paths, exact commands and working directories, plane, prerequisite names, assertions, cleanup, and output paths. Commit reusable specs and safe synthetic fixtures; keep databases, logs, screenshots, traces, and reports in ignored or per-run temporary locations.

Bind the report to the full checked-out commit SHA and distinguish source references from execution evidence. Include an assertion row for every recipe check and every feature-specific behavior claim. Record FAIL when a check fails. Use BLOCKED only when a concrete external or human prerequisite prevents the supported probe; missing packages, a missing report, a first failed request, and unsupported setup are not human blockers. Before declaring a recoverable setup, product, or tool failure incomplete, record at least two materially different supported recovery attempts, capped at three per item, and stop on success. Stop owned resources and record logs when a probe fails.

## 5. Pre-QA falsification

Before an exact-head QA campaign whose correctness depends on ordering, locks, cleanup, check-then-act behavior, cross-transport delivery, retries, or idempotency, read `codepress factory skill --name falsify-diff` and `codepress factory skill --name falsifier`. Follow their exact-SHA repo-less snapshot, integrity, dispatch, and cleanup contract before QA. Do not copy a release-specific prompt or helper into this repository. For a change without those surfaces, record that falsification was not applicable.

## 6. Report honestly

Include the environment identity, exact head, checks run, feature assertions, results, and concise observed evidence. Keep credentials and production values out of output. A verification report does not prove more than the assertions it contains; a blocked environment is not a PASS, and a successful build does not prove the application route or OpenAI integration works.
