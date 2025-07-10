import { supabase } from '../lib/supabase';
import { Job, JobItem } from '../types';
import { Database } from '../lib/database.types';

type JobRow = Database['public']['Tables']['jobs']['Row'];
type JobItemRow = Database['public']['Tables']['job_items']['Row'];

// Convert database row to Job type
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (jobsError) throw jobsError;

    const { data: allItems, error: itemsError } = await supabase
      .from('job_items')
      .select('*')
      .in('job_id', jobs.map(job => job.id));

    if (itemsError) throw itemsError;

    return jobs.map(job => {
      const jobItems = allItems.filter(item => item.job_id === job.id);
      return convertJobRowToJob(job, jobItems);
    });
  },

  async createJob(job: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Insert job
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .insert({
        client_name: job.clientName,
        date: job.date,
        type: job.type,
        status: job.status,
        notes: job.notes || null,
        user_id: user.id
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Insert job items
    const { data: itemsData, error: itemsError } = await supabase
      .from('job_items')
      .insert(
        job.items.map(item => ({
          job_id: jobData.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price
        }))
      )
      .select();

    if (itemsError) throw itemsError;

    return convertJobRowToJob(jobData, itemsData);
  },

  async updateJob(job: Job): Promise<Job> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update job
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .update({
        client_name: job.clientName,
        date: job.date,
        type: job.type,
        status: job.status,
        notes: job.notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (jobError) throw jobError;

    // Delete existing items
    const { error: deleteError } = await supabase
      .from('job_items')
      .delete()
      .eq('job_id', job.id);

    if (deleteError) throw deleteError;

    // Insert new items
    const { data: itemsData, error: itemsError } = await supabase
      .from('job_items')
      .insert(
        job.items.map(item => ({
          job_id: job.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price
        }))
      )
      .select();

    if (itemsError) throw itemsError;

    return convertJobRowToJob(jobData, itemsData);
  },

  async deleteJob(jobId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('user_id', user.id);

    if (error) throw error;
  }
};