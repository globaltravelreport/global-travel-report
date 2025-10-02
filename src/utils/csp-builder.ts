// CSP Policy Builder Utility
// Generates Content Security Policy headers with nonce support and environment-specific policies

export interface CSPOptions {
  nonce?: string;
  env?: 'development' | 'production';
  reportOnly?: boolean;
}

export function buildCSP({ nonce = '', env = 'production', reportOnly = false }: CSPOptions = {}): { key: string; value: string } {
  const isProd = env === 'production';
  // Google reCAPTCHA and Google domains for script-src and frame-src
  const scriptSrc = [
    `'self'`,
    nonce ? `'nonce-${nonce}'` : '',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://www.recaptcha.net', // alternate reCAPTCHA CDN
  ].filter(Boolean).join(' ');
  const styleSrc = [
    `'self'`,
    nonce ? `'nonce-${nonce}'` : '',
    `'unsafe-hashes'`,
    'https://fonts.googleapis.com',
    'https://www.gstatic.com',
  ].filter(Boolean).join(' ');
  const imgSrc = [
    `'self'`,
    'data:',
    'blob:',
    'https://images.unsplash.com',
    'https://unsplash.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://i.ytimg.com',
    'https://picsum.photos',
    'https://source.unsplash.com',
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://www.recaptcha.net'
  ].join(' ');
  const connectSrc = [
    `'self'`,
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://api.unsplash.com',
    'https://vitals.vercel-insights.com',
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://www.recaptcha.net'
  ].join(' ');
  const fontSrc = [
    `'self'`,
    'https://fonts.gstatic.com',
    'https://www.gstatic.com'
  ].join(' ');
  const frameSrc = [
    `'self'`,
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://www.recaptcha.net'
  ].join(' ');
  const policy = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    `connect-src ${connectSrc}`,
    `font-src ${fontSrc}`,
    `frame-src ${frameSrc}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
    `report-uri /api/security/csp-violation`
  ].join('; ');
  return {
    key: reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
    value: policy
  };
}

export function validateCSP(policy: string): boolean {
  // Dummy validation: ensure no unsafe-eval/unsafe-inline in production
  return !/unsafe-eval|unsafe-inline/.test(policy);
}
