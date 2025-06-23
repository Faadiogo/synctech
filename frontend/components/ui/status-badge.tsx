import { Badge } from '@/components/ui/badge';
import { statusConfig } from '@/lib/services/escopoService';

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${className || ''}`}
    >
      {config.label}
    </Badge>
  );
} 