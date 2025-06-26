// pages/api/power-rankings.js
import { Pool } from 'pg';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function for normal distribution CDF
function normalCDF(x, mean = 0, stdDev = 1) {
  const z = (x - mean) / stdDev;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) prob = 1 - prob;
  return prob;
}

export default async function handler(req, res) {
  try {
    // Get season from query parameter, default to 2025
    const season = parseInt(req.query.season) || 2025;
    
    console.log(`Fetching power rankings for ${season} season`);
    
    // Get power rankings with team data
    const query = `
      SELECT DISTINCT ON (LOWER(TRIM(pr.team_name)))
        pr.team_name,
        pr.power_rating,
        pr.offense_rating,
        pr.defense_rating,
        pr.strength_of_schedule,
        t.school,
        t.mascot,
        t.conference,
        t.classification,
        t.color,
        t.alt_color,
        t.logo_url
      FROM team_power_ratings pr
      LEFT JOIN teams t ON LOWER(TRIM(pr.team_name)) = LOWER(TRIM(t.school))
      WHERE pr.season = $1
      ORDER BY LOWER(TRIM(pr.team_name)), pr.power_rating DESC
    `;
    
    const result = await pool.query(query, [season]);
    
    // Add rankings and percentiles
    const rankedTeams = result.rows
      .sort((a, b) => b.power_rating - a.power_rating)
      .map((team, index) => ({
        ...team,
        rank: index + 1,
        power_percentile: Math.round(((result.rows.length - index) / result.rows.length) * 100),
        offense_percentile: calculatePercentile(team.offense_rating, result.rows.map(t => t.offense_rating)),
        defense_percentile: calculatePercentile(team.defense_rating, result.rows.map(t => t.defense_rating)),
        sos_percentile: calculatePercentile(team.strength_of_schedule, result.rows.map(t => t.strength_of_schedule))
      }));

    res.status(200).json(rankedTeams);
  } catch (err) {
    console.error('Error fetching power rankings:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

function calculatePercentile(value, allValues) {
  const sorted = allValues.filter(v => v !== null).sort((a, b) => a - b);
  const rank = sorted.findIndex(v => v >= value) + 1;
  return Math.round((rank / sorted.length) * 100);
}