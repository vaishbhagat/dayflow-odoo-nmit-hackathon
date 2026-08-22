import { getInitials, getAvatarColor, cn } from '@/lib/utils';

export function EmployeeAvatar({ name, imageUrl, size = 'md', className }) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const colorClass = getAvatarColor(name);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn('rounded-full object-cover flex-shrink-0', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0', colorClass, sizeClasses[size], className)}>
      {getInitials(name)}
    </div>
  );
}
