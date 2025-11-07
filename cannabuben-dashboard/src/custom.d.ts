// ==============================
// Global Type Declarations
// ==============================

// ✅ Allow importing image and media assets
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";

// ✅ Support environment variables (Vite)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ADMIN_API_URL?: string;
  // Add more env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ✅ Prevent TS from breaking if global React types are not imported
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
