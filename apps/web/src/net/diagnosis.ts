/**
 * What the browser can work out by itself about a failed connection.
 *
 * Kept apart from the socket hook, and free of React and socket.io, so the
 * rules can be tested: they are the difference between a deployment that is
 * misconfigured and one that is down, and they are easy to get subtly wrong.
 */

const FALLBACK_URL = 'http://localhost:8080';

/**
 * Where to open the socket.
 *
 * `??` is not enough: an environment variable that exists but is empty — which
 * is what a dashboard field saved blank gives you — is a string, not
 * `undefined`, and `io('')` then dials the page's own origin, where nothing is
 * listening. Trailing slashes are dropped so the value can be pasted straight
 * from an address bar.
 */
export const serverUrl = (): string => {
    const configured = process.env.NEXT_PUBLIC_GAME_SERVER_URL?.trim().replace(/\/+$/, '');
    return configured ? configured : FALLBACK_URL;
};

const isLocal = (host: string): boolean =>
    host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.local');

/**
 * Why the connection could not be opened, in the player's language.
 *
 * "Serveur injoignable" is true but useless: the three things that actually go
 * wrong on a fresh deployment are indistinguishable from it, and two of them
 * are settings rather than outages. A page that names the cause turns a
 * half-hour of dashboard archaeology into one glance, so the reason is computed
 * from what the browser can see by itself and shown next to the status.
 */
export const connectionDiagnosis = (url: string, pageOrigin: string | null): string | null => {
    let target: URL;
    try {
        target = new URL(url);
    } catch {
        return `L'adresse du serveur est invalide : « ${url} ».`;
    }
    if (!pageOrigin) {
        return null;
    }
    let page: URL;
    try {
        page = new URL(pageOrigin);
    } catch {
        return null;
    }
    // The client was compiled without NEXT_PUBLIC_GAME_SERVER_URL, so it is
    // dialling the developer's own machine from a site on the internet.
    if (isLocal(target.hostname) && !isLocal(page.hostname)) {
        return `Ce site a été compilé sans adresse de serveur : il essaie ${target.origin}, qui n'existe que sur une machine de développement. Il faut renseigner NEXT_PUBLIC_GAME_SERVER_URL puis recompiler.`;
    }
    // A browser silently refuses a plain-HTTP socket from an HTTPS page, and
    // the refusal looks exactly like a server that is down.
    if (page.protocol === 'https:' && target.protocol === 'http:') {
        return `Le navigateur bloque une connexion non chiffrée (${target.origin}) depuis une page en HTTPS. L'adresse du serveur doit commencer par https://.`;
    }
    return null;
};
