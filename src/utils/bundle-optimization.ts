import dynamic from 'next/dynamic';

export function dynamicImportWithLoading(importFn: () => Promise<any>, loading?: () => React.ReactElement) {
  return dynamic(importFn, { ssr: false, loading });
}
// Add more helpers as needed for chunk naming, modularized imports, etc.
