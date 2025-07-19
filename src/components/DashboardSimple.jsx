import { useState } from 'react'
import PasswordGenerator from './PasswordGenerator'
import PasswordManager from './PasswordManager'
import './Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="user-section">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <h1>{greeting()}, {user?.name || 'User'}</h1>
              <p>{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          
          <div className="header-info">
            <div className="info-item">
              <span className="info-label">Last Login</span>
              <span className="info-value">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Security Level</span>
              <span className="info-value security-high">High</span>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <nav className="dashboard-nav">
          <button 
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            <span className="nav-icon">🔑</span>
            Generator
          </button>
          <button 
            className={`nav-btn ${activeTab === 'manager' ? 'active' : ''}`}
            onClick={() => setActiveTab('manager')}
          >
            <span className="nav-icon">🔐</span>
            Manager
          </button>
          <button 
            className={`nav-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="nav-icon">🛡️</span>
            Security
          </button>
          <button 
            className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="nav-icon">📈</span>
            Analytics
          </button>
        </nav>

        <div className="breadcrumb">
          <span className="breadcrumb-icon">
            {activeTab === 'overview' && '📊'}
            {activeTab === 'generator' && '🔑'}
            {activeTab === 'manager' && '🔐'}
            {activeTab === 'security' && '🛡️'}
            {activeTab === 'analytics' && '📊'}
          </span>
          <span className="breadcrumb-text">
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'generator' && 'Password Generator'}
            {activeTab === 'manager' && 'Password Manager'}
            {activeTab === 'security' && 'Security Center'}
            {activeTab === 'analytics' && 'Analytics & Reports'}
          </span>
        </div>

        <main className="dashboard-main">
          <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
            <div className="welcome-card">
              <h2>Welcome to your Dashboard</h2>
              <p>Secure password management made simple. Generate strong passwords and store them safely.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab('generator')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon">🔑</div>
                <div className="stat-content">
                  <h3>Password Generator</h3>
                  <p>Create strong, secure passwords</p>
                </div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab('manager')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon">🔐</div>
                <div className="stat-content">
                  <h3>Password Manager</h3>
                  <p>Store and manage your passwords</p>
                </div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab('security')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon">🛡️</div>
                <div className="stat-content">
                  <h3>Security</h3>
                  <p>Keep your accounts secure</p>
                </div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab('analytics')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Analytics</h3>
                  <p>Track password strength</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'generator' ? 'active' : ''}`}>
            <PasswordGenerator />
          </div>

          <div className={`tab-content ${activeTab === 'manager' ? 'active' : ''}`}>
            <PasswordManager />
          </div>

          <div className={`tab-content ${activeTab === 'security' ? 'active' : ''}`}>
            <div className="security-section">
              <div className="welcome-card">
                <h2>Security Overview</h2>
                <p>Monitor and improve your password security.</p>
              </div>
              
              <div className="security-stats">
                <div className="security-card">
                  <h3>🔐 Saved Passwords</h3>
                  <p className="stat-number">{JSON.parse(localStorage.getItem('savedPasswords') || '[]').length}</p>
                  <p>Total passwords stored</p>
                </div>
                
                <div className="security-card">
                  <h3>💪 Strong Passwords</h3>
                  <p className="stat-number">
                    {JSON.parse(localStorage.getItem('savedPasswords') || '[]').filter(p => {
                      let score = 0;
                      if (p.password.length >= 8) score += 1;
                      if (p.password.length >= 12) score += 1;
                      if (/[a-z]/.test(p.password)) score += 1;
                      if (/[A-Z]/.test(p.password)) score += 1;
                      if (/[0-9]/.test(p.password)) score += 1;
                      if (/[^A-Za-z0-9]/.test(p.password)) score += 1;
                      return score > 4;
                    }).length}
                  </p>
                  <p>Strong passwords</p>
                </div>
                
                <div className="security-card warning">
                  <h3>⚠️ Weak Passwords</h3>
                  <p className="stat-number">
                    {JSON.parse(localStorage.getItem('savedPasswords') || '[]').filter(p => {
                      let score = 0;
                      if (p.password.length >= 8) score += 1;
                      if (p.password.length >= 12) score += 1;
                      if (/[a-z]/.test(p.password)) score += 1;
                      if (/[A-Z]/.test(p.password)) score += 1;
                      if (/[0-9]/.test(p.password)) score += 1;
                      if (/[^A-Za-z0-9]/.test(p.password)) score += 1;
                      return score <= 2;
                    }).length}
                  </p>
                  <p>Need attention</p>
                </div>
              </div>

              <div className="security-tips">
                <h3>Security Tips</h3>
                <ul>
                  <li>✅ Use unique passwords for each account</li>
                  <li>✅ Enable two-factor authentication when available</li>
                  <li>✅ Use passwords with at least 12 characters</li>
                  <li>✅ Include uppercase, lowercase, numbers, and symbols</li>
                  <li>✅ Avoid using personal information in passwords</li>
                  <li>✅ Update passwords regularly for important accounts</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'analytics' ? 'active' : ''}`}>
            <div className="analytics-section">
              <div className="welcome-card">
                <h2>Password Analytics</h2>
                <p>Detailed insights into your password security.</p>
              </div>
              
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Password Strength Distribution</h3>
                  <div className="strength-chart">
                    {(() => {
                      const passwords = JSON.parse(localStorage.getItem('savedPasswords') || '[]');
                      const strong = passwords.filter(p => {
                        let score = 0;
                        if (p.password && p.password.length >= 8) score += 1;
                        if (p.password && p.password.length >= 12) score += 1;
                        if (p.password && /[a-z]/.test(p.password)) score += 1;
                        if (p.password && /[A-Z]/.test(p.password)) score += 1;
                        if (p.password && /[0-9]/.test(p.password)) score += 1;
                        if (p.password && /[^A-Za-z0-9]/.test(p.password)) score += 1;
                        return score > 4;
                      }).length;
                      const medium = passwords.filter(p => {
                        let score = 0;
                        if (p.password && p.password.length >= 8) score += 1;
                        if (p.password && p.password.length >= 12) score += 1;
                        if (p.password && /[a-z]/.test(p.password)) score += 1;
                        if (p.password && /[A-Z]/.test(p.password)) score += 1;
                        if (p.password && /[0-9]/.test(p.password)) score += 1;
                        if (p.password && /[^A-Za-z0-9]/.test(p.password)) score += 1;
                        return score <= 4 && score > 2;
                      }).length;
                      const weak = passwords.filter(p => {
                        let score = 0;
                        if (p.password && p.password.length >= 8) score += 1;
                        if (p.password && p.password.length >= 12) score += 1;
                        if (p.password && /[a-z]/.test(p.password)) score += 1;
                        if (p.password && /[A-Z]/.test(p.password)) score += 1;
                        if (p.password && /[0-9]/.test(p.password)) score += 1;
                        if (p.password && /[^A-Za-z0-9]/.test(p.password)) score += 1;
                        return score <= 2;
                      }).length;
                      
                      return (
                        <div className="chart-bars">
                          <div className="chart-bar">
                            <div className="bar strong" style={{ height: `${passwords.length ? (strong / passwords.length) * 100 : 0}%` }}></div>
                            <span>Strong ({strong})</span>
                          </div>
                          <div className="chart-bar">
                            <div className="bar medium" style={{ height: `${passwords.length ? (medium / passwords.length) * 100 : 0}%` }}></div>
                            <span>Medium ({medium})</span>
                          </div>
                          <div className="chart-bar">
                            <div className="bar weak" style={{ height: `${passwords.length ? (weak / passwords.length) * 100 : 0}%` }}></div>
                            <span>Weak ({weak})</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    {JSON.parse(localStorage.getItem('savedPasswords') || '[]')
                      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
                      .slice(0, 5)
                      .map(password => (
                        <div key={password.id} className="activity-item">
                          <span className="activity-icon">🔐</span>
                          <div className="activity-details">
                            <p><strong>{password.website}</strong></p>
                            <small>Updated {new Date(password.updatedAt).toLocaleDateString()}</small>
                          </div>
                        </div>
                      ))
                    }
                    {JSON.parse(localStorage.getItem('savedPasswords') || '[]').length === 0 && (
                      <p>No passwords saved yet. Start by adding some passwords!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
