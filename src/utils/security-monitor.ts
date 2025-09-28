// Security Monitoring Utility
import { logError } from './error-handler';
import { SecurityEventType } from '../types/security';

export interface SecurityEvent {
  type: SecurityEventType;
  ip: string;
  userAgent?: string;
  details?: any;
  timestamp?: string;
}

const suspiciousIPs = new Set<string>();

export function trackSecurityEvent(event: SecurityEvent) {
  logError({
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
    level: 'security',
  });
  if (event.type === 'failed_login' || event.type === 'threat_detected') {
    suspiciousIPs.add(event.ip);
  }
}

export function isIPBlocked(ip: string) {
  return suspiciousIPs.has(ip);
}
