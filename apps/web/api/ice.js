/**
 * Vercel function: the ICE servers (STUN + TURN relay) for WebRTC.
 *
 * Without a TURN relay, two players behind different NATs (4G, many home
 * boxes, company networks) often cannot reach each other directly. The TURN
 * credentials are short-lived and made here, so the secret never reaches
 * the browser.
 *
 * Environment variables (Vercel project settings), one provider is enough:
 *   CLOUDFLARE_TURN_KEY_ID + CLOUDFLARE_TURN_API_TOKEN   Cloudflare Realtime TURN
 *   METERED_TURN_DOMAIN + METERED_TURN_API_KEY           Metered (xxx.metered.live)
 * Without either, an empty list: the game keeps its STUN servers.
 *
 * Security: the secrets stay in this function (no VITE_ prefix, so never in
 * the bundle nor in the repository). What the browser gets is a temporary
 * TURN login, valid TTL seconds, usable only as a relay. The endpoint is
 * public by nature (every player must call it); a browser on another site
 * is turned away by Sec-Fetch-Site, and abuse is bounded by the short TTL
 * plus a rate limit set in the Vercel firewall.
 */
const TTL = 4 * 3600;

/** Browsers time out on port 53 (Cloudflare's own advice): drop those URLs. */
function withoutPort53(servers) {
    return servers
        .map((s) => {
            const urls = (Array.isArray(s.urls) ? s.urls : [s.urls]).filter((u) => typeof u === 'string' && !/:53(\?|$)/.test(u));
            return urls.length ? { ...s, urls } : null;
        })
        .filter(Boolean);
}

async function cloudflare(keyId, token) {
    const res = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: TTL })
    });
    if (!res.ok) throw new Error(`cloudflare ${res.status}`);
    const data = await res.json();
    return withoutPort53(Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers]);
}

async function metered(domain, key) {
    const res = await fetch(`https://${domain}/api/v1/turn/credentials?apiKey=${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error(`metered ${res.status}`);
    return res.json();
}

const json = (body, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});

export async function GET(request) {
    // Only the game's own pages, or the address typed in the address bar
    // ("none"): a script on another site gets nothing.
    const site = request.headers.get('sec-fetch-site');
    if (site && site !== 'same-origin' && site !== 'none') return json({ iceServers: [] }, 403);
    const env = process.env;
    let iceServers = [];
    try {
        if (env.CLOUDFLARE_TURN_KEY_ID && env.CLOUDFLARE_TURN_API_TOKEN) {
            iceServers = await cloudflare(env.CLOUDFLARE_TURN_KEY_ID, env.CLOUDFLARE_TURN_API_TOKEN);
        } else if (env.METERED_TURN_DOMAIN && env.METERED_TURN_API_KEY) {
            iceServers = await metered(env.METERED_TURN_DOMAIN, env.METERED_TURN_API_KEY);
        }
    } catch (e) {
        console.error('ICE :', e instanceof Error ? e.message : 'erreur');
    }
    return json({ iceServers });
}
