// @ts-check
import vercel from '@astrojs/vercel';
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: vercel(),
    devToolbar: {
        enabled: false
    },
    env: {
        schema: {
            API_URL: envField.string({ context: 'client', access: 'public', }),
            API_SECRET: envField.string({ context: 'server', access: 'secret', }),
            WASSENGER_TOKEN: envField.string({ context: 'server', access: 'secret', }),
            RESEND_TOKEN: envField.string({ context: 'server', access: 'secret', }),
            HOST: envField.string({ context: 'client', access: 'public', }),
        }
    }
});
