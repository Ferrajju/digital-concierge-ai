/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_N8N_FLUJO1_WEBHOOK_URL: string
  readonly VITE_N8N_FLUJO2_WEBHOOK_URL: string
  readonly VITE_N8N_FLUJO3_WEBHOOK_URL: string
  readonly VITE_N8N_GUIA_LOCAL_WEBHOOK_URL: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_TELEGRAM_BOT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
