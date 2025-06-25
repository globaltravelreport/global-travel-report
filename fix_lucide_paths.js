const fs = require('fs');
const path = require('path');

// Map of incorrect paths to correct ones
const iconPathMap = {
  'lucide-react/alerttriangle': 'lucide-react/dist/esm/icons/alert-triangle',
  'lucide-react/refreshcw': 'lucide-react/dist/esm/icons/refresh-cw',
  'lucide-react/home': 'lucide-react/dist/esm/icons/home',
  'lucide-react/filetext': 'lucide-react/dist/esm/icons/file-text',
  'lucide-react/logout': 'lucide-react/dist/esm/icons/log-out',
  'lucide-react/barchart': 'lucide-react/dist/esm/icons/bar-chart',
  'lucide-react/filter': 'lucide-react/dist/esm/icons/filter',
  'lucide-react/checkcircle': 'lucide-react/dist/esm/icons/check-circle',
  'lucide-react/alertcircle': 'lucide-react/dist/esm/icons/alert-circle'
};

// Better approach: use standard barrel imports but with optimization disabled
function fixLucideImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace individual imports back to barrel imports
  content = content.replace(
    /import { ([^}]+) } from 'lucide-react\/[^']+';/g,
    "import { $1 } from 'lucide-react';"
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed imports in: ${filePath}`);
}

// Files to fix
const filesToFix = [
  './components/ErrorBoundary.tsx',
  './components/admin/AdminHeader.tsx', 
  './components/analytics/OverviewStats.tsx',
  './src/components/search/SearchForm.tsx',
  './src/components/ui/Breadcrumb.tsx',
  './src/components/ui/FreshnessIndicator.tsx'
];

filesToFix.forEach(fixLucideImports);

console.log('Lucide import paths fixed!');
