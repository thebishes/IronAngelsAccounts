/*
  # Add 'paid' status to job_status enum

  1. Database Changes
    - Add 'paid' as a valid value to the job_status enum type
    - This allows jobs to be marked as paid in addition to completed, pending, and invoiced

  2. Security
    - No RLS changes needed as this only modifies an existing enum type
*/

ALTER TYPE job_status ADD VALUE 'paid';