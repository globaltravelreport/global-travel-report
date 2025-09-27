// Test MongoDB connection and story retrieval
require('dotenv').config({ path: '.env.local' });

async function testMongoDB() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set');
    console.log('MONGODB_DB:', process.env.MONGODB_DB || 'Not set');

    // Dynamically import MongoDB
    const { MongoClient } = require('mongodb');

    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    // Create a new MongoDB client
    const client = new MongoClient(process.env.MONGODB_URI);

    // Connect to the MongoDB server
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB server successfully!');

    // Get the database
    const dbName = process.env.MONGODB_DB || 'global-travel-report';
    const db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Check if stories collection exists
    const storiesCollection = db.collection('stories');
    const storiesCount = await storiesCollection.countDocuments();
    console.log(`Stories collection has ${storiesCount} documents`);

    // Get a sample of stories
    const stories = await storiesCollection.find({}).limit(5).toArray();
    console.log('Sample stories:');
    stories.forEach(story => {
      console.log(`- ${story.title} (slug: ${story.slug})`);
    });

    // Check for specific story
    const parisStory = await storiesCollection.findOne({ slug: 'exploring-paris' });
    if (parisStory) {
      console.log('Found "exploring-paris" story:', parisStory.title);
    } else {
      console.log('Story with slug "exploring-paris" not found');
    }

    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
    process.exit(1);
  }
}

testMongoDB();
