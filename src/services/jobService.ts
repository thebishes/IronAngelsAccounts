import { executeExternalQuery } from '../lib/externalPostgres';
import { Job, JobItem } from '../types';
import { authService } from './authService';

interface JobRow {
  id: string;
  client_name: string;
  date: string;
  type: 'ironing' | 'cleaning' | 'both';
  total: string;
  status: 'completed' | 'pending' | 'invoiced' | 'paid';
  notes: string | null;
  invoice_number: string | null;
  invoicing_company: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  team_id: string | null;
}

interface JobItemRow {
  id: string;
  job_id: string;
  description: string;
  quantity: number;
  price: string;
  total: string;
  created_at: string;
}

const convertJobRowToJob = (jobRow: JobRow, items: JobItemRow[]): Job => {
  return {
    id: jobRow.id,
    clientName: jobRow.client_name,
    date: jobRow.date,
    type: jobRow.type,
    total: Number(jobRow.total),
    status: jobRow.status,
    notes: jobRow.notes || undefined,
    createdAt: jobRow.created_at,
    invoiceNumber: jobRow.invoice_number || undefined,
    invoicingCompany: (jobRow.invoicing_company as 'Cleaning Angels' | 'Ironing Angels') || 'Cleaning Angels',
    items: items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      price: Number(item.price),
      total: Number(item.total)
    }))
  };
};

export const jobService = {
  async getAllJobs(): Promise<Job[]> {
    //const { user } = await authService.getCurrentUser();
    //if (!user) throw new Error('User not authenticated');

    const sql = 'SELECT * FROM jobs ORDER BY date DESC';
    const params: any[] = [];

    const jobsResult = await executeExternalQuery<JobRow>(sql, params);
    if (!jobsResult.success || !jobsResult.data) throw new Error(jobsResult.error || 'Failed to fetch jobs');

    const jobs = jobsResult.data;
    if (jobs.length === 0) return [];

    const jobIds = jobs.map(j => j.id);
    const itemsResult = await executeExternalQuery<JobItemRow>(
      `SELECT * FROM job_items WHERE job_id = ANY($1)`,
      [jobIds]
    );



    const allItems = itemsResult.success && itemsResult.data ? itemsResult.data : [];

    return jobs.map(job => {
      const jobItems = allItems.filter(item => item.job_id === job.id);
      return convertJobRowToJob(job, jobItems);
    });
  },

  async createJob(job: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    const { user } = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Creating job in database with user:', user.id);
    console.log('Job data:', {
      clientName: job.clientName,
      date: job.date,
      type: job.type,
      status: job.status,
      notes: job.notes,
      invoicingCompany: job.invoicingCompany
    });

    const jobResult = await executeExternalQuery<JobRow>(
      `INSERT INTO jobs (client_name, date, type, status, notes, user_id, invoicing_company)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        job.clientName,
        job.date,
        job.type,
        job.status,
        job.notes || null,
        user.id,
        job.invoicingCompany || 'Cleaning Angels'
      ]
    );

    console.log('Job insert result:', jobResult);

    if (!jobResult.success || !jobResult.data || jobResult.data.length === 0) {
      const errorMsg = jobResult.error || 'Failed to create job';
      console.error('Job creation failed:', errorMsg);
      throw new Error(errorMsg);
    }

    const jobData = jobResult.data[0];

    console.log('Job created with ID:', jobData.id);
    console.log('Creating job items:', job.items);

    const itemsValues = job.items.map((item, idx) => {
      const base = idx * 4;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
    }).join(', ');

    const itemsParams = job.items.flatMap(item => [
      jobData.id,
      item.description,
      item.quantity,
      item.price
    ]);

    console.log('Items SQL values:', itemsValues);
    console.log('Items params:', itemsParams);

    const itemsResult = await executeExternalQuery<JobItemRow>(
      `INSERT INTO job_items (job_id, description, quantity, price)
       VALUES ${itemsValues}
       RETURNING *`,
      itemsParams
    );

    console.log('Items insert result:', itemsResult);

    if (!itemsResult.success || !itemsResult.data) {
      const errorMsg = itemsResult.error || 'Failed to create job items';
      console.error('Job items creation failed:', errorMsg);
      throw new Error(errorMsg);
    }

    const finalJobResult = await executeExternalQuery<JobRow>(
      'SELECT * FROM jobs WHERE id = $1',
      [jobData.id]
    );

    if (!finalJobResult.success || !finalJobResult.data || finalJobResult.data.length === 0) {
      throw new Error('Failed to fetch created job');
    }

    return convertJobRowToJob(finalJobResult.data[0], itemsResult.data);
  },

  async updateJob(job: Job): Promise<Job> {
    const { user } = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const existingJobResult = await executeExternalQuery<{ team_id: string | null }>(
      'SELECT team_id FROM jobs WHERE id = $1',
      [job.id]
    );

    if (!existingJobResult.success || !existingJobResult.data || existingJobResult.data.length === 0) {
      throw new Error('Job not found');
    }

    const existingJob = existingJobResult.data[0];

    const jobResult = await executeExternalQuery<JobRow>(
      `UPDATE jobs
       SET client_name = $1, date = $2, type = $3, status = $4, notes = $5,
           team_id = $6, updated_at = NOW(), invoicing_company = $7
       WHERE id = $8
       RETURNING *`,
      [
        job.clientName,
        job.date,
        job.type,
        job.status,
        job.notes || null,
        existingJob.team_id,
        job.invoicingCompany || 'Cleaning Angels',
        job.id
      ]
    );

    if (!jobResult.success || !jobResult.data || jobResult.data.length === 0) {
      throw new Error(jobResult.error || 'Failed to update job');
    }

    await executeExternalQuery('DELETE FROM job_items WHERE job_id = $1', [job.id]);

    const itemsValues = job.items.map((item, idx) => {
      const base = idx * 4;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
    }).join(', ');

    const itemsParams = job.items.flatMap(item => [
      job.id,
      item.description,
      item.quantity,
      item.price
    ]);

    const itemsResult = await executeExternalQuery<JobItemRow>(
      `INSERT INTO job_items (job_id, description, quantity, price)
       VALUES ${itemsValues}
       RETURNING *`,
      itemsParams
    );

    if (!itemsResult.success || !itemsResult.data) {
      throw new Error(itemsResult.error || 'Failed to create job items');
    }

    const finalJobResult = await executeExternalQuery<JobRow>(
      'SELECT * FROM jobs WHERE id = $1',
      [job.id]
    );

    if (!finalJobResult.success || !finalJobResult.data || finalJobResult.data.length === 0) {
      throw new Error('Failed to fetch updated job');
    }

    return convertJobRowToJob(finalJobResult.data[0], itemsResult.data);
  },

  async deleteJob(jobId: string): Promise<void> {
    const { user } = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const result = await executeExternalQuery('DELETE FROM jobs WHERE id = $1', [jobId]);

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete job');
    }
  }
};
