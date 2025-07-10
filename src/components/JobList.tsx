import React, { useState } from 'react';
import { Job } from '../types';
import { Search, Eye, Edit, Trash2, Calendar, User, PoundSterling } from 'lucide-react';
import { formatDateUK } from '../utils/dateUtils';

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
    </div>
  );
};

export default JobList;