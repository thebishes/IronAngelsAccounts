export interface JobItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Job {
  id: string;
  clientName: string;
  date: string;
  type: 'ironing' | 'cleaning' | 'both';
  items: JobItem[];
  total: number;
  status: 'completed' | 'pending' | 'invoiced';
  notes?: string;
  createdAt: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  clientName?: string;
  type?: 'ironing' | 'cleaning' | 'both' | 'all';
  status?: 'completed' | 'pending' | 'invoiced' | 'all';
}