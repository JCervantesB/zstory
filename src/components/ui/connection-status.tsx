import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Badge } from './badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionError?: string | null;
  newItemsCount?: number;
  className?: string;
}

export function ConnectionStatus({ 
  isConnected, 
  connectionError, 
  newItemsCount = 0,
  className = '' 
}: ConnectionStatusProps) {
  const getStatusIcon = () => {
    if (connectionError) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return isConnected ? (
      <Wifi className="h-4 w-4 text-green-500" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-500" />
    );
  };

  const getTooltipText = () => {
    if (connectionError) {
      return `Error de conexión: ${connectionError}`;
    }
    return isConnected 
      ? 'Conectado - Recibiendo actualizaciones en tiempo real'
      : 'Desconectado - Sin actualizaciones en tiempo real';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center space-x-1 relative ${className}`}>
            {getStatusIcon()}
            {newItemsCount > 0 && (
              <Badge className="h-5 w-5 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                {newItemsCount > 99 ? '99+' : newItemsCount}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}