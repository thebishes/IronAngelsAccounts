import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddJob.css';

const AddJob = ({ onAddJob, loading }) => {
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const six = Math.floor(100000 + Math.random() * 900000);
    return `${year}-${six}`;
  };
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: '',
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toISOString().split('T')[0],
    serviceType: 'Ironing',
    invoicingCompany: 'Ironing Angels',
    status: 'Completed',
    notes: ''
  });

  const [items, setItems] = useState([
    { description: '', quantity: 1, price: 0, total: 0 }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Regenerate invoice number when date changes year (optional UX nicety)
  React.useEffect(() => {
    const currentYear = new Date(formData.date).getFullYear();
    const prefix = String(formData.invoiceNumber || '').split('-')[0];
    if (String(currentYear) !== prefix) {
      setFormData(prev => ({ ...prev, invoiceNumber: `${currentYear}-${Math.floor(100000 + Math.random() * 900000)}` }));
    }
  }, [formData.date]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    
    // Calculate total for this item
    if (field === 'quantity' || field === 'price') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const price = parseFloat(updatedItems[index].price) || 0;
      updatedItems[index].total = quantity * price;
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.clientName.trim()) {
      alert('Please enter a client name');
      return;
    }

    const validItems = items.filter(item => item.description.trim() && item.quantity > 0);
    
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const newJob = {
      ...formData,
      items: validItems,
      totalAmount: calculateTotalAmount()
    };

    try {
      await onAddJob(newJob);
      navigate('/');
    } catch (error) {
      alert(error.message || 'Failed to save job. Please try again.');
    }
  };

  return (
    <div className="add-job">
      <div className="container">
        <div className="add-job-form">
          <h1>Add New Job</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="clientName">Client Name *</label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="invoiceNumber">Invoice# (Auto-generated)</label>
                <input
                  type="text"
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="serviceType">Service Type *</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Ironing">Ironing</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Invoiced">Invoiced</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="invoicingCompany">Invoicing Company *</label>
                <select
                  id="invoicingCompany"
                  name="invoicingCompany"
                  value={formData.invoicingCompany}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Ironing Angels">Ironing Angels</option>
                  <option value="Cleaning Angels">Cleaning Angels</option>
                  <option value="Iron & Clean Pro">Iron & Clean Pro</option>
                </select>
              </div>
            </div>

            <div className="items-section">
              <h3>Items & Charges</h3>
              <div className="items-header">
                <span>Description *</span>
                <span>Quantity</span>
                <span>Price (£)</span>
                <span>Total (£)</span>
                <span></span>
              </div>

              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-field">
                    <label className="mobile-label">Description *</label>
                    <input
                      type="text"
                      placeholder="e.g., Shirts, Bed sheets, House cleaning"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="item-field">
                    <label className="mobile-label">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="item-field">
                    <label className="mobile-label">Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    />
                  </div>
                  <div className="item-field">
                    <label className="mobile-label">Total (£)</label>
                    <input
                      type="text"
                      value={item.total.toFixed(2)}
                      readOnly
                      className="readonly"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="remove-item-btn"
                    disabled={items.length === 1}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))}

              <button type="button" onClick={addItem} className="add-item-btn">
                ➕ Add Item
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes..."
                rows="4"
              />
            </div>

            <div className="form-footer">
              <div className="total-amount">
                <strong>Total Amount: £{calculateTotalAmount().toFixed(2)}</strong>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => navigate('/')} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Job
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJob;