import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const handleDeleteRequest = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess('A confirmation email has been sent. Please check your inbox to complete the account deletion process.');
        setConfirmDelete(false);
      } else {
        setError(data.message || 'Failed to initiate account deletion');
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="auth-container">Loading...</div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Dashboard</h2>
        <p className="subtitle">Welcome, {user.username}!</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="profile-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {user.isVerified ? 'Verified' : 'Not Verified'}</p>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="button-primary"
        >
          Logout
        </button>
        
        <div className="account-actions">
          <h3>Account Management</h3>
          
          <div className="danger-zone">
            <h4>Delete Account</h4>
            <p>This action cannot be undone. Once you delete your account, all your data will be permanently removed.</p>
            
            {!confirmDelete ? (
              <button 
                onClick={() => setConfirmDelete(true)} 
                className="button-danger"
              >
                Delete My Account
              </button>
            ) : (
              <div className="confirm-delete">
                <p>Are you sure you want to delete your account?</p>
                <div className="button-group">
                  <button 
                    onClick={handleDeleteRequest} 
                    className="button-danger"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Yes, Delete My Account'}
                  </button>
                  <button 
                    onClick={() => setConfirmDelete(false)} 
                    className="button-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 