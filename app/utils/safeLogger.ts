import { logger } from '@/utils/logger'

export function safeLogError(message: string, error: unknown, context?: Record<string, unknown>) {
  const errorInfo = error instanceof Error 
    ? { 
        message: error.message,
        name: error.name,
        stack: error.stack,
        ...(error as any).status && { status: (error as any).status }
      }
    : { error: String(error) }
  
  logger.error(message, { ...errorInfo, ...context })
} 