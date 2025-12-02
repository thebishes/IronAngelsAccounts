import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddJob from './components/AddJob';
import JobList from './components/JobList';
import Reports from './components/Reports';
import Auth from './components/Auth';
import { Job } from './types';
import { jobService } from './services/jobService';
import { authService } from './services/authService';
import { Loader2 } from 'lucide-react';
const DEBUG_MODE = true; // Set to false to re-enable login

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const checkUser = async () => {
    if (DEBUG_MODE) {
      const fakeUser = { id: 'debug-user', email: 'debug@example.com' };
      localStorage.setItem('currentUser', JSON.stringify(fakeUser));
      setUser(fakeUser);
      await loadJobs();
      setLoading(false);
      return;
    }

    try {
      const { user } = await authService.getCurrentUser();
      setUser(user);
      if (user) {
        await loadJobs();
      }
    } catch (err) {
      console.error('Error checking user:', err);
    } finally {
      setLoading(false);
    }
  };

  checkUser();

  const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
    setUser(user);
    if (user) {
      await loadJobs();
    } else {
      setJobs([]);
    }
  });

  return () => subscription.unsubscribe();
}, []);

  const loadJobs = async () => {
    try {
      setError(null);
      const jobsData = await jobService.getAllJobs();
      setJobs(jobsData);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs. Please try again.');
    }
  };

  const handleAddJob = async (job: Omit<Job, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      console.log('Creating job with data:', job);
      const newJob = await jobService.createJob(job);
      console.log('Job created successfully:', newJob);
      // Reload all jobs to get the correct totals from database
      await loadJobs();
    } catch (err) {
      console.error('Error adding job:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add job. Please try again.';
      setError(errorMessage);
      alert(`Error adding job: ${errorMessage}`);
    }
  };

  const handleUpdateJob = async (updatedJob: Job) => {
    try {
      setError(null);
      const updated = await jobService.updateJob(updatedJob);
      // Reload all jobs to get the correct totals from database
      await loadJobs();
      setEditingJob(null);
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      setError(null);
      await jobService.deleteJob(jobId);
      // Reload all jobs to ensure data consistency
      await loadJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again.');
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setCurrentView('add-job');
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setJobs([]);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const renderCurrentView = () => {
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
          >
            Dismiss
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard jobs={jobs} onViewChange={setCurrentView} />;
      case 'add-job':
        return (
          <AddJob 
            onAddJob={editingJob ? handleUpdateJob : handleAddJob} 
            onViewChange={setCurrentView}
            editingJob={editingJob}
          />
        );
      case 'jobs':
        return (
          <JobList 
            jobs={jobs} 
            onDeleteJob={handleDeleteJob}
            onEditJob={handleEditJob}
          />
        );
      case 'reports':
        return <Reports jobs={jobs} />;
      default:
        return <Dashboard jobs={jobs} onViewChange={setCurrentView} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => setLoading(false)} />;
  }

  return (
    <Layout
      currentView={currentView}
      onViewChange={setCurrentView}
      user={user}
      onSignOut={handleSignOut}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;