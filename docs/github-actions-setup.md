# Setting Up GitHub Actions for Daily Story Generation

This guide explains how to set up GitHub Actions to automatically generate daily stories for the Global Travel Report website.

## Overview

The GitHub Actions workflow will:

1. Run daily at 2 PM Sydney time (04:00 UTC)
2. Generate 8 new stories (including 2 about cruises)
3. Commit and push the new stories to the repository
4. Revalidate the website to make the new stories visible

## Required Secrets

You need to add the following secrets to your GitHub repository:

1. `OPENAI_API_KEY`: Your OpenAI API key for generating story content
2. `UNSPLASH_ACCESS_KEY`: Your Unsplash API key for fetching images
3. `CRON_SECRET_KEY`: The secret key used for revalidating your website

## How to Add Secrets to Your GitHub Repository

1. Go to your GitHub repository at https://github.com/globaltravelreport/global-travel-report
2. Click on "Settings" in the top navigation bar
3. In the left sidebar, click on "Secrets and variables" and then "Actions"
4. Click on "New repository secret"
5. Add each of the required secrets:

   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
   - Click "Add secret"

   Repeat for `UNSPLASH_ACCESS_KEY` and `CRON_SECRET_KEY` with their respective values.

## Testing the Workflow

To test the workflow without waiting for the scheduled time:

1. Go to your GitHub repository
2. Click on "Actions" in the top navigation bar
3. Select the "Daily Story Generation" workflow from the left sidebar
4. Click on "Run workflow" on the right side
5. Click the green "Run workflow" button in the dropdown

This will manually trigger the workflow, allowing you to verify that it works correctly.

## Monitoring the Workflow

You can monitor the workflow runs:

1. Go to your GitHub repository
2. Click on "Actions" in the top navigation bar
3. Click on the "Daily Story Generation" workflow
4. Click on any workflow run to see its details
5. You can download the logs as artifacts to see the detailed output

## Troubleshooting

If the workflow fails, check the following:

1. Verify that all secrets are correctly set up
2. Check the workflow logs for any error messages
3. Ensure your API keys are valid and have sufficient quota
4. Make sure the revalidation endpoint is working correctly

## Benefits of Using GitHub Actions

- Runs automatically without requiring your laptop to be on
- Free for public repositories and has generous free tier for private repositories
- Integrated with your GitHub repository
- Provides detailed logs and notifications
- Can be manually triggered for testing

## Next Steps

After setting up the GitHub Actions workflow, you should:

1. Monitor the first few runs to ensure everything works correctly
2. Check that new stories appear on your website
3. Verify that the stories have proper formatting, unique images, and correct dates
