import './Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
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
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </header>

        <main className="dashboard-main">
          <div className="welcome-card">
            <h2>Welcome to your Dashboard</h2>
            <p>Everything you need, beautifully organized and ready to use.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">�</div>
              <div className="stat-content">
                <h3>Analytics</h3>
                <p>View your insights</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚙️</div>
              <div className="stat-content">
                <h3>Settings</h3>
                <p>Manage preferences</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Team</h3>
                <p>Collaborate together</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>Goals</h3>
                <p>Track your progress</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
