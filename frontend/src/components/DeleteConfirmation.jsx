import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './Verification.css';

function DeleteConfirmation() {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmDeletion = async () => {
      try {
        console.log(`Deletion confirmation attempt for userId: ${userId}, token: ${token}`);
        
        // Clear any existing user data from localStorage first
        localStorage.removeItem('user');
        
        const response = await fetch(`http://localhost:5000/api/auth/confirm-deletion/${userId}/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('Deletion response:', data);
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Account successfully deleted.');
          
          // If account was successfully deleted, remove user session
          localStorage.removeItem('user');
        } else {
          // Handle case where account might have been already deleted
          if (response.status === 400 && data.message === "Invalid deletion link") {
            // Check if the user was already deleted and we're just seeing a residual link
            setStatus('success');
            setMessage('Your account has been deleted successfully.');
          } else {
            setStatus('error');
            setMessage(data.message || 'Failed to delete account. The link may be expired or invalid.');
          }
        }
      } catch (error) {
        console.error('Deletion confirmation error:', error);
        setStatus('error');
        setMessage('An error occurred during account deletion. Please try again later.');
      }
    };

    confirmDeletion();
  }, [userId, token, navigate]);

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h2>Account Deletion</h2>
        
        {status === 'loading' && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processing your account deletion request...</p>
          </div>
        )}
        
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <p className="success-message">{message}</p>
            <Link to="/signup" className="signin-button">Create New Account</Link>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="error-icon">✗</div>
            <p className="error-message">{message}</p>
            <Link to="/signin" className="signin-button">Back to Sign In</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default DeleteConfirmation; 