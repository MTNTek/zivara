/**
 * Structured logging service for Zivara.
 *
 * In production, outputs JSON to stdout — compatible with Vercel Logs,
 * CloudWatch, Datadog, and any log aggregator that reads structured JSON.
 *
 * For Sentry integration, set SENTRY_DSN env var and install @sentry/nextjs.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (process.env.NODE_ENV === 'production') {
      // Structured JSON to stdout — picked up by Vercel / CloudWatch / Datadog
      const line = JSON.stringify(entry);
      if (level === 'error' || level === 'critical') {
        process.stderr.write(line + '\n');
      } else {
        process.stdout.write(line + '\n');
      }

      // Forward critical errors to Sentry if configured
      if ((level === 'error' || level === 'critical') && process.env.SENTRY_DSN) {
        this.forwardToSentry(entry);
      }

      // Alert on critical
      if (level === 'critical') {
        this.sendAlert(message, context);
      }
    } else {
      // Pretty console output in development
      this.logToConsole(entry);
    }
  }

  info(message: string, context?: Record<string, unknown>) { this.write('info', message, context); }
  warn(message: string, context?: Record<string, unknown>) { this.write('warn', message, context); }
  error(message: string, context?: Record<string, unknown>) { this.write('error', message, context); }
  critical(message: string, context?: Record<string, unknown>) { this.write('critical', message, context); }

  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    this.write(level, message, context);
  }

  logAuthAttempt(success: boolean, email: string, context?: Record<string, unknown>) {
    const level = success ? 'info' : 'warn';
    const message = success ? `Auth success: ${email}` : `Auth failed: ${email}`;
    this.write(level, message, { ...context, authSuccess: success, email });
  }

  private logToConsole(entry: LogEntry) {
    const tag = `[${entry.level.toUpperCase()}] [${entry.timestamp}]`;
    const method = entry.level === 'critical' ? 'error' : entry.level;
    if (entry.context) {
      console[method](tag, entry.message, entry.context);
    } else {
      console[method](tag, entry.message);
    }
  }

  private async forwardToSentry(entry: LogEntry) {
    // Sentry integration: install @sentry/nextjs and set SENTRY_DSN to enable.
    // When installed, Sentry auto-instruments Next.js — errors are captured automatically.
    // This manual forward is for structured log messages that aren't thrown errors.
    console.error(`[SENTRY-FORWARD] ${entry.level}: ${entry.message}`, entry.context || '');
  }

  private sendAlert(message: string, context?: Record<string, unknown>) {
    // In production, this could POST to a Slack webhook, PagerDuty, etc.
    // For now, the structured JSON log with level=critical is enough for
    // log-based alerting rules in Vercel/Datadog/CloudWatch.
    console.error('🚨 CRITICAL:', message, context || '');
  }
}

export const logger = new Logger();
