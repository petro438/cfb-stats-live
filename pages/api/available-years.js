// Take the first part of the artifact (lines 1-28)
import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT DISTINCT season 
      FROM team_power_ratings 
      WHERE season IS NOT NULL 
      ORDER BY season DESC
    `);
    
    const years = result.rows.map(row => row.season);
    res.status(200).json({ years });
    
  } catch (error) {
    console.error('Error fetching available years:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.end();
  }
}
