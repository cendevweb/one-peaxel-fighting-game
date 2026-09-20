import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        // `apps/web` is a browser bundle and is not tested here, with one
        // exception: the connection diagnosis is pure string logic, and the
        // deployment mistakes it recognizes are exactly the ones nobody
        // notices by hand.
        include: ['packages/**/*.test.ts', 'apps/server/**/*.test.ts', 'apps/web/src/net/*.test.ts'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        testTimeout: 20000
    }
});
