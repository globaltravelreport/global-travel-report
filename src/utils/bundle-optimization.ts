export function dynamicImportWithLoading(importFn, loading) {
  return dynamic(importFn, { ssr: false, loading });
}
// Add more helpers as needed for chunk naming, modularized imports, etc.
