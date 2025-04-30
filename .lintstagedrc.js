module.exports = {
  // Run ESLint on JavaScript and TypeScript files
  '**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  
  // Run Prettier on other file types
  '**/*.{json,md,css,scss}': ['prettier --write'],
  
  // Run TypeScript type checking on TypeScript files
  '**/*.{ts,tsx}': () => 'npm run typecheck',
  
  // Run tests related to changed files
  '**/*.{js,jsx,ts,tsx}': files => {
    // Get the list of test files related to the changed files
    const testFiles = files
      .map(file => {
        // Convert file path to potential test file path
        const testFile = file
          .replace(/\.(js|jsx|ts|tsx)$/, '.test.$1')
          .replace(/^(src|lib|components)\//, '__tests__/');
        
        return `jest --findRelatedTests ${file} ${testFile}`;
      })
      .join(' && ');
    
    return testFiles || 'echo "No test files found"';
  },
};
