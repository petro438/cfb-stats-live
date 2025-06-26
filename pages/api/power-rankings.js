import { Client } from 'pg';

export default async function handler(req, res) {
  console.log('=== Power Rankings API Called ===');
  console.log('Method:', req.method);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;
  
  try {
    console.log('Creating PostgreSQL client...');
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Database connected successfully');
    
    // First, let's see what tables exist
    console.log('Checking available tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Available tables:', tablesResult.rows.map(r => r.table_name));

    // Check if our required tables exist
    const hasTeams = tablesResult.rows.some(r => r.table_name === 'teams');
    const hasRatings = tablesResult.rows.some(r => r.table_name === 'team_power_ratings');
    console.log('Has teams table:', hasTeams);
    console.log('Has team_power_ratings table:', hasRatings);

    if (!hasRatings) {
      throw new Error('team_power_ratings table does not exist');
    }

    // Let's see the structure of team_power_ratings
    console.log('Checking team_power_ratings structure...');
    const structureResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'team_power_ratings'
    `);
    console.log('team_power_ratings columns:', structureResult.rows);

    // Simple count test
    console.log('Counting power ratings...');
    const countResult = await client.query('SELECT COUNT(*) as count FROM team_power_ratings');
    console.log('Total power ratings:', countResult.rows[0].count);

    // Try the main query
    console.log('Executing main query...');
    const query = `
      SELECT 
        pr.team_name,
        pr.power_rating,
        pr.offense_rating, 
        pr.defense_rating,
        pr.strength_of_schedule,
        pr.power_percentile,
        pr.offense_percentile,
        pr.defense_percentile,
        pr.sos_percentile,
        ${hasTeams ? `
        t.school,
        t.conference,
        t.logo_url
        FROM team_power_ratings pr
        LEFT JOIN teams t ON LOWER(TRIM(pr.team_name)) = LOWER(TRIM(t.school))
        ` : `
        pr.team_name as school,
        'Unknown' as conference,
        null as logo_url
        FROM team_power_ratings pr
        `}
      WHERE pr.power_rating IS NOT NULL
      ORDER BY pr.power_rating DESC
      LIMIT 150;
    `;
    
    console.log('Query to execute:', query);
    const result = await client.query(query);
    console.log(`✅ Query successful, got ${result.rows.length} rows`);

    // Sample first row to check data structure
    if (result.rows.length > 0) {
      console.log('Sample row:', result.rows[0]);
    }
    
    // Transform data
    console.log('Transforming data...');
    const teams = result.rows.map((team, index) => ({
      rank: index + 1,
      team_name: team.team_name,
      school: team.school || team.team_name,
      conference: team.conference || 'Independent',
      logo_url: team.logo_url || 'https://a.espncdn.com/i/teamlogos/ncaa/500/default.png',
      power_rating: parseFloat(team.power_rating) || 0,
      offense_rating: parseFloat(team.offense_rating) || 0,
      defense_rating: parseFloat(team.defense_rating) || 0,
      strength_of_schedule: parseFloat(team.strength_of_schedule) || 0,
      power_percentile: parseFloat(team.power_percentile) || 50,
      offense_percentile: parseFloat(team.offense_percentile) || 50,
      defense_percentile: parseFloat(team.defense_percentile) || 50,
      sos_percentile: parseFloat(team.sos_percentile) || 50
    }));

    console.log(`✅ Transformed ${teams.length} teams successfully`);
    console.log('Sample transformed team:', teams[0]);
    
    res.status(200).json(teams);
    
  } catch (error) {
    console.error('❌ ERROR in power-rankings API:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Database query failed', 
      message: error.message,
      type: error.constructor.name,
      details: error.stack
    });
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('✅ Database connection closed');
      } catch (e) {
        console.error('❌ Error closing database connection:', e);
      }
    }
  }
}
