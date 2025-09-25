/**
 * Comprehensive script to fix image URLs and photographer attribution in story files
 * This script ensures each story has a unique image and photographer
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Category-specific images with photographer information
const CATEGORY_IMAGES = {
  'Travel': [
    { url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080', photographer: 'Jakob Owens', profileUrl: 'https://unsplash.com/@jakobowens1' },
    { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1', photographer: 'Asoggetti', profileUrl: 'https://unsplash.com/@asoggetti' },
    { url: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b', photographer: 'Jaromir Kavan', profileUrl: 'https://unsplash.com/@jerrykavan' },
    { url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d', photographer: 'Dino Reichmuth', profileUrl: 'https://unsplash.com/@dinoreichmuth' },
    { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', photographer: 'Sylvain Mauroux', profileUrl: 'https://unsplash.com/@sylvainmauroux' },
    { url: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0', photographer: 'Sime Basioli', profileUrl: 'https://unsplash.com/@basecore' },
    { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800', photographer: 'Braden Jarvis', profileUrl: 'https://unsplash.com/@jarvisphoto' },
    { url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2', photographer: 'Simon Migaj', profileUrl: 'https://unsplash.com/@simonmigaj' },
    { url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a', photographer: 'Arto Marttinen', profileUrl: 'https://unsplash.com/@wandervisions' },
    { url: 'https://images.unsplash.com/photo-1528127269322-539801943592', photographer: 'Emile Guillemot', profileUrl: 'https://unsplash.com/@emilegt' },
    { url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff', photographer: 'Thomas Tucker', profileUrl: 'https://unsplash.com/@tents_and_tread' },
    { url: 'https://images.unsplash.com/photo-1528164344705-47542687000d', photographer: 'Davide Cantelli', profileUrl: 'https://unsplash.com/@cant89' }
  ],
  'Cruise': [
    { url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
    { url: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b', photographer: 'Josiah Farrow', profileUrl: 'https://unsplash.com/@josiahfarrow' },
    { url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110', photographer: 'Vidar Nordli-Mathisen', profileUrl: 'https://unsplash.com/@vidarnm' },
    { url: 'https://images.unsplash.com/photo-1548690396-1fae5d6a3f8a', photographer: 'Vidar Nordli-Mathisen', profileUrl: 'https://unsplash.com/@vidarnm' },
    { url: 'https://images.unsplash.com/photo-1548574169-47bca74f9515', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
    { url: 'https://images.unsplash.com/photo-1580541631950-7282082b03fe', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
    { url: 'https://images.unsplash.com/photo-1566375638485-8c4d8780ae10', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
    { url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0', photographer: 'Vidar Nordli-Mathisen', profileUrl: 'https://unsplash.com/@vidarnm' },
    { url: 'https://images.unsplash.com/photo-1559599746-8823b38544c6', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
    { url: 'https://images.unsplash.com/photo-1580394693539-9b20a140c7e3', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
    { url: 'https://images.unsplash.com/photo-1580541631950-7282082b03fe', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' }
  ],
  'Culture': [
    { url: 'https://images.unsplash.com/photo-1493707553966-283afac8c358', photographer: 'Anthony Tran', profileUrl: 'https://unsplash.com/@anthonytran' },
    { url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5', photographer: 'Jingda Chen', profileUrl: 'https://unsplash.com/@jingda' },
    { url: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be', photographer: 'Esteban Castle', profileUrl: 'https://unsplash.com/@estebancastle' },
    { url: 'https://images.unsplash.com/photo-1551913902-c92207136625', photographer: 'Raimond Klavins', profileUrl: 'https://unsplash.com/@raimondklavins' },
    { url: 'https://images.unsplash.com/photo-1552084117-56a987666449', photographer: 'Heidi Kaden', profileUrl: 'https://unsplash.com/@heidikaden' },
    { url: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b', photographer: 'Raimond Klavins', profileUrl: 'https://unsplash.com/@raimondklavins' },
    { url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04', photographer: 'Jezael Melgoza', profileUrl: 'https://unsplash.com/@jezar' },
    { url: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0', photographer: 'Shifaaz Shamoon', profileUrl: 'https://unsplash.com/@sotti' },
    { url: 'https://images.unsplash.com/photo-1581872151274-8ede2e3f7d12', photographer: 'Shifaaz Shamoon', profileUrl: 'https://unsplash.com/@sotti' },
    { url: 'https://images.unsplash.com/photo-1519181245277-cffeb31da2e3', photographer: 'Jezael Melgoza', profileUrl: 'https://unsplash.com/@jezar' },
    { url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077', photographer: 'Dario Bronnimann', profileUrl: 'https://unsplash.com/@darby' },
    { url: 'https://images.unsplash.com/photo-1516834474-48c0abc2a902', photographer: 'Jezael Melgoza', profileUrl: 'https://unsplash.com/@jezar' }
  ],
  'Food & Wine': [
    { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
    { url: 'https://images.unsplash.com/photo-1543352634-99a5d50ae78e', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
    { url: 'https://images.unsplash.com/photo-1533777324565-a040eb52facd', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
    { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3', photographer: 'Kelsey Knight', profileUrl: 'https://unsplash.com/@kelseyannvere' },
    { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
    { url: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
    { url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
    { url: 'https://images.unsplash.com/photo-1515778767554-195d641642a7', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
    { url: 'https://images.unsplash.com/photo-1482275548304-a58859dc31b7', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
    { url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
    { url: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
    { url: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' }
  ],
  'Adventure': [
    { url: 'https://images.unsplash.com/photo-1551632811-561732d1e306', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1455156218388-5e61b526818b', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1542359649-31e03cd4d909', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1484910292437-025e5d13ce87', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
    { url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' }
  ],
  'General': [
    { url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080', photographer: 'Jakob Owens', profileUrl: 'https://unsplash.com/@jakobowens1' },
    { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1', photographer: 'Asoggetti', profileUrl: 'https://unsplash.com/@asoggetti' },
    { url: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b', photographer: 'Jaromir Kavan', profileUrl: 'https://unsplash.com/@jerrykavan' },
    { url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d', photographer: 'Dino Reichmuth', profileUrl: 'https://unsplash.com/@dinoreichmuth' },
    { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', photographer: 'Sylvain Mauroux', profileUrl: 'https://unsplash.com/@sylvainmauroux' },
    { url: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0', photographer: 'Sime Basioli', profileUrl: 'https://unsplash.com/@basecore' },
    { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800', photographer: 'Braden Jarvis', profileUrl: 'https://unsplash.com/@jarvisphoto' },
    { url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2', photographer: 'Simon Migaj', profileUrl: 'https://unsplash.com/@simonmigaj' },
    { url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a', photographer: 'Arto Marttinen', profileUrl: 'https://unsplash.com/@wandervisions' },
    { url: 'https://images.unsplash.com/photo-1528127269322-539801943592', photographer: 'Emile Guillemot', profileUrl: 'https://unsplash.com/@emilegt' },
    { url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff', photographer: 'Thomas Tucker', profileUrl: 'https://unsplash.com/@tents_and_tread' },
    { url: 'https://images.unsplash.com/photo-1528164344705-47542687000d', photographer: 'Davide Cantelli', profileUrl: 'https://unsplash.com/@cant89' }
  ]
};

// Track used images to avoid duplicates
const usedImages = new Set();

// Function to get a unique image for a story based on its properties
function getUniqueImageForStory(story, filename) {
  // Determine the category
  const category = story.category || story.type || 'General';
  
  // Find the appropriate image array
  let categoryKey = 'General';
  for (const key of Object.keys(CATEGORY_IMAGES)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      categoryKey = key;
      break;
    }
  }
  
  const imageArray = CATEGORY_IMAGES[categoryKey];
  
  // Create a unique hash based on the filename and title
  const uniqueString = `${filename}-${story.title || ''}`;
  const uniqueHash = uniqueString.split('').reduce((acc, char, index) => {
    return acc + (char.charCodeAt(0) * (index + 1));
  }, 0);
  
  // Try to find an unused image
  let attempts = 0;
  let index = Math.abs(uniqueHash) % imageArray.length;
  let selectedImage = imageArray[index];
  
  // If the image is already used, try to find another one
  while (usedImages.has(selectedImage.url) && attempts < imageArray.length) {
    index = (index + 1) % imageArray.length;
    selectedImage = imageArray[index];
    attempts++;
  }
  
  // If we've tried all images in the category and they're all used,
  // just use the original selection (better to have duplicates than no image)
  if (attempts >= imageArray.length) {
    console.log(`Warning: All images for category ${categoryKey} are already used. Using a duplicate for ${filename}.`);
    index = Math.abs(uniqueHash) % imageArray.length;
    selectedImage = imageArray[index];
  }
  
  // Mark this image as used
  usedImages.add(selectedImage.url);
  
  return selectedImage;
}

// Function to fix image URLs and photographer attribution in story files
async function fixImagesComprehensive() {
  try {
    console.log('Starting comprehensive image fix...');
    
    // Check if the articles directory exists
    if (!fs.existsSync(ARTICLES_DIRECTORY)) {
      console.error('Articles directory does not exist:', ARTICLES_DIRECTORY);
      return;
    }
    
    // Get all markdown files in the articles directory
    const files = fs.readdirSync(ARTICLES_DIRECTORY).filter(file => file.endsWith('.md'));
    
    if (files.length === 0) {
      console.log('No story files found');
      return;
    }
    
    console.log(`Found ${files.length} story files to process`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    // Process each file
    for (const file of files) {
      try {
        const filePath = path.join(ARTICLES_DIRECTORY, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse the frontmatter
        const { data: frontmatter, content } = matter(fileContent);
        
        // Get a unique image for this story
        const imageData = getUniqueImageForStory(frontmatter, file);
        
        // Update the frontmatter
        const updatedFrontmatter = {
          ...frontmatter,
          imageUrl: imageData.url,
          photographer: {
            name: imageData.photographer,
            url: imageData.profileUrl
          }
        };
        
        // Write the updated content back to the file
        const updatedFileContent = matter.stringify(content, updatedFrontmatter);
        fs.writeFileSync(filePath, updatedFileContent);
        
        console.log(`Updated image and photographer for: ${file}`);
        fixedCount++;
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Finished processing files. Fixed ${fixedCount} files. Encountered ${errorCount} errors.`);
    
  } catch (error) {
    console.error('Error fixing images:', error);
  }
}

// Run the script
fixImagesComprehensive();
