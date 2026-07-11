'use client';

import dynamic from 'next/dynamic';

// Keep the experimental assistant and its animation library out of the normal
// visitor bundle. The server layout only mounts this loader when the feature is
// explicitly enabled.
const AITravelAssistantMount = dynamic(
  () => import('../src/components/experimental/AITravelAssistantMount'),
  { ssr: false }
);

export default function AITravelAssistantLoader() {
  return <AITravelAssistantMount />;
}
