# Instructions to Update OpenAI API Key in GitHub Repository Secrets

The daily story generation workflow is failing because the OpenAI API key is invalid. Follow these steps to update the API key:

1. Go to the [OpenAI API Keys page](https://platform.openai.com/api-keys) and create a new API key if you don't have a valid one.

2. Go to the GitHub repository settings:
   - Navigate to https://github.com/globaltravelreport/global-travel-report/settings/secrets/actions

3. Find the `OPENAI_API_KEY` secret and click on "Update"

4. Paste your valid OpenAI API key and click "Update secret"

5. After updating the secret, trigger the workflow again:
   - Go to https://github.com/globaltravelreport/global-travel-report/actions/workflows/daily-stories-fixed.yml
   - Click on "Run workflow"
   - Set the following parameters:
     - Count: 2
     - Cruise Count: 1
     - Test Mode: true
   - Click "Run workflow"

6. Monitor the workflow execution to ensure it completes successfully

## Alternative: Use Test Mode Only

If you don't have a valid OpenAI API key, you can modify the workflow to always run in test mode:

1. Edit the `.github/workflows/daily-stories-fixed.yml` file
2. Find the "Generate stories" step and modify it to always use the `--test-mode` flag
3. Commit and push the changes
4. Trigger the workflow again

This will allow the workflow to run without making actual API calls to OpenAI.
