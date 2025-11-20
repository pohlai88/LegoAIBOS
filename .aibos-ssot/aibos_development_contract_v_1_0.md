# 📜 AI-BOS Development Contract

## Metadata
- **Document ID**: AI-BOS-CONTRACT-v1  
- **Version**: 1.0.0  
- **Status**: Active  
- **Date Issued**: 2025-11-20  
- **Authors**: Jack + ChatGPT  
- **Review Cycle**: Quarterly (or upon major architectural change)  
- **Reasoning / Purpose**:  
  To establish non-negotiable guardrails for architecture, coding, and process.  
  This contract prevents drift across AI/codegen tools and ensures modular, safe, reversible development.

---

## 1. Scope
This contract applies to:
- Kernel, SDK, adapters, and all modules  
- All AI/codegen contributions  
- All human developer contributions

It defines **rules, responsibilities, and KPIs** that must be respected before any code is merged.

---

## 2. Architecture Guardrails

### 2.1 Kernel
- Owns authentication, tenants, global navigation, event bus, app registry  
- Provides SDK + adapter interfaces  
- Enforces modular boundaries

### 2.2 Modules
- Own their DB schema & migrations  
- Own domain services & APIs  
- Own UI surfaces (routes, cards, panels) registered via adapter

### 2.3 Rules
- ❌ No cross‑module DB imports  
- ✅ Communication only via kernel APIs/events or explicit public contracts  
- ❌ No shortcut imports bypassing SDK/adapter pattern  
- ❌ Kernel must not contain domain-specific business logic (e.g. accounting rules)

---

## 3. Coding Standards

- Language: **TypeScript** (strict mode)  
- ESLint: **0 errors allowed**  
- No `any` unless explicitly justified with comment **and** ADR reference  
- Async/await consistency; no floating promises  
- Errors must be handled or clearly propagated (no silent failures)

### 3.1 Frontend
- Use **design tokens SSOT** (tokens file + tokens README)  
- No raw Tailwind/hardcoded colors or spacing when tokens exist  
- Follow existing component patterns and UI kit  
- Maintain basic accessibility (labels, focus, ARIA where appropriate)

### 3.2 Database Code
- All DB access goes through module-local repositories/services  
- Schema changes are expressed via migrations, never ad-hoc  
- No inline SQL scattered across unrelated files

---

## 4. Process Rules

- **Surgical patches only** (aim ≤ ~220 lines per diff)  
- **One concern per patch** (bug OR feature OR refactor, not mixed without explicit note)  
- **No silent rewrites** — refactors must be explicitly declared in the description  
- **Backwards compatibility** by default; breaking changes require versioned APIs (v2) or shims  
- **Design-first**: every task starts with a short design slice before code (plain + technical)

**Task framing (required for humans + AI):**
1. Mission (1–2 sentences)  
2. Non-goals (what is out of scope)  
3. Location (modules/files)  
4. Output format (diff vs new file vs docs only)

---

## 5. KPIs

- **Type errors**: 0 in touched modules  
- **Lint errors**: 0 in changed files  
- **Architecture violations**: 0 (no cross‑module DB or imports; no new kernel domain logic)  
- **Test coverage**: kernel + accounting ≥ 70% over time  
- **Module integration time**: new module (with adapter) can be plugged into kernel in hours, not days

---

## 6. Documentation & Traceability

- Short, precise comments only (no noise)  
- ADRs for major decisions (e.g. `ADR-012: Accounting module exposes JournalEntry API via kernel adapter`)  
- README updates whenever module public contracts or setup steps change

### 6.1 ADR Template

```markdown
# ADR-XXX: [Title]

- **Date**: YYYY-MM-DD
- **Author**: [Name]
- **Status**: Proposed | Accepted | Superseded
- **Context**: What problem are we solving?
- **Decision**: What rule/architecture change is made?
- **Consequences**: Impact on modules, kernel, DX/UX
- **References**: Related contract section(s)
```

---

## 7. Vocabulary (Consistency)

Use these terms consistently in code, docs, and prompts:

- **Kernel** = control plane / OS shell  
- **Module** = bounded context / app (Accounting, Inventory, etc.)  
- **Adapter** = plugin interface implementing the Kernel SDK contract  
- **SDK** = standard "plug" through which modules talk to Kernel  
- **Manifest / schema / entity** = structured module definitions for data/API/UI  
- **Repository** = module-local data access layer  
- **Service** = module-local business logic using repositories

---

## 8. Enforcement

- Pre‑commit hooks (recommended minimum):  
  - `tsc --noEmit`  
  - `eslint .` (or staged files)  
- CI checks (required for protected branches):  
  - Typecheck must pass  
  - ESLint must pass  
  - Core test suites should run for affected modules where available

The contract is **living**: when new patterns/decisions emerge, update via versioning + ADRs.

---

## 9. Versioning Policy

- **MAJOR**: Breaking architectural or process changes  
- **MINOR**: New rules or KPIs added, backwards compatible  
- **PATCH**: Clarifications, typo fixes, metadata updates

Changes require:
- Version bump (MAJOR.MINOR.PATCH)  
- Author + date recorded in Metadata  
- Reasoning captured in an ADR entry

---

## 10. AI Usage Rules

Any AI/codegen tool (including ChatGPT) must:

1. Be explicitly instructed to follow this contract (`AI-BOS-CONTRACT-v1`, version 1.0.0).  
2. Receive the task framing (Mission, Non-goals, Location, Output format).  
3. Produce a short design slice before code (plain + technical).  
4. Output **surgical patches** that respect architecture & coding rules (no giant rewrites).  
5. Call out any place where the contract cannot be followed and propose either:  
   - A smaller, compliant alternative, or  
   - An ADR to update the contract.

---

✅ This contract is the SSOT for AI-BOS development. If code, tools, or habits drift, this document pulls them back to a consistent, modular, and auditable path.

