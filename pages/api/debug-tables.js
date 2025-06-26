// pages/api/debug-tables.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  try {
    // Check what tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tables = await pool.query(tablesQuery);

    // Check teams table structure
    const teamsColumnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'teams'
    `;
    const teamsColumns = await pool.query(teamsColumnsQuery);

    // Check power ratings table structure  
    const ratingsColumnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'team_power_ratings'
    `;
    const ratingsColumns = await pool.query(ratingsColumnsQuery);

    res.status(200).json({
      tables: tables.rows,
      teams_columns: teamsColumns.rows,
      ratings_columns: ratingsColumns.rows
    });
  } catch (err) {
    console.error('Error checking database structure:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}