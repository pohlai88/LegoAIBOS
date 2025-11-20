# __MODULE_NAME__ Template

Canonical AI-BOS module scaffold.

## Rules
- Only imports @aibos/kernel-sdk as cross-module dependency.
- Owns schema/services/events/routes internally.
- No cross-module DB or app imports.

## How to use
1. Copy folder to packages/<module-name>
2. Replace __MODULE_ID__ and __MODULE_NAME__
3. Run:
   - pnpm --filter @aibos/<module-name> typecheck
   - pnpm --filter @aibos/<module-name> test