import { Client } from 'pg';

export default async function handler(req, res) {
  console.log('Health check API called');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Attempting database connection...');
    await client.connect();
    console.log('Database connected successfully');

    // Test basic query
    const result = await client.query('SELECT COUNT(*) as team_count FROM teams');
    const teamCount = result.rows[0].team_count;
    console.log(`Found ${teamCount} teams in database`);

    // Test power ratings table
    const ratingsResult = await client.query('SELECT COUNT(*) as rating_count FROM team_power_ratings');
    const ratingCount = ratingsResult.rows[0].rating_count;
    console.log(`Found ${ratingCount} power ratings in database`);

    // Test sample data
    const sampleResult = await client.query(`
      SELECT 
        pr.team_name,
        pr.power_rating,
        t.school,
        t.conference
      FROM team_power_ratings pr
      LEFT JOIN teams t ON LOWER(TRIM(pr.team_name)) = LOWER(TRIM(t.school))
      WHERE pr.power_rating IS NOT NULL
      ORDER BY pr.power_rating DESC
      LIMIT 3
    `);

    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      teams: parseInt(teamCount),
      ratings: parseInt(ratingCount),
      sample_data: sampleResult.rows,
      environment: {
        database_url_exists: !!process.env.DATABASE_URL,
        database_url_preview: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.substring(0, 20) + '...' : 'MISSING'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      stack: error.stack,
      environment: {
        database_url_exists: !!process.env.DATABASE_URL,
        database_url_preview: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.substring(0, 20) + '...' : 'MISSING'
      }
    });
  } finally {
    try {
      await client.end();
    } catch (e) {
      console.error('Error closing client:', e);
    }
  }
}
