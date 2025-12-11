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

// Image module declarations
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}