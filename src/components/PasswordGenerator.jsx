import { useState, useEffect } from 'react'
import './PasswordGenerator.css'

const PasswordGenerator = ({ onPasswordGenerated }) => {
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [options, setOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    mustIncludeEach: true
  })
  const [strength, setStrength] = useState('')
  const [strengthScore, setStrengthScore] = useState(0)
  const [passwordHistory, setPasswordHistory] = useState([])
  const [copyFeedback, setCopyFeedback] = useState('')
  const [presets, setPresets] = useState('custom')

  // Password presets
  const passwordPresets = {
    custom: 'Custom Settings',
    pin: 'PIN (Numbers Only)',
    memorable: 'Memorable (No Symbols)',
    maximum: 'Maximum Security',
    wifi: 'WiFi Password',
    basic: 'Basic Password'
  }

  // Apply presets
  const applyPreset = (preset) => {
    const presetConfigs = {
      pin: {
        length: 6,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: true,
        excludeAmbiguous: true,
        mustIncludeEach: false
      },
      memorable: {
        length: 14,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: true,
        excludeAmbiguous: true,
        mustIncludeEach: true
      },
      maximum: {
        length: 32,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: false,
        excludeAmbiguous: false,
        mustIncludeEach: true
      },
      wifi: {
        length: 24,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: true,
        excludeAmbiguous: true,
        mustIncludeEach: true
      },
      basic: {
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: false,
        excludeAmbiguous: false,
        mustIncludeEach: true
      }
    }

    if (presetConfigs[preset]) {
      setOptions(presetConfigs[preset])
      setPresets(preset)
    }
  }

  // Auto-generate password when options change
  useEffect(() => {
    if (generatedPassword) {
      generatePassword()
    }
  }, [options])

  const generatePassword = () => {
    let charset = ''
    let requiredChars = []
    
    if (options.includeLowercase) {
      let lowercase = 'abcdefghijklmnopqrstuvwxyz'
      if (options.excludeSimilar) lowercase = lowercase.replace(/[il]/g, '')
      charset += lowercase
      if (options.mustIncludeEach) requiredChars.push(lowercase)
    }
    
    if (options.includeUppercase) {
      let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (options.excludeSimilar) uppercase = uppercase.replace(/[ILO]/g, '')
      charset += uppercase
      if (options.mustIncludeEach) requiredChars.push(uppercase)
    }
    
    if (options.includeNumbers) {
      let numbers = '0123456789'
      if (options.excludeSimilar) numbers = numbers.replace(/[01]/g, '')
      charset += numbers
      if (options.mustIncludeEach) requiredChars.push(numbers)
    }
    
    if (options.includeSymbols) {
      let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?~`'
      if (options.excludeAmbiguous) symbols = symbols.replace(/[{}[\]()\/\\'"~,;.<>]/g, '')
      charset += symbols
      if (options.mustIncludeEach) requiredChars.push(symbols)
    }

    if (charset === '') {
      alert('Please select at least one character type')
      return
    }

    let password = ''
    
    // Ensure at least one character from each selected type
    if (options.mustIncludeEach && requiredChars.length > 0) {
      for (let charSet of requiredChars) {
        password += charSet.charAt(Math.floor(Math.random() * charSet.length))
      }
    }
    
    // Fill the rest with random characters
    while (password.length < options.length) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    // Shuffle the password to avoid predictable patterns
    password = password.split('').sort(() => Math.random() - 0.5).join('')

    setGeneratedPassword(password)
    calculateStrength(password)
    
    // Add to history (keep last 5)
    setPasswordHistory(prev => [password, ...prev.slice(0, 4)])
    
    if (onPasswordGenerated) {
      onPasswordGenerated(password)
    }
  }

  const calculateStrength = (password) => {
    let score = 0
    let reasons = []
    
    // Length scoring
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    if (password.length >= 20) score += 1
    
    // Character variety
    if (/[a-z]/.test(password)) { score += 1; reasons.push('lowercase') }
    if (/[A-Z]/.test(password)) { score += 1; reasons.push('uppercase') }
    if (/[0-9]/.test(password)) { score += 1; reasons.push('numbers') }
    if (/[^A-Za-z0-9]/.test(password)) { score += 2; reasons.push('symbols') }
    
    // Entropy bonus
    const uniqueChars = new Set(password).size
    if (uniqueChars >= password.length * 0.8) score += 1
    
    setStrengthScore(score)
    
    if (score <= 3) setStrength('weak')
    else if (score <= 6) setStrength('medium')
    else if (score <= 8) setStrength('strong')
    else setStrength('excellent')
  }

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return '#dc3545'
      case 'medium': return '#ffc107'
      case 'strong': return '#28a745'
      case 'excellent': return '#20c997'
      default: return '#6c757d'
    }
  }

  const copyToClipboard = async (text = generatedPassword, label = 'Password') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(`${label} copied!`)
      setTimeout(() => setCopyFeedback(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      setCopyFeedback('Failed to copy')
      setTimeout(() => setCopyFeedback(''), 2000)
    }
  }

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }))
    setPresets('custom')
  }

  const getEstimatedCrackTime = () => {
    const charsetSize = 
      (options.includeLowercase ? 26 : 0) +
      (options.includeUppercase ? 26 : 0) +
      (options.includeNumbers ? 10 : 0) +
      (options.includeSymbols ? 32 : 0)
    
    const combinations = Math.pow(charsetSize, options.length)
    const secondsToCrack = combinations / (10000000000) // Assuming 10B attempts/sec
    
    if (secondsToCrack < 60) return 'Instant'
    if (secondsToCrack < 3600) return `${Math.ceil(secondsToCrack / 60)} minutes`
    if (secondsToCrack < 86400) return `${Math.ceil(secondsToCrack / 3600)} hours`
    if (secondsToCrack < 31536000) return `${Math.ceil(secondsToCrack / 86400)} days`
    if (secondsToCrack < 31536000000) return `${Math.ceil(secondsToCrack / 31536000)} years`
    return 'Centuries'
  }

  return (
    <div className="password-generator">
      <div className="generator-header">
        <h3>🔐 Advanced Password Generator</h3>
        <div className="preset-selector">
          <label>Quick Presets:</label>
          <select 
            value={presets} 
            onChange={(e) => applyPreset(e.target.value)}
            className="preset-dropdown"
          >
            {Object.entries(passwordPresets).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {copyFeedback && (
        <div className="copy-feedback">
          ✅ {copyFeedback}
        </div>
      )}
      
      <div className="generator-options">
        <div className="option-group">
          <label>
            Password Length: <strong>{options.length}</strong>
            <input
              type="range"
              min="4"
              max="64"
              value={options.length}
              onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
              className="length-slider"
            />
            <div className="length-markers">
              <span>4</span>
              <span>16</span>
              <span>32</span>
              <span>64</span>
            </div>
          </label>
        </div>

        <div className="checkbox-grid">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => handleOptionChange('includeUppercase', e.target.checked)}
            />
            <span className="checkbox-text">
              <strong>A-Z</strong> Uppercase Letters
            </span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => handleOptionChange('includeLowercase', e.target.checked)}
            />
            <span className="checkbox-text">
              <strong>a-z</strong> Lowercase Letters
            </span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => handleOptionChange('includeNumbers', e.target.checked)}
            />
            <span className="checkbox-text">
              <strong>0-9</strong> Numbers
            </span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => handleOptionChange('includeSymbols', e.target.checked)}
            />
            <span className="checkbox-text">
              <strong>!@#</strong> Symbols
            </span>
          </label>

          <label className="checkbox-label advanced">
            <input
              type="checkbox"
              checked={options.excludeSimilar}
              onChange={(e) => handleOptionChange('excludeSimilar', e.target.checked)}
            />
            <span className="checkbox-text">
              Exclude Similar <em>(i, l, 1, L, o, 0, O)</em>
            </span>
          </label>

          <label className="checkbox-label advanced">
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={(e) => handleOptionChange('excludeAmbiguous', e.target.checked)}
            />
            <span className="checkbox-text">
              Exclude Ambiguous <em>({}[]()\/'"~,;.&lt;&gt;)</em>
            </span>
          </label>

          <label className="checkbox-label advanced">
            <input
              type="checkbox"
              checked={options.mustIncludeEach}
              onChange={(e) => handleOptionChange('mustIncludeEach', e.target.checked)}
            />
            <span className="checkbox-text">
              Must Include Each Selected Type
            </span>
          </label>
        </div>
      </div>

      <div className="generator-actions">
        <button onClick={generatePassword} className="generate-btn">
          🎲 Generate Password
        </button>
        
        <button 
          onClick={() => generatePassword()} 
          className="regenerate-btn"
          disabled={!generatedPassword}
        >
          🔄 Regenerate
        </button>
      </div>

      {generatedPassword && (
        <div className="generated-password">
          <div className="password-display">
            <div className="password-container">
              <input
                type="text"
                value={generatedPassword}
                readOnly
                className="password-input"
                onClick={(e) => e.target.select()}
              />
              <div className="password-actions">
                <button onClick={() => copyToClipboard()} className="copy-btn">
                  📋
                </button>
                <button 
                  onClick={() => {
                    const input = document.createElement('input')
                    input.value = generatedPassword
                    document.body.appendChild(input)
                    input.select()
                    document.body.removeChild(input)
                  }} 
                  className="select-btn"
                  title="Select all"
                >
                  📄
                </button>
              </div>
            </div>
          </div>
          
          <div className="password-analysis">
            <div className="strength-section">
              <div className="strength-header">
                <span>Password Strength:</span>
                <span className={`strength-badge ${strength}`}>
                  {strength.toUpperCase()}
                </span>
              </div>
              
              <div className="strength-meter">
                <div 
                  className={`strength-fill ${strength}`} 
                  style={{ 
                    width: `${(strengthScore / 9) * 100}%`,
                    backgroundColor: getStrengthColor()
                  }}
                ></div>
              </div>
              
              <div className="strength-details">
                <span>Score: {strengthScore}/9</span>
                <span>Estimated crack time: {getEstimatedCrackTime()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {passwordHistory.length > 1 && (
        <div className="password-history">
          <h4>Recent Passwords</h4>
          <div className="history-list">
            {passwordHistory.slice(1, 4).map((pwd, index) => (
              <div key={index} className="history-item">
                <span className="history-password">{pwd.substring(0, 12)}...</span>
                <button 
                  onClick={() => copyToClipboard(pwd, 'Previous password')}
                  className="history-copy-btn"
                  title="Copy this password"
                >
                  📋
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PasswordGenerator
