import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './Verification.css';

function EmailVerification() {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log(`Verifying token: ${token} for user: ${userId}`);
        
        const response = await fetch(`http://localhost:5000/api/auth/verify-email/${userId}/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('Verification response:', data);
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now sign in.');
          
          // Try to fetch user data to get the email
          try {
            const userResponse = await fetch(`http://localhost:5000/api/auth/user/${userId}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setEmail(userData.email);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
          
        } else if (response.status === 400 && data.message.includes('already verified')) {
          setStatus('success');
          setMessage('Your email has already been verified. You can sign in with your account.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to verify email. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again later.');
      }
    };

    verifyEmail();
  }, [userId, token]);

  const handleAutoLogin = () => {
    if (email) {
      // Store information that this user was just verified
      localStorage.setItem('justVerified', 'true');
      localStorage.setItem('verifiedEmail', email);
      navigate('/signin');
    } else {
      navigate('/signin');
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h2>Email Verification</h2>
        
        {status === 'loading' && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Verifying your email...</p>
          </div>
        )}
        
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <p className="success-message">{message}</p>
            <button onClick={handleAutoLogin} className="signin-button">Continue to Sign In</button>
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

export default EmailVerification; 