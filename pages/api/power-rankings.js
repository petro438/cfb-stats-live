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
        t.conference,
        t.logo_url,
        ROW_NUMBER() OVER (ORDER BY pr.power_rating DESC) as rank
      FROM team_power_ratings pr
      LEFT JOIN teams t ON LOWER(TRIM(pr.team_name)) = LOWER(TRIM(t.school))
      WHERE pr.power_rating IS NOT NULL
      ORDER BY pr.team_name, pr.power_rating DESC
      LIMIT 150;
    `;

    const result = await client.query(query);
    
    const teams = result.rows.map((team, index) => ({
      rank: index + 1,
      team_name: team.team_name,
      school: team.school || team.team_name,
      conference: team.conference || 'Independent',
      logo_url: team.logo_url || 'https://a.espncdn.com/i/teamlogos/ncaa/500/default.png',
      power_rating: parseFloat(team.power_rating),
      offense_rating: parseFloat(team.offense_rating),
      defense_rating: parseFloat(team.defense_rating),
      strength_of_schedule: parseFloat(team.strength_of_schedule),
      power_percentile: parseFloat(team.power_percentile) || 50,
      offense_percentile: parseFloat(team.offense_percentile) || 50,
      defense_percentile: parseFloat(team.defense_percentile) || 50,
      sos_percentile: parseFloat(team.sos_percentile) || 50
    }));

    res.status(200).json(teams);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed', details: error.message });
  } finally {
    await client.end();
  }
}
