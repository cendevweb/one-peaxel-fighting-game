import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['packages/**/*.test.ts', 'apps/server/**/*.test.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', 'apps/web/**'],
        testTimeout: 20000
    }
});
