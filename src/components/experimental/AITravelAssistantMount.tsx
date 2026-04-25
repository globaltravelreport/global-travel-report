'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AITravelAssistant, AITravelButton } from './AITravelAssistant';

/**
 * Only renders when NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true'.
 * Resets open state on route change to prevent the fixed panel
 * from persisting across navigation and intercepting header clicks.
 */
export default function AITravelAssistantMount() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const enabled = process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true';

  if (!enabled) return null;

  return (
    <>
      <AITravelButton onClick={() => setOpen(true)} />
      <AITravelAssistant isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
