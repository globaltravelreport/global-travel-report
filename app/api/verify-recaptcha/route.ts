import { NextResponse } from 'next/server'
import { recaptchaLog } from '@/app/utils/recaptcha'

const RECAPTCHA_SECRET_KEY = '6LfuvR0rAAAAAL8B3APv8mCu-SanRkhMpun05Mnl'
const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      recaptchaLog.error('No token provided in request')
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    recaptchaLog.info('Verifying reCAPTCHA token')

    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
    })

    const result = await response.json()

    if (!response.ok) {
      recaptchaLog.error('reCAPTCHA verification request failed', result)
      return NextResponse.json(
        { error: 'Failed to verify token' },
        { status: response.status }
      )
    }

    recaptchaLog.debug('reCAPTCHA verification response', result)

    if (!result.success) {
      recaptchaLog.warn('reCAPTCHA verification failed', {
        errorCodes: result['error-codes']
      })
      return NextResponse.json(
        { error: 'Invalid token', details: result['error-codes'] },
        { status: 400 }
      )
    }

    recaptchaLog.success('reCAPTCHA verification successful', {
      score: result.score,
      action: result.action
    })

    return NextResponse.json({
      success: true,
      score: result.score,
      action: result.action,
      challenge_ts: result.challenge_ts
    })
  } catch (error) {
    recaptchaLog.error('reCAPTCHA verification error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 