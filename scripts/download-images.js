const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  // Hero images
  'contact-hero.jpg': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop',
  'news-hero.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1920&h=600&fit=crop',
  'deals-hero.jpg': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=600&fit=crop',
  'destinations-hero.jpg': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=600&fit=crop',
  'tips-hero.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1920&h=600&fit=crop',

  // News images
  'news/travel-restrictions.jpg': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=200&fit=crop',
  'news/airline-recovery.jpg': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=300&h=200&fit=crop',
  'news/sustainable-travel.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=300&h=200&fit=crop',
  'news/digital-nomad.jpg': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=200&fit=crop',
  'news/hotel-innovations.jpg': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop',
  'news/travel-insurance.jpg': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&h=200&fit=crop',

  // Deals images
  'deals/summer-vacation.jpg': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop',
  'deals/business-class.jpg': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=200&fit=crop',
  'deals/hotel-loyalty.jpg': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop',
  'deals/family-package.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=300&h=200&fit=crop',
  'deals/last-minute.jpg': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop',
  'deals/group-travel.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=300&h=200&fit=crop',

  // Destinations images
  'destinations/paris.jpg': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=200&fit=crop',
  'destinations/tokyo.jpg': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=300&h=200&fit=crop',
  'destinations/new-york.jpg': 'https://images.unsplash.com/photo-1546436836-07a91091f160?w=300&h=200&fit=crop',
  'destinations/sydney.jpg': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300&h=200&fit=crop',
  'destinations/cape-town.jpg': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=300&h=200&fit=crop',
  'destinations/rio.jpg': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&h=200&fit=crop',

  // Tips images
  'tips/packing.jpg': 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=300&h=200&fit=crop',
  'tips/budget.jpg': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&h=200&fit=crop',
  'tips/security.jpg': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=300&h=200&fit=crop',
  'tips/photography.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=300&h=200&fit=crop',
  'tips/health.jpg': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=200&fit=crop',
  'tips/family.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=300&h=200&fit=crop',
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(fs.createWriteStream(filepath))
          .on('error', reject)
          .once('close', () => resolve(filepath));
      } else {
        response.resume();
        reject(new Error(`Request Failed With a Status Code: ${response.statusCode}`));
      }
    });
  });
}

async function downloadAllImages() {
  const baseDir = path.join(__dirname, '../public/images');
  
  // Create directories if they don't exist
  const dirs = ['news', 'deals', 'destinations', 'tips'];
  dirs.forEach(dir => {
    const dirPath = path.join(baseDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Download all images
  for (const [filename, url] of Object.entries(images)) {
    const filepath = path.join(baseDir, filename);
    try {
      console.log(`Downloading ${filename}...`);
      await downloadImage(url, filepath);
      console.log(`Downloaded ${filename}`);
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
    }
  }
}

downloadAllImages(); 