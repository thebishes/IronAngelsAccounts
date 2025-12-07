import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './AddJob.css';

const EditJob = ({ onUpdateJob, api, loading }) => {
  const { invoiceNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const passedJob = location.state && location.state.job;

  const [job, setJob] = useState(passedJob || null);
  const [formData, setFormData] = useState({
    clientName: '',
    date: '',
    serviceType: 'Ironing',
    invoicingCompany: 'Cleaning Angels',
    status: 'Completed',
    notes: '',
    totalAmount: 0,
  });

  useEffect(() => {
    const populate = (data) => {
      setJob(data);
      setFormData({
        clientName: data.clientName || '',
        date: data.date ? data.date.split('/').reverse().join('-') : '',
        serviceType: data.serviceType || 'Ironing',
        invoicingCompany: data.invoicingCompany || 'Iron & Clean Pro',
        status: data.status || 'Completed',
        notes: data.notes || '',
        totalAmount: data.totalAmount || 0,
      });
    };

    if (passedJob) {
      populate(passedJob);
      return;
    }

    const load = async () => {
      try {
        const data = await api.getJobByInvoice(invoiceNumber);
        populate(data);
      } catch (e) {
        alert(e.message || 'Failed to load job');
        navigate('/all-jobs');
      }
    };
    load();
  }, [invoiceNumber, passedJob]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'totalAmount' ? parseFloat(value || 0) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      await api.updateJobByInvoice(invoiceNumber, payload);
      navigate('/all-jobs');
    } catch (err) {
      alert(err.message || 'Failed to save changes');
    }
  };

  if (!job) {
    return (
      <div className="add-job">
        <div className="container">
          <div className="add-job-form"><h1>Loading...</h1></div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-job">
      <div className="container">
        <div className="add-job-form">
          <h1>Edit Job #{job.invoiceNumber}</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="clientName">Client Name *</label>
                <input type="text" id="clientName" name="clientName" value={formData.clientName} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="serviceType">Service Type *</label>
                <select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleInputChange} required>
                  <option value="Ironing">Ironing</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select id="status" name="status" value={formData.status} onChange={handleInputChange} required>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="invoicingCompany">Invoicing Company *</label>
                <select id="invoicingCompany" name="invoicingCompany" value={formData.invoicingCompany} onChange={handleInputChange} required>
                  <option value="Cleaning Angels">Cleaning Angels</option>
                  <option value="Iron & Clean Pro">Iron & Clean Pro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="totalAmount">Total Amount (£)</label>
                <input type="number" step="0.01" id="totalAmount" name="totalAmount" value={formData.totalAmount} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any additional notes..." rows="4" />
            </div>

            <div className="form-footer">
              <div></div>
              <div className="form-actions">
                <button type="button" onClick={() => navigate('/all-jobs')} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn" disabled={loading}>Save</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditJob;
