import { execSync } from 'child_process';
import { format } from 'date-fns-tz';

const PRODUCTION_URL = 'https://www.globaltravelreport.com';
const MAX_RETRIES = 3;
const TIMEZONE = 'Australia/Sydney';

function getTimestamp(): string {
  return format(new Date(), 'dd/MM/yyyy HH:mm', { timeZone: TIMEZONE });
}

type LogType = 'INFO' | 'ERROR' | 'SUCCESS' | 'CMD';

function log(type: LogType, message: string) {
  const timestamp = format(new Date(), '[dd/MM/yyyy, HH:mm AEST]', { timeZone: TIMEZONE });
  console.log(`${timestamp} [${type}] ${message}`);
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

async function deploy() {
  try {
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