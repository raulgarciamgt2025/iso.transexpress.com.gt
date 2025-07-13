import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { sessionManager } from '@/utils/sessionManager';
import { formatTimeUntilExpiration } from '@/utils/tokenUtils';
import { useAuthContext } from '@/context/useAuthContext';

interface SessionStatusProps {
  showTimeLeft?: boolean;
  className?: string;
}

const SessionStatus: React.FC<SessionStatusProps> = ({ 
  showTimeLeft = false, 
  className = '' 
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [sessionInfo, setSessionInfo] = useState(sessionManager.getSessionInfo());
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.token) {
      return;
    }

    const updateSessionInfo = () => {
      const info = sessionManager.getSessionInfo();
      setSessionInfo(info);
      
      if (showTimeLeft && user.token) {
        setTimeLeft(formatTimeUntilExpiration(user.token));
      }
    };

    // Update immediately
    updateSessionInfo();

    // Update every 30 seconds
    const interval = setInterval(updateSessionInfo, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.token, showTimeLeft]);

  if (!isAuthenticated) {
    return null;
  }

  const getBadgeVariant = () => {
    switch (sessionInfo.state) {
      case 'valid':
        return 'success';
      case 'expiring-soon':
        return 'warning';
      case 'expired':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (sessionInfo.state) {
      case 'valid':
        return 'Sesión activa';
      case 'expiring-soon':
        return 'Expira pronto';
      case 'expired':
        return 'Sesión expirada';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <div className={`session-status ${className}`}>
      <Badge bg={getBadgeVariant()} className="me-2">
        {getStatusText()}
      </Badge>
      {showTimeLeft && timeLeft && sessionInfo.state !== 'expired' && (
        <small className="text-muted">
          Tiempo restante: {timeLeft}
        </small>
      )}
    </div>
  );
};

export default SessionStatus;
