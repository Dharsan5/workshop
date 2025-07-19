import { useState, useEffect } from 'react'
import './PasswordManager.css'

const PasswordManager = () => {
  const [passwords, setPasswords] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newPassword, setNewPassword] = useState({
    website: '',
    username: '',
    password: '',
    notes: ''
  })
  const [showPasswords, setShowPasswords] = useState({})
  const [editingId, setEditingId] = useState(null)

  // Load passwords from localStorage on component mount
  useEffect(() => {
    const savedPasswords = localStorage.getItem('savedPasswords')
    if (savedPasswords) {
      setPasswords(JSON.parse(savedPasswords))
    }
  }, [])

  // Save passwords to localStorage whenever passwords change
  useEffect(() => {
    localStorage.setItem('savedPasswords', JSON.stringify(passwords))
  }, [passwords])

  const handleAddPassword = (e) => {
    e.preventDefault()
    
    if (!newPassword.website || !newPassword.username || !newPassword.password) {
      alert('Please fill in all required fields')
      return
    }

    const passwordEntry = {
      id: Date.now(),
      ...newPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setPasswords(prev => [...prev, passwordEntry])
    setNewPassword({ website: '', username: '', password: '', notes: '' })
    setShowAddForm(false)
  }

  const handleUpdatePassword = (id, updatedData) => {
    setPasswords(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updatedData, updatedAt: new Date().toISOString() }
        : p
    ))
    setEditingId(null)
  }

  const handleDeletePassword = (id) => {
    if (confirm('Are you sure you want to delete this password?')) {
      setPasswords(prev => prev.filter(p => p.id !== id))
    }
  }

  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copied to clipboard!`)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert(`Failed to copy ${label}`)
    }
  }

  const calculatePasswordStrength = (password) => {
    let score = 0
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    
    if (score <= 2) return 'weak'
    if (score <= 4) return 'medium'
    return 'strong'
  }

  const filteredPasswords = passwords.filter(p =>
    p.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="password-manager">
      <div className="manager-header">
        <h3>Password Manager</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-password-btn"
        >
          {showAddForm ? 'Cancel' : '+ Add Password'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddPassword} className="add-password-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Website/Service *"
              value={newPassword.website}
              onChange={(e) => setNewPassword(prev => ({ ...prev, website: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Username/Email *"
              value={newPassword.username}
              onChange={(e) => setNewPassword(prev => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-row">
            <input
              type="password"
              placeholder="Password *"
              value={newPassword.password}
              onChange={(e) => setNewPassword(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={newPassword.notes}
              onChange={(e) => setNewPassword(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          
          <button type="submit" className="save-btn">Save Password</button>
        </form>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="passwords-list">
        {filteredPasswords.length === 0 ? (
          <div className="empty-state">
            <p>No passwords saved yet. Add your first password to get started!</p>
          </div>
        ) : (
          filteredPasswords.map(password => (
            <PasswordCard
              key={password.id}
              password={password}
              isEditing={editingId === password.id}
              showPassword={showPasswords[password.id]}
              onEdit={() => setEditingId(password.id)}
              onSave={(updatedData) => handleUpdatePassword(password.id, updatedData)}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDeletePassword(password.id)}
              onToggleVisibility={() => togglePasswordVisibility(password.id)}
              onCopy={copyToClipboard}
              strength={calculatePasswordStrength(password.password)}
            />
          ))
        )}
      </div>
    </div>
  )
}

const PasswordCard = ({ 
  password, 
  isEditing, 
  showPassword, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete, 
  onToggleVisibility, 
  onCopy,
  strength 
}) => {
  const [editData, setEditData] = useState(password)

  useEffect(() => {
    setEditData(password)
  }, [password])

  const handleSave = () => {
    if (!editData.website || !editData.username || !editData.password) {
      alert('Please fill in all required fields')
      return
    }
    onSave(editData)
  }

  if (isEditing) {
    return (
      <div className="password-card editing">
        <div className="edit-form">
          <input
            type="text"
            value={editData.website}
            onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="Website/Service"
          />
          <input
            type="text"
            value={editData.username}
            onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
            placeholder="Username/Email"
          />
          <input
            type="password"
            value={editData.password}
            onChange={(e) => setEditData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Password"
          />
          <input
            type="text"
            value={editData.notes}
            onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes"
          />
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={onCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="password-card">
      <div className="card-header">
        <div className="website-info">
          <h4>{password.website}</h4>
          <div className={`strength-badge ${strength}`}>
            {strength.toUpperCase()}
          </div>
        </div>
        <div className="card-actions">
          <button onClick={onEdit} className="action-btn edit">✏️</button>
          <button onClick={onDelete} className="action-btn delete">🗑️</button>
        </div>
      </div>
      
      <div className="card-content">
        <div className="info-row">
          <span className="label">Username:</span>
          <span className="value">{password.username}</span>
          <button 
            onClick={() => onCopy(password.username, 'Username')}
            className="copy-small"
          >
            📋
          </button>
        </div>
        
        <div className="info-row">
          <span className="label">Password:</span>
          <span className="value password-value">
            {showPassword ? password.password : '••••••••'}
          </span>
          <div className="password-actions">
            <button onClick={onToggleVisibility} className="copy-small">
              {showPassword ? '🙈' : '👁️'}
            </button>
            <button 
              onClick={() => onCopy(password.password, 'Password')}
              className="copy-small"
            >
              📋
            </button>
          </div>
        </div>
        
        {password.notes && (
          <div className="info-row">
            <span className="label">Notes:</span>
            <span className="value">{password.notes}</span>
          </div>
        )}
        
        <div className="card-footer">
          <small>
            Created: {new Date(password.createdAt).toLocaleDateString()}
            {password.updatedAt !== password.createdAt && (
              <> • Updated: {new Date(password.updatedAt).toLocaleDateString()}</>
            )}
          </small>
        </div>
      </div>
    </div>
  )
}

export default PasswordManager
