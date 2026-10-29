import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const dotenv = fs.readFileSync('.env.local', 'utf-8');
const dbMatch = dotenv.match(/DATABASE_URL=([^\r\n]+)/);
if (!dbMatch) {
  console.error('No DATABASE_URL found in .env.local');
  process.exit(1);
}

const dbUrl = dbMatch[1].trim().replace(/^["']|["']$/g, '');
const sql = neon(dbUrl);

async function run() {
  console.log('Connecting to Neon DB to create reviews table...');
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      location TEXT DEFAULT 'Sri Lanka',
      rating INTEGER NOT NULL DEFAULT 5,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      image TEXT DEFAULT '/campaign/real/couple-graphic-tees.webp',
      status TEXT NOT NULL DEFAULT 'published',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('Reviews table created or already exists!');

  const count = await sql`SELECT count(*) FROM reviews`;
  console.log('Current reviews count in DB:', count[0].count);
}

run().catch(err => {
  console.error('Error creating reviews table:', err);
  process.exit(1);
});

