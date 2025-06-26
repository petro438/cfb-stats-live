export default function Home() {
  return (
    <div style={{
      fontFamily: 'Trebuchet MS, sans-serif',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#ffffff'
    }}>
      <h1 style={{
        color: '#212529',
        fontSize: '32px',
        marginBottom: '20px'
      }}>
        CFB Analytics Site
      </h1>
      
      <div style={{
        backgroundColor: '#28a745',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        ✅ <strong>SITE IS WORKING!</strong>
      </div>

      <p style={{
        fontSize: '18px',
        marginBottom: '20px',
        color: '#6c757d'
      }}>
        If you can see this message, your Vercel deployment is successful.
      </p>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Next Steps:</h3>
        <ol style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Test API endpoint: <code>/api/health</code></li>
          <li>Check database connection</li>
          <li>Load power rankings data</li>
          <li>Add full homepage functionality</li>
        </ol>
      </div>

      <div style={{
        marginTop: '30px',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        <strong>Debug Info:</strong><br/>
        Timestamp: {new Date().toISOString()}<br/>
        Environment: {typeof window !== 'undefined' ? 'Client' : 'Server'}
      </div>
    </div>
  );
}
