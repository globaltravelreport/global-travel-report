const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  // Ensure data directories exist
  const dataDir = path.join(process.cwd(), 'app/data');
  const imagesDir = path.join(process.cwd(), 'public/images');
  
  ensureDirectoryExists(dataDir);
  ensureDirectoryExists(imagesDir);

  // Ensure articles.json exists
  const articlesPath = path.join(dataDir, 'articles.json');
  if (!fs.existsSync(articlesPath)) {
    fs.writeFileSync(articlesPath, '[]', 'utf8');
  }

  // Log success
  console.log('Prebuild completed successfully');
}

main(); 