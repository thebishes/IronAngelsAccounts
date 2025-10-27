import React from 'react';
import { Job } from '../types';
import { Calendar, PoundSterling, FileText, TrendingUp } from 'lucide-react';
import { formatDateUK } from '../utils/dateUtils';

interface DashboardProps {
  jobs: Job[];
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ jobs, onViewChange }) => {
  const totalEarnings = jobs.reduce((sum, job) => sum + job.total, 0);
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const pendingJobs = jobs.filter(job => job.status === 'pending').length;
  const thisMonthJobs = jobs.filter(job => {
    const jobDate = new Date(job.date);
    const now = new Date();
    return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
  });
  const thisMonthEarnings = thisMonthJobs.reduce((sum, job) => sum + job.total, 0);

  const recentJobs = jobs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Earnings',
      value: `£${totalEarnings.toFixed(2)}`,
      icon: PoundSterling,
      color: 'bg-slate-600',
    },
    {
      title: 'Completed Jobs',
      value: completedJobs.toString(),
      icon: FileText,
      color: 'bg-slate-500',
    },
    {
      title: 'Pending Jobs',
      value: pendingJobs.toString(),
      icon: Calendar,
      color: 'bg-slate-700',
    },
    {
      title: 'This Month',
      value: `£${thisMonthEarnings.toFixed(2)}`,
      icon: PoundSterling,
      color: 'bg-slate-800',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard v3.2b</h2>
        <button
          onClick={() => onViewChange('add-job')}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Add New Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`p-4 rounded-xl shadow-md ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Recent Jobs</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {recentJobs.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              No jobs yet. <button
                onClick={() => onViewChange('add-job')}
                className="text-slate-700 hover:text-slate-900 underline"
              >
                Add your first job
              </button>
            </div>
          ) : (
            recentJobs.map((job) => (
              <div key={job.id} className="px-6 py-3 hover:bg-slate-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{job.clientName}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-slate-500 capitalize leading-tight">{job.type}</p>
                      {job.notes && (
                        <span className="text-xs text-slate-400">•</span>
                      )}
                     {job.invoiceNumber && (
                       <>
                         <span className="text-xs text-slate-400">•</span>
                         <span className="text-xs text-slate-500 font-mono">#{job.invoiceNumber}</span>
                       </>
                     )}
                    </div>
                    {job.notes && (
                      <p className="text-xs text-slate-400 mt-1 leading-tight truncate max-w-xs">
                        {job.notes} {job.invoiceNumber && <span className="font-mono">#{job.invoiceNumber}</span>}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800">£{job.total.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 leading-tight">
                      {formatDateUK(job.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;