# Setting Up MongoDB Atlas for Global Travel Report

This guide will walk you through setting up MongoDB Atlas to store stories persistently for your Global Travel Report website.

## What is MongoDB Atlas?

MongoDB Atlas is a fully-managed cloud database service that handles all the complexity of deploying, managing, and healing your deployments on the cloud service provider of your choice (AWS, Azure, and GCP). It's perfect for storing complex data like your stories.

## Step 1: Access Your MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and log in to your account
2. If you don't have an account yet, sign up for a free account

## Step 2: Create a New Project (if needed)

1. In the MongoDB Atlas dashboard, click on "Projects" in the top navigation
2. Click "New Project"
3. Name your project "Global Travel Report"
4. Click "Create Project"

## Step 3: Create a New Cluster

1. In your project, click "Build a Database"
2. Choose the "FREE" tier (M0 Sandbox)
3. Select your preferred cloud provider and region (choose a region close to your users)
4. Name your cluster "global-travel-report"
5. Click "Create"

## Step 4: Set Up Database Access

1. In the left sidebar, click on "Database Access" under "Security"
2. Click "Add New Database User"
3. Choose "Password" for authentication method
4. Enter a username (e.g., "global-travel-admin")
5. Enter a secure password or click "Autogenerate Secure Password"
6. Under "Database User Privileges", select "Atlas admin" (for simplicity)
7. Click "Add User"

## Step 5: Set Up Network Access

1. In the left sidebar, click on "Network Access" under "Security"
2. Click "Add IP Address"
3. For development, you can click "Allow Access from Anywhere" (not recommended for production)
4. For production, add the specific IP addresses of your Vercel deployment
5. Click "Confirm"

## Step 6: Get Your Connection String

1. In the left sidebar, click on "Database" under "Deployment"
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Choose "Node.js" as your driver and the latest version
5. Copy the connection string (it will look like `mongodb+srv://username:<password>@global-travel-report.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
6. Replace `<password>` with your database user's password

## Step 7: Add the Connection String to Vercel

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your "global-travel-report" project
3. Click on "Settings" in the left sidebar
4. Click on "Environment Variables"
5. Add a new environment variable:
   - Name: `MONGODB_URI`
   - Value: Your MongoDB connection string (from Step 6)
   - Environment: Production (and optionally Preview and Development)
6. Add another environment variable:
   - Name: `MONGODB_DB`
   - Value: `global-travel-report`
   - Environment: Production (and optionally Preview and Development)
7. Click "Save"

## Step 8: Deploy Your Project

After setting up the MongoDB Atlas database and adding the environment variables to Vercel, you'll need to deploy your project again:

```bash
cd /Users/rodneypattison/Desktop/global-travel-report
vercel --prod
```

## Next Steps

After completing these steps, your MongoDB Atlas database will be ready to use. The code changes we've made will use these environment variables to connect to your MongoDB Atlas database and store stories persistently.

## Troubleshooting

If you encounter any issues during setup:

1. Make sure your database user has the correct permissions
2. Verify that your IP address is allowed in the Network Access settings
3. Check that the connection string is correctly formatted and the password is properly replaced
4. Ensure that the environment variables are correctly set in your Vercel project settings

## Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver Documentation](https://docs.mongodb.com/drivers/node/)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
