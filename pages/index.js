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
        throw new Error(`Failed to fetch rankings: ${response.status}`);
      }
      const data = await response.json();
      console.log('API Response:', data);
      setTeams(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching rankings:', err);
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

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: 'Trebuchet MS'
    }}>
      Loading CFB Power Rankings...
    </div>
  );

  if (error) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: 'Trebuchet MS',
      color: '#d32f2f'
    }}>
      <div>Error: {error}</div>
      <button 
        onClick={fetchPowerRankings}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Retry
      </button>
    </div>
  );

  return (
    <div style={{ 
      fontFamily: 'Trebuchet MS, sans-serif',
      padding: '8px',
      backgroundColor: '#ffffff',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '16px',
        color: '#212529',
        textAlign: 'center'
      }}>
        CFB Power Rankings 2025
      </h1>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '12px',
        margin: '8px 0',
        borderRadius: '4px',
        border: '1px solid #dee2e6',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0', fontSize: '14px' }}>
          <strong>How to use:</strong> Subtract higher team's rating from lower team's rating for neutral field spread. Add ~2.2 points for home field advantage.
        </p>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px',
          border: '1px solid #dee2e6'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{padding: '8px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold', width: '60px'}}>RK</th>
              <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold', minWidth: '200px'}}>TEAM</th>
              <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold', width: '100px'}}>CONF</th>
              <th style={{padding: '8px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold', width: '80px'}}>PWR</th>
              <th style={{padding: '8px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold', width: '80px'}}>OFF</th>
              <th style={{padding: '8px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold', width: '80px'}}>DEF</th>
              <th style={{padding: '8px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontFamily: 'Trebuchet MS', fontSize: '12px', fontWeight: 'bold', width: '80px'}}>SOS</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={team.team_name || team.teamName || index} style={{
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
              }}>
                <td style={{
                  padding: '8px', 
                  borderBottom: '1px solid #dee2e6',
                  textAlign: 'center',
                  fontFamily: 'Consolas, monospace',
                  fontWeight: 'bold'
                }}>
                  {team.rank || index + 1}
                </td>
                <td style={{padding: '8px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold'}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {team.logo_url && (
                      <img 
                        src={team.logo_url} 
                        alt={team.team_name || team.teamName}
                        style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <span style={{ cursor: 'pointer', color: '#007bff' }}>
                      {(team.school || team.team_name || team.teamName)?.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td style={{padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '12px'}}>
                  {team.conference || 'N/A'}
                </td>
                <td style={{
                  padding: '8px', 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: getPercentileColor(team.power_percentile || 50),
                  fontFamily: 'Consolas, monospace',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {team.power_rating ? parseFloat(team.power_rating).toFixed(1) : 'N/A'}
                </td>
                <td style={{
                  padding: '8px', 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: getPercentileColor(team.offense_percentile || 50),
                  fontFamily: 'Consolas, monospace',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {team.offense_rating ? parseFloat(team.offense_rating).toFixed(1) : 'N/A'}
                </td>
                <td style={{
                  padding: '8px', 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: getPercentileColor(team.defense_percentile || 50),
                  fontFamily: 'Consolas, monospace',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {team.defense_rating ? parseFloat(team.defense_rating).toFixed(1) : 'N/A'}
                </td>
                <td style={{
                  padding: '8px', 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: getPercentileColor(team.sos_percentile || 50),
                  fontFamily: 'Consolas, monospace',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {team.strength_of_schedule ? parseFloat(team.strength_of_schedule).toFixed(1) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#6c757d',
        textAlign: 'center',
        borderTop: '1px solid #dee2e6',
        paddingTop: '8px'
      }}>
        <strong>Legend:</strong> Colors represent percentile rankings (Green = Elite, Red = Poor) • 
        Data source: Supabase PostgreSQL • 
        Total teams: {teams.length}
      </div>
    </div>
  );
}
