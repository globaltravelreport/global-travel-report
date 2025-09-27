'use client';
import { useServiceWorker } from '@/hooks/useServiceWorker';
export default function SWMount() {
  useServiceWorker();
  return null;
}
