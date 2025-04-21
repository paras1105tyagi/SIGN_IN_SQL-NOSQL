// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import EmailVerification from './components/EmailVerification';
import DeleteConfirmation from './components/DeleteConfirmation';
import Dashboard from './components/Dashboard';
import './components/Verification.css';
import './components/Auth.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email/:userId/:token" element={<EmailVerification />} />
        <Route path="/confirm-deletion/:userId/:token" element={<DeleteConfirmation />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
