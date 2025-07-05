// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '/src/context/AuthProvider.jsx';
import './Login.css';

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

  // SVG Icons for Social Logins
  const GoogleLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const MicrosoftLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="24" height="24">
      <path d="M0 0h23v23H0z" fill="#f3f3f3"/>
      <path d="M1 1h10v10H1z" fill="#f35325"/>
      <path d="M12 1h10v10H12z" fill="#81bc06"/>
      <path d="M1 12h10v10H1z" fill="#05a6f0"/>
      <path d="M12 12h10v10H12z" fill="#ffba08"/>
    </svg>
  );

  return (
    <div className="login-container">
      <div className="login-box">
        <img 
          src="src/assets/logokai.png" 
          alt="KAI Logo" 
          className="login-logo"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = '/default-logo.png'
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