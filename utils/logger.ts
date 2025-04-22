import { NextRequest } from 'next/server'

interface LogData {
  request?: NextRequest
  error?: Error
  url?: string
  hasContent?: boolean
  contentLength?: number
  duration?: number
  [key: string]: any
}

class Logger {
  private formatMessage(message: string, data?: LogData): string {
    const timestamp = new Date().toISOString()
    const requestId = data?.request?.headers.get('x-request-id') || 'unknown'
    const ip = data?.request?.ip || data?.request?.headers.get('x-forwarded-for') || 'unknown'
    
    let formattedMessage = `[${timestamp}] [${requestId}] [${ip}] ${message}`
    
    if (data) {
      const { request, error, ...rest } = data
      if (Object.keys(rest).length > 0) {
        formattedMessage += ` ${JSON.stringify(rest)}`
      }
      if (error) {
        formattedMessage += `\nError: ${error.message}\nStack: ${error.stack}`
      }
    }
    
    return formattedMessage
  }

  info(message: string, data?: LogData): void {
    console.log(this.formatMessage(message, data))
  }

  error(message: string, data?: LogData): void {
    console.error(this.formatMessage(message, data))
  }

  warn(message: string, data?: LogData): void {
    console.warn(this.formatMessage(message, data))
  }
}

export const logger = new Logger() 