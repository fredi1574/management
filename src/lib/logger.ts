/**
 * Structured logging utility for consistent logging across the application
 * In production, integrate with Sentry, LogRocket, or similar services
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    const levelUpper = level.toUpperCase().padEnd(5);
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    const errorStr = error ? `\n${error.stack}` : "";
    return `[${timestamp}] ${levelUpper} ${message}${contextStr}${errorStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    const formatted = this.formatEntry(entry);

    // Console output
    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "debug":
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
    }

    // Send to external service in production
    if (!this.isDevelopment && level === "error") {
      this.sendToErrorTracking(entry);
    }
  }

  private sendToErrorTracking(entry: LogEntry): void {
    // Implement Sentry or similar integration here
    // Example:
    // Sentry.captureException(entry.error, {
    //   level: entry.level,
    //   tags: { context: JSON.stringify(entry.context) },
    // });
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log("error", message, context, error);
  }

  /**
   * Log API request/response
   */
  logApiCall(
    method: string,
    path: string,
    status: number,
    duration: number,
    context?: Record<string, any>
  ): void {
    this.info(`${method} ${path} - ${status}`, {
      method,
      path,
      status,
      durationMs: duration,
      ...context,
    });
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    context?: Record<string, any>
  ): void {
    this.debug(`DB ${operation} on ${table}`, {
      operation,
      table,
      durationMs: duration,
      ...context,
    });
  }

  /**
   * Log performance metric
   */
  logPerformance(metric: string, value: number, unit: string = "ms"): void {
    this.debug(`Performance: ${metric} = ${value}${unit}`, {
      metric,
      value,
      unit,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Middleware to log API calls
 */
export function createLoggingMiddleware() {
  return (request: Request) => {
    const start = Date.now();
    const { method, url } = request;
    const path = new URL(url).pathname;

    return {
      log: (status: number) => {
        const duration = Date.now() - start;
        logger.logApiCall(method, path, status, duration);
      },
    };
  };
}
