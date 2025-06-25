/**
 * File-based Storage Utility
 *
 * This is a simple implementation that uses file-based storage.
 * It provides a similar interface to what would be expected from a database,
 * but doesn't require any external database dependencies.
 */

import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';
import {
  Collection,
  Db,
  connectToMongoDB,
  getStoriesCollection,
  closeMongoDB
} from '@/utils/fileStorage';

// Re-export the interfaces and functions from fileStorage
export type { Collection, Db };
export {
  connectToMongoDB,
  getStoriesCollection,
  closeMongoDB
};

/**
 * Check if we're in a Node.js environment where MongoDB can be used
 * This stub always returns false to prevent actual MongoDB usage
 */
export function canUseMongoDB(): boolean {
  return false;
}
