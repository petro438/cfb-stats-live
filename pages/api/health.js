import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Database connected successfully');

    // Test basic connection
    const testQuery = await client.query('SELECT NOW() as current_time');
    
    // Try to count teams
    let teamCount = 'unknown';
    try {
      const teamResult = await client.query('SELECT COUNT(*) as count FROM teams');
      teamCount = teamResult.rows[0].count;
    } catch (err) {
      console.log('Teams table not accessible:', err.message);
    }

    // Try to count power ratings
    let ratingsCount = 'unknown';
    try {
      const ratingsResult = await client.query('SELECT COUNT(*) as count FROM team_power_ratings');
      ratingsCount = ratingsResult.rows[0].count;
    } catch (err) {
      console.log('Power ratings table not accessible:', err.message);
    }

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        currentTime: testQuery.rows[0].current_time,
        tables: {
          teams: teamCount,
          powerRatings: ratingsCount
        }
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } finally {
    await client.end();
  }
}
