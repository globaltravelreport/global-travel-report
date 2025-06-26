#!/bin/bash

echo "Starting repository cleanup..."

# Find and remove .DS_Store files
echo "Removing .DS_Store files..."
find . -name ".DS_Store" -type f -delete

# Find and remove backup files
echo "Removing backup files..."
find . -name "*.bak" -type f -delete
find . -name "*.old" -type f -delete
find . -name "*.tmp" -type f -delete
find . -name "*~" -type f -delete

# Find and remove log files (but preserve important logs)
echo "Removing temporary log files..."
find . -name "*.log" -not -path "./logs/*" -not -path "./.log_backup/*" -type f -delete

# Find and remove temporary directories
echo "Removing temporary directories..."
find . -name "tmp" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "temp" -type d -exec rm -rf {} + 2>/dev/null || true

# Find and remove editor temporary files
echo "Removing editor temporary files..."
find . -name ".swp" -type f -delete
find . -name ".swo" -type f -delete
find . -name "*.swp" -type f -delete
find . -name "*.swo" -type f -delete

# Find and remove OS generated files
echo "Removing OS generated files..."
find . -name "Thumbs.db" -type f -delete
find . -name "desktop.ini" -type f -delete

# Find and remove empty directories (but preserve important structure)
echo "Removing empty directories..."
find . -type d -empty -not -path "./.git/*" -not -path "./node_modules/*" -delete 2>/dev/null || true

echo "Cleanup completed!"

# Show what would be staged for deletion
echo "Files that will be staged for deletion:"
git status --porcelain | grep "^ D" || echo "No files to delete"

