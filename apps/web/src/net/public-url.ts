/** The game's official address, where invite links send the other player. */
export const OFFICIAL_URL = 'https://www.one-piexel.gg';

/**
 * The public address baked into the bundle (see vite.config.ts).
 * VITE_PUBLIC_URL wins when set; any Vercel build uses the official domain,
 * whatever Vercel itself calls its production domain (it may still be the
 * old web-….vercel.app one). Elsewhere (local dev, a plain `vite build`)
 * there is none, and links stay on the page that made them.
 */
export function publicUrlFrom(env: Record<string, string | undefined>): string {
    const explicit = env.VITE_PUBLIC_URL?.trim();
    if (explicit) return explicit;
    return env.VERCEL ? OFFICIAL_URL : '';
}
