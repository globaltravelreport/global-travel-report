import { logger } from '@/utils/logger'

interface ErrorWithStatus extends Error {
  status?: number;
}

export function safeLogError(message: string, error: unknown, context?: Record<string, unknown>) {
  const errorInfo = error instanceof Error 
    ? { 
        message: error.message,
        name: error.name,
        stack: error.stack,
        ...(error as ErrorWithStatus).status && { status: (error as ErrorWithStatus).status }
      }
    : { error: String(error) }
  
  logger.error(message, { ...errorInfo, ...context })
} 