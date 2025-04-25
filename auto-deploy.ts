import { execSync } from 'child_process';
import { format } from 'date-fns-tz';
import { appendFileSync, existsSync } from 'fs';
import { join } from 'path';

const PRODUCTION_URL = 'https://www.globaltravelreport.com';
const MAX_RETRIES = 3;
const TIMEZONE = 'Australia/Sydney';
const LOG_FILE = 'deploy-log.txt';

function getTimestamp(): string {
  return format(new Date(), 'dd/MM/yyyy HH:mm', { timeZone: TIMEZONE });
}

type LogType = 'INFO' | 'ERROR' | 'SUCCESS' | 'CMD';

function log(type: LogType, message: string, writeToFile = true) {
  const timestamp = format(new Date(), '[dd/MM/yyyy, HH:mm AEST]', { timeZone: TIMEZONE });
  const logMessage = `${timestamp} [${type}] ${message}\n`;
  console.log(logMessage.trim());
  
  if (writeToFile) {
    appendFileSync(LOG_FILE, logMessage);
  }
}

function executeCommand(command: string, errorMessage: string): string {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    log('CMD', output.trim());
    return output;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log('ERROR', `${errorMessage}: ${errorMsg}`);
    throw error;
  }
}

function showSuccessMessage() {
  const message = `
🎉 Deployment Successful! 🎉

Your changes have been successfully deployed to:
${PRODUCTION_URL}

The deployment process included:
✓ Staging all changes
✓ Creating a commit with timestamp
✓ Pushing to main branch
✓ Verifying the push

You can view the deployment logs in:
${join(process.cwd(), LOG_FILE)}

Thank you for using the auto-deploy script!
`;
  console.log(message);
  appendFileSync(LOG_FILE, '\n' + message + '\n');
}

async function deploy() {
  try {
    // Ensure log file exists
    if (!existsSync(LOG_FILE)) {
      appendFileSync(LOG_FILE, '');
    }

    // Add a separator for new deployment
    log('INFO', 'Starting new deployment...', false);
    appendFileSync(LOG_FILE, '\n' + '='.repeat(80) + '\n');

    // Stage all changes
    log('INFO', 'Staging all changes...');
    executeCommand('git add .', 'Failed to stage changes');

    // Create commit with timestamp
    const timestamp = getTimestamp();
    const commitMessage = `Auto-update from Cursor - [${timestamp}] AEST`;
    log('INFO', `Creating commit: ${commitMessage}`);
    executeCommand(`git commit -m "${commitMessage}"`, 'Failed to create commit');

    // Push to main with retries
    log('INFO', 'Pushing to main branch...');
    let pushSuccess = false;
    let attempts = 0;

    while (!pushSuccess && attempts < MAX_RETRIES) {
      attempts++;
      try {
        executeCommand('git push origin main', 'Failed to push to main branch');
        pushSuccess = true;
        log('SUCCESS', 'Successfully pushed to main branch');
      } catch (error: unknown) {
        if (attempts < MAX_RETRIES) {
          log('INFO', `Push failed, retrying (attempt ${attempts + 1}/${MAX_RETRIES})...`);
        } else {
          throw error;
        }
      }
    }

    // Verify the push by checking the remote
    log('INFO', 'Verifying push...');
    const localHash = executeCommand('git rev-parse HEAD', 'Failed to get local commit hash').trim();
    const remoteHash = executeCommand('git rev-parse origin/main', 'Failed to get remote commit hash').trim();

    if (localHash === remoteHash) {
      log('SUCCESS', 'Push verified successfully');
      log('INFO', `Changes will be deployed to: ${PRODUCTION_URL}`);
      showSuccessMessage();
    } else {
      throw new Error('Local and remote commit hashes do not match');
    }

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log('ERROR', `Deployment failed: ${errorMsg}`);
    process.exit(1);
  }
}

// Run the deployment
deploy().catch((error: unknown) => {
  const errorMsg = error instanceof Error ? error.message : String(error);
  log('ERROR', `Unexpected error: ${errorMsg}`);
  process.exit(1);
}); 