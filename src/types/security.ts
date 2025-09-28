// Security-related TypeScript types

export type SecurityEventType =
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'validation_failure'
  | 'failed_login'
  | 'suspicious_request'
  | 'threat_detected'
  | 'rate_limit'
  | 'csp_violation'
  | 'error'
  | 'monitoring';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
}

export interface CSPPolicy {
  nonce?: string;
  env?: 'development' | 'production';
  reportOnly?: boolean;
  policy: string;
}

export interface ErrorMonitoringData {
  requestId: string;
  url: string;
  method: string;
  error: string;
  stack?: string;
  timestamp: string;
  category?: SecurityEventType;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface SecurityContext {
  ip: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
  isAuthenticated?: boolean;
}

export interface SecurityAlert {
  type: SecurityEventType;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}
