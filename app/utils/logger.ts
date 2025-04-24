type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  message: string;
  timestamp: string;
  level: LogLevel;
  data?: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logBuffer: LogEntry[] = [];

  private createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      message,
      timestamp: new Date().toISOString(),
      level,
      data
    };
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    const entry = this.createLogEntry(level, message, data);
    this.logBuffer.push(entry);

    // In development, also log to console
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? console.error : 
                          level === 'warn' ? console.warn :
                          console.log;
      consoleMethod(`[${level.toUpperCase()}] ${message}`, data || '');
    }

    // TODO: In production, implement proper log aggregation
    // This could be sending logs to a service like Datadog, CloudWatch, etc.
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown) {
    this.log('error', message, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
  }

  debug(message: string, data?: unknown) {
    if (this.isDevelopment) {
      this.log('debug', message, data);
    }
  }

  // Get recent logs (useful for error reporting)
  getRecentLogs(count = 10): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  // Clear log buffer
  clearLogs() {
    this.logBuffer = [];
  }
}

export const logger = new Logger(); 