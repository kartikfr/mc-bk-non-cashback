/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PARTNER_API_KEY?: string;
  readonly VITE_PARTNER_TOKEN_URL?: string;
  readonly VITE_PARTNER_BASE_URL?: string;
  readonly VITE_ENABLE_REDIRECT_ANALYTICS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}