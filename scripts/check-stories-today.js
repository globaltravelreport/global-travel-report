// Script to check how many stories were created today
const { getAllStories } = require('../src/utils/stories');

async function checkStoriesToday() {
  try {
    // Get all stories
    const stories = await getAllStories();
    
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter stories created today
    const storiesToday = stories.filter(story => {
      const storyDate = story.publishedAt instanceof Date 
        ? story.publishedAt 
        : new Date(story.publishedAt);
      
      // Set story date to midnight for comparison
      const storyDateOnly = new Date(storyDate);
      storyDateOnly.setHours(0, 0, 0, 0);
      
      // Compare dates
      return storyDateOnly.getTime() === today.getTime();
    });
    
    console.log(`Number of stories created today: ${storiesToday.length}`);
    
    if (storiesToday.length > 0) {
      console.log('\nStories created today:');
      storiesToday.forEach((story, index) => {
        console.log(`${index + 1}. ${story.title} (${story.country})`);
      });
    }
  } catch (error) {
    console.error('Error checking stories:', error);
  }
}

// Run the function
checkStoriesToday();
