/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Documentación (URL externa). */
  readonly VITE_DEV_DOCS_URL?: string;
  /** Administración de datos (URL externa). */
  readonly VITE_DEV_DATA_ADMIN_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.png" {
  const src: string;
  export default src;
}
