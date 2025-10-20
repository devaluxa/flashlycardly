import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load from .env.local (Next.js convention for local secrets)
config({ path: '.env.local' });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

