// src/components/SignIn.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Check if user was just verified
    const justVerified = localStorage.getItem('justVerified');
    const verifiedEmail = localStorage.getItem('verifiedEmail');
    
    if (justVerified === 'true' && verifiedEmail) {
      setSuccess('Your email has been verified! Please sign in to continue.');
      setFormData(prev => ({ ...prev, email: verifiedEmail }));
      
      // Clear the verification flags
      localStorage.removeItem('justVerified');
      localStorage.removeItem('verifiedEmail');
    }
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(`Welcome back, ${data.user.username}!`);
        // Store user info in localStorage or state management
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        if (data.isVerified === false) {
          setError('Please verify your email before signing in. Check your inbox for the verification link.');
        } else {
          setError(data.message || 'Sign in failed. Please check your credentials.');
        }
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Verification email has been resent. Please check your inbox.');
      } else {
        setError(data.message || 'Failed to resend verification email.');
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to your account</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="button-primary" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          {error && error.includes('verify your email') && (
            <button 
              type="button" 
              className="button-secondary" 
              onClick={handleResendVerification}
              disabled={loading}
            >
              Resend Verification Email
            </button>
          )}
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
