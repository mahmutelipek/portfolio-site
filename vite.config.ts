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

/**
 * Starts the home page's two data requests as soon as the HTML is parsed, while the app bundle is still
 * downloading, instead of after React has booted. The page picks the answers up from `window.__early`
 * (see Home.tsx) and falls back to its normal request if they are missing. The URL and key are the same
 * public values that already ship inside the bundle.
 */
function startEarlyRequests(url: string | undefined, key: string | undefined): Plugin {
  return {
    name: 'start-early-requests',
    transformIndexHtml() {
      if (!url || !key) return
      const code =
        `(function(){try{var u=${JSON.stringify(url)},k=${JSON.stringify(key)},h={apikey:k,Authorization:'Bearer '+k};` +
        `function g(p){return fetch(u+'/rest/v1/'+p,{headers:h}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})}` +
        `window.__early={projects:g('projects?select=*&is_visible=neq.false&order=sort_order.asc'),logos:g('logos?select=*&order=sort_order.asc')}}catch(e){}})();`
      return [{ tag: 'script', children: code, injectTo: 'head-prepend' as const }]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [
      react(),
      preconnectSupabase(env.VITE_SUPABASE_URL),
      startEarlyRequests(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY),
    ],
  }
})
