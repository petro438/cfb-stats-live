import { Client } from 'pg';

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    
    // Test queries to verify database structure
    const tests = [];
    
    // Test 1: Check teams table
    try {
      const teamsResult = await client.query('SELECT COUNT(*) as team_count FROM teams LIMIT 1;');
      tests.push({
        name: 'Teams Table',
        status: 'OK',
        count: parseInt(teamsResult.rows[0].team_count)
      });
    } catch (err) {
      tests.push({
        name: 'Teams Table',
        status: 'ERROR',
        error: err.message
      });
    }

    // Test 2: Check power_ratings table
    try {
      const powerResult = await client.query('SELECT COUNT(*) as rating_count FROM team_power_ratings LIMIT 1;');
      tests.push({
        name: 'Power Ratings Table',
        status: 'OK',
        count: parseInt(powerResult.rows[0].rating_count)
      });
    } catch (err) {
      tests.push({
        name: 'Power Ratings Table',
        status: 'ERROR', 
        error: err.message
      });
    }

    // Test 3: Sample data query
    try {
      const sampleResult = await client.query(`
        SELECT pr.team_name, pr.power_rating, t.school, t.conference, t.logo_url
        FROM team_power_ratings pr
        LEFT JOIN teams t ON LOWER(TRIM(pr.team_name)) = LOWER(TRIM(t.school))
        WHERE pr.power_rating IS NOT NULL
        ORDER BY pr.power_rating DESC
        LIMIT 3;
      `);
      tests.push({
        name: 'Sample Data Query',
        status: 'OK',
        sample: sampleResult.rows
      });
    } catch (err) {
      tests.push({
        name: 'Sample Data Query',
        status: 'ERROR',
        error: err.message
      });
    }

    const allHealthy = tests.every(test => test.status === 'OK');

    res.status(allHealthy ? 200 : 500).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      tests: tests,
      version: '1.0.0'
    });

  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  } finally {
    await client.end();
  }
}
