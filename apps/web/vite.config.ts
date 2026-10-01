import { defineConfig, loadEnv } from 'vite';

/**
 * The public address of the game, baked into the bundle so invite links
 * point at it rather than at whatever URL the host happened to open.
 * On Vercel, a deployment-specific URL (web-abc123-….vercel.app) sits
 * behind Vercel Authentication: a friend following a link built from it
 * gets a Vercel login page instead of the game.
 *
 * VITE_PUBLIC_URL wins when set; otherwise a Vercel production build uses
 * the official domain, and any other Vercel build falls back to Vercel's
 * VERCEL_PROJECT_PRODUCTION_URL, which may still name the old vercel.app
 * domain. Local builds keep '' (links on the page's own address).
 */
const OFFICIAL_URL = 'https://www.one-piexel.gg';

export default defineConfig(({ mode }) => {
    const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };
    const prodHost = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    const publicUrl = env.VITE_PUBLIC_URL?.trim()
        || (env.VERCEL_ENV === 'production' ? OFFICIAL_URL : '')
        || (prodHost ? `https://${prodHost}` : '');
    return {
        define: {
            __PUBLIC_URL__: JSON.stringify(publicUrl),
            __PREVIEW_BUILD__: JSON.stringify(env.VERCEL_ENV === 'preview')
        }
    };
});
