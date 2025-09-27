# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automating tasks in the Global Travel Report repository.

## Daily Story Generation

The `daily-stories.yml` workflow automatically generates new stories every day at 2 PM Sydney time (04:00 UTC). It:

1. Runs the daily story generator script
2. Commits and pushes the new stories to the repository
3. Revalidates the website to make the new stories visible

### Required Secrets

To use this workflow, you need to set up the following secrets in your GitHub repository:

1. `OPENAI_API_KEY`: Your OpenAI API key for generating story content
2. `UNSPLASH_ACCESS_KEY`: Your Unsplash API key for fetching images
3. `CRON_SECRET_KEY`: The secret key used for revalidating the website

### Setting Up Secrets

1. Go to your GitHub repository
2. Click on "Settings"
3. Click on "Secrets and variables" in the left sidebar
4. Click on "Actions"
5. Click on "New repository secret"
6. Add each of the required secrets with their respective values

### Testing the Workflow

You can manually trigger the workflow to test it:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Daily Story Generation" workflow
3. Click on "Run workflow"
4. Click on "Run workflow" in the dropdown

Alternatively, you can test it locally using the `test-github-action.sh` script:

```bash
# Make the script executable
chmod +x scripts/test-github-action.sh

# Set the required environment variables
export OPENAI_API_KEY="your-openai-api-key"
export UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
export CRON_SECRET_KEY="your-cron-secret-key"

# Run the test script
./scripts/test-github-action.sh
```

### Workflow Schedule

The workflow is scheduled to run at 2 PM Sydney time (04:00 UTC) every day. If you need to change this schedule, edit the `cron` expression in the `daily-stories.yml` file.

For example, to run at 3 PM Sydney time (05:00 UTC), change the cron expression to:

```yaml
cron: '0 5 * * *'
```

The cron expression format is:
```
minute hour day-of-month month day-of-week
```

### Logs

The workflow generates logs that are uploaded as artifacts. You can view these logs by:

1. Go to the "Actions" tab in your GitHub repository
2. Click on a completed workflow run
3. Scroll down to the "Artifacts" section
4. Click on "daily-story-logs" to download the logs
