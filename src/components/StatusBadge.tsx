interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  Green: { label: 'Mastered', className: 'status-badge-green' },
  Orange: { label: 'Slow', className: 'status-badge-orange' },
  Yellow: { label: 'Partial', className: 'status-badge-yellow' },
  Red: { label: 'Forgot', className: 'status-badge-red' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.Red;
  const sizeClass = size === 'sm' ? 'status-badge-sm' : 'status-badge-md';

  return (
    <span className={`status-badge ${config.className} ${sizeClass}`}>
      {config.label}
    </span>
  );
}
