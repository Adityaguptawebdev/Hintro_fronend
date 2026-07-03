import { cn } from '../../../utils/cn';

const Card = ({ children, className, hover = false, padding = true, ...props }) => (
  <div
    className={cn(
      'card',
      padding && 'p-5',
      hover && 'transition-shadow hover:shadow-card-hover',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className }) => (
  <div className={cn('mb-4 flex items-center justify-between', className)}>{children}</div>
);

const CardTitle = ({ children, className }) => (
  <h3 className={cn('text-sm font-semibold text-gray-900', className)}>{children}</h3>
);

Card.Header = CardHeader;
Card.Title = CardTitle;

export default Card;
