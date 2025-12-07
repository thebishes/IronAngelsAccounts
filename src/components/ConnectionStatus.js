import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      // Try to reach the health endpoint
      await apiService.healthCheck();
      setStatus('connected');
    } catch (error) {
      console.error('Connection check failed:', error);
      setStatus('disconnected');
      setError(error.message);
    }
  };

  if (status === 'checking') {
    return (
      <div className="connection-status checking">
        <span className="status-icon">⏳</span>
        <span>Checking server connection...</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="connection-status connected">
        <span className="status-icon">✅</span>
        <span>Connected to server</span>
      </div>
    );
  }

  return (
    <div className="connection-status disconnected">
      <div className="status-content">
        <span className="status-icon">❌</span>
        <div className="status-text">
          <strong>Cannot connect to server</strong>
          <p>{error}</p>
          <p>Please ensure the backend server is running:</p>
          <code>cd server && npm start</code>
        </div>
      </div>
      <button onClick={checkConnection} className="retry-btn">
        🔄 Retry Connection
      </button>
    </div>
  );
};

export default ConnectionStatus;