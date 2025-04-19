const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// Configuration
const CONFIG = {
    checkInterval: 1800000, // 30 minutes
    maxRetries: 3,
    retryDelay: 60000, // 1 minute
    projectUrl: 'https://www.globaltravelreport.com',
    logFile: path.join(__dirname, '..', 'deploy-log.txt')
};

// Utility functions
const getSydneyTime = () => {
    return new Date().toLocaleString('en-AU', {
        timeZone: 'Australia/Sydney',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

const log = async (message, type = 'info') => {
    const timestamp = getSydneyTime();
    const logMessage = `[${timestamp} AEST] [${type.toUpperCase()}] ${message}`;
    
    // Console output
    console.log(logMessage);
    
    // File logging
    try {
        await fs.appendFile(CONFIG.logFile, logMessage + '\n');
    } catch (error) {
        console.error(`Failed to write to log file: ${error.message}`);
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Execute shell command with output streaming
const executeCommand = (command, cwd) => {
    return new Promise((resolve, reject) => {
        const process = exec(command, { cwd });
        
        process.stdout.on('data', async (data) => {
            const output = data.trim();
            if (output) {
                await log(output, 'cmd');
            }
        });
        
        process.stderr.on('data', async (data) => {
            const output = data.trim();
            if (output) {
                await log(output, 'error');
            }
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
    });
};

// Verify Vercel CLI installation
async function checkVercelCli() {
    try {
        await executeCommand('vercel --version');
        return true;
    } catch (error) {
        await log('Vercel CLI is not installed. Installing...', 'warning');
        try {
            await executeCommand('npm install -g vercel');
            return true;
        } catch (installError) {
            throw new Error('Failed to install Vercel CLI');
        }
    }
}

// Check for changes and deploy if necessary
async function checkAndDeploy(retryCount = 0) {
    try {
        const projectRoot = path.resolve(__dirname, '..');
        
        await log('Starting deployment check...', 'info');
        
        // Ensure Vercel CLI is available
        await checkVercelCli();
        
        // Pull latest changes
        await log('Pulling latest changes from GitHub...');
        await executeCommand('git pull origin main', projectRoot);
        
        // Check for changes
        await log('Checking for local changes...');
        const status = await executeCommand('git status --porcelain', projectRoot);
        
        if (!status) {
            await log('No changes detected');
            return;
        }

        await log('Changes detected in the following files:', 'info');
        await log(status, 'files');

        // Run deployment script
        await log('Starting deployment process...');
        await executeCommand('./deploy.sh', projectRoot);
        
        await log('Deployment completed successfully ✨', 'success');
        await log(`Site is live at ${CONFIG.projectUrl}`, 'success');
        await log('-------------------------------------------');

    } catch (error) {
        await log(`Deployment failed: ${error.message}`, 'error');

        if (retryCount < CONFIG.maxRetries) {
            await log(`Retrying deployment in ${CONFIG.retryDelay / 1000} seconds... (Attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
            await sleep(CONFIG.retryDelay);
            return checkAndDeploy(retryCount + 1);
        } else {
            await log('Max retry attempts reached. Please check the deployment manually.', 'error');
            await log('Common issues to check:', 'info');
            await log('1. Verify Vercel CLI authentication', 'info');
            await log('2. Check GitHub repository permissions', 'info');
            await log('3. Verify build configuration in vercel.json', 'info');
            await log('-------------------------------------------');
        }
    }
}

// Initialize log file
async function initializeLogFile() {
    const header = `
-------------------------------------------
Global Travel Report - Deployment Log
Started: ${getSydneyTime()} AEST
-------------------------------------------
`;
    try {
        await fs.appendFile(CONFIG.logFile, header + '\n');
    } catch (error) {
        console.error(`Failed to initialize log file: ${error.message}`);
    }
}

// Main execution
async function main() {
    await initializeLogFile();
    await log('Auto-deployment service started');
    await log(`Checking for changes every ${CONFIG.checkInterval / 60000} minutes`);
    await log(`Deploying to: ${CONFIG.projectUrl}`);
    await log('-------------------------------------------');

    // Initial check
    await checkAndDeploy();

    // Set up interval for subsequent checks
    setInterval(async () => {
        await checkAndDeploy();
    }, CONFIG.checkInterval);
}

// Start the service with error handling
main().catch(async error => {
    await log(`Fatal error: ${error.message}`, 'error');
    await log('Auto-deployment service stopped', 'error');
    await log('-------------------------------------------');
    process.exit(1);
}); 