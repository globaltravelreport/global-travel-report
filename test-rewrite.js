const axios = require('axios');

async function testRewrite() {
  try {
    // Create an axios instance that includes credentials
    const client = axios.create({
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // First, authenticate
    const authResponse = await client.post('http://localhost:3000/api/auth', {
      username: 'Admin',
      password: 'Nuch07!'
    });

    console.log('Authentication successful');

    // Get the auth cookie
    const cookies = authResponse.headers['set-cookie'];
    if (!cookies) {
      throw new Error('No authentication cookie received');
    }

    // Make the rewrite request with the auth cookie
    const response = await client.post('http://localhost:3000/api/rewrite', {
      url: 'https://www.globaltravelreport.com/nuch'
    }, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });

    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRewrite(); 