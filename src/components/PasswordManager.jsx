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
    notes: '',
    category: 'Login',
    isFavorite: false,
    totp: '',
    customFields: []
  })
  const [showPasswords, setShowPasswords] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [importExportMode, setImportExportMode] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const categories = ['All', 'Login', 'Credit Card', 'Secure Note', 'Identity', 'Bank Account', 'Software License']

  // Load passwords from localStorage on component mount
  useEffect(() => {
    const savedPasswords = localStorage.getItem('savedPasswords')
    
    if (savedPasswords) {
      try {
        const parsedPasswords = JSON.parse(savedPasswords)
        setPasswords(parsedPasswords)
      } catch (error) {
        console.error('Error parsing saved passwords:', error)
        setPasswords([])
      }
    }
    setIsLoaded(true)
  }, [])

  // Save passwords to localStorage whenever passwords change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('savedPasswords', JSON.stringify(passwords))
    }
  }, [passwords, isLoaded])

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
      updatedAt: new Date().toISOString(),
      passwordHistory: [{ password: newPassword.password, date: new Date().toISOString() }],
      lastUsed: null,
      favicon: newPassword.website ? `https://www.google.com/s2/favicons?domain=${newPassword.website}&sz=32` : null
    }

    setPasswords(prev => [...prev, passwordEntry])
    setNewPassword({ website: '', username: '', password: '', notes: '', category: 'Login', isFavorite: false, totp: '', customFields: [] })
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

  const generateNewPassword = (id) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
    let newPassword = ''
    for (let i = 0; i < 16; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    setPasswords(prev => prev.map(p => {
      if (p.id === id) {
        const updatedPassword = {
          ...p,
          password: newPassword,
          updatedAt: new Date().toISOString(),
          passwordHistory: [...(p.passwordHistory || []), { password: newPassword, date: new Date().toISOString() }]
        }
        return updatedPassword
      }
      return p
    }))
    
    copyToClipboard(newPassword, 'New Password')
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

  const filteredPasswords = passwords.filter(p => {
    const matchesSearch = p.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchesFavorites = !showFavoritesOnly || p.isFavorite
    
    return matchesSearch && matchesCategory && matchesFavorites
  })

  const toggleFavorite = (id) => {
    setPasswords(prev => prev.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite, updatedAt: new Date().toISOString() } : p
    ))
  }

  const exportPasswords = () => {
    const dataStr = JSON.stringify(passwords, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `passwords_backup_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importPasswords = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        if (Array.isArray(importedData)) {
          setPasswords(prev => [...prev, ...importedData.map(p => ({ ...p, id: Date.now() + Math.random() }))])
          alert('Passwords imported successfully!')
        } else {
          alert('Invalid file format')
        }
      } catch (error) {
        alert('Error reading file')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="password-manager">
      <div className="manager-header">
        <h3>Password Manager</h3>
        <div className="header-controls">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="add-password-btn"
          >
            {showAddForm ? 'Cancel' : '+ Add Password'}
          </button>
          <div className="manager-options">
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`filter-btn ${showFavoritesOnly ? 'active' : ''}`}
              title="Show favorites only"
            >
              ⭐ {showFavoritesOnly ? 'Show All' : 'Favorites'}
            </button>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button onClick={exportPasswords} className="export-btn" title="Export passwords">
              📤 Export
            </button>
            <label className="import-btn" title="Import passwords">
              📥 Import
              <input 
                type="file" 
                accept=".json" 
                onChange={importPasswords} 
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddPassword} className="add-password-form">
          <div className="form-header">
            <select
              value={newPassword.category}
              onChange={(e) => setNewPassword(prev => ({ ...prev, category: e.target.value }))}
              className="category-select"
            >
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label className="favorite-toggle">
              <input
                type="checkbox"
                checked={newPassword.isFavorite}
                onChange={(e) => setNewPassword(prev => ({ ...prev, isFavorite: e.target.checked }))}
              />
              <span>⭐ Add to Favorites</span>
            </label>
          </div>
          
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
              placeholder="TOTP Secret (optional)"
              value={newPassword.totp}
              onChange={(e) => setNewPassword(prev => ({ ...prev, totp: e.target.value }))}
            />
          </div>
          
          <div className="form-row">
            <textarea
              placeholder="Secure Notes (optional)"
              value={newPassword.notes}
              onChange={(e) => setNewPassword(prev => ({ ...prev, notes: e.target.value }))}
              rows="3"
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
              onToggleFavorite={() => toggleFavorite(password.id)}
              onGenerateNew={() => generateNewPassword(password.id)}
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
  onToggleFavorite,
  onGenerateNew,
  onCopy,
  strength 
}) => {
  const [editData, setEditData] = useState(password)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    setEditData(password)
  }, [password])

  const handleCopyWithFeedback = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(`${label} copied!`)
      setTimeout(() => setCopyFeedback(''), 2000)
      onCopy(text, label)
    } catch (err) {
      setCopyFeedback('Copy failed')
      setTimeout(() => setCopyFeedback(''), 2000)
    }
  }

  const openWebsite = () => {
    let url = password.website
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getPasswordStrengthPercent = () => {
    let score = 0
    if (password.password.length >= 8) score += 1
    if (password.password.length >= 12) score += 1
    if (/[a-z]/.test(password.password)) score += 1
    if (/[A-Z]/.test(password.password)) score += 1
    if (/[0-9]/.test(password.password)) score += 1
    if (/[^A-Za-z0-9]/.test(password.password)) score += 1
    return (score / 6) * 100
  }

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
    <div className={`password-card ${password.isFavorite ? 'favorite' : ''}`}>
      <div className="card-header">
        <div className="website-info">
          <div className="website-title">
            {password.favicon && (
              <img 
                src={password.favicon} 
                alt={`${password.website} favicon`} 
                className="website-favicon"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="website-title-content">
              <h4>{password.website}</h4>
              <span className="category-badge">{password.category || 'Login'}</span>
            </div>
          </div>
          
          <div className="card-header-right">
            <div className="card-badges">
              <div className={`strength-badge ${strength}`}>
                {strength.toUpperCase()}
              </div>
              {password.totp && (
                <div className="totp-badge" title="2FA Enabled">🔐</div>
              )}
            </div>
            
            <div className="card-actions">
              <button onClick={onEdit} className="action-btn edit" title="Edit Password">
                ✏️
              </button>
              <button onClick={onDelete} className="action-btn delete" title="Delete Password">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <div className="info-row">
          <span className="label">Username:</span>
          <span className="value">{password.username}</span>
          <button 
            onClick={() => handleCopyWithFeedback(password.username, 'Username')}
            className="copy-btn"
          >
            📋
          </button>
        </div>
        
        <div className="info-row">
          <span className="label">Password:</span>
          <span className="value password-value">
            {showPassword ? password.password : '••••••••••••'}
          </span>
          <div className="password-controls">
            <button 
              onClick={onToggleVisibility} 
              className="copy-btn"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
            <button 
              onClick={() => handleCopyWithFeedback(password.password, 'Password')}
              className="copy-btn"
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
