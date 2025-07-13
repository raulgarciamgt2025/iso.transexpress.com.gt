import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Card, Container } from 'react-bootstrap';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service (add your error reporting here)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
          <Card className="text-center" style={{ maxWidth: '500px' }}>
            <Card.Body>
              <div className="mb-4">
                <h1 className="text-danger">🚨</h1>
                <h4 className="text-danger">Algo salió mal</h4>
              </div>
              
              <Alert variant="danger" className="text-start">
                <Alert.Heading>Error de aplicación</Alert.Heading>
                <p>
                  Se ha producido un error inesperado. Nuestro equipo ha sido notificado 
                  y está trabajando para solucionarlo.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-3">
                    <summary>Detalles del error (desarrollo)</summary>
                    <pre className="mt-2 small text-muted">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </Alert>

              <div className="d-flex gap-2 justify-content-center">
                <Button variant="primary" onClick={this.handleReload}>
                  Recargar página
                </Button>
                <Button variant="outline-secondary" onClick={this.handleReset}>
                  Intentar de nuevo
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
