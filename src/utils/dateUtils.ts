// Utility functions for UK date formatting
export const formatDateUK = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
};

export const formatDateUKFull = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatMonthYearUK = (dateString: string): string => {
  const date = new Date(dateString + '-01');
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long' 
  };
  return date.toLocaleDateString('en-GB', options);
};