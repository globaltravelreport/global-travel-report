#!/usr/bin/env python3
"""
Story Webhook Bot for Make.com Integration

This script prompts the user for story information and posts it as JSON
to a Make.com webhook for automated processing and distribution.

Usage:
    python3 scripts/bot.py

Requirements:
    pip install requests

The script will prompt for:
- Story title
- Story excerpt/summary
- Story URL
- Image URL

All input is sent as JSON to the configured webhook URL.
"""

import json
import sys

try:
    import requests
except ImportError:
    print("❌ Error: The 'requests' library is required but not installed.")
    print("   Please install it with: pip install requests")
    sys.exit(1)

# Webhook URL for Make.com integration
WEBHOOK_URL = "https://hook.us2.make.com/w22pet4ujx4xssam6ejo66xunyxuessz"

def get_user_input():
    """Prompt user for story information with validation."""

    print("🌐 Story Webhook Bot")
    print("===================")
    print("")

    # Get story title
    title = input("📝 Enter story title: ").strip()
    if not title:
        print("❌ Error: Title cannot be empty")
        sys.exit(1)

    # Get story excerpt
    excerpt = input("📄 Enter story excerpt: ").strip()
    if not excerpt:
        print("❌ Error: Excerpt cannot be empty")
        sys.exit(1)

    # Get story URL
    url = input("🔗 Enter story URL: ").strip()
    if not url:
        print("❌ Error: URL cannot be empty")
        sys.exit(1)

    # Get image URL
    image_url = input("🖼️  Enter image URL: ").strip()
    if not image_url:
        print("❌ Error: Image URL cannot be empty")
        sys.exit(1)

    return {
        "title": title,
        "excerpt": excerpt,
        "url": url,
        "imageUrl": image_url
    }

def send_to_webhook(data):
    """Send story data to the Make.com webhook."""

    try:
        # Set headers for JSON content
        headers = {
            "Content-Type": "application/json"
        }

        # Send POST request
        response = requests.post(
            WEBHOOK_URL,
            json=data,
            headers=headers,
            timeout=30
        )

        # Return response details
        return {
            "status_code": response.status_code,
            "response_body": response.text,
            "success": response.status_code == 200
        }

    except requests.exceptions.RequestException as e:
        return {
            "status_code": 0,
            "response_body": f"Request error: {str(e)}",
            "success": False
        }

def main():
    """Main function to run the webhook bot."""

    # Get user input
    story_data = get_user_input()

    # Display summary
    print("")
    print("📊 Summary of data to send:")
    print(f"   Title: {story_data['title']}")
    print(f"   Excerpt: {story_data['excerpt']}")
    print(f"   URL: {story_data['url']}")
    print(f"   Image: {story_data['imageUrl']}")
    print("")

    # Confirm before sending
    confirm = input("🚀 Send to webhook? (y/N): ").strip().lower()

    if confirm not in ['y', 'yes']:
        print("❌ Operation cancelled.")
        sys.exit(0)

    # Send to webhook
    print("📤 Sending data to webhook...")
    print("")

    result = send_to_webhook(story_data)

    # Display results
    print("📊 Response Status:", result["status_code"])
    print("📄 Response Body:", result["response_body"])
    print("")

    if result["success"]:
        print("✅ Success! Story data sent successfully to webhook.")
    else:
        print("❌ Error! Failed to send data to webhook.")
        print(f"   Status: {result['status_code']}")
        print(f"   Response: {result['response_body']}")
        sys.exit(1)

if __name__ == "__main__":
    main()