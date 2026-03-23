// @ts-check
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    devToolbar: {
        enabled: false
    },
    env: {
        schema: {
            API_URL: envField.string({ context: 'client', access: 'public', default: 'https://sjnkypidqrezwztkrmtg.supabase.co' }),
            API_SECRET: envField.string({ context: 'server', access: 'secret', default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbmt5cGlkcXJlend6dGtybXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDQ1NTMsImV4cCI6MjA4OTA4MDU1M30.zCyNdsoXgTSDFmXl0vvvQP71milt4-AN8YkQ8WWqUyc' }),
            WASSENGER_TOKEN: envField.string({ context: 'server', access: 'secret', default: 'e5f1837600c1d35e4271edfdd7e98c1c9a1655fd3bf7bbbab9a7b401c1f8febf' }),
            RESEND_TOKEN: envField.string({ context: 'server', access: 'secret', default: 're_MVL8LH8i_FJpgaz7cs73W4w62ic23QynP' })
        }
    }
});
