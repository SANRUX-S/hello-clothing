import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function run() {
  console.log("Adding password_hash column to admin_users...");
  await sql`
    ALTER TABLE admin_users 
    ADD COLUMN IF NOT EXISTS password_hash TEXT;
  `;
  console.log("Column password_hash confirmed.");

  const defaultCredentials = [
    {
      email: 'superadmin@helloclothing.store',
      name: 'Super Admin',
      role: 'super_admin',
      pass: 'HelloClothing#SuperAdmin2026!',
    },
    {
      email: 'manager@helloclothing.store',
      name: 'Store Operations Manager',
      role: 'co_admin',
      pass: 'HelloClothing#CoAdmin2026!',
    },
    {
      email: 'staff@helloclothing.store',
      name: 'Order Fulfillment Staff',
      role: 'admin',
      pass: 'HelloClothing#AdminStaff2026!',
    },
  ];

  for (const c of defaultCredentials) {
    const hashed = hashPassword(c.pass);
    await sql`
      INSERT INTO admin_users (id, email, name, role, status, password_hash)
      VALUES (${`admin-${c.role}`}, ${c.email}, ${c.name}, ${c.role}, 'active', ${hashed})
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = ${hashed},
        name = ${c.name},
        role = ${c.role},
        status = 'active';
    `;
    console.log(`Updated password for ${c.email} (${c.role})`);
  }

  const users = await sql`SELECT id, email, name, role, status, (password_hash IS NOT NULL) as has_password FROM admin_users`;
  console.log("Admin users in DB:", users);
}

run().catch(console.error);
