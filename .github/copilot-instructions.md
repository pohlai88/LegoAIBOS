# AI-BOS Copilot Instructions

## Architecture Overview

**AI-BOS** is a modular "Lego-style" ERP platform with strict separation between the Kernel (control plane) and pluggable Modules (domain apps like Accounting, Inventory).

### Monorepo Structure (Authoritative)
Even if the current repo is flat, **all code contributions must assume the monorepo layout** described in `aibos_kernel_boilerplate_scaffold_v_1_0.md`:
- **Kernel** (`apps/kernel/`): Authentication, tenant context, event bus, app registry, adapter loading. Zero domain logic.
- **Modules** (`apps/*/`): Own their DB schema, services, UI, and business rules. Register via adapters.
- **SDK** (`packages/kernel-sdk/`): Public contracts (AppManifest, KernelContext, events) used by all modules.
- **Tests** (`tests/kernel/`): Core validation tests for manifest, adapters, events.

### Critical Rules (Non-negotiable)
1. **No cross-module DB imports** — modules communicate only via kernel APIs/events or explicit public contracts
2. **No shortcut imports** — `apps/*` cannot import other `apps/*` directly (enforced by ESLint in `.eslintrc.cjs`)
3. **Kernel has no domain logic** — accounting rules, inventory calculations, etc. belong in modules
4. **Design tokens when available** — once design tokens are established, use them exclusively; no hardcoded colors/spacing

### Anti-Patterns (Do NOT Do)
- ❌ Import another module's DB schema: `import { Invoice } from "../../invoicing/db/schema"`
- ❌ Bypass kernel SDK: `import { AccountingService } from "../../accounting/services"`
- ❌ Add domain logic to kernel: accounting rules, inventory calculations in `apps/kernel/`
- ❌ Hardcode UI styles when tokens exist: `style={{ color: '#1a73e8' }}` instead of using design tokens

## Development Workflow

### Task Framing (Required for every task)
```
Mission: [1-2 sentence goal]
Non-goals: [explicitly out of scope]
Location: [module/files affected]
Output: [diff/new files/docs]
```

### Design-First Approach
Before writing code, provide a **design slice**:
- **Plain English**: What changes? Who owns it? How does it affect other parts?
- **Technical**: Interfaces/types, data flows, schema impacts

Proceed directly if unambiguous; wait for approval if uncertain.

### Implementation Standards
- **Surgical patches**: ≤220 lines per diff, one concern per change
- **TypeScript strict spirit**: No `any` without comment + ADR reference
- **ESLint clean**: 0 errors in changed files
- **Backwards compatibility**: Breaking changes require versioned APIs or shims

## Key Patterns

### Module Structure (Canonical Example: Accounting)
```
apps/accounting/
  src/
    adapter.ts          # defineApp() manifest - ENTRY POINT
    db/
      schema.ts         # Module-owned entities (JournalEntry, Account)
      migrations/       # Schema changes over time
    services/
      JournalService.ts # Business logic using repositories
    repositories/
      JournalRepo.ts    # DB access layer
    ui/
      routes.tsx        # Routes registered via adapter
      components/       # Module-specific UI
  package.json
  tsconfig.json
```

**Key insight**: `adapter.ts` is the contract between module and kernel. Everything else is module-internal.

### Adapter Registration (apps/accounting/src/adapter.ts)
```typescript
import { defineApp } from "@aibos/kernel-sdk";

export default defineApp({
  id: "accounting",
  name: "Accounting",
  version: "1.0.0",
  ownedEntities: ["JournalEntry", "Account"],
  routes: [...],
  menu: [...],
  permissions: ["accounting:read", "accounting:write"],
  events: {
    emits: ["journal.entry.created"],
    consumes: ["invoice.paid"]
  }
});
```

**Critical**: This manifest is validated by Zod at definition time. Missing required fields will fail fast.

### Cross-Module Communication
**✅ Do**: Use kernel event bus
```typescript
kernel.events.emit(ctx, { 
  type: "invoice.paid", 
  payload: { invoiceId, amount } 
});
```

**❌ Don't**: Direct imports from other modules
```typescript
import { Invoice } from "../../invoicing/db/schema"; // VIOLATION
```

## Tech Stack
- **Language**: TypeScript (strict mode recommended)
- **Validation**: Zod schemas at boundaries (see `manifestSchema.ts`)
- **Events**: EventEmitter3 with tenant-scoped keys (`tenantId:eventType`)
- **Testing**: Vitest for kernel + modules (target ≥70% coverage)

## Testing Requirements

Follow the scaffold's test patterns in `tests/kernel/`:
- **manifest.test.ts** → Zod validation of `AppManifest` structure
- **adapters.test.ts** → Adapter install/unmount lifecycle
- **events.test.ts** → Tenant-scoped event isolation

**For new modules**:
1. Add manifest validation test (ensures `defineApp()` contract compliance)
2. Add adapter lifecycle test (mount/unmount)
3. Trend toward ≥70% coverage for kernel + accounting modules over time

**Example test structure**:
```typescript
import { defineApp } from "@aibos/kernel-sdk";

const myModule = defineApp({
  id: "my.module",
  name: "My Module",
  version: "1.0.0",
  // ... manifest fields
});

expect(myModule.manifest.id).toBe("my.module");
```

## Common Tasks

### Adding a New Module
1. Create `apps/new-module/` with `adapter.ts` exporting `defineApp()`
2. Own all schema in `src/db/`, migrations in `migrations/`
3. Register routes/menu via manifest
4. Mount in kernel: `kernel.boot({ adapters: [newModule] })`

### Changing Module API
1. Add new version (v2) alongside existing
2. Update manifest with new service definitions
3. Deprecate old version gracefully (no immediate breaks)
4. Document in ADR if breaking change

### Debugging Boundaries
- ESLint enforces no cross-app imports (see `.eslintrc.cjs`)
- Kernel boot logs show installed apps: `kernel.boot()` outputs `appId@version`
- Test with `tests/kernel/adapters.test.ts` patterns

## Documentation
- **Contract**: `aibos_development_contract_v_1_0.md` (authoritative rules)
- **Scaffold**: `aibos_kernel_boilerplate_scaffold_v_1_0.md` (implementation reference)
- **ADRs**: Document major decisions in `docs/ADR-XXX.md` format
  - ADR-001: Kernel baseline architecture
  - ADR-002: SDK manifest SSOT using Zod

## Self-Check Before Submitting
- [ ] No cross-module DB or shortcut imports
- [ ] TypeScript strict compatible (no unsafe `any`)
- [ ] Design tokens used (no hardcoded styles)
- [ ] ESLint passes on changed files
- [ ] Patch focused on single concern
- [ ] Design slice provided for non-trivial changes
