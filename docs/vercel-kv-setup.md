# Setting Up Vercel KV for Global Travel Report

This guide will walk you through setting up Vercel KV to store stories persistently for your Global Travel Report website.

## What is Vercel KV?

Vercel KV is a Redis-compatible key-value database that's fully managed by Vercel. It's perfect for storing data that needs to be accessed quickly, like stories for your website.

## Step 1: Create a Vercel KV Database

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your "global-travel-report" project
3. Click on "Storage" in the left sidebar
4. Click on "Connect Database"
5. Select "KV Database"
6. Click "Create" to create a new KV database
7. Name your database "global-travel-report-stories"
8. Select the "Free" plan (includes 100MB storage, 10M monthly operations)
9. Click "Create" to create the database

## Step 2: Get the Connection Details

After creating the database, you'll be provided with connection details. These will be automatically added to your project's environment variables:

- `KV_URL`: The URL to connect to your KV database
- `KV_REST_API_URL`: The REST API URL for your KV database
- `KV_REST_API_TOKEN`: The authentication token for your KV database
- `KV_REST_API_READ_ONLY_TOKEN`: A read-only token for your KV database

These environment variables will be automatically available to your application.

## Step 3: Deploy Your Project

After setting up the KV database, you'll need to deploy your project again to make the environment variables available to your application:

```bash
cd /Users/rodneypattison/Desktop/global-travel-report
vercel --prod
```

## Next Steps

After completing these steps, your Vercel KV database will be ready to use. The code changes we're making will use these environment variables to connect to your KV database and store stories persistently.

## Troubleshooting

If you encounter any issues during setup:

1. Make sure you're logged in to the correct Vercel account
2. Check that your project is linked to the correct Vercel project
3. Verify that the environment variables are correctly set in your Vercel project settings

## Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Vercel KV Pricing](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing)
