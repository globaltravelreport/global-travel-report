# MailerLite Newsletter Integration Setup

This document provides step-by-step instructions for setting up the MailerLite newsletter integration in the Global Travel Report application.

## Overview

The application uses MailerLite's API to manage newsletter subscriptions. The integration includes:

- Secure API key authentication
- Rate limiting to prevent abuse
- Honeypot protection against bots
- Input validation and sanitization
- Error handling and user feedback
- Support for custom fields (first name, last name, frequency preferences)

## Prerequisites

1. A MailerLite account (free or paid)
2. Access to your MailerLite dashboard
3. Basic understanding of environment variables

## Step 1: Get Your MailerLite API Key

1. Log in to your MailerLite account
2. Navigate to **Integrations** → **API**
3. Click **Generate new token**
4. Give your token a descriptive name (e.g., "Global Travel Report Website")
5. Copy the generated API key (it starts with `eyJ...`)

⚠️ **Important**: Store this API key securely. It provides full access to your MailerLite account.

## Step 2: Configure Environment Variables

Add the following variables to your `.env.local` file:

```env
# MailerLite Configuration
MAILERLITE_API_KEY=your_api_key_here
MAILERLITE_API_URL=https://connect.mailerlite.com/api
# MAILERLITE_DEFAULT_GROUP_ID=your_group_id_here  # Optional
```

### Required Variables

- **MAILERLITE_API_KEY**: Your MailerLite API key from Step 1
- **MAILERLITE_API_URL**: The MailerLite API base URL (should remain as shown)

### Optional Variables

- **MAILERLITE_DEFAULT_GROUP_ID**: If you want to add subscribers to a specific group, provide the group ID here

## Step 3: Find Your Group ID (Optional)

If you want to add subscribers to a specific group:

1. Go to **Subscribers** → **Groups** in your MailerLite dashboard
2. Click on the group you want to use
3. Look at the URL in your browser - the group ID is the number at the end
4. Add this ID to your environment variables

Example: If the URL is `https://dashboard.mailerlite.com/groups/123456`, your group ID is `123456`.

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your website's newsletter signup form

3. Fill out the form with a test email address

4. Check your MailerLite dashboard to confirm the subscriber was added

## API Endpoint Details

The newsletter API endpoint is located at `/api/newsletter` and accepts POST requests with the following JSON body:

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "frequency": "weekly",
  "honeypot": ""
}
```

### Request Fields

- **email** (required): Valid email address
- **firstName** (required): Subscriber's first name
- **lastName** (required): Subscriber's last name
- **frequency** (optional): Newsletter frequency (`daily`, `weekly`, `monthly`)
- **honeypot** (required): Must be empty (bot protection)

### Response Format

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully subscribed to our weekly newsletter! Please check your email for a confirmation link.",
    "data": {
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "frequency": "weekly",
      "subscriberId": "158170318983136536"
    }
  }
}
```

**Error Response (400/409/500):**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Security Features

The integration includes several security measures:

1. **Rate Limiting**: Maximum 5 requests per minute per IP address
2. **Input Validation**: All fields are validated using Zod schemas
3. **Input Sanitization**: HTML tags and special characters are removed
4. **Honeypot Protection**: Hidden field to detect bot submissions
5. **CSRF Protection**: Validates CSRF tokens for form submissions
6. **API Key Security**: API key is stored securely in environment variables

## Error Handling

The system handles various error scenarios:

- **Invalid email format**: Returns validation error
- **Missing required fields**: Returns validation error
- **Duplicate email**: Returns 409 status with appropriate message
- **MailerLite API errors**: Logs error details and returns generic user message
- **Rate limit exceeded**: Returns 429 status with retry message

## Troubleshooting

### Common Issues

1. **"MailerLite API key is not configured"**
   - Check that `MAILERLITE_API_KEY` is set in your `.env.local` file
   - Ensure the API key is valid and not expired

2. **"CSRF token is missing"**
   - This is normal for direct API testing
   - Use the website form for proper CSRF token handling

3. **"Too many requests"**
   - Rate limiting is active
   - Wait 1 minute before trying again

4. **Subscriber not appearing in MailerLite**
   - Check the API response for error messages
   - Verify your API key has the correct permissions
   - Check if the email already exists in your account

### Debug Mode

To enable debug logging, add this to your environment:

```env
NODE_ENV=development
```

This will log detailed information about API requests and responses.

## Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Ensure CSRF protection is enabled (`validateCsrf: true`)
3. Monitor API usage in your MailerLite dashboard
4. Set up proper error monitoring and logging

## Support

For issues related to:

- **MailerLite API**: Check [MailerLite API Documentation](https://developers.mailerlite.com/)
- **Application Integration**: Create an issue in the project repository
- **MailerLite Account**: Contact MailerLite support

## Migration from Listmonk

If you're migrating from a previous Listmonk integration:

1. Export your subscribers from Listmonk
2. Import them into MailerLite
3. Update your environment variables as described above
4. Test the integration thoroughly
5. Remove old Listmonk environment variables

The API interface remains the same, so your frontend forms should continue working without changes.
