/**
 * Script to directly fix image URLs in story files
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Direct mapping between photographers and their images
const PHOTOGRAPHER_IMAGES = {
  'Jakob Owens': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400',
  'Asoggetti': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&q=80&w=2400',
  'Jaromir Kavan': 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&q=80&w=2400',
  'Dino Reichmuth': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&q=80&w=2400',
  'Sylvain Mauroux': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&q=80&w=2400',
  'Alonso Reyes': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400',
  'Josiah Farrow': 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&q=80&w=2400',
  'Vidar Nordli-Mathisen': 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&q=80&w=2400',
  'Flo Maderebner': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&q=80&w=2400',
  'Anthony Tran': 'https://images.unsplash.com/photo-1493707553966-283afac8c358?auto=format&q=80&w=2400',
  'Jingda Chen': 'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5?auto=format&q=80&w=2400',
  'Esteban Castle': 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&q=80&w=2400',
  'Jezael Melgoza': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&q=80&w=2400',
  'Brooke Lark': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&q=80&w=2400',
  'Kelsey Knight': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&q=80&w=2400',
  'Simon Migaj': 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&q=80&w=2400',
  'Sime Basioli': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&q=80&w=2400',
  'Braden Jarvis': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&q=80&w=2400',
  'Arto Marttinen': 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&q=80&w=2400',
  'Emile Guillemot': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&q=80&w=2400',
  'Thomas Tucker': 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&q=80&w=2400',
  'Davide Cantelli': 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&q=80&w=2400',
  'Raimond Klavins': 'https://images.unsplash.com/photo-1551913902-c92207136625?auto=format&q=80&w=2400',
  'Heidi Kaden': 'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&q=80&w=2400',
  'Shifaaz Shamoon': 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?auto=format&q=80&w=2400',
  'Dario Bronnimann': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&q=80&w=2400'
};

// Function to fix image URLs in story files
async function fixImageUrls() {
  try {
    console.log('Starting to fix image URLs in story files...');
    
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
        
        // Check if the photographer name exists and has a corresponding image URL
        if (frontmatter.photographer && frontmatter.photographer.name) {
          const photographerName = frontmatter.photographer.name;
          const correctImageUrl = PHOTOGRAPHER_IMAGES[photographerName];
          
          // If we have a correct image URL for this photographer, update the frontmatter
          if (correctImageUrl && frontmatter.imageUrl !== correctImageUrl) {
            console.log(`Updating image URL for ${file} to match photographer ${photographerName}`);
            console.log(`Old URL: ${frontmatter.imageUrl}`);
            console.log(`New URL: ${correctImageUrl}`);
            
            // Update the frontmatter
            frontmatter.imageUrl = correctImageUrl;
            
            // Write the updated content back to the file
            const updatedFileContent = matter.stringify(content, frontmatter);
            fs.writeFileSync(filePath, updatedFileContent);
            
            fixedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Finished processing files. Fixed ${fixedCount} files. Encountered ${errorCount} errors.`);
    
  } catch (error) {
    console.error('Error fixing image URLs:', error);
  }
}

// Run the script
fixImageUrls();
