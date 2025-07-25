import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ChevronDown } from 'lucide-react';
import { Job, JobItem } from '../types';
import { jobService } from '../services/jobService';

interface AddJobProps {
  onAddJob: (job: Job) => void;
  onViewChange: (view: string) => void;
  editingJob?: Job | null;
}

const AddJob: React.FC<AddJobProps> = ({ onAddJob, onViewChange, editingJob }) => {
  const [clientName, setClientName] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allClientNames, setAllClientNames] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'ironing' | 'cleaning' | 'both'>('ironing');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'completed' | 'pending' | 'invoiced'|'paid'>('completed');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoicingCompany, setInvoicingCompany] = useState<'Cleaning Angels' | 'Ironing Angels'>('Cleaning Angels');
  const [items, setItems] = useState<JobItem[]>([
    { id: '1', description: '', quantity: 1, price: 0, total: 0 }
  ]);

  // Load existing client names on component mount
  useEffect(() => {
    const loadClientNames = async () => {
      try {
        const jobs = await jobService.getAllJobs();
        const uniqueClients = [...new Set(jobs.map(job => job.clientName))].sort();
        setAllClientNames(uniqueClients);
      } catch (error) {
        console.error('Error loading client names:', error);
      }
    };
    loadClientNames();
  }, []);

  useEffect(() => {
    if (editingJob) {
      setClientName(editingJob.clientName);
      setDate(editingJob.date);
      setType(editingJob.type);
      setNotes(editingJob.notes || '');
      setStatus(editingJob.status);
      setInvoiceNumber(editingJob.invoiceNumber || '');
      setInvoicingCompany(editingJob.invoicingCompany || 'Cleaning Angels');
      setItems(editingJob.items);
    } else {
      // Generate preview invoice number for new jobs
      const currentYear = new Date().getFullYear();
      setInvoiceNumber(`${currentYear}-0000`);
    }
  }, [editingJob]);

  // Filter suggestions based on input
  useEffect(() => {
    if (clientName.trim() && allClientNames.length > 0) {
      const filtered = allClientNames.filter(name =>
        name.toLowerCase().includes(clientName.toLowerCase()) &&
        name.toLowerCase() !== clientName.toLowerCase()
      );
      setClientSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setClientSuggestions([]);
      setShowSuggestions(false);
    }
  }, [clientName, allClientNames]);

  const addItem = () => {
    const newItem: JobItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof JobItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleClientNameChange = (value: string) => {
    setClientName(value);
  };

  const selectSuggestion = (suggestion: string) => {
    setClientName(suggestion);
    setShowSuggestions(false);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim() || items.some(item => !item.description.trim())) {
      alert('Please fill in all required fields');
      return;
    }

    const jobData: Job = {
      id: editingJob ? editingJob.id : Date.now().toString(),
      clientName: clientName.trim(),
      date,
      type,
      items: items.filter(item => item.description.trim()),
      total: totalAmount,
      status,
      notes: notes.trim() || undefined,
      invoicingCompany,
      createdAt: editingJob ? editingJob.createdAt : new Date().toISOString()
    };

    onAddJob(jobData);
    
    if (!editingJob) {
      // Reset form only if not editing
      setClientName('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('ironing');
      setNotes('');
      setStatus('completed');
      setInvoicingCompany('Cleaning Angels');
      setInvoicingCompany('Cleaning Angels');
      setItems([{ id: '1', description: '', quantity: 1, price: 0, total: 0 }]);
    }
    
    onViewChange('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">
            {editingJob ? 'Edit Job' : 'Add New Job'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => handleClientNameChange(e.target.value)}
                onFocus={() => {
                  if (clientSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicking on them
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Enter client name"
                required
              />
              {showSuggestions && clientSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {clientSuggestions.slice(0, 10).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Invoice# {!editingJob && <span className="text-slate-500">(Auto-generated)</span>}
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  !editingJob ? 'bg-slate-100 text-slate-600' : ''
                }`}
                placeholder="Invoice number"
                readOnly={!editingJob}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Service Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'ironing' | 'cleaning' | 'both')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="ironing">Ironing</option>
                <option value="cleaning">Cleaning</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'completed' | 'pending' | 'invoiced'|'paid')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="invoiced">Invoiced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Invoicing Company *
              </label>
              <select
                value={invoicingCompany}
                onChange={(e) => setInvoicingCompany(e.target.value as 'Cleaning Angels' | 'Ironing Angels')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="Cleaning Angels">Cleaning Angels</option>
                <option value="Ironing Angels">Ironing Angels</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Items & Charges
            </label>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        placeholder="e.g., Shirts, Bed sheets, House cleaning"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Price (£)
                      </label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Total (£)
                      </label>
                      <input
                        type="text"
                        value={item.total.toFixed(2)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100 text-slate-600"
                        readOnly
                      />
                    </div>
                    
                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="w-full p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-slate-700">Total Amount:</span>
              <span className="text-2xl font-bold text-slate-800">£{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onViewChange('dashboard')}
              className="px-6 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingJob ? 'Update Job' : 'Save Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJob;