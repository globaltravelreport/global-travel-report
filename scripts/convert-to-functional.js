/**
 * Script to convert class components to functional components
 * 
 * This script:
 * 1. Finds all React class components in the codebase
 * 2. Converts them to functional components using hooks
 * 3. Updates imports and exports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = process.cwd();
const backupDir = path.join(rootDir, 'backup', 'class-components');

// Create backup directory
if (!fs.existsSync(path.join(rootDir, 'backup'))) {
  fs.mkdirSync(path.join(rootDir, 'backup'));
}
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Find all TypeScript and JavaScript files
const findComponentFiles = () => {
  try {
    const output = execSync(
      'find . -type f -name "*.tsx" -o -name "*.jsx" | grep -v "node_modules" | grep -v ".next"',
      { encoding: 'utf8' }
    );
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding component files:', error);
    return [];
  }
};

// Check if a file contains a class component
const containsClassComponent = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for class component patterns
    const classComponentPatterns = [
      /class\s+\w+\s+extends\s+React\.Component/,
      /class\s+\w+\s+extends\s+Component/,
      /class\s+\w+\s+extends\s+PureComponent/,
    ];
    
    return classComponentPatterns.some(pattern => pattern.test(content));
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error);
    return false;
  }
};

// Extract component name from a file
const extractComponentName = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/class\s+(\w+)\s+extends/);
    return matches ? matches[1] : path.basename(filePath, path.extname(filePath));
  } catch (error) {
    console.error(`Error extracting component name from ${filePath}:`, error);
    return path.basename(filePath, path.extname(filePath));
  }
};

// Convert a class component to a functional component
const convertToFunctional = (filePath) => {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Backup the original file
    const relativePath = path.relative(rootDir, filePath);
    const backupPath = path.join(backupDir, relativePath);
    const backupDirPath = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }
    
    fs.writeFileSync(backupPath, content);
    
    // Extract component name
    const componentName = extractComponentName(filePath);
    
    console.log(`Converting ${componentName} in ${filePath} to a functional component...`);
    
    // This is a simplified conversion that won't work for all cases
    // A real implementation would need to parse the AST and handle many edge cases
    
    // Replace class declaration with function declaration
    let newContent = content.replace(
      /class\s+(\w+)\s+extends\s+(React\.Component|Component|PureComponent)(\s*<.*?>)?\s*{/g,
      (match, name, componentType, typeParams) => {
        return `const ${name} = (props) => {`;
      }
    );
    
    // Replace this.props with props
    newContent = newContent.replace(/this\.props/g, 'props');
    
    // Replace this.state with useState hooks
    // This is a very simplified approach and won't work for complex state
    const stateMatches = content.match(/this\.state\s*=\s*({[^}]+})/);
    if (stateMatches) {
      const stateObject = stateMatches[1];
      
      // Extract state properties
      const stateProps = stateObject
        .replace(/[{}]/g, '')
        .split(',')
        .map(prop => prop.trim())
        .filter(Boolean)
        .map(prop => {
          const [key, value] = prop.split(':').map(p => p.trim());
          return { key, value: value || 'null' };
        });
      
      // Add useState imports if needed
      if (!newContent.includes('useState')) {
        newContent = newContent.replace(
          /import React(.*?)from 'react';/,
          "import React, { useState$1from 'react';"
        );
      }
      
      // Add useState hooks
      const useStateHooks = stateProps
        .map(({ key, value }) => `const [${key}, set${key.charAt(0).toUpperCase() + key.slice(1)}] = useState(${value});`)
        .join('\n  ');
      
      newContent = newContent.replace(
        /const \w+ = \(props\) => {/,
        `$&\n  ${useStateHooks}`
      );
      
      // Replace this.setState calls
      stateProps.forEach(({ key }) => {
        const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
        newContent = newContent.replace(
          new RegExp(`this\\.setState\\(\\{\\s*${key}\\s*:\\s*([^}]+)\\s*\\}\\)`, 'g'),
          `${setterName}($1)`
        );
      });
    }
    
    // Replace lifecycle methods with useEffect
    // This is a very simplified approach and won't work for all lifecycle methods
    if (content.includes('componentDidMount') || content.includes('componentDidUpdate') || content.includes('componentWillUnmount')) {
      // Add useEffect import if needed
      if (!newContent.includes('useEffect')) {
        newContent = newContent.replace(
          /import React(.*?)from 'react';/,
          (match, group) => {
            if (group.includes('useState')) {
              return match.replace('useState', 'useState, useEffect');
            }
            return "import React, { useEffect$1from 'react';";
          }
        );
      }
      
      // Replace componentDidMount
      if (content.includes('componentDidMount')) {
        const didMountMatch = content.match(/componentDidMount\(\)\s*{([^}]+)}/);
        if (didMountMatch) {
          const didMountBody = didMountMatch[1];
          newContent = newContent.replace(
            /const \w+ = \(props\) => {/,
            `$&\n  useEffect(() => {${didMountBody}  }, []);`
          );
        }
      }
      
      // Replace componentWillUnmount
      if (content.includes('componentWillUnmount')) {
        const willUnmountMatch = content.match(/componentWillUnmount\(\)\s*{([^}]+)}/);
        if (willUnmountMatch) {
          const willUnmountBody = willUnmountMatch[1];
          newContent = newContent.replace(
            /const \w+ = \(props\) => {/,
            `$&\n  useEffect(() => {\n    return () => {${willUnmountBody}    };\n  }, []);`
          );
        }
      }
    }
    
    // Replace render method
    newContent = newContent.replace(
      /render\(\)\s*{([^}]+)return\s+([^;]+);?\s*}/,
      'return $2;'
    );
    
    // Replace class methods with functions
    // This is a very simplified approach and won't work for all methods
    const methodMatches = content.match(/(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{([^}]+)}/g);
    if (methodMatches) {
      methodMatches.forEach(methodMatch => {
        const methodNameMatch = methodMatch.match(/(\w+)\s*=/);
        if (methodNameMatch) {
          const methodName = methodNameMatch[1];
          
          // Extract method body and parameters
          const methodBodyMatch = methodMatch.match(/=\s*\(([^)]*)\)\s*=>\s*{([^}]+)}/);
          if (methodBodyMatch) {
            const params = methodBodyMatch[1];
            const body = methodBodyMatch[2];
            
            // Add the function before the return statement
            newContent = newContent.replace(
              /return/,
              `const ${methodName} = (${params}) => {${body}};\n\n  return`
            );
            
            // Replace this.methodName with methodName
            newContent = newContent.replace(new RegExp(`this\\.${methodName}`, 'g'), methodName);
          }
        }
      });
    }
    
    // Replace class closing brace with function closing brace
    newContent = newContent.replace(/}(\s*export default \w+;?)$/, ');$1');
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, newContent);
    
    console.log(`Successfully converted ${componentName} to a functional component.`);
    
    return true;
  } catch (error) {
    console.error(`Error converting ${filePath} to a functional component:`, error);
    return false;
  }
};

// Main function
const main = () => {
  console.log('Finding class components...');
  
  const allFiles = findComponentFiles();
  const classComponentFiles = allFiles.filter(containsClassComponent);
  
  console.log(`Found ${classComponentFiles.length} class components.`);
  
  if (classComponentFiles.length === 0) {
    console.log('No class components to convert.');
    return;
  }
  
  console.log('Converting class components to functional components...');
  
  let successCount = 0;
  let failureCount = 0;
  
  classComponentFiles.forEach(filePath => {
    const success = convertToFunctional(filePath);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  });
  
  console.log(`Conversion complete. ${successCount} components converted successfully, ${failureCount} failed.`);
  console.log(`Original files backed up to ${backupDir}.`);
  console.log('Please review the converted files and make any necessary adjustments.');
};

// Run the script
main();
