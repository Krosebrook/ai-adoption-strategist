/**
 * Structured logging utility for observability
 * Provides consistent log format and integrates with error tracking
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
}

// Get log level from environment or default to INFO
const currentLogLevel = LOG_LEVELS[import.meta.env.VITE_LOG_LEVEL || 'INFO'] || LOG_LEVELS.INFO

/**
 * Format log entry with metadata
 */
function formatLogEntry(level, message, meta = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
    environment: import.meta.env.MODE || 'development',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  }
}

/**
 * Log to console with structured format
 */
function logToConsole(level, entry) {
  const styles = {
    DEBUG: 'color: #888',
    INFO: 'color: #0066cc',
    WARN: 'color: #ff9900; font-weight: bold',
    ERROR: 'color: #cc0000; font-weight: bold',
    CRITICAL: 'color: #fff; background: #cc0000; font-weight: bold; padding: 2px 4px',
  }

  const prefix = `[${level}] ${entry.timestamp}`
  
  if (import.meta.env.MODE === 'development') {
    console.log(`%c${prefix}`, styles[level], entry.message, entry)
  } else {
    // Production: structured JSON for log aggregation
    console.log(JSON.stringify(entry))
  }
}

/**
 * Send error to tracking service (e.g., Sentry)
 */
async function sendToErrorTracking(entry) {
  // TODO: Integrate with Sentry or other error tracking service
  // if (window.Sentry && entry.level === 'ERROR' || entry.level === 'CRITICAL') {
  //   window.Sentry.captureException(entry.error || new Error(entry.message), {
  //     extra: entry,
  //   })
  // }
  
  // For now, just log to console in production
  if (import.meta.env.MODE === 'production') {
    console.error('Error tracking not configured:', entry)
  }
}

/**
 * Logger class
 */
class Logger {
  constructor(context = 'app') {
    this.context = context
  }

  debug(message, meta = {}) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      const entry = formatLogEntry('DEBUG', message, { ...meta, context: this.context })
      logToConsole('DEBUG', entry)
    }
  }

  info(message, meta = {}) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      const entry = formatLogEntry('INFO', message, { ...meta, context: this.context })
      logToConsole('INFO', entry)
    }
  }

  warn(message, meta = {}) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      const entry = formatLogEntry('WARN', message, { ...meta, context: this.context })
      logToConsole('WARN', entry)
    }
  }

  error(message, error = null, meta = {}) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      const entry = formatLogEntry('ERROR', message, {
        ...meta,
        context: this.context,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : null,
      })
      logToConsole('ERROR', entry)
      sendToErrorTracking(entry)
    }
  }

  critical(message, error = null, meta = {}) {
    const entry = formatLogEntry('CRITICAL', message, {
      ...meta,
      context: this.context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : null,
    })
    logToConsole('CRITICAL', entry)
    sendToErrorTracking(entry)
  }

  // Performance logging
  time(label) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.time(`[${this.context}] ${label}`)
    }
  }

  timeEnd(label) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.timeEnd(`[${this.context}] ${label}`)
    }
  }
}

// Create default logger instance
const logger = new Logger('app')

// Export factory function for context-specific loggers
export function createLogger(context) {
  return new Logger(context)
}

// Export default logger
export default logger

// Export individual methods for convenience
export const { debug, info, warn, error, critical, time, timeEnd } = logger
