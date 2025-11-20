# ADR-003: Adopt HelloWorld v1.0.1 Service + Event Demo Template

## Metadata
- **Document ID**: ADR-003-HELLOWORLD-DEMO
- **Version**: 1.0.0
- **Status**: Accepted
- **Date Issued**: 2025-11-20
- **Authors**: Jack + ChatGPT
- **Related SSOTs**: AI-BOS-KERNEL-BOILERPLATE-v1.0.0, ADR-001, ADR-002

---

## Context
Kernel v1.0.0 is frozen as a lean chassis.  
Before shipping real business modules, we need a proven, canonical example of:

1. Adapter manifest SSOT compliance
2. Service contract declaration (with stable pattern)
3. Event emission/consumption via kernel lanes
4. Cross-module communication without boundary violations

HelloWorld v1.0.0 proved basic adapter + nav.  
We now need a richer but safe demo to act as the template for all future modules.

---

## Decision
We adopt **HelloWorld v1.0.1** as the canonical module template that includes:

- A declared public service contract:
  - `demo.helloworld.echo`
  - Zod input/output schemas
  - A minimal handler stub (module-local execution proof)
- A declared event lane:
  - emits `HELLO_EVENT`
- A safe injection strategy:
  - UI accepts optional `emitEvent` prop
  - Module helpers (`createHelloEmitter`) use injected lanes only

We also adopt **listener-demo v1.0.0** as the paired consumer template:

- Declares `consumes: ["HELLO_EVENT"]`
- Uses injected `onEvent` lane via helper (`createHelloListener`)

Cross-module proof is enforced by tests in `/tests/kernel/eventIntegration.test.ts`.

---

## Consequences
### Positive
- Establishes a repeatable SSOT module template for services + events.
- Proves inter-module comms through kernel lanes only.
- Prevents future modules inventing ad-hoc handler/event patterns.
- Keeps kernel lean (no runtime injection standardization yet).

### Negative / Tradeoffs
- Service invocation is module-local until kernel RPC lands in v1.1+.
- Event lane injection remains manual in tests until formalized.

---

## References
- ADR-001: Kernel v1.0.0 baseline adopted
- ADR-002: SDK manifest schema as SSOT
- HelloWorld v1.0.1 + listener-demo v1.0.0 source and tests
