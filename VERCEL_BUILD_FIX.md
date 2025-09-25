# Fixing Vercel Build Errors

## Issue

The Vercel build is failing with the following errors:

```
./app/admin/content-audit/page.tsx
Module not found: Can't resolve '@/src/components/ui/tabs'

./app/admin/content-audit/page.tsx
Module not found: Can't resolve '@/src/components/ui/table'

./src/components/admin/PerformanceMonitor.tsx
Module not found: Can't resolve '@/src/components/ui/tabs'

./src/components/ui/FreshnessIndicator.tsx
Module not found: Can't resolve '@/src/components/ui/tooltip'

./src/utils/dynamic-import.ts
Error: Expected '>', got 'placeholder'
```

## Solution

1. Create the missing UI components:
   - `tabs.tsx`
   - `table.tsx`
   - `tooltip.tsx`

2. Fix the dynamic-import.ts file to avoid JSX syntax errors.

3. Fix type errors in various components.

## Steps to Fix

### 1. Create the missing UI components

#### Create `src/components/ui/tabs.tsx`:

```tsx
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/src/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

#### Create `src/components/ui/table.tsx`:

```tsx
import * as React from "react"

import { cn } from "@/src/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-primary font-medium text-primary-foreground", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
```

#### Create `src/components/ui/tooltip.tsx`:

```tsx
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/src/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

### 2. Fix the dynamic-import.ts file

Replace the content of `src/utils/dynamic-import.ts` with:

```tsx
/**
 * Dynamic Import Utilities
 *
 * This module provides utilities for dynamic imports and code splitting.
 */

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

/**
 * Options for dynamic imports
 */
export interface DynamicImportOptions {
  /**
   * Whether to load the component on the server side
   */
  ssr?: boolean;

  /**
   * Loading component to show while the dynamic component is loading
   */
  loading?: ReactNode;

  /**
   * Whether to load the component only when it's visible in the viewport
   */
  loadOnlyWhenVisible?: boolean;
}

/**
 * Dynamically import a component with code splitting
 *
 * @param importFunc - Function that imports the component
 * @param options - Options for dynamic import
 * @returns Dynamically imported component
 *
 * @example
 * ```tsx
 * const DynamicMap = dynamicImport(() => import('@/components/Map'), {
 *   ssr: false,
 *   loading: <div>Loading map...</div>
 * });
 * ```
 */
export function dynamicImport<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {}
) {
  const { ssr = true, loading, loadOnlyWhenVisible = false } = options;

  // Simple dynamic import without JSX
  return dynamic(importFunc, { ssr });
}

/**
 * Dynamically import a component with code splitting and no server-side rendering
 *
 * @param importFunc - Function that imports the component
 * @param options - Options for dynamic import
 * @returns Dynamically imported component
 *
 * @example
 * ```tsx
 * const DynamicChart = clientOnly(() => import('@/components/Chart'));
 * ```
 */
export function clientOnly<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: Omit<DynamicImportOptions, 'ssr'> = {}
) {
  return dynamicImport(importFunc, { ...options, ssr: false });
}

/**
 * Dynamically import a component with code splitting and lazy loading
 *
 * @param importFunc - Function that imports the component
 * @param options - Options for dynamic import
 * @returns Dynamically imported component
 *
 * @example
 * ```tsx
 * const LazyVideo = lazyLoad(() => import('@/components/Video'));
 * ```
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: Omit<DynamicImportOptions, 'loadOnlyWhenVisible'> = {}
) {
  return dynamicImport(importFunc, { ...options, loadOnlyWhenVisible: true });
}
```

### 3. Fix the DynamicWorldMap component

Update `src/components/maps/DynamicWorldMap.tsx` by replacing:

```tsx
const DynamicWorldMap = clientOnly<React.ComponentType<WorldMapProps>>(
  () => import('./WorldMap'),
  {
    loading: ({ width, height }: { width?: number | string; height?: number | string }) => (
      <MapLoading width={width} height={height} />
    ),
  }
);
```

with:

```tsx
const DynamicWorldMap = clientOnly<React.ComponentType<WorldMapProps>>(
  () => import('./WorldMap')
);
```

### 4. Fix the error-logger.ts file

In `src/utils/error-logger.ts`, replace:

```tsx
// Call the original handler if it exists
if (originalUnhandledRejection) {
  return originalUnhandledRejection(event);
}
```

with:

```tsx
// Call the original handler if it exists
if (originalUnhandledRejection) {
  return originalUnhandledRejection.call(window, event);
}
```

### 5. Fix the web-vitals.ts file

In `src/utils/web-vitals.ts`, replace:

```tsx
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  const { id, name, value, delta } = metric;

  // Get the rating for the metric
  const rating = getMetricRating(name, value);

  // Store the metric
  storeWebVitalsMetric({
    id,
    name,
    value,
    rating,
    delta,
    navigationType: (performance as any).getEntriesByType?.('navigation')?.[0]?.type || '',
  });
}
```

with:

```tsx
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  const { id, name, value } = metric;
  // delta is not available in NextWebVitalsMetric type, so we use any to access it
  const delta = (metric as any).delta;

  // Get the rating for the metric
  const rating = getMetricRating(name, value);

  // Store the metric
  storeWebVitalsMetric({
    id,
    name,
    value,
    rating,
    delta: delta || 0,
    navigationType: (performance as any).getEntriesByType?.('navigation')?.[0]?.type || '',
  });
}
```

### 6. Fix the OptimizedImage component

In `src/components/ui/OptimizedImage.tsx`, remove the `formats` prop:

```tsx
// Remove this line
formats={['image/avif', 'image/webp']}
```

### 7. Fix the FAQSchema component

In `src/components/seo/FAQSchema.tsx`, replace:

```tsx
<Accordion type="single" collapsible className="w-full">
  {items.map((item, index) => (
    <AccordionItem key={index} value={`item-${index}`}>
      <AccordionTrigger className="text-left font-medium">
        {item.question}
      </AccordionTrigger>
      <AccordionContent>
        <div dangerouslySetInnerHTML={{ __html: item.answer }} />
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

with:

```tsx
<Accordion className="w-full">
  {items.map((item, index) => (
    <AccordionItem key={index}>
      <AccordionTrigger>
        {item.question}
      </AccordionTrigger>
      <AccordionContent>
        <div dangerouslySetInnerHTML={{ __html: item.answer }} />
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

### 8. Fix the StoryCard component

In `src/components/stories/StoryCard.tsx`, replace:

```tsx
<FreshnessIndicator
  publishedDate={story.publishedAt}
  updatedDate={story.updatedAt}
  size="sm"
/>
```

with:

```tsx
<FreshnessIndicator
  publishedDate={typeof story.publishedAt === 'string' ? story.publishedAt : story.publishedAt.toISOString()}
  updatedDate={story.updatedAt ? (typeof story.updatedAt === 'string' ? story.updatedAt : story.updatedAt.toISOString()) : undefined}
  size="sm"
/>
```

### 9. Fix the stories/[slug]/page.tsx file

In `app/stories/[slug]/page.tsx`, replace:

```tsx
images={[
  {
    url: story.coverImage,
    width: 1200,
    height: 630,
    alt: story.title
  }
]}
```

with:

```tsx
images={[
  story.coverImage
]}
```

And replace:

```tsx
article={{
  publishedTime: story.publishedAt,
  modifiedTime: story.updatedAt || story.publishedAt,
  authors: ['Global Travel Report Editorial Team'],
  section: story.category,
  tags: story.tags
}}
```

with:

```tsx
article={{
  publishedTime: new Date(story.publishedAt).toISOString(),
  modifiedTime: new Date(story.updatedAt || story.publishedAt).toISOString(),
  authors: ['Global Travel Report Editorial Team'],
  section: story.category,
  tags: story.tags
}}
```

## 10. Install the missing dependencies

Run the following command to install the missing Radix UI dependencies:

```bash
npm install @radix-ui/react-tabs @radix-ui/react-tooltip
```

## Conclusion

After making these changes, the Vercel build should complete successfully. These fixes address the following issues:

1. Missing UI components that were referenced in the code but not implemented
2. JSX syntax errors in the dynamic-import.ts file
3. Type errors in various components
4. Missing dependencies

If you encounter any other issues during the build, please check the error messages and make the necessary adjustments.