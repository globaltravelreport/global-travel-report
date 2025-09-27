import { useEffect, useLayoutEffect } from 'react';

// useIsomorphicLayoutEffect is a replacement for useLayoutEffect that works on both server and client
// On the server, it falls back to useEffect to avoid SSR mismatches
// On the client, it uses useLayoutEffect for better performance
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;