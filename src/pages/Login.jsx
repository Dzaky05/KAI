// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '/src/context/AuthProvider.jsx';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // dipanggil DI SINI, bukan di luar fungsi

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const result = onLogin
        ? await onLogin({ email, password })
        : await login({ email, password }); // fallback ke context login

      if (result.success) {
        navigate('/Dashboard'); // ganti dengan rute yang sesuai
      } else if (result.error) {
        setError(result.error);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="src/assets/logokai.png" alt="KAI Logo" className="login-logo" />
        <h2 className="login-title">SIGN IN</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="login-input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <button type="submit" className="login-button">Sign In</button>
        </form>

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
