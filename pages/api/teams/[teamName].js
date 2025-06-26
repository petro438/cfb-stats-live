// pages/api/teams/[teamName].js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  const { teamName } = req.query;
  const year = parseInt(req.query.year) || 2025;

  try {
    // Get team info with power ratings
    const teamQuery = `
      SELECT DISTINCT ON (LOWER(TRIM(t.school)))
        t.*,
        pr.power_rating,
        pr.offense_rating,
        pr.defense_rating,
        pr.strength_of_schedule
      FROM teams t
      LEFT JOIN team_power_ratings pr ON (
        LOWER(TRIM(pr.team_name)) = LOWER(TRIM(t.school)) OR
        LOWER(TRIM(pr.team_name)) = LOWER(TRIM(t.alt_name)) OR
        LOWER(TRIM(pr.team_name)) = LOWER(TRIM(t.alt_name2))
      )
      WHERE (
        LOWER(TRIM(t.school)) = LOWER(TRIM($1)) OR
        LOWER(TRIM(t.alt_name)) = LOWER(TRIM($1)) OR
        LOWER(TRIM(t.alt_name2)) = LOWER(TRIM($1))
      )
      AND (pr.year = $2 OR pr.year IS NULL)
      ORDER BY LOWER(TRIM(t.school)), pr.power_rating DESC NULLS LAST
      LIMIT 1
    `;

    const result = await pool.query(teamQuery, [teamName, year]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching team data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}