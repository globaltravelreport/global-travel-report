/**
 * Script to consolidate components from different directories
 * 
 * This script:
 * 1. Identifies duplicate components between /components and /src/components
 * 2. Moves all components to a unified structure in /src/components
 * 3. Creates appropriate imports and exports
 * 4. Updates import paths in other files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = process.cwd();
const oldComponentsDir = path.join(rootDir, 'components');
const newComponentsDir = path.join(rootDir, 'src', 'components');
const backupDir = path.join(rootDir, 'backup', 'components');

// Create backup directory
if (!fs.existsSync(path.join(rootDir, 'backup'))) {
  fs.mkdirSync(path.join(rootDir, 'backup'));
}

// Backup old components
console.log('Backing up components...');
if (fs.existsSync(backupDir)) {
  fs.rmSync(backupDir, { recursive: true, force: true });
}
fs.cpSync(oldComponentsDir, backupDir, { recursive: true });

// Get all component files
const getComponentFiles = (dir) => {
  const results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results.push(...getComponentFiles(filePath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  
  return results;
};

// Get component name from file path
const getComponentName = (filePath) => {
  const fileName = path.basename(filePath);
  return fileName.replace(/\.(tsx|ts)$/, '');
};

// Get relative directory from components root
const getRelativeDir = (filePath, baseDir) => {
  const relativePath = path.relative(baseDir, path.dirname(filePath));
  return relativePath === '' ? '.' : relativePath;
};

// Process components
console.log('Processing components...');
const oldComponents = getComponentFiles(oldComponentsDir);
const newComponents = getComponentFiles(newComponentsDir);

// Map of component names to their locations
const componentMap = {};

// First, catalog all components
oldComponents.forEach(filePath => {
  const name = getComponentName(filePath);
  const relativeDir = getRelativeDir(filePath, oldComponentsDir);
  
  if (!componentMap[name]) {
    componentMap[name] = [];
  }
  
  componentMap[name].push({
    name,
    filePath,
    relativeDir,
    isOld: true
  });
});

newComponents.forEach(filePath => {
  const name = getComponentName(filePath);
  const relativeDir = getRelativeDir(filePath, newComponentsDir);
  
  if (!componentMap[name]) {
    componentMap[name] = [];
  }
  
  componentMap[name].push({
    name,
    filePath,
    relativeDir,
    isOld: false
  });
});

// Process each component
Object.keys(componentMap).forEach(name => {
  const components = componentMap[name];
  
  if (components.length > 1) {
    console.log(`Found duplicate component: ${name}`);
    
    // Prefer the src/components version
    const srcComponent = components.find(c => !c.isOld);
    if (srcComponent) {
      console.log(`  Using src/components version: ${srcComponent.filePath}`);
    } else {
      console.log(`  No src/components version found, using components version`);
      
      // Copy the old component to the new location
      const oldComponent = components[0];
      const newPath = path.join(newComponentsDir, oldComponent.relativeDir, `${name}.tsx`);
      
      // Create directory if it doesn't exist
      const newDir = path.dirname(newPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      
      // Copy the file
      fs.copyFileSync(oldComponent.filePath, newPath);
      console.log(`  Copied to: ${newPath}`);
    }
  } else if (components[0].isOld) {
    // Single component in old directory, move to new directory
    const component = components[0];
    const newPath = path.join(newComponentsDir, component.relativeDir, `${name}.tsx`);
    
    // Create directory if it doesn't exist
    const newDir = path.dirname(newPath);
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFileSync(component.filePath, newPath);
    console.log(`Moved component: ${component.filePath} -> ${newPath}`);
  }
});

// Update import paths in all files
console.log('Updating import paths...');
const updateImportPaths = () => {
  try {
    // Find all TypeScript and JavaScript files
    const files = execSync('find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v "node_modules" | grep -v ".next"')
      .toString()
      .split('\n')
      .filter(Boolean);
    
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      let updated = false;
      
      // Replace imports from /components to /src/components
      const oldImportRegex = /@\/components\/(.*)/g;
      if (oldImportRegex.test(content)) {
        content = content.replace(oldImportRegex, '@/src/components/$1');
        updated = true;
      }
      
      if (updated) {
        fs.writeFileSync(file, content);
        console.log(`Updated imports in: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error updating import paths:', error);
  }
};

updateImportPaths();

console.log('Component consolidation complete!');
console.log('Note: You should manually review the changes and fix any remaining import issues.');
