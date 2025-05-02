# Fixing Date Issues in Story Files

This document explains how to fix date issues in story files that are causing errors during the build process.

## The Problem

The build process is failing with errors like:

```
Error reading story file 1-asias-latest-museums-a-must-visit-for-aussie-explorers.md: RangeError: Invalid time value
```

This is happening because some story files have invalid date values in their frontmatter. When the application tries to convert these invalid dates to ISO strings using `new Date(dateStr).toISOString()`, it fails with a `RangeError`.

## The Solution

We've implemented two fixes for this issue:

1. **Safe Date Conversion**: We've added a `safeToISOString()` function in `src/utils/fileStorage.ts` that safely converts date strings to ISO strings, handling invalid dates gracefully.

2. **Fix Script**: We've created a script that can fix all story files with invalid dates.

## How to Fix

### Option 1: Run the Fix Script

The easiest way to fix all story files at once is to run the fix script:

```bash
npm run fix-story-dates
```

This script will:
- Scan all story files in the `content/articles` directory
- Check for invalid dates in the frontmatter
- Replace invalid dates with the current date
- Save the fixed files

### Option 2: Manual Fix

If you prefer to fix the files manually, you can:

1. Open each story file in the `content/articles` directory
2. Check the `date` field in the frontmatter
3. Replace invalid dates with a valid ISO date string (e.g., `2024-05-01T00:00:00.000Z`)

## Preventing Future Issues

To prevent similar issues in the future:

1. Always use valid ISO date strings in the frontmatter of story files
2. Use the `safeToISOString()` function when working with dates from external sources
3. Add validation for dates when creating or updating story files

## Technical Details

### The Fix Implementation

We've made the following changes to the codebase:

1. Added a `safeToISOString()` function in `src/utils/fileStorage.ts`:
   ```typescript
   function safeToISOString(dateStr: string | Date | undefined): string {
     if (!dateStr) {
       return new Date().toISOString();
     }
     
     try {
       // If it's already a Date object
       if (dateStr instanceof Date) {
         return dateStr.toISOString();
       }
       
       // Try to parse the date string
       const date = new Date(dateStr);
       
       // Check if the date is valid
       if (isNaN(date.getTime())) {
         console.warn(`Invalid date: ${dateStr}, using current date instead`);
         return new Date().toISOString();
       }
       
       return date.toISOString();
     } catch (error) {
       console.warn(`Error converting date: ${dateStr}, using current date instead`, error);
       return new Date().toISOString();
     }
   }
   ```

2. Updated the story object creation to use this function:
   ```typescript
   publishedAt: safeToISOString(storyData.date),
   ```

3. Updated the `saveStory` function to use this function:
   ```typescript
   date: "${safeToISOString(story.publishedAt)}"
   ```

4. Created a script to fix existing story files: `scripts/fixStoryDates.ts`

### Valid Date Formats

JavaScript's `Date` constructor accepts various date formats, but the safest format to use is the ISO 8601 format:

```
YYYY-MM-DDTHH:mm:ss.sssZ
```

For example:
```
2024-05-01T00:00:00.000Z
```

This format is guaranteed to be parsed correctly across all browsers and environments.
