import { Client } from 'pg';

export default async function handler(req, res) {
  // Only allow GET requests
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

    // Get year parameter (default to 2025)
    const year = req.query.year || 2025;

    // Query to get power rankings with team info
    const query = `
      SELECT DISTINCT ON (pr.team_name)
        pr.team_name,
        pr.power_rating,
        pr.offense_rating, 
        pr.defense_rating,
        pr.strength_of_schedule,
        pr.power_percentile,
        pr.offense_percentile,
        pr.defense_percentile,
        pr.sos_percentile,
        t.school,
        t.mascot,
        t.conference,
        t.classification,
        t.logo_url,
        t.color,
        t.alt_color,
        ROW_NUMBER() OVER (ORDER BY pr.power_rating DESC) as rank
      FROM team_power_ratings pr
      LEFT JOIN teams t ON LOWER(TRIM(pr.team_name)) = LOWER(TRIM(t.school))
      WHERE pr.power_rating IS NOT NULL
      ORDER BY pr.team_name, pr.power_rating DESC;
    `;

    console.log(`🔍 Executing query for year: ${year}`);
    const result = await client.query(query);
    
    console.log(`📊 Query returned ${result.rows.length} teams`);

    // Process and format the data
    const teams = result.rows.map((team, index) => ({
      rank: index + 1,
      team_name: team.team_name,
      school: team.school || team.team_name,
      mascot: team.mascot,
      conference: team.conference || 'Independent',
      classification: team.classification,
      logo_url: team.logo_url || `https://a.espncdn.com/i/teamlogos/ncaa/500/default.png`,
      color: team.color,
      alt_color: team.alt_color,
      power_rating: parseFloat(team.power_rating) || 0,
      offense_rating: parseFloat(team.offense_rating) || 0,
      defense_rating: parseFloat(team.defense_rating) || 0,
      strength_of_schedule: parseFloat(team.strength_of_schedule) || 0,
      power_percentile: parseFloat(team.power_percentile) || 50,
      offense_percentile: parseFloat(team.offense_percentile) || 50,
      defense_percentile: parseFloat(team.defense_percentile) || 50,
      sos_percentile: parseFloat(team.sos_percentile) || 50
    }));

    console.log(`✅ Processed ${teams.length} teams successfully`);
    console.log(`📋 Sample team:`, teams[0]);

    res.status(200).json(teams);

  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    await client.end();
  }
}
