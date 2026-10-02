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
 */
const TTL = 6 * 3600;

async function cloudflare(keyId, token) {
    const res = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: TTL })
    });
    if (!res.ok) throw new Error(`cloudflare ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers];
}

async function metered(domain, key) {
    const res = await fetch(`https://${domain}/api/v1/turn/credentials?apiKey=${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error(`metered ${res.status}`);
    return res.json();
}

export async function GET() {
    const env = process.env;
    let iceServers = [];
    try {
        if (env.CLOUDFLARE_TURN_KEY_ID && env.CLOUDFLARE_TURN_API_TOKEN) {
            iceServers = await cloudflare(env.CLOUDFLARE_TURN_KEY_ID, env.CLOUDFLARE_TURN_API_TOKEN);
        } else if (env.METERED_TURN_DOMAIN && env.METERED_TURN_API_KEY) {
            iceServers = await metered(env.METERED_TURN_DOMAIN, env.METERED_TURN_API_KEY);
        }
    } catch (e) {
        console.error('ICE :', e);
    }
    return new Response(JSON.stringify({ iceServers }), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
}
