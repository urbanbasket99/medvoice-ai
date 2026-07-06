/// <reference types="vite/client" />

// Opts out of Vite's `Record<string, any>` fallback for `ImportMetaEnv` so
// every `import.meta.env.*` access is fully typed (required for the
// project's "no any" TypeScript standard).
interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}
