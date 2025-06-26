import { useState, useEffect } from 'react';

export default function Home() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPowerRankings();
  }, []);

  const fetchPowerRankings = async () => {
    try {
      const response = await fetch('/api/power-rankings');
      if (!response.ok) {
        throw new Error('Failed to fetch rankings');
      }
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPercentileColor = (percentile) => {
    if (percentile >= 96) return '#58c36c';
    if (percentile >= 91) return '#6aca7c';
    if (percentile >= 86) return '#7cd08b';
    if (percentile >= 81) return '#8dd69b';
    if (percentile >= 76) return '#9fddaa';
    if (percentile >= 71) return '#b0e3ba';
    if (percentile >= 66) return '#c2e9c9';
    if (percentile >= 61) return '#d4f0d9';
    if (percentile >= 56) return '#e5f6e8';
    if (percentile >= 51) return '#f7fcf8';
    if (percentile >= 46) return '#fdf5f4';
    if (percentile >= 41) return '#fbe1df';
    if (percentile >= 36) return '#f9cdc9';
    if (percentile >= 31) return '#f7b9b4';
    if (percentile >= 26) return '#f5a59f';
    if (percentile >= 21) return '#f2928a';
    if (percentile >= 16) return '#f07e74';
    if (percentile >= 11) return '#ee6a5f';
    if (percentile >= 6) return '#ec564a';
    return '#ea4335';
  };

  if (loading) return <div style={{padding: '20px', fontFamily: 'Trebuchet MS'}}>Loading...</div>;
  if (error) return <div style={{padding: '20px', fontFamily: 'Trebuchet MS'}}>Error: {error}</div>;

  return (
    <div style={{ 
      fontFamily: 'Trebuchet MS, sans-serif',
      padding: '8px',
      backgroundColor: '#ffffff'
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '16px',
        color: '#212529'
      }}>
        CFB Power Rankings
      </h1>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold'}}>RK</th>
              <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold'}}>TEAM</th>
              <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold'}}>CONF</th>
              <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold'}}>PWR</th>
              <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold'}}>OFF</th>
              <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold'}}>DEF</th>
              <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold'}}>SOS</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={team.team_name} style={{
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
              }}>
                <td style={{padding: '8px', borderBottom: '1px solid #dee2e6'}}>{team.rank}</td>
                <td style={{padding: '8px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold'}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {team.logo_url && (
                      <img 
                        src={team.logo_url} 
                        alt={team.team_name}
                        style={{ width: '20px', height: '20px' }}
                      />
                    )}
                    {(team.school || team.team_name)?.toUpperCase()}
                  </div>
                </td>
                <td style={{padding: '8px', borderBottom: '1px solid #dee2e6'}}>{team.conference}</td>
                <td style={{
                  padding: '8px', 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: getPercentileColor(team.power_percentile),
                  fontFamily: 'Consolas, monospace'
                }}>
                  {team.power_rating ? parseFloat(team.power_rating).toFixed(1) : 'N/A'}
                </td>
                <td style={{
                  padding: '8px', 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: getPercentileColor(team.offense_percentile),
                  fontFamily: 'Consolas, monospace'
                }}>
                  {team.offense_rating ? parseFloat(team.offense_rating).toFixed(1) : 'N/A'}
                </td>
                <td style={{
                  padding: '8px', 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: getPercentileColor(team.defense_percentile),
                  fontFamily: 'Consolas, monospace'
                }}>
                  {team.defense_rating ? parseFloat(team.defense_rating).toFixed(1) : 'N/A'}
                </td>
                <td style={{
                  padding: '8px', 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: getPercentileColor(team.sos_percentile),
                  fontFamily: 'Consolas, monospace'
                }}>
                  {team.strength_of_schedule ? parseFloat(team.strength_of_schedule).toFixed(1) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
