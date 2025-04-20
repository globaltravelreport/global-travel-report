const fs = require('fs');
const path = require('path');

function main() {
  const sourceDir = path.join(process.cwd(), 'app/data');
  const targetDir = path.join(process.cwd(), '.next/static/data');

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy articles.json
  const sourcePath = path.join(sourceDir, 'articles.json');
  const targetPath = path.join(targetDir, 'articles.json');

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log('Articles copied successfully to build directory');
  } else {
    console.log('No articles.json found to copy');
  }
}

main(); 