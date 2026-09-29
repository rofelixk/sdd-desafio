---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
handoffs:
  - label: Analyze For Consistency
    agent: speckit.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: speckit.implement
    prompt: Start the implementation in phases
    send: true
scripts:
  sh: scripts/bash/setup-tasks.sh --json
  ps: scripts/powershell/setup-tasks.ps1 -Json
  py: scripts/python/setup_tasks.py --json
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before tasks generation)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_tasks` key
- If the YAML cannot be parsed or is invalid, do not skip silently: tell the user that `.specify/extensions.yml` could not be read (include the parser error) and that no hooks were checked, including any mandatory (`optional: false`) hooks registered there, then continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal `{command}` id shown above, e.g. a skills-mode agent runs it as `/skill:speckit-...` or `$speckit-...`). Emitting the block alone does not run the hook.
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

1. **Setup**: Run `{SCRIPT}` from repo root and parse FEATURE_DIR, TASKS_TEMPLATE_CONTENT, TASKS_TEMPLATE, and AVAILABLE_DOCS list. `FEATURE_DIR` and `TASKS_TEMPLATE` must be absolute paths when provided. `AVAILABLE_DOCS` is a list of document names/relative paths available under `FEATURE_DIR` (for example `research.md` or `contracts/`). For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load design documents**: Read from FEATURE_DIR:
   - **Required**: spec.md (rules `RN-NNN`, ambiguities `AMB-NNN`, edge cases, rule application order), plan.md (stack, architecture, test strategy)
   - **Optional**: DECISIONS.md (spec change log), data-model.md, contracts/, research.md, quickstart.md
   - **IF EXISTS**: Load `/memory/constitution.md` for project principles and governance constraints
   - **IF EXISTS**: the current `tasks.md` — existing task IDs and their `[x]` state MUST be preserved

3. **Execute task generation workflow**:
   - Extract every `RN-NNN` and `AMB-NNN` from spec.md, plus every edge case of the edge-case table
   - Extract stack, architecture boundaries and test naming convention from plan.md
   - Generate tasks following the Task Generation Rules below, grouped in the phases of the template
   - Validate coverage: every `RN-NNN` and every `AMB-NNN` is referenced by at least one task's `Atende:` field; list uncovered IDs explicitly instead of silently skipping them

4. **Generate tasks.md**: Use TASKS_TEMPLATE_CONTENT (from the JSON output above) as the structure. For compatibility with older setup scripts that omit TASKS_TEMPLATE_CONTENT, read TASKS_TEMPLATE instead. Keep the template headings, phase names and the "Cobertura" table, and fill:
   - Fase 1 — Fundação (project setup, I/O skeleton, money representation)
   - Fase 2 — Regras de negócio (one or more tasks per `RN-NNN` / `AMB-NNN`)
   - Fase 3 — Casos de borda (from the spec's edge-case table)
   - Fase 4 — Saída e CLI
   - Fase 5 — Envelope: keep the placeholder section; do not invent tasks for it
   - Cobertura: one row per `RN-NNN` / `AMB-NNN` → task(s) → test name(s)
   - Write the content in Portuguese (pt-BR), matching the template

## Mandatory Post-Execution Hooks

**You MUST complete this section before reporting completion to the user.**

Check if `.specify/extensions.yml` exists in the project root.
- If it does not exist, or no hooks are registered under `hooks.after_tasks`, skip to the Completion Report.
- If it exists, read it and look for entries under the `hooks.after_tasks` key.
- If the YAML cannot be parsed or is invalid, do not skip silently: tell the user that `.specify/extensions.yml` could not be read (include the parser error) and that no hooks were checked, including any mandatory (`optional: false`) hooks registered there, then continue to the Completion Report.
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Mandatory hook** (`optional: false`) — **You MUST emit `EXECUTE_COMMAND:` for each mandatory hook**:
    ```
    ## Extension Hooks

    **Automatic Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal `{command}` id shown above, e.g. a skills-mode agent runs it as `/skill:speckit-...` or `$speckit-...`). Emitting the block alone does not run the hook.
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```


## Completion Report

Output path to generated tasks.md and summary:
- Total task count and count per phase
- Coverage: which `RN-NNN` / `AMB-NNN` are covered, and any that are NOT (must be empty or justified)
- Parallel opportunities identified (`[P]` tasks)
- Format validation: Confirm ALL tasks follow the format below (checkbox, `T-NNN`, `Atende`, `Aceite`, `Commit`)

Context for task generation: {ARGS}

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be traceable to the spec. The traceability chain `RN/AMB → T-NNN → commit → test` is the primary organizing principle, not user stories.

**Tests are MANDATORY**: every business rule (`RN-NNN`) and every decided ambiguity (`AMB-NNN`) needs an automated test. Every task's acceptance criterion is, whenever possible, "the test X passes". Test names reference the rule ID, following the naming convention from plan.md.

**One task = one commit**: size each task so it fits in a single commit `feat(T-NNN): ...` / `test(T-NNN): ...`. If the acceptance criterion cannot be expressed as "test X passes", split the task.

### Task Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] **T-NNN** — [P?] Description with file path
  - **Atende:** RN-NNN, AMB-NNN
  - **Aceite:** <the test that must pass>
  - **Commit:** `<hash preenchido depois>`
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: `T-NNN` in bold, three digits with hyphen (`T-001`, `T-002`...), sequential in execution order
3. **[P] marker**: OPTIONAL. Include ONLY if the task is parallelizable (different files, no dependencies on incomplete tasks)
4. **Description**: Clear action, with the exact file path when the task touches code
5. **Atende**: REQUIRED for phases 2–5 — the spec IDs the task implements. Phase 1 tasks may use `Atende: (infraestrutura)`
6. **Aceite**: REQUIRED — verifiable without reading the code, normally a named test
7. **Commit**: REQUIRED placeholder, filled in after the commit

**Numbering rules**:

- NEVER restart or renumber existing task IDs — numbering is the traceability axis
- When tasks.md already exists, keep existing tasks (including `[x]` state and filled `Commit:` hashes) and continue numbering from the highest existing ID
- Removed/obsolete tasks are struck through (`~~T-007~~`) with a pointer to the `DECISIONS.md` entry, never deleted

**Examples**:

- ✅ CORRECT:
  ```text
  - [ ] **T-004** — Aplicar teto diário de alimentação em src/regras/alimentacao.py
    - **Atende:** RN-003, AMB-002
    - **Aceite:** `test_rn003_teto_diario_alimentacao` passa
    - **Commit:** `<hash preenchido depois>`
  ```
- ✅ CORRECT: `- [ ] **T-009** — [P] Casos de borda de data inválida em tests/test_bordas.py` (with its three fields)
- ❌ WRONG: `- [ ] T004 [US1] Aplicar teto` (speckit default format — use `T-NNN` and `Atende:`)
- ❌ WRONG: task without `Atende:` in phases 2–5
- ❌ WRONG: `**Aceite:** funciona corretamente` (not verifiable)

## Done When

- [ ] tasks.md generated with template phases, `T-NNN` IDs, `Atende`/`Aceite`/`Commit` fields and the Cobertura table
- [ ] Every `RN-NNN` / `AMB-NNN` covered or explicitly listed as uncovered
- [ ] Extension hooks dispatched or skipped according to the rules in Mandatory Post-Execution Hooks above
- [ ] Completion reported to user with task count, coverage and parallel opportunities
