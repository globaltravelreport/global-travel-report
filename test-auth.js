const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const BASE_URL = 'http://localhost:3000';
const USERNAME = 'nuch';
const PASSWORD = process.env.NUCH_PASSWORD || 'Nuch07!';

// Sample travel article for testing
const sampleContent = `Travel benefits include exposure to new cultures, stress relief, and personal growth. 
Traveling allows you to experience different ways of life, try new foods, and meet people from diverse backgrounds. 
It can help you develop a broader perspective on the world and improve your problem-solving skills. 
Many people find that travel helps them grow as individuals and become more adaptable to change.
The experience of navigating new places and situations builds confidence and resilience.`;

async function testAuth() {
  try {
    // Create a cookie jar and axios instance that supports cookies
    const jar = new CookieJar();
    const client = wrapper(axios.create({ 
      jar,
      baseURL: BASE_URL,
      validateStatus: status => status < 500 // Don't throw on 401
    }));

    console.log('Testing unauthenticated access...');
    const unauthResponse = await client.get('/nuch', {
      auth: undefined // Remove auth for this test
    });
    if (unauthResponse.status === 401) {
      console.log('✅ Unauthenticated access blocked correctly');
    } else {
      console.log('❌ Error: Unauthenticated access should be blocked');
    }

    console.log('\nTesting wrong credentials...');
    const wrongAuthResponse = await client.get('/nuch', {
      auth: {
        username: 'wrong',
        password: 'wrong'
      }
    });
    if (wrongAuthResponse.status === 401) {
      console.log('✅ Wrong credentials rejected correctly');
    } else {
      console.log('❌ Error: Wrong credentials should be rejected');
    }

    // Set up client with correct auth for remaining tests
    const authedClient = wrapper(axios.create({ 
      jar,
      baseURL: BASE_URL,
      auth: {
        username: USERNAME,
        password: PASSWORD
      }
    }));

    console.log('\nTesting correct authentication...');
    const protectedResponse = await authedClient.get('/nuch');
    if (protectedResponse.status === 200) {
      console.log('✅ Protected content accessed successfully');
    } else {
      console.log('❌ Protected content access failed:', protectedResponse.status);
    }

    console.log('\nTesting rewrite endpoint with content...');
    const contentResponse = await authedClient.post('/api/rewrite', {
      content: sampleContent
    });
    
    if (contentResponse.status === 200 && 
        contentResponse.data?.title && 
        contentResponse.data?.summary && 
        contentResponse.data?.content && 
        contentResponse.data?.keywords) {
      console.log('✅ Rewrite endpoint working correctly with content');
      console.log('Response structure:', Object.keys(contentResponse.data).join(', '));
    } else {
      console.log('❌ Rewrite endpoint failed or returned invalid structure');
      console.log('Status:', contentResponse.status);
      console.log('Data:', contentResponse.data);
    }

  } catch (err) {
    console.error('Test failed:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
  }
}

testAuth(); 