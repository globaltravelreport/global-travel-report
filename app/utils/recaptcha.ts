const isDev = process.env.NODE_ENV === 'development'
const isDebug = process.env.RECAPTCHA_DEBUG === 'true'

// Site keys
const PROD_SITE_KEY = '6LfuvR0rAAAAAKCLSAhbtRfyquD-xwRKnrWdRJJV'
const TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Google's test key

export const SITE_KEY = isDev ? TEST_SITE_KEY : PROD_SITE_KEY

// Logging utilities
export const recaptchaLog = {
  info: (message: string, data?: any) => {
    if (isDebug || isDev) {
      console.info(`🔒 reCAPTCHA [INFO]: ${message}`, data || '')
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ reCAPTCHA [WARN]: ${message}`, data || '')
  },
  error: (message: string, error?: any) => {
    console.error(`❌ reCAPTCHA [ERROR]: ${message}`, error || '')
  },
  success: (message: string, data?: any) => {
    if (isDebug || isDev) {
      console.log(`✅ reCAPTCHA [SUCCESS]: ${message}`, data || '')
    }
  },
  debug: (message: string, data?: any) => {
    if (isDebug) {
      console.debug(`🔍 reCAPTCHA [DEBUG]: ${message}`, data || '')
    }
  }
}

// Validation utilities
export const validateRecaptchaToken = (token: string | null): token is string => {
  if (!token) {
    recaptchaLog.error('No token provided')
    return false
  }
  if (typeof token !== 'string') {
    recaptchaLog.error('Invalid token type', typeof token)
    return false
  }
  if (token === 'mock-token') {
    recaptchaLog.warn('Mock token detected - verification bypassed in development')
    return isDev
  }
  return true
}

// Environment checks
export const checkRecaptchaConfig = () => {
  if (!SITE_KEY) {
    recaptchaLog.error('Site key is undefined')
    return false
  }
  
  if (isDev) {
    recaptchaLog.info('Using test site key in development mode')
  }
  
  if (isDebug) {
    recaptchaLog.debug('Debug mode enabled')
  }
  
  return true
} 