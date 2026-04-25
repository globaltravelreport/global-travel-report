'use client';

import React, { useState } from 'react';
import { AITravelAssistant, AITravelButton } from './AITravelAssistant';

/**
 * Only renders when NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true'.
 * Removed the NODE_ENV !== 'production' fallback which caused the
 * floating button and assistant panel to always mount, overlapping
 * header navigation and intercepting click events.
 */
export default function AITravelAssistantMount() {
  const [open, setOpen] = useState(false);

  const enabled = process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true';

  if (!enabled) return null;

  return (
    <>
      <AITravelButton onClick={() => setOpen(true)} />
      <AITravelAssistant isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
