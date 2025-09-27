const fs = require('fs');

let content = fs.readFileSync('app/api/feed/rss/route.ts', 'utf8');
content = content.replace(/\.replace\(\/'\/g, ''\);/g, ".replace(/'/g, ''');");
fs.writeFileSync('app/api/feed/rss/route.ts', content);
console.log('Fixed RSS syntax error');
