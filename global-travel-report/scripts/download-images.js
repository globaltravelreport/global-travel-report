const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  // Hero images
  'contact-hero.jpg': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&q=80&w=2400',
  'news-hero.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&q=80&w=2400',
  'deals-hero.jpg': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&q=80&w=2400',
  'destinations-hero.jpg': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&q=80&w=2400',
  'tips-hero.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&q=80&w=2400',

  // News images
  'news/travel-restrictions.jpg': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&q=80&w=2400',
  'news/airline-recovery.jpg': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&q=80&w=2400',
  'news/sustainable-travel.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&q=80&w=2400',
  'news/digital-nomad.jpg': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&q=80&w=2400',
  'news/hotel-innovations.jpg': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&q=80&w=2400',
  'news/travel-insurance.jpg': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&q=80&w=2400',

  // Deals images
  'deals/summer-vacation.jpg': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=2400',
  'deals/business-class.jpg': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=2400',
  'deals/hotel-loyalty.jpg': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&q=80&w=2400',
  'deals/family-package.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&q=80&w=2400',
  'deals/last-minute.jpg': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=2400',
  'deals/group-travel.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&q=80&w=2400',

  // Destinations images
  'destinations/paris.jpg': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&q=80&w=2400',
  'destinations/tokyo.jpg': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&q=80&w=2400',
  'destinations/new-york.jpg': 'https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&q=80&w=2400',
  'destinations/sydney.jpg': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&q=80&w=2400',
  'destinations/cape-town.jpg': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&q=80&w=2400',
  'destinations/rio.jpg': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&q=80&w=2400',

  // Tips images
  'tips/packing.jpg': 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&q=80&w=2400',
  'tips/budget.jpg': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&q=80&w=2400',
  'tips/security.jpg': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&q=80&w=2400',
  'tips/photography.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&q=80&w=2400',
  'tips/health.jpg': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&q=80&w=2400',
  'tips/family.jpg': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&q=80&w=2400',
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