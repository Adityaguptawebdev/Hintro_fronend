import Button from '../../ui/Button';

const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <span className="text-4xl">{icon}</span>
    <div>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </div>
    {action && (
      <Button size="sm" variant="secondary" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);

export default EmptyState;
