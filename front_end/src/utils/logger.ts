/**
 * Frontend Logger
 * Centralized logging for debugging - outputs to browser console with colors
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: unknown;
}

const LOG_COLORS = {
  debug: '#9CA3AF',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
};

class Logger {
  private logs: LogEntry[] = [];
  private enabled = true;

  private formatTime(): string {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  private log(level: LogLevel, component: string, message: string, data?: unknown) {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: this.formatTime(),
      level,
      component,
      message,
      data,
    };

    this.logs.push(entry);

    const color = LOG_COLORS[level];
    const prefix = `%c[${entry.timestamp}] [${level.toUpperCase()}] [${component}]`;
    
    if (data !== undefined) {
      console.log(prefix, `color: ${color}; font-weight: bold`, message, data);
    } else {
      console.log(prefix, `color: ${color}; font-weight: bold`, message);
    }
  }

  debug(component: string, message: string, data?: unknown) {
    this.log('debug', component, message, data);
  }

  info(component: string, message: string, data?: unknown) {
    this.log('info', component, message, data);
  }

  warn(component: string, message: string, data?: unknown) {
    this.log('warn', component, message, data);
  }

  error(component: string, message: string, data?: unknown) {
    this.log('error', component, message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
    console.clear();
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

export const logger = new Logger();

// Make it globally available for debugging in console
(window as unknown as { logger: Logger }).logger = logger;

export default logger;
