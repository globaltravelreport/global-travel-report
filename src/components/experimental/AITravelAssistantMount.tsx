'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

/**
 * Only renders when NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true'.
 * Dynamic-import the heavy framer-motion assistant so it never hits first paint
 * when the feature is off (default).
 */
const AITravelAssistant = dynamic(
  () => import('./AITravelAssistant').then((m) => m.AITravelAssistant),
  { ssr: false }
);
const AITravelButton = dynamic(
  () => import('./AITravelAssistant').then((m) => m.AITravelButton),
  { ssr: false }
);

export default function AITravelAssistantMount() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setEnabled(process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true');
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!enabled) return null;

  return (
    <>
      <AITravelButton onClick={() => setOpen(true)} />
      <AITravelAssistant isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
