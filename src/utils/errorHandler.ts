import Swal from 'sweetalert2';
import { ApiError, SessionExpiredError } from '@/helpers/apiClient';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Standardized error interface
export interface StandardError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string | number;
  details?: any;
  timestamp: Date;
}

// Error classification utility
export const classifyError = (error: any): StandardError => {
  const timestamp = new Date();

  // Handle session expired errors specifically
  if (error instanceof SessionExpiredError) {
    return {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      message: error.message,
      code: error.status,
      details: error.response,
      timestamp,
    };
  }

  // Handle API errors
  if (error instanceof ApiError) {
    let type: ErrorType;
    let severity: ErrorSeverity;

    switch (error.status) {
      case 401:
        type = ErrorType.AUTHENTICATION;
        severity = ErrorSeverity.HIGH;
        break;
      case 403:
        type = ErrorType.AUTHORIZATION;
        severity = ErrorSeverity.HIGH;
        break;
      case 400:
      case 422:
        type = ErrorType.VALIDATION;
        severity = ErrorSeverity.MEDIUM;
        break;
      case 500:
      case 502:
      case 503:
        type = ErrorType.SERVER;
        severity = ErrorSeverity.HIGH;
        break;
      case 0:
        type = ErrorType.NETWORK;
        severity = ErrorSeverity.HIGH;
        break;
      default:
        type = ErrorType.CLIENT;
        severity = ErrorSeverity.MEDIUM;
    }

    return {
      type,
      severity,
      message: error.message,
      code: error.status,
      details: error.response,
      timestamp,
    };
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return {
      type: ErrorType.CLIENT,
      severity: ErrorSeverity.MEDIUM,
      message: error.message,
      details: error.stack,
      timestamp,
    };
  }

  // Handle unknown errors
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: typeof error === 'string' ? error : 'Se produjo un error inesperado',
    details: error,
    timestamp,
  };
};

// Error display utility
export const displayError = (error: any, options?: {
  title?: string;
  showDetails?: boolean;
  onClose?: () => void;
}) => {
  const standardError = classifyError(error);
  const { title, showDetails = false, onClose } = options || {};

  // Get user-friendly title based on error type
  const getTitle = (): string => {
    if (title) return title;

    switch (standardError.type) {
      case ErrorType.AUTHENTICATION:
        return 'Error de autenticación';
      case ErrorType.AUTHORIZATION:
        return 'No autorizado';
      case ErrorType.VALIDATION:
        return 'Error de validación';
      case ErrorType.NETWORK:
        return 'Error de conexión';
      case ErrorType.SERVER:
        return 'Error del servidor';
      default:
        return 'Error';
    }
  };

  // Get icon based on severity
  const getIcon = (): 'error' | 'warning' | 'info' => {
    switch (standardError.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      default:
        return 'info';
    }
  };

  // Show SweetAlert2 notification
  Swal.fire({
    title: getTitle(),
    text: standardError.message,
    icon: getIcon(),
    confirmButtonText: 'Entendido',
    footer: showDetails && standardError.details ? 
      `<details><summary>Detalles técnicos</summary><pre>${JSON.stringify(standardError.details, null, 2)}</pre></details>` : 
      undefined,
    didClose: onClose,
  });
};

// Error logging utility
export const logError = (error: any, context?: string) => {
  const standardError = classifyError(error);
  
  console.group(`🚨 Error ${context ? `in ${context}` : ''}`);
  console.error('Timestamp:', standardError.timestamp.toISOString());
  console.error('Type:', standardError.type);
  console.error('Severity:', standardError.severity);
  console.error('Message:', standardError.message);
  
  if (standardError.code) {
    console.error('Code:', standardError.code);
  }
  
  if (standardError.details) {
    console.error('Details:', standardError.details);
  }
  
  console.groupEnd();

  // In production, send to error reporting service
  if (import.meta.env.PROD && standardError.severity === ErrorSeverity.CRITICAL) {
    // Example: Send to Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: { context, standardError } });
  }
};

// Combined error handler
export const handleError = (error: any, options?: {
  context?: string;
  display?: boolean;
  displayOptions?: Parameters<typeof displayError>[1];
}) => {
  const { context, display = true, displayOptions } = options || {};
  
  // Don't display UI for session expired errors - they're handled by AuthContext
  if (error instanceof SessionExpiredError) {
    logError(error, context);
    return classifyError(error);
  }
  
  // Log the error
  logError(error, context);
  
  // Display the error to user if requested
  if (display) {
    displayError(error, displayOptions);
  }
  
  return classifyError(error);
};

export default {
  classify: classifyError,
  display: displayError,
  log: logError,
  handle: handleError,
};
