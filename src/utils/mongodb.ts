/**
 * MongoDB Stub Utility
 *
 * This is a stub implementation that doesn't actually use MongoDB.
 * It's designed to be compatible with code that expects MongoDB functions
 * but doesn't actually require the MongoDB package.
 */

import { Story } from '@/types/Story';
import { mockStories } from '@/src/mocks/stories';

// Mock collection type to match MongoDB's Collection interface
export interface Collection<T> {
  find: (query?: any) => { toArray: () => Promise<T[]> };
  findOne: (query: any) => Promise<T | null>;
  insertOne: (doc: T) => Promise<any>;
  insertMany: (docs: T[]) => Promise<any>;
  updateOne: (filter: any, update: any, options?: any) => Promise<any>;
  deleteOne: (filter: any) => Promise<any>;
  countDocuments: () => Promise<number>;
}

// Mock DB type
export interface Db {
  collection: <T>(name: string) => Collection<T>;
}

// Mock stories collection
const storiesCollection: Collection<Story> = {
  find: (query?: any) => ({
    toArray: async () => {
      console.log('Mock MongoDB: find() called with query:', query);
      return [...mockStories];
    }
  }),
  findOne: async (query: any) => {
    console.log('Mock MongoDB: findOne() called with query:', query);
    if (query.id) {
      return mockStories.find(s => s.id === query.id) || null;
    }
    if (query.slug) {
      return mockStories.find(s => s.slug === query.slug) || null;
    }
    return null;
  },
  insertOne: async (doc: Story) => {
    console.log('Mock MongoDB: insertOne() called with doc:', doc.title);
    return { acknowledged: true, insertedId: doc.id };
  },
  insertMany: async (docs: Story[]) => {
    console.log(`Mock MongoDB: insertMany() called with ${docs.length} docs`);
    return { acknowledged: true, insertedCount: docs.length };
  },
  updateOne: async (filter: any, update: any) => {
    console.log('Mock MongoDB: updateOne() called with filter:', filter);
    return { acknowledged: true, modifiedCount: 1 };
  },
  deleteOne: async (filter: any) => {
    console.log('Mock MongoDB: deleteOne() called with filter:', filter);
    return { acknowledged: true, deletedCount: 1 };
  },
  countDocuments: async () => {
    return mockStories.length;
  }
};

// Mock DB instance
const mockDb: Db = {
  collection: <T>(name: string): Collection<T> => {
    console.log(`Mock MongoDB: Getting collection: ${name}`);
    if (name === 'stories') {
      return storiesCollection as unknown as Collection<T>;
    }
    throw new Error(`Collection ${name} not implemented in mock`);
  }
};

/**
 * Check if we're in a Node.js environment where MongoDB can be used
 * This stub always returns false to prevent actual MongoDB usage
 */
export function canUseMongoDB(): boolean {
  return false;
}

/**
 * Connect to MongoDB (stub implementation)
 * @returns A promise that resolves to the mock database instance
 */
export async function connectToMongoDB(): Promise<Db> {
  console.log('Mock MongoDB: connectToMongoDB() called');
  return mockDb;
}

/**
 * Get the stories collection (stub implementation)
 * @returns A promise that resolves to the mock stories collection
 */
export async function getStoriesCollection(): Promise<Collection<Story>> {
  console.log('Mock MongoDB: getStoriesCollection() called');
  return storiesCollection;
}

/**
 * Close the MongoDB connection (stub implementation)
 */
export async function closeMongoDB(): Promise<void> {
  console.log('Mock MongoDB: closeMongoDB() called');
}
