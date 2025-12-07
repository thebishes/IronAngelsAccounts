import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './AllJobs.css';

const AllJobs = ({ jobs, onDeleteJob, loading }) => {
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const formatCurrency = (amount) => `£${amount.toFixed(2)}`;

  const filteredJobs = jobs.filter(job => {
    if (filter === 'All') return true;
    return job.status === filter;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date.split('/').reverse().join('-'));
        bValue = new Date(b.date.split('/').reverse().join('-'));
        break;
      case 'client':
        aValue = a.clientName.toLowerCase();
        bValue = b.clientName.toLowerCase();
        break;
      case 'amount':
        aValue = a.totalAmount;
        bValue = b.totalAmount;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const generateInvoicePdf = (job) => {
    const doc = new jsPDF();

    const left = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const centre = pageWidth / 2;
    let y = 20;

    // Header / Branding
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 0, 0); // red (RGB)
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0); // black (RGB)
    doc.text('Ironing Angels', centre, y); y += 8;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('by Hayley', centre, y); y += 6;
    doc.text('Professional Cleaning & Ironing Services', centre, y); y += 6;
    doc.text('Email: info@ironingangels.uk', centre, y); y += 6;
    doc.text('Phone: 07901 611906', centre, y); y += 10;

    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Invoice', left, y); y += 10;

    // Invoice meta
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Invoice #: ${job.invoiceNumber}`, left, y); y += 6;
    doc.text(`Date: ${job.date}`, left, y); y += 6;
    doc.text(`Client: ${job.clientName}`, left, y); y += 6;
    doc.text(`Service: ${job.serviceType}`, left, y); y += 6;
    doc.text(`Status: ${job.status}`, left, y); y += 10;

    // Items section
    doc.setFont(undefined, 'bold');
    doc.text('Items', left, y); y += 6;
    doc.setFont(undefined, 'normal');

    const items = job.items || [];
    if (items.length === 0) {
      doc.text('- No items -', left, y); y += 6;
    } else {
      items.forEach((item) => {
        const line = `${item.description}  x${item.quantity}  @ £${Number(item.price || item.total || 0).toFixed(2)}  = £${Number(item.total || (item.price * item.quantity) || 0).toFixed(2)}`;
        doc.text(line, left, y);
        y += 6;
      });
    }

    y += 6;
    doc.setFont(undefined, 'bold');
    const totalDue = Number(job.totalAmount || 0).toFixed(2);
    doc.text(`Total: £${totalDue}`, left, y);

    // Payment details footer block (near bottom)
    const footerTop = 250;
    let fy = footerTop;
    doc.setFont(undefined, 'bold');
    doc.text('Payment Details:', left, fy); fy += 6;
    doc.setFont(undefined, 'normal');
    doc.text('Please quote your invoice number', left, fy); fy += 6;
    doc.text('Account number: 64862237', left, fy); fy += 6;
    doc.text('Sort code: 60-83-71', left, fy); fy += 6;
    doc.text(`Amount Due: £${totalDue}`, left, fy); fy += 10;

    // Thank you message
    doc.setFontSize(10);
    doc.text('Thank you for your business!', left, 285);

    const filename = `Invoice-${job.invoiceNumber || job.id}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="all-jobs">
      <div className="container">
        <div className="page-header">
          <h1>All Jobs</h1>
          <div className="job-stats">
            <span>Total: {jobs.length} jobs</span>
            <span>•</span>
            <span>Total Value: {formatCurrency(jobs.reduce((sum, job) => sum + job.totalAmount, 0))}</span>
          </div>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All Jobs</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="client">Client Name</option>
              <option value="amount">Amount</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="jobs-table-container">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Invoice#</th>
                <th>Client Name</th>
                <th>Date</th>
                <th>Service Type</th>
                <th>Status</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedJobs.map((job) => (
                <tr key={job.id}>
                  <td className="invoice-cell">#{job.invoiceNumber}</td>
                  <td className="client-cell">{job.clientName}</td>
                  <td className="date-cell">{job.date}</td>
                  <td className="service-cell">{job.serviceType}</td>
                  <td className="status-cell">
                    <span className={`status-badge ${job.status.toLowerCase().replace(' ', '-')}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="items-cell">
                    <div className="items-summary">
                      {job.items.map((item, index) => (
                        <div key={index} className="item-summary">
                          {item.description} ({item.quantity}x)
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="amount-cell">{formatCurrency(job.totalAmount)}</td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="pdf-btn"
                      title="Download Invoice PDF"
                      aria-label={`Download invoice for ${job.invoiceNumber}`}
                      onClick={() => generateInvoicePdf(job)}
                      disabled={loading}
                      style={{ marginRight: '8px' }}
                    >
                      🧾 Invoice
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      title="Delete"
                      aria-label={`Delete job ${job.invoiceNumber}`}
                      onClick={() => onDeleteJob && onDeleteJob(job)}
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedJobs.length === 0 && (
            <div className="no-jobs">
              <p>No jobs found matching the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllJobs;