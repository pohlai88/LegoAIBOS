Project: AI-BOS

You MUST obey **AI-BOS Development Contract v1.0.0 (AI-BOS-CONTRACT-v1)**:
- Kernel = control plane (no domain logic, no direct DB to modules)
- Modules own their schema/services/UI, exposed via adapters
- No cross-module DB imports or shortcut imports
- TS strict spirit, ESLint clean, design tokens SSOT, surgical patch, one concern per diff

**Mission:** [short description]  
**Non-goals:** [out of scope]  
**Location:** [modules/files]  
**Output:** unified diff

1. First, give me a short **design slice** (plain + technical).  
2. Then, provide a **surgical patch** (unified diff) that respects the contract.  
3. Call out any assumptions or contract conflicts explicitly.
