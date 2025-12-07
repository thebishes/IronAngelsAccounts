import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ jobs }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calculate statistics
  const totalEarnings = jobs.reduce((sum, job) => sum + job.totalAmount, 0);
  const completedJobs = jobs.filter(job => job.status === 'Completed').length;
  const pendingJobs = jobs.filter(job => job.status === 'Pending').length;
  
  const thisMonthEarnings = jobs
    .filter(job => {
      const jobDate = new Date(job.date.split('/').reverse().join('-'));
      return jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear;
    })
    .reduce((sum, job) => sum + job.totalAmount, 0);

  const formatCurrency = (amount) => `£${amount.toFixed(2)}`;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard v4.0a</h1>
          <Link to="/add-job" className="add-job-btn">
            Add New Job
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">£</div>
            <div className="stat-content">
              <h3>Total Earnings</h3>
              <p className="stat-value">{formatCurrency(totalEarnings)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>Completed Jobs</h3>
              <p className="stat-value">{completedJobs}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Pending Jobs</h3>
              <p className="stat-value">{pendingJobs}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">£</div>
            <div className="stat-content">
              <h3>This Month</h3>
              <p className="stat-value">{formatCurrency(thisMonthEarnings)}</p>
            </div>
          </div>
        </div>

        <div className="recent-jobs">
          <h2>Recent Jobs</h2>
          <div className="jobs-list">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="job-item">
                <div className="job-info">
                  <h3>{job.clientName}</h3>
                  <div className="job-details">
                    <span className="service-type">{job.serviceType}</span>
                    <span className="invoice-number">#{job.invoiceNumber}</span>
                    {job.notes && <span className="job-notes">{job.notes}</span>}
                  </div>
                </div>
                <div className="job-summary">
                  <div className="job-amount">{formatCurrency(job.totalAmount)}</div>
                  <div className="job-date">{job.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;