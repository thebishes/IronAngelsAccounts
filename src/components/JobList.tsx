import React, { useState } from 'react';
import { Job } from '../types';
import { Search, Eye, Edit, Trash2, Calendar, User, PoundSterling, FileText } from 'lucide-react';
import { formatDateUK } from '../utils/dateUtils';
import jsPDF from 'jspdf';

interface JobListProps {
  jobs: Job[];
  onDeleteJob: (jobId: string) => void;
  onEditJob: (job: Job) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, onDeleteJob, onEditJob }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'ironing' | 'cleaning' | 'both'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [invoiceJob, setInvoiceJob] = useState<Job | null>(null);

  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.items.some(item => item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || job.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'client':
          aValue = a.clientName.toLowerCase();
          bValue = b.clientName.toLowerCase();
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field: 'date' | 'client' | 'total') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleExportPDF = (job: Job) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 30;

    // Company Header
    pdf.setFontSize(20);
    pdf.setTextColor(190, 24, 93); // Dark pink color
    const companyName = job.invoicingCompany || 'Cleaning Angels';
    pdf.text(companyName, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 116, 139); // Grey color
    pdf.text('by Hayley', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Professional Cleaning & Ironing Services', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    pdf.text(`Email: info@${companyName.toLowerCase().replace(' ', '')}.uk`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    pdf.text('Phone: 07901 611906', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;

    // Invoice Title
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('INVOICE', pageWidth - margin, yPosition, { align: 'right' });
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.text(`Invoice #: ${job.invoiceNumber || 'N/A'}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;
    pdf.text(`Date: ${formatDateUK(job.date)}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;
    pdf.text(`Status: ${job.status}`, pageWidth - margin, yPosition, { align: 'right' });
    
    // Bill To
    yPosition += 15;
    pdf.setFontSize(12);
    pdf.text('Bill To:', margin, yPosition);
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.text(job.clientName, margin, yPosition);
    
    yPosition += 20;

    // Table Header
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const tableStartY = yPosition;
    const colWidths = [80, 25, 30, 35];
    const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
    
    // Header background
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 10, 'F');
    
    pdf.text('Description', colPositions[0], yPosition + 5);
    pdf.text('Qty', colPositions[1], yPosition + 5, { align: 'center' });
    pdf.text('Rate', colPositions[2], yPosition + 5, { align: 'right' });
    pdf.text('Amount', colPositions[3], yPosition + 5, { align: 'right' });
    
    yPosition += 15;

    // Table Rows
    job.items.forEach((item, index) => {
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 10, 'F');
      }
      
      pdf.text(item.description, colPositions[0], yPosition + 5);
      pdf.text(item.quantity.toString(), colPositions[1], yPosition + 5, { align: 'center' });
      pdf.text(`£${item.price.toFixed(2)}`, colPositions[2], yPosition + 5, { align: 'right' });
      pdf.text(`£${item.total.toFixed(2)}`, colPositions[3], yPosition + 5, { align: 'right' });
      
      yPosition += 12;
    });

    // Total
    yPosition += 10;
    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin + colWidths[0] + colWidths[1], yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(12);
    pdf.text('Total:', pageWidth - margin - 40, yPosition);
    pdf.text(`£${job.total.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
    
    // Notes
    if (job.notes) {
      yPosition += 20;
      pdf.setFontSize(10);
      pdf.text('Notes:', margin, yPosition);
      yPosition += 8;
      const splitNotes = pdf.splitTextToSize(job.notes, pageWidth - 2 * margin);
      pdf.text(splitNotes, margin, yPosition);
      yPosition += splitNotes.length * 5;
    }
    
    // Footer
    yPosition += 20;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    const footerText = [
      'Thank you for your custom, we appreciate it.',
      '',
      'If you appreciate our services and would like to leave a public comment for our social media, please WhatsApp us.',
      '',
      'Payment terms: Please pay on day of invoice receipt.',
      '',
      'Payment Details:',
      'Please quote your invoice number',
      'Account number: 64862237',
      'Sort code: 60-83-71'
    ];
    
    footerText.forEach((line) => {
      if (line === 'Payment Details:') {
        pdf.setFontSize(9);
        pdf.setTextColor(51, 65, 85); // Darker color for header
      } else if (line.includes('Account number:') || line.includes('Sort code:') || line.includes('Please quote your invoice number')) {
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0); // Black for payment details
      } else {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100); // Grey for other text
      }
      pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
    });

    // Save the PDF
    const fileName = `invoice-${job.invoiceNumber || job.id}-${job.clientName.replace(/\s+/g, '-')}.pdf`;
    pdf.save(fileName);
  };
  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'invoiced':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">All Jobs</h2>
        <div className="text-sm text-slate-600">
          {filteredJobs.length} of {jobs.length} jobs
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'ironing' | 'cleaning' | 'both')}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="ironing">Ironing</option>
            <option value="cleaning">Cleaning</option>
            <option value="both">Both</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'client' | 'total')}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="client">Sort by Client</option>
            <option value="total">Sort by Total</option>
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-700">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center hover:text-slate-900"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Date
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Invoice#</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">
                  <button
                    onClick={() => handleSort('client')}
                    className="flex items-center hover:text-slate-900"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Client
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Items</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">
                  <button
                    onClick={() => handleSort('total')}
                    className="flex items-center hover:text-slate-900"
                  >
                    <PoundSterling className="h-4 w-4 mr-2" />
                    Total
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors duration-200">
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {formatDateUK(job.date)}
                  </td>
                  <td className="py-4 px-4 text-sm font-mono text-slate-800">
                    {job.invoiceNumber || 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-800">
                    {job.clientName}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600 capitalize">
                    {job.type}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {job.items.length} item{job.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-800">
                    £{job.total.toFixed(2)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditJob(job)}
                        className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors duration-200"
                        title="Edit Job"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setInvoiceJob(job)}
                        className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors duration-200"
                        title="Generate Invoice"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleExportPDF(job)}
                        className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors duration-200"
                        title="Export PDF"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this job?')) {
                            onDeleteJob(job.id);
                          }
                        }}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200"
                        title="Delete Job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredJobs.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No jobs found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Job Details</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600">Client</label>
                  <p className="text-slate-800">{selectedJob.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Invoice#</label>
                  <p className="text-slate-800 font-mono">{selectedJob.invoiceNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Date</label>
                  <p className="text-slate-800">{formatDateUK(selectedJob.date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Type</label>
                  <p className="text-slate-800 capitalize">{selectedJob.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Items</label>
                <div className="space-y-2">
                  {selectedJob.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                      <div>
                        <p className="font-medium text-slate-800">{item.description}</p>
                        <p className="text-sm text-slate-600">Qty: {item.quantity} × £{item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-medium text-slate-800">£{item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedJob.notes && (
                <div>
                  <label className="block text-sm font-medium text-slate-600">Notes</label>
                  <p className="text-slate-800">{selectedJob.notes}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-slate-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-slate-800">£{selectedJob.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center print:hidden">
              <h3 className="text-lg font-semibold text-slate-800">Invoice</h3>
              <div className="flex space-x-3">
                <button
                  onClick={handlePrintInvoice}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200"
                >
                  Print Invoice
                </button>
                <button
                  onClick={() => handleExportPDF(invoiceJob)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => setInvoiceJob(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Invoice Content */}
            <div className="p-6 print:p-0">
              <div className="max-w-4xl mx-auto bg-white">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold" style={{ color: '#be185d' }}>
                    {invoiceJob.invoicingCompany || 'Cleaning Angels'}
                  </h1>
                  <p className="text-slate-500 italic text-lg mb-1">by Hayley</p>
                  <div className="text-slate-600 text-sm">
                    <p>Professional Cleaning & Ironing Services</p>
                    <p>Email: info@{(invoiceJob.invoicingCompany || 'Cleaning Angels').toLowerCase().replace(' ', '')}.uk</p>
                    <p>Phone: 07901 611906</p>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800 mb-2">Bill To:</h3>
                    <div className="text-slate-700">
                      <p className="font-medium">{invoiceJob.clientName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-3">
                      <h2 className="text-xl font-bold text-slate-800 mb-1">INVOICE</h2>
                      <p className="text-sm text-slate-600">Invoice #: {invoiceJob.invoiceNumber || 'N/A'}</p>
                      <p className="text-sm text-slate-600">Date: {formatDateUK(invoiceJob.date)}</p>
                      <p className="text-sm text-slate-600">Status: <span className="capitalize">{invoiceJob.status}</span></p>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="mb-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="text-left py-2 px-2 font-semibold text-slate-800 text-sm">Description</th>
                        <th className="text-center py-2 px-2 font-semibold text-slate-800 text-sm">Qty</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-800 text-sm">Rate</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-800 text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceJob.items.map((item, index) => (
                        <tr key={item.id} className="border-b border-slate-200">
                          <td className="py-2 px-2 text-slate-700 text-sm">{item.description}</td>
                          <td className="py-2 px-2 text-center text-slate-700 text-sm">{item.quantity}</td>
                          <td className="py-2 px-2 text-right text-slate-700 text-sm">£{item.price.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right text-slate-700 text-sm">£{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="flex justify-end mb-6">
                  <div className="w-64">
                    <div className="border-t-2 border-slate-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-800">Total:</span>
                        <span className="text-xl font-bold text-slate-800">£{invoiceJob.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {invoiceJob.notes && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-slate-800 mb-1">Notes:</h3>
                    <p className="text-slate-700 text-sm">{invoiceJob.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-600">
                  
                  <p className="mt-2">
                    <p>Thank you for your custom, we appreciate it. </p>
<p></p>

<p>If you appreciate our services and would like to leave a public comment for our social media, please WhatsApp us.</p>

                  <p>  Payment terms: Please pay on day of invoice receipt.</p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <p className="font-semibold text-slate-700 mb-2">Payment Details:</p>
                    <p>Please quote your invoice number</p>
                    <p>Account number: 64862237</p>
                    <p>Sort code: 60-83-71</p>
                  </div>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;