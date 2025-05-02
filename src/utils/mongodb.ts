/**
 * MongoDB Connection Utility
 *
 * This utility provides a connection to MongoDB Atlas.
 * It uses a singleton pattern to ensure only one connection is created.
 *
 * IMPORTANT: This file is dynamically imported only in server-side contexts
 * to ensure compatibility with Edge Runtime.
 */

// Import MongoDB types but use dynamic imports for the actual client
// to ensure compatibility with Edge Runtime
import type { MongoClient, Db, Collection } from 'mongodb';
import { Story } from '@/types/Story';

// Connection URL from environment variables
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'global-travel-report';

// MongoDB client instance - will be initialized on demand
let client: any = null;
let db: any = null;
let isConnecting = false;
let connectionPromise: Promise<any> | null = null;

/**
 * Check if we're in a Node.js environment where MongoDB can be used
 * This helps ensure compatibility with Edge Runtime
 */
export function canUseMongoDB(): boolean {
  return (
    typeof process !== 'undefined' &&
    typeof process.env !== 'undefined' &&
    !!process.env.MONGODB_URI &&
    typeof globalThis.require === 'function'
  );
}

/**
 * Connect to MongoDB
 * @returns A promise that resolves to the MongoDB database instance
 */
export async function connectToMongoDB(): Promise<any> {
  // If we're already connected, return the existing database instance
  if (db) {
    return db;
  }

  // If we're in the process of connecting, return the existing promise
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  // Check if MongoDB can be used in this environment
  if (!canUseMongoDB()) {
    throw new Error('MongoDB cannot be used in this environment (likely Edge Runtime)');
  }

  // Check if MongoDB URI is configured
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  // Set connecting flag and create a new connection promise
  isConnecting = true;
  connectionPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('Connecting to MongoDB...');

      // Dynamically import MongoDB to ensure compatibility with Edge Runtime
      const { MongoClient } = await import('mongodb');

      // Create a new MongoDB client
      client = new MongoClient(MONGODB_URI);

      // Connect to the MongoDB server
      await client.connect();
      console.log('Connected to MongoDB server');

      // Get the database
      db = client.db(MONGODB_DB);
      console.log(`Connected to database: ${MONGODB_DB}`);

      // Reset connecting flag
      isConnecting = false;

      // Resolve with the database instance
      resolve(db);
    } catch (error) {
      // Reset connecting flag and connection promise
      isConnecting = false;
      connectionPromise = null;

      // Log and reject with the error
      console.error('Error connecting to MongoDB:', error);
      reject(error);
    }
  });

  return connectionPromise;
}

/**
 * Get the stories collection
 * @returns A promise that resolves to the stories collection
 */
export async function getStoriesCollection(): Promise<Collection<Story>> {
  try {
    const db = await connectToMongoDB();
    return db.collection<Story>('stories');
  } catch (error) {
    console.error('Error getting stories collection:', error);
    throw error;
  }
}

/**
 * Close the MongoDB connection
 * This should be called when the application is shutting down
 */
export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    connectionPromise = null;
    console.log('MongoDB connection closed');
  }
}
