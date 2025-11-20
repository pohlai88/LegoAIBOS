// eslint.config.js (ESLint v9 flat config)
// SSOT guardrails: prevent drift + enforce kernel/SDK/adapter boundaries.

import js from "@eslint/js";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";

export default [
  // Ignore common build and tool artifacts
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.vite/**",
      "**/.turbo/**",
      "**/coverage/**"
    ]
  },
  js.configs.recommended,

  // Base TS/React parsing: keep minimal for v1 (no plugin bloat yet).
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      // General hygiene
      "no-unused-vars": "off", // TS handles this better
      "no-undef": "off"
    }
  },
  // Enable TypeScript syntax parsing (parser-only, no rule packs)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    }
  },

  // ============================
  // PACKAGES boundary rules
  // ============================
  {
    files: ["packages/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            // ❌ Packages must never import apps/*
            {
              group: ["apps/*", "apps/**"],
              message:
                "SSOT Boundary: packages/ cannot import from apps/. Use kernel-sdk contracts + adapter lanes."
            },

            // ❌ Block cross-module imports except kernel-sdk
            // Allows: @aibos/kernel-sdk
            {
              group: ["@aibos/*", "!@aibos/kernel-sdk"],
              message:
                "SSOT Boundary: modules cannot import other modules directly. Only @aibos/kernel-sdk is allowed."
            },

            // ❌ Prevent reaching into other packages by path
            {
              group: ["packages/*", "packages/**", "!packages/kernel-sdk/**"],
              message:
                "SSOT Boundary: do not import package source by path. Use workspace package name via SDK only."
            },

            // ❌ Block leaking internals/db across boundaries
            {
              group: [
                "@aibos/*/src/internal/**",
                "@aibos/*/src/db/**",
                "packages/*/src/internal/**",
                "packages/*/src/db/**"
              ],
              message:
                "SSOT Boundary: internal/db folders are private. Expose via public contracts or SDK only."
            }
          ]
        }
      ]
    }
  },

  // ============================
  // APPS boundary rules
  // ============================
  {
    files: ["apps/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            // ❌ Apps should not import other apps by path
            {
              group: ["apps/*", "apps/**", "!apps/kernel/**", "!apps/kernel-ui/**"],
              message:
                "SSOT Boundary: apps/ cannot cross-import other apps. Share code via packages/ only."
            },

            // ❌ Apps can import packages, but never internals/db directly
            {
              group: [
                "@aibos/*/src/internal/**",
                "@aibos/*/src/db/**",
                "packages/*/src/internal/**",
                "packages/*/src/db/**"
              ],
              message:
                "SSOT Boundary: apps must not import module internals/db. Use public exports + SDK lanes."
            }
          ]
        }
      ]
    }
  },

  // ============================
  // TESTS boundary rules
  // ============================
  {
    files: ["tests/**/*.{ts,tsx,js,jsx}"],
    rules: {
      // Tests may import apps + packages to verify boundaries end-to-end.
      "no-restricted-imports": "off"
    }
  }
];
