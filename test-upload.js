const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testUpload() {
  try {
    // Create a test image
    const testImagePath = path.join(__dirname, 'public', 'uploads', 'test-image.jpg');
    const imageBuffer = Buffer.from('fake image data');
    fs.writeFileSync(testImagePath, imageBuffer);

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath));

    // Send request to upload endpoint
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form
    });

    const result = await response.json();
    console.log('Upload response:', result);

    // Clean up test file
    fs.unlinkSync(testImagePath);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUpload(); 