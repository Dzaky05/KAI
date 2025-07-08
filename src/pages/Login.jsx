// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '/src/context/AuthProvider.jsx';
import './Login.css'; // Assuming you have a Login.css file for styling

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = onLogin
        ? await onLogin({ email, password })
        : await login({ email, password });

      if (result?.success) {
        navigate('/Dashboard');
      } else {
        setError(result?.error || result?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img
          src="src/assets/logokai.png" // Ensure this path is correct
          alt="KAI Logo"
          className="login-logo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-logo.png' // Fallback image
          }}
        />

        <h2 className="login-title">PT KERETA API BALAI YASA & LAA</h2>
        <p className="login-subtitle">Enter your credentials to access your account</p>

        {error && (
          <div className="login-error">
            <span className="error-icon">!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
              autoComplete="username"
            />
          </div>

          <div className="login-input-group">
            <div className="password-label-container">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="/forgot-password" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Removed social login divider and buttons */}
        {/*
        <div className="login-divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-button google">
            <GoogleLogo />
            Google
          </button>
          <button className="social-button microsoft">
            <MicrosoftLogo />
            Microsoft
          </button>
        </div>
        */}

        <div className="login-link">
          Don't have an account? <a href="/signup">Sign Up</a>
        </div>

        <div className="login-footer">
          © {new Date().getFullYear()} PT Kereta Api Indonesia
        </div>
      </div>
    </div>
  );
};

export default Login;