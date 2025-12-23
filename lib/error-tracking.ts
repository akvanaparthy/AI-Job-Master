// Production error tracking service
// Supports Sentry and can be extended for other services

interface ErrorContext {
  [key: string]: unknown;
}

interface ErrorTrackingConfig {
  dsn?: string;
  environment?: string;
  enabled: boolean;
}

class ErrorTracking {
  private config: ErrorTrackingConfig;
  private sentryInitialized = false;

  constructor() {
    this.config = {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    };

    if (this.config.enabled && typeof window !== 'undefined') {
      this.initializeSentry();
    }
  }

  private async initializeSentry(): Promise<void> {
    if (this.sentryInitialized || !this.config.dsn) return;

    try {
      const Sentry = await import('@sentry/nextjs');

      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        tracesSampleRate: 0.1,
        beforeSend(event, hint) {
          if (event.exception) {
            console.error('[Sentry]', hint.originalException || hint.syntheticException);
          }
          return event;
        },
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
        ],
      });

      this.sentryInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  captureException(error: Error, context?: ErrorContext): void {
    if (!this.config.enabled) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ErrorTracking (dev mode):', error, context);
      }
      return;
    }

    import('@sentry/nextjs').then(({ captureException, setContext }) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          setContext(key, value as Record<string, unknown>);
        });
      }
      captureException(error);
    }).catch(err => {
      console.error('Failed to capture exception:', err);
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    if (!this.config.enabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`ErrorTracking (dev mode) [${level}]:`, message, context);
      }
      return;
    }

    import('@sentry/nextjs').then(({ captureMessage, setContext }) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          setContext(key, value as Record<string, unknown>);
        });
      }
      captureMessage(message, level);
    }).catch(err => {
      console.error('Failed to capture message:', err);
    });
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.config.enabled) return;

    import('@sentry/nextjs').then(({ setUser }) => {
      setUser(user);
    }).catch(err => {
      console.error('Failed to set user:', err);
    });
  }

  clearUser(): void {
    if (!this.config.enabled) return;

    import('@sentry/nextjs').then(({ setUser }) => {
      setUser(null);
    }).catch(err => {
      console.error('Failed to clear user:', err);
    });
  }

  addBreadcrumb(message: string, category?: string, data?: ErrorContext): void {
    if (!this.config.enabled) return;

    import('@sentry/nextjs').then(({ addBreadcrumb }) => {
      addBreadcrumb({
        message,
        category,
        data: data as Record<string, unknown>,
        timestamp: Date.now() / 1000,
      });
    }).catch(err => {
      console.error('Failed to add breadcrumb:', err);
    });
  }
}

export const errorTracking = new ErrorTracking();
