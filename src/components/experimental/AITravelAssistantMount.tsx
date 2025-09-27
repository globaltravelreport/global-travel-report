'use client';

import React, { useState } from 'react';
import { AITravelAssistant, AITravelButton } from './AITravelAssistant';

/**
 * Dev/Staging-only mount for the AI Travel Assistant.
 * Renders when:
 * - NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true'
 * - or NODE_ENV !== 'production'
 */
export default function AITravelAssistantMount() {
  const [open, setOpen] = useState(false);

  const enabled =
    process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true' ||
    process.env.NODE_ENV !== 'production';

  if (!enabled) return null;

  return (
    <>
      <AITravelButton onClick={() => setOpen(true)} />
      <AITravelAssistant isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}