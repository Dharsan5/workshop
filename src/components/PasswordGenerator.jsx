import { useState } from 'react'
import './PasswordGenerator.css'

const PasswordGenerator = ({ onPasswordGenerated }) => {
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [options, setOptions] = useState({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false
  })
  const [strength, setStrength] = useState('')

  const generatePassword = () => {
    let charset = ''
    
    if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (options.includeNumbers) charset += '0123456789'
    if (options.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    if (options.excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '')
    }

    if (charset === '') {
      alert('Please select at least one character type')
      return
    }

    let password = ''
    for (let i = 0; i < options.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    setGeneratedPassword(password)
    calculateStrength(password)
    
    if (onPasswordGenerated) {
      onPasswordGenerated(password)
    }
  }

  const calculateStrength = (password) => {
    let score = 0
    
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    
    if (score <= 2) setStrength('weak')
    else if (score <= 4) setStrength('medium')
    else setStrength('strong')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword)
      alert('Password copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy password:', err)
      alert('Failed to copy password')
    }
  }

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }))
  }

  return (
    <div className="password-generator">
      <h3>Password Generator</h3>
      
      <div className="generator-options">
        <div className="option-group">
          <label>
            Password Length: {options.length}
            <input
              type="range"
              min="4"
              max="50"
              value={options.length}
              onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
              className="length-slider"
            />
          </label>
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => handleOptionChange('includeUppercase', e.target.checked)}
            />
            Include Uppercase (A-Z)
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => handleOptionChange('includeLowercase', e.target.checked)}
            />
            Include Lowercase (a-z)
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => handleOptionChange('includeNumbers', e.target.checked)}
            />
            Include Numbers (0-9)
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => handleOptionChange('includeSymbols', e.target.checked)}
            />
            Include Symbols (!@#$...)
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.excludeSimilar}
              onChange={(e) => handleOptionChange('excludeSimilar', e.target.checked)}
            />
            Exclude Similar Characters (i, l, 1, L, o, 0, O)
          </label>
        </div>
      </div>

      <button onClick={generatePassword} className="generate-btn">
        Generate Password
      </button>

      {generatedPassword && (
        <div className="generated-password">
          <div className="password-display">
            <input
              type="text"
              value={generatedPassword}
              readOnly
              className="password-input"
            />
            <button onClick={copyToClipboard} className="copy-btn">
              📋 Copy
            </button>
          </div>
          
          {strength && (
            <div className={`strength-indicator ${strength}`}>
              Password Strength: <strong>{strength.toUpperCase()}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PasswordGenerator
