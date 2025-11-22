const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'skillpilot',
  password: process.env.DB_PASSWORD || 'skillpilot123',
  database: process.env.DB_NAME || 'skillpilot_db',
});

async function seedAdmin() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔐 Creating users table...');
    
    // Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Users table created/verified');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    // Check if admin already exists
    const existingAdmin = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [adminEmail]
    );
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD environment variable is required');
    }

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists, updating password...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await client.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, adminEmail]
      );
      console.log('✅ Admin password updated');
    } else {
      console.log('👤 Creating super admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        [adminEmail, hashedPassword, 'super_admin']
      );
      console.log('✅ Super admin created successfully');
    }
    
    await client.query('COMMIT');
    console.log('🎉 Admin seeding completed!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding admin:', error);
    throw error;
  } finally {
    client.release();
  }
}

seedAdmin()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });

