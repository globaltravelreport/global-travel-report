/**
 * Logger utility that wraps console methods with additional functionality
 */
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.info(message, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(message, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.debug(message, ...args);
  }
}; 