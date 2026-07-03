import { cn } from '../../../utils/cn';

const Badge = ({ children, variant = 'default', dot = false, className }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-brand-50 text-brand-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
  };

  return (
    <span className={cn('badge', variants[variant], className)}>
      {dot && (
        <span
          className={cn(
            'mr-1.5 h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-green-500',
            variant === 'warning' && 'bg-yellow-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'primary' && 'bg-brand-500',
            variant === 'default' && 'bg-gray-400',
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
