const fs = require('fs');

// Fix the heading content issue in alert.tsx
function fixAlertHeading() {
  const filePath = './components/ui/alert.tsx';
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find and fix empty heading tags
  content = content.replace(
    /<AlertTitle\s*ref={ref}\s*className={cn\([^}]+\)}\s*{\.\.\.props}\s*\/>/g,
    '<AlertTitle ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props}>{children || "Alert"}</AlertTitle>'
  );
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed heading content in alert.tsx');
}

// Fix the non-interactive element interaction in AccessibilityMenu.tsx
function fixAccessibilityMenu() {
  const filePath = './src/components/ui/AccessibilityMenu.tsx';
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace div with button for interactive elements
  content = content.replace(
    /<div\s+className="accessibility-option"\s+onClick={[^}]+}>/g,
    '<button className="accessibility-option w-full text-left" onClick={resetSettings}>'
  );
  
  content = content.replace(
    /<\/div>(\s*<\/div>\s*<\/div>)$/m,
    '</button>$1'
  );
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed non-interactive element in AccessibilityMenu.tsx');
}

// Run all fixes
fixAlertHeading();
fixAccessibilityMenu();

console.log('Accessibility fixes completed!');
