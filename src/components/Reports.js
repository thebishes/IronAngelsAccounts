import React, { useState } from 'react';
import './Reports.css';

const Reports = ({ jobs }) => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('summary');

  const formatCurrency = (amount) => `£${amount.toFixed(2)}`;

  // Calculate date ranges
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  const filterJobsByDateRange = (jobs) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.date.split('/').reverse().join('-'));
      
      switch (dateRange) {
        case 'thisMonth':
          return jobDate >= thisMonthStart;
        case 'lastMonth':
          return jobDate >= lastMonthStart && jobDate <= lastMonthEnd;
        case 'thisYear':
          return jobDate >= thisYearStart;
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredJobs = filterJobsByDateRange(jobs);

  // Calculate summary statistics
  const totalRevenue = filteredJobs.reduce((sum, job) => sum + job.totalAmount, 0);
  const totalJobs = filteredJobs.length;
  const completedJobs = filteredJobs.filter(job => job.status === 'Completed').length;
  const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

  // Group jobs by client
  const clientStats = filteredJobs.reduce((acc, job) => {
    if (!acc[job.clientName]) {
      acc[job.clientName] = {
        name: job.clientName,
        jobs: 0,
        revenue: 0
      };
    }
    acc[job.clientName].jobs += 1;
    acc[job.clientName].revenue += job.totalAmount;
    return acc;
  }, {});

  const topClients = Object.values(clientStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Group jobs by service type
  const serviceStats = filteredJobs.reduce((acc, job) => {
    if (!acc[job.serviceType]) {
      acc[job.serviceType] = {
        type: job.serviceType,
        jobs: 0,
        revenue: 0
      };
    }
    acc[job.serviceType].jobs += 1;
    acc[job.serviceType].revenue += job.totalAmount;
    return acc;
  }, {});

  const serviceBreakdown = Object.values(serviceStats);

  // Monthly breakdown for this year
  const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(now.getFullYear(), i, 1);
    const monthJobs = jobs.filter(job => {
      const jobDate = new Date(job.date.split('/').reverse().join('-'));
      return jobDate.getMonth() === i && jobDate.getFullYear() === now.getFullYear();
    });
    
    return {
      month: month.toLocaleDateString('en-GB', { month: 'long' }),
      jobs: monthJobs.length,
      revenue: monthJobs.reduce((sum, job) => sum + job.totalAmount, 0)
    };
  });

  return (
    <div className="reports">
      <div className="container">
        <div className="page-header">
          <h1>Reports & Analytics</h1>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <label>Date Range:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Report Type:</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="summary">Summary</option>
              <option value="clients">Client Analysis</option>
              <option value="services">Service Breakdown</option>
              <option value="monthly">Monthly Trends</option>
            </select>
          </div>
        </div>

        {reportType === 'summary' && (
          <div className="report-section">
            <h2>Business Summary</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p className="stat-value">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="stat-card">
                <h3>Total Jobs</h3>
                <p className="stat-value">{totalJobs}</p>
              </div>
              <div className="stat-card">
                <h3>Completed Jobs</h3>
                <p className="stat-value">{completedJobs}</p>
              </div>
              <div className="stat-card">
                <h3>Average Job Value</h3>
                <p className="stat-value">{formatCurrency(averageJobValue)}</p>
              </div>
            </div>
          </div>
        )}

        {reportType === 'clients' && (
          <div className="report-section">
            <h2>Top Clients</h2>
            <div className="table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Jobs</th>
                    <th>Total Revenue</th>
                    <th>Avg Job Value</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((client, index) => (
                    <tr key={index}>
                      <td>{client.name}</td>
                      <td>{client.jobs}</td>
                      <td>{formatCurrency(client.revenue)}</td>
                      <td>{formatCurrency(client.revenue / client.jobs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'services' && (
          <div className="report-section">
            <h2>Service Breakdown</h2>
            <div className="table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Service Type</th>
                    <th>Jobs</th>
                    <th>Revenue</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceBreakdown.map((service, index) => (
                    <tr key={index}>
                      <td>{service.type}</td>
                      <td>{service.jobs}</td>
                      <td>{formatCurrency(service.revenue)}</td>
                      <td>{totalRevenue > 0 ? ((service.revenue / totalRevenue) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'monthly' && (
          <div className="report-section">
            <h2>Monthly Trends ({now.getFullYear()})</h2>
            <div className="table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Jobs</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBreakdown.map((month, index) => (
                    <tr key={index}>
                      <td>{month.month}</td>
                      <td>{month.jobs}</td>
                      <td>{formatCurrency(month.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredJobs.length === 0 && (
          <div className="no-data">
            <p>No data available for the selected date range.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;