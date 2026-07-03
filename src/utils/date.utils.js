import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';

export const formatDate = (date, fmt = 'MMM d, yyyy') =>
  format(typeof date === 'string' ? parseISO(date) : date, fmt);

export const formatDateTime = (date) => formatDate(date, 'MMM d, yyyy h:mm a');

export const timeAgo = (date) =>
  formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true });

export const isOverdue = (dueDate) =>
  dueDate ? isBefore(typeof dueDate === 'string' ? parseISO(dueDate) : dueDate, new Date()) : false;

export const isUpcoming = (date, withinHours = 24) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(d, new Date()) && isBefore(d, new Date(Date.now() + withinHours * 3600000));
};
