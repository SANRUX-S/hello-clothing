import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function test() {
  console.log("Checking Neon DB connection...");
  const res = await sql`SELECT NOW()`;
  console.log("Neon DB connected at:", res[0].now);

  console.log("Creating admin_users table...");
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_login TIMESTAMPTZ
    )
  `;
  console.log("Table admin_users ready.");

  // Seed default admin accounts if not exist
  const admins = [
    { id: 'admin-01', email: 'superadmin@helloclothing.store', name: 'Super Admin', role: 'super_admin' },
    { id: 'admin-02', email: 'manager@helloclothing.store', name: 'Store Manager', role: 'co_admin' },
    { id: 'admin-03', email: 'staff@helloclothing.store', name: 'Fulfillment Staff', role: 'admin' },
  ];

  for (const a of admins) {
    await sql`
      INSERT INTO admin_users (id, email, name, role, status)
      VALUES (${a.id}, ${a.email}, ${a.name}, ${a.role}, 'active')
      ON CONFLICT (email) DO UPDATE SET role = ${a.role}, name = ${a.name}
    `;
    console.log(`Configured ${a.role}: ${a.email}`);
  }

  const all = await sql`SELECT * FROM admin_users`;
  console.log("Current admin users in Neon DB:", all);
}

test().catch(console.error);
