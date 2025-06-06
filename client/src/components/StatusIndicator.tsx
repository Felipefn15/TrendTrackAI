import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";

interface StatusIndicatorProps {
  status: 'active' | 'error' | 'rate_limited' | 'running' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function StatusIndicator({ status, size = 'md', showText = true, className = '' }: StatusIndicatorProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Active',
          dot: 'bg-green-400'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'Error',
          dot: 'bg-red-400'
        };
      case 'rate_limited':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: 'Rate Limited',
          dot: 'bg-yellow-400'
        };
      case 'running':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: 'Running',
          dot: 'bg-blue-400 animate-pulse'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: 'Pending',
          dot: 'bg-gray-400'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: 'Unknown',
          dot: 'bg-gray-400'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  if (!showText) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`${dotSizeClasses[size]} ${config.dot} rounded-full`} />
      </div>
    );
  }

  return (
    <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0 ${className}`}>
      <Icon className={`${sizeClasses[size]} mr-1`} />
      {config.text}
    </Badge>
  );
}
