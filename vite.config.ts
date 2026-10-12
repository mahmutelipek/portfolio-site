import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Opens the connection to Supabase while the app is still loading, so the first data request skips DNS and TLS. */
function preconnectSupabase(url: string | undefined): Plugin {
  return {
    name: 'preconnect-supabase',
    transformIndexHtml() {
      if (!url) return
      try {
        const href = new URL(url).origin
        return [{ tag: 'link', attrs: { rel: 'preconnect', href, crossorigin: '' }, injectTo: 'head-prepend' as const }]
      } catch {
        return
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), preconnectSupabase(env.VITE_SUPABASE_URL)],
  }
})
