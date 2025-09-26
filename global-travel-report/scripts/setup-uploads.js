const fs = require('fs');
const path = require('path');

const uploadDir = path.join(process.cwd(), 'public/uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}

// Set permissions (read/write for owner, read for group and others)
try {
  fs.chmodSync(uploadDir, 0o755);
  console.log('Set permissions for uploads directory');
} catch (error) {
  console.error('Error setting permissions:', error);
}

console.log('Uploads directory setup complete'); 