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

const defaultReviews = [
  {
    id: 'rev-01',
    author: 'Sanduni M.',
    location: 'Colombo 07',
    rating: 5,
    title: 'Collar stays completely flat after multiple washes.',
    body: 'Finally a local brand doing actual heavyweight cotton. The 240 GSM has structure without feeling hot in Colombo. The drop-shoulder cut is spot on.',
    image: '/campaign/real/woman-black-tee.webp',
    status: 'published',
  },
  {
    id: 'rev-02',
    author: 'Kavindu P.',
    location: 'Kandy',
    rating: 5,
    title: 'Got to Kandy in 48 hours. Proper heavy fleece.',
    body: 'The hood is double-layered so it stays structured instead of drooping flat. Delivery was super quick with PromptX COD.',
    image: '/campaign/real/man-black-hoodie.webp',
    status: 'published',
  },
  {
    id: 'rev-03',
    author: 'Dilki R.',
    location: 'Negombo',
    rating: 5,
    title: 'Boxy fit without looking sloppy.',
    body: 'Grabbed the white hoodie for an oversized look. Fleece is soft on the inside and the ribbed cuffs keep the sleeves stacked nicely.',
    image: '/campaign/real/woman-white-hoodie.webp',
    status: 'published',
  },
  {
    id: 'rev-04',
    author: 'Shenal W.',
    location: 'Battaramulla',
    rating: 5,
    title: 'Doesn’t shrink or bacon around the neck.',
    body: 'Washed this tee three times now—collar ribbing didn’t lose shape at all. Best heavyweight tee I’ve bought in SL so far.',
    image: '/campaign/real/man-white-tee.webp',
    status: 'published',
  },
  {
    id: 'rev-05',
    author: 'Amesh & Tharushi',
    location: 'Galle',
    rating: 5,
    title: 'Screen print quality is top notch.',
    body: 'Got matching signature graphic tees. Thick screen print that doesn’t crack or peel. WhatsApp support replied to our sizing question in minutes.',
    image: '/campaign/real/couple-graphic-tees.webp',
    status: 'published',
  },
];

async function seed() {
  console.log('Seeding default reviews into Neon DB...');
  for (const r of defaultReviews) {
    await sql`
      INSERT INTO reviews (id, author, location, rating, title, body, image, status, created_at, updated_at)
      VALUES (${r.id}, ${r.author}, ${r.location}, ${r.rating}, ${r.title}, ${r.body}, ${r.image}, ${r.status}, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        author = EXCLUDED.author,
        location = EXCLUDED.location,
        rating = EXCLUDED.rating,
        title = EXCLUDED.title,
        body = EXCLUDED.body,
        image = EXCLUDED.image,
        status = EXCLUDED.status;
    `;
  }
  const count = await sql`SELECT count(*) FROM reviews`;
  console.log('Total reviews now in Neon DB:', count[0].count);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

