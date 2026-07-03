import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './styles/App.css';

const MainApp = () => {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  if (loading) {
    return (
      <div className="auth-page" style={{ flexDirection: 'column', gap: '20px' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.5px' }}>🛡️ AccessGuard</span>
        <p style={{ color: 'var(--text-secondary)' }}>Securing your session context...</p>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard />
      ) : (
        <div className="auth-page" style={{ flexDirection: 'column' }}>
          {showRegister ? (
            <Register onToggleLogin={() => setShowRegister(false)} />
          ) : (
            <Login onToggleRegister={() => setShowRegister(true)} />
          )}

          {/* Security Alert: Portfolio JWT Handling Disclosure */}
          <div style={{ marginTop: '30px', maxWidth: '450px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <p>
              🔒 <strong>Security Implementation Note:</strong> This application utilizes 
              an <code>HttpOnly</code>, <code>SameSite=Strict</code> cookie to store JWT tokens, protecting sessions 
              against XSS injection. 
              <span 
                className="security-warning-link" 
                style={{ marginLeft: '5px' }}
                onClick={() => setShowSecurityWarning(!showSecurityWarning)}
              >
                {showSecurityWarning ? 'Hide Warning Info' : 'Show Storage Policy'}
              </span>
            </p>
            {showSecurityWarning && (
              <div 
                className="glass-card" 
                style={{ 
                  marginTop: '15px', 
                  padding: '15px', 
                  fontSize: '0.75rem', 
                  textAlign: 'left',
                  border: '1px dashed rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.02)'
                }}
              >
                <p style={{ color: '#f87171', fontWeight: 600, marginBottom: '6px' }}>⚠️ LocalStorage Warning</p>
                <p style={{ lineHeight: '1.4' }}>
                  Storing JWT credentials in <code>localStorage</code> or <code>sessionStorage</code> exposes 
                  them to active Cross-Site Scripting (XSS) extraction via malicious scripts. AccessGuard implements 
                  HttpOnly tokens which cannot be queried via standard JavaScript document properties.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} AccessGuard Portfolio Project. Developed by Internship Program.</p>
      </footer>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
