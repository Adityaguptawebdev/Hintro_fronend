export const truncate = (str, maxLen = 80) =>
  str && str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const formatDuration = (minutes) => {
  if (!minutes) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`;
};

export const priorityColor = (priority) => ({
  low: 'text-gray-500 bg-gray-100',
  medium: 'text-yellow-700 bg-yellow-50',
  high: 'text-orange-700 bg-orange-50',
  critical: 'text-red-700 bg-red-50',
}[priority] ?? 'text-gray-500 bg-gray-100');

export const statusColor = (status) => ({
  scheduled: 'text-blue-700 bg-blue-50',
  in_progress: 'text-purple-700 bg-purple-50',
  completed: 'text-green-700 bg-green-50',
  cancelled: 'text-gray-500 bg-gray-100',
  pending: 'text-yellow-700 bg-yellow-50',
}[status] ?? 'text-gray-500 bg-gray-100');
