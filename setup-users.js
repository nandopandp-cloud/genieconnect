// Setup script to create users table in Neon
const sql = require('./lib/db');

async function setupUsers() {
  try {
    console.log('Creating users table...');

    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✓ Users table created');

    // Check if users already exist
    const existing = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`Current users in database: ${existing[0].count}`);

    // Insert demo users if table is empty
    if (existing[0].count === 0) {
      console.log('Inserting demo users...');

      await sql`
        INSERT INTO users (name, email, password_hash, created_at)
        VALUES
          ('Fernando', 'fernando@jovensgenios.com', 'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d', CURRENT_TIMESTAMP),
          ('Nathália', 'nathalia@gmail.com', 'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d', CURRENT_TIMESTAMP),
          ('João', 'joao.figueroa@jovensgenios.com', 'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d', CURRENT_TIMESTAMP)
      `;

      console.log('✓ Demo users inserted');
    } else {
      console.log('✓ Users already exist, skipping insertion');
    }

    // Verify
    const users = await sql`SELECT id, name, email FROM users ORDER BY created_at`;
    console.log('\n✓ Users in database:');
    users.forEach(u => console.log(`  - ${u.name} (${u.email})`));

    console.log('\n✓ Setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Setup failed:', err);
    process.exit(1);
  }
}

setupUsers();
