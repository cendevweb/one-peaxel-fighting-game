import type { NextConfig } from 'next';

const config: NextConfig = {
    reactStrictMode: true,
    // Phaser touches `window` at import time, so it is only ever loaded from a
    // dynamic client-side import; this keeps the server bundle free of it.
    transpilePackages: ['@opfg/combat-core', '@opfg/shared'],
    eslint: { ignoreDuringBuilds: true },
    async headers() {
        return [
            {
                source: '/atlases/:path*',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
            },
            {
                source: '/stages/:path*',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
            }
        ];
    }
};

export default config;
