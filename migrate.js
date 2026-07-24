const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://taskadminuser:T6GI4JmFy8IFmA926e0cRReMDLOjLwl8@dpg-d9hrdqsvikkc739sheo0-a.frankfurt-postgres.render.com/taskadmindb_h3ef',
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      start_date DATE DEFAULT CURRENT_DATE,
      due_date DATE DEFAULT CURRENT_DATE,
      completed BOOLEAN DEFAULT false,
      category VARCHAR(50) DEFAULT 'general',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('Tasks table created successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
