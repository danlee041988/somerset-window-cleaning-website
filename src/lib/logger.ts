/**
 * Simple Logger for Error Tracking
 * 
 * In production, this would integrate with services like Sentry, LogRocket, etc.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`.trim();
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage(LogLevel.INFO, message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      errorMessage: error?.message,
      errorStack: error?.stack,
    };
    
    console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
    
    // In production, send to error tracking service
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Example: Send to monitoring service
      this.sendToMonitoring(message, error, errorContext);
    }
  }

  private sendToMonitoring(message: string, error?: Error, context?: LogContext): void {
    // This is where you'd integrate with Sentry, LogRocket, etc.
    // For now, we'll just track in localStorage for demo purposes
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push({
        timestamp: new Date().toISOString(),
        message,
        error: error?.message,
        context,
        url: window.location.href,
      });
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      // Fail silently
    }
  }

  // Track page views
  trackPageView(page: string, context?: LogContext): void {
    this.info(`Page view: ${page}`, context);
  }

  // Track form submissions
  trackFormSubmission(formName: string, success: boolean, context?: LogContext): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const message = `Form submission: ${formName} - ${success ? 'success' : 'failed'}`;
    
    if (success) {
      this.info(message, context);
    } else {
      this.warn(message, context);
    }
  }

  // Track API errors
  trackApiError(endpoint: string, status: number, error: string, context?: LogContext): void {
    this.error(`API error: ${endpoint} - ${status}`, new Error(error), {
      ...context,
      endpoint,
      status,
    });
  }
}

// Export singleton instance
export const logger = new Logger();