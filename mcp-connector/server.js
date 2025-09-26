const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_BASE_URL = 'https://api.brevo.com/v3';

// SSE endpoint for MCP
app.get('/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send a welcome message
  res.write('data: {"type": "connected", "message": "MCP connector ready"}\n\n');

  // Handle incoming messages (for simplicity, just echo)
  req.on('data', (chunk) => {
    const message = chunk.toString();
    console.log('Received:', message);
    // Process commands here if needed
  });

  req.on('close', () => {
    console.log('Connection closed');
  });
});

// Add contact
app.post('/addContact', async (req, res) => {
  const { email, name } = req.body;
  try {
    const response = await axios.post(`${BREVO_BASE_URL}/contacts`, {
      email,
      attributes: { NAME: name },
    }, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List contacts
app.get('/listContacts', async (req, res) => {
  try {
    const response = await axios.get(`${BREVO_BASE_URL}/contacts`, {
      headers: {
        'api-key': BREVO_API_KEY,
      },
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`MCP connector running on port ${port}`);
});