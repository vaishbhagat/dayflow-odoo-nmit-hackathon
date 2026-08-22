import { cn } from '@/lib/utils';

export function PageHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between page-header', className)}>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
