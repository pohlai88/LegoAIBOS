# Accounting Module (MVP)

Thin slice v1.0.0: Journal Entry Capture.

## What this proves
- Real domain module plugs into kernel via adapter
- JE balancing rules enforced at service contract boundary
- UI visible in Kernel UI host

## Out of scope (v1.0.0)
- DB writes / migrations
- Posting engine
- Party types / dimensions
- Approvals / workflows

## Dev
```bash
pnpm --filter @aibos/accounting typecheck
pnpm --filter @aibos/accounting test
```
