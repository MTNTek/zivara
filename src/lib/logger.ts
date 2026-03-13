/**
 * Logging Service
 * 
 * Centralized logging infrastructure for the Zivara eCommerce platform.
 * Provides structured logging with severity levels and context.
 * 
 * Requirements: 18.1, 18.4, 18.5, 18.6, 18.7
 */

/**
 * Log severity levels
 * Requirement 18.7: Categorize errors by severity
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'critical';

/**
 * Structured log entry
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

/**
 * Logger class for structured logging
 */
class Logger {
  /**
   * Core logging method
   * Requirement 18.1: Log errors with timestamp, error type, and stack trace
   * 
   * @param level - Log severity level
   * @param message - Log message
   * @param context - Additional context data
   */
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
    };

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
      
      // Send alert for critical errors (Requirement 18.5)
      if (level === 'critical') {
        this.sendAlert(message, context);
      }
    } else {
      // Console logging in development
      this.logToConsole(entry);
    }
  }

  /**
   * Log informational messages
   * Severity: Info
   * 
   * @param message - Log message
   * @param context - Additional context data
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning messages
   * Severity: Warning
   * 
   * @param message - Log message
   * @param context - Additional context data
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error messages
   * Severity: Error
   * 
   * @param message - Log message
   * @param context - Additional context data
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * Log critical errors
   * Severity: Critical
   * Requirement 18.5: Send alert notification to admins for critical errors
   * 
   * @param message - Log message
   * @param context - Additional context data
   */
  critical(message: string, context?: Record<string, unknown>): void {
    this.log('critical', message, context);
  }

  /**
   * Log authentication attempts
   * Requirement 18.4: Log all authentication attempts including successes and failures
   * 
   * @param success - Whether authentication was successful
   * @param email - User email
   * @param context - Additional context (IP address, user agent, etc.)
   */
  logAuthAttempt(success: boolean, email: string, context?: Record<string, unknown>): void {
    const level = success ? 'info' : 'warn';
    const message = success 
      ? `Authentication successful: ${email}` 
      : `Authentication failed: ${email}`;
    
    this.log(level, message, {
      ...context,
      authSuccess: success,
      email,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Console logging for development
   * 
   * @param entry - Log entry to output
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, timestamp, context } = entry;
    const consoleMethod = level === 'critical' ? 'error' : level;
    
    const formattedMessage = [
      `[${level.toUpperCase()}]`,
      `[${timestamp.toISOString()}]`,
      message,
    ].join(' ');
    
    if (context) {
      console[consoleMethod](formattedMessage, context);
    } else {
      console[consoleMethod](formattedMessage);
    }
  }

  /**
   * Send log entry to external logging service
   * Requirement 18.6: Maintain error logs for a minimum of 30 days
   * 
   * In production, this would integrate with services like:
   * - Sentry
   * - LogRocket
   * - Datadog
   * - CloudWatch
   * - Application Insights
   * 
   * @param entry - Log entry to send
   */
  private sendToLoggingService(entry: LogEntry): void {
    // Implementation depends on chosen logging service
    // Example for Sentry:
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureMessage(entry.message, {
    //     level: entry.level as SeverityLevel,
    //     extra: entry.context,
    //   });
    // }
    
    // For now, log to console in production as well
    this.logToConsole(entry);
    
    // TODO: Integrate with external logging service
    // The service should be configured to retain logs for at least 30 days
  }

  /**
   * Send alert notification to admins
   * Requirement 18.5: Send alert notification to admins for critical errors
   * 
   * @param message - Alert message
   * @param context - Additional context data
   */
  private sendAlert(message: string, context?: Record<string, unknown>): void {
    // Implementation depends on alerting mechanism
    // Options include:
    // - Email notifications
    // - Slack/Discord webhooks
    // - PagerDuty
    // - SMS alerts
    
    // For now, log prominently to console
    console.error('🚨 CRITICAL ALERT 🚨');
    console.error('Message:', message);
    if (context) {
      console.error('Context:', context);
    }
    
    // TODO: Integrate with alerting service
    // Example:
    // await sendEmail({
    //   to: process.env.ADMIN_EMAIL,
    //   subject: `Critical Error: ${message}`,
    //   body: JSON.stringify({ message, context }, null, 2),
    // });
  }
}

/**
 * Singleton logger instance
 * Export for use throughout the application
 */
export const logger = new Logger();
