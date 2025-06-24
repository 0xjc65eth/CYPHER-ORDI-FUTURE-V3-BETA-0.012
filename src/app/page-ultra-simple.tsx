export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      color: '#ff6600', 
      padding: '2rem',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🚀 CYPHER ORDi Future V3
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: '#ffaa44', marginBottom: '2rem' }}>
        Bloomberg Terminal - Beta 0.012
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1rem' 
      }}>
        <div style={{ 
          backgroundColor: '#111', 
          border: '2px solid #ff6600', 
          padding: '1rem', 
          borderRadius: '8px' 
        }}>
          <h3>✅ Status do Sistema</h3>
          <p>🟢 Servidor: Online</p>
          <p>🟢 Next.js: 15.3.3</p>
          <p>🟢 Node.js: 18.20.5</p>
        </div>
        
        <div style={{ 
          backgroundColor: '#111', 
          border: '2px solid #ff6600', 
          padding: '1rem', 
          borderRadius: '8px' 
        }}>
          <h3>₿ Bitcoin</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$43,250</p>
          <p style={{ color: '#00ff00' }}>+2.4% (24h)</p>
        </div>
        
        <div style={{ 
          backgroundColor: '#111', 
          border: '2px solid #ff6600', 
          padding: '1rem', 
          borderRadius: '8px' 
        }}>
          <h3>📍 Navegação</h3>
          <p><a href="/dashboard" style={{ color: '#ffaa44' }}>Dashboard</a></p>
          <p><a href="/portfolio" style={{ color: '#ffaa44' }}>Portfolio</a></p>
          <p><a href="/cypher-ai" style={{ color: '#ffaa44' }}>CYPHER AI</a></p>
        </div>
      </div>
      
      <footer style={{ 
        marginTop: '3rem', 
        textAlign: 'center', 
        color: '#666',
        borderTop: '1px solid #333',
        paddingTop: '1rem'
      }}>
        <p>CYPHER ORDi Future V3 - Servidor funcionando em localhost:4444</p>
        <p>Commit: 4038c8cf9066f118b41bb4f80612c68e8526a41b</p>
      </footer>
    </div>
  );
}