const fs = require('fs');
const path = require('path');

// List of files that need fixing based on build errors
const filesToFix = [
  './components/ErrorBoundary.tsx',
  './components/admin/AdminHeader.tsx', 
  './components/analytics/OverviewStats.tsx',
  './src/components/search/SearchForm.tsx',
  './src/components/ui/Breadcrumb.tsx',
  './src/components/ui/FreshnessIndicator.tsx'
];

// Function to fix lucide imports in a file
function fixLucideImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace barrel imports with individual imports
  content = content.replace(
    /import\s*{\s*([^}]+)\s*}\s*from\s*['"]lucide-react['"];?/g,
    (match, icons) => {
      const iconList = icons.split(',').map(icon => icon.trim());
      return iconList.map(icon => `import { ${icon} } from 'lucide-react/${icon.toLowerCase()}';`).join('\n');
    }
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed imports in: ${filePath}`);
}

// Fix all files
filesToFix.forEach(fixLucideImports);

console.log('Lucide import fixes completed!');
