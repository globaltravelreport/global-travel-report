/**
 * Logger utility that wraps console methods with additional functionality
 */
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.info(message, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(message, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    console.debug(message, ...args);
  }
}; 