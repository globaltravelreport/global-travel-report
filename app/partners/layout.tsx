import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Travel Partners',
  description:
    'Trusted Global Travel Report partners for accommodation, transfers, eSIMs, insurance, VPN and travel finance — compared for Australian travellers.',
  openGraph: {
    title: 'Travel Partners | Global Travel Report',
    description:
      'Trusted Global Travel Report partners for accommodation, transfers, eSIMs, insurance, VPN and travel finance — compared for Australian travellers.',
    locale: 'en_AU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Partners | Global Travel Report',
    description:
      'Trusted Global Travel Report partners for accommodation, transfers, eSIMs, insurance, VPN and travel finance — compared for Australian travellers.',
  },
};

export default function PartnersLayout({ children }: { children: ReactNode }) {
  return children;
}
