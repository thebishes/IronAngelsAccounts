import React, { useState, useMemo } from 'react';
import { Job, ReportFilters } from '../types';
import { Calendar, PoundSterling, TrendingUp, FileText, Download } from 'lucide-react';

interface ReportsProps {
  jobs: Job[];
}

const Reports: React.FC<ReportsProps> = ({ jobs }) => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'all',
    status: 'all'
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const jobDate = new Date(job.date);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      
      if (start && jobDate < start) return false;
      if (end && jobDate > end) return false;
      if (filters.type !== 'all' && job.type !== filters.type) return false;
      if (filters.status !== 'all' && job.status !== filters.status) return false;
      if (filters.clientName && !job.clientName.toLowerCase().includes(filters.clientName.toLowerCase())) return false;
      
      return true;
    });
  }, [jobs, filters]);

  const stats = useMemo(() => {
    const totalRevenue = filteredJobs.reduce((sum, job) => sum + job.total, 0);
    const totalJobs = filteredJobs.length;
    const averageJob = totalJobs > 0 ? totalRevenue / totalJobs : 0;
    
    const serviceBreakdown = filteredJobs.reduce((acc, job) => {
      acc[job.type] = (acc[job.type] || 0) + job.total;
      return acc;
    }, {} as Record<string, number>);

    const monthlyData = filteredJobs.reduce((acc, job) => {
      const month = new Date(job.date).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + job.total;
      return acc;
    }, {} as Record<string, number>);

    const topClients = Object.entries(
      filteredJobs.reduce((acc, job) => {
        acc[job.clientName] = (acc[job.clientName] || 0) + job.total;
        return acc;
      }, {} as Record<string, number>)
    )
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

    return {
      totalRevenue,
      totalJobs,
      averageJob,
      serviceBreakdown,
      monthlyData,
      topClients
    };
  }, [filteredJobs]);

  const exportToCSV = () => {
    const headers = ['Date', 'Invoice#', 'Client', 'Type', 'Status', 'Items', 'Total'];
    const rows = filteredJobs.map(job => [
      new Date(job.date).toLocaleDateString(),
      job.invoiceNumber || 'N/A',
      job.clientName,
      job.type,
      job.status,
      job.items.map(item => `${item.description} (${item.quantity} × £${item.price})`).join('; '),
      job.total.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Reports</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>
            <select
              value={filters.type || 'all'}
              onChange={(e) => setFilters({...filters, type: e.target.value as any})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="ironing">Ironing</option>
              <option value="cleaning">Cleaning</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({...filters, status: e.target.value as any})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="invoiced">Invoiced</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Client Name</label>
            <input
              type="text"
              value={filters.clientName || ''}
              onChange={(e) => setFilters({...filters, clientName: e.target.value})}
              placeholder="Filter by client..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <PoundSterling className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-800">£{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Jobs</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalJobs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Average Job</p>
              <p className="text-2xl font-bold text-slate-800">£{stats.averageJob.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Date Range</p>
              <p className="text-lg font-bold text-slate-800">
                {filteredJobs.length} jobs
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Service Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(stats.serviceBreakdown).map(([service, amount]) => (
                <div key={service} className="flex justify-between items-center">
                  <span className="text-slate-600 capitalize">{service}</span>
                  <span className="font-semibold text-slate-800">£{amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Top Clients</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topClients.map(([client, amount]) => (
                <div key={client} className="flex justify-between items-center">
                  <span className="text-slate-600">{client}</span>
                  <span className="font-semibold text-slate-800">£{amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Monthly Revenue</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(stats.monthlyData)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, amount]) => (
                <div key={month} className="flex justify-between items-center">
                  <span className="text-slate-600">
                    {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </span>
                  <span className="font-semibold text-slate-800">£{amount.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;