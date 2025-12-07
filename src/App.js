import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddJob from './components/AddJob';
import AllJobs from './components/AllJobs';
import Reports from './components/Reports';
import apiService from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const authStatus = sessionStorage.getItem('ironCleanAuth');
    const token = localStorage.getItem('authToken');
    
    if (authStatus === 'authenticated' && token) {
      setIsAuthenticated(true);
      loadJobs();
    }
  }, []);

  // Load jobs from database
  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await apiService.getJobs();
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (authStatus) => {
    setIsAuthenticated(authStatus);
    if (authStatus) {
      loadJobs();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ironCleanAuth');
    sessionStorage.removeItem('currentUser');
    apiService.logout();
    setIsAuthenticated(false);
    setJobs([]);
  };

  const addJob = async (newJobData) => {
    try {
      setLoading(true);
      const newJob = await apiService.createJob(newJobData);
      setJobs([newJob, ...jobs]);
      return newJob;
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (job) => {
    try {
      setLoading(true);
      // Prefer invoice-based deletion for robust identifier handling
      await apiService.deleteJob(job.invoiceNumber || job.id);
      setJobs(prev => prev.filter(j => j.id !== job.id && j.invoiceNumber !== job.invoiceNumber));
    } catch (error) {
      console.error('Error deleting job:', error);
      setError(`Failed to delete job: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <Header onLogout={handleLogout} />
        <main className="main-content">
          {error && (
            <div className="error-banner">
              <p>⚠️ {error}</p>
              <button onClick={loadJobs}>Retry</button>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Dashboard jobs={jobs} loading={loading} />} />
            <Route path="/add-job" element={<AddJob onAddJob={addJob} loading={loading} />} />
            <Route path="/all-jobs" element={<AllJobs jobs={jobs} loading={loading} onDeleteJob={deleteJob} />} />
            <Route path="/reports" element={<Reports jobs={jobs} loading={loading} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;