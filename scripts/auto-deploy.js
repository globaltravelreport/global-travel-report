#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');

// Configure timezone
const timezone = 'Australia/Sydney';

// Log file path
const logFile = path.join(process.cwd(), 'deploy-log.txt');

// Function to get current Sydney time
function getSydneyTime() {
  return DateTime.now().setZone(timezone).toFormat('dd/MM/yyyy HH:mm');
}

// Function to log messages with timestamp
function log(message, type = 'INFO') {
  const timestamp = getSydneyTime();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

// Function to execute shell commands
function executeCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to deploy to Vercel
async function deployToVercel(attempt = 1) {
  log(`Deployment attempt ${attempt} of 3`);
  
  const result = executeCommand('vercel --prod --yes');
  
  if (result.success) {
    log('Deployment successful');
    return true;
  }
  
  if (attempt < 3) {
    log(`Deployment failed, retrying in 10 seconds... (Attempt ${attempt + 1})`, 'WARN');
    await new Promise(resolve => setTimeout(resolve, 10000));
    return deployToVercel(attempt + 1);
  }
  
  log('Deployment failed after 3 attempts', 'ERROR');
  return false;
}

// Main function
async function main() {
  log('Auto-deployment service started');
  
  // Check for uncommitted changes
  const gitStatus = executeCommand('git status --porcelain');
  
  if (!gitStatus.success) {
    log('Failed to check Git status', 'ERROR');
    process.exit(1);
  }
  
  if (!gitStatus.output.trim()) {
    log('No changes detected');
    process.exit(0);
  }
  
  log('Changes detected, starting deployment process');
  
  // Add all files
  const addResult = executeCommand('git add .');
  if (!addResult.success) {
    log('Failed to add files', 'ERROR');
    process.exit(1);
  }
  
  // Commit changes
  const commitMessage = `Auto update from Cursor - ${getSydneyTime()}`;
  const commitResult = executeCommand(`git commit -m "${commitMessage}"`);
  if (!commitResult.success) {
    log('Failed to commit changes', 'ERROR');
    process.exit(1);
  }
  
  // Push to main branch
  const pushResult = executeCommand('git push origin main');
  if (!pushResult.success) {
    log('Failed to push changes', 'ERROR');
    process.exit(1);
  }
  
  // Deploy to Vercel
  const deploySuccess = await deployToVercel();
  if (!deploySuccess) {
    process.exit(1);
  }
  
  log('Auto-deployment completed successfully');
}

// Run the script
main().catch(error => {
  log(`Unexpected error: ${error.message}`, 'ERROR');
  process.exit(1);
}); 