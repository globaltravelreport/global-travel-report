#!/bin/bash

# Webhook bot script to send story data to Make.com webhook
# This script prompts for story information and sends it as JSON to the webhook

WEBHOOK_URL="https://hook.us2.make.com/w22pet4ujx4xssam6ejo66xunyxuessz"

echo "🌐 Story Webhook Bot"
echo "==================="
echo ""

# Prompt for story title
echo -n "📝 Enter story title: "
read -r STORY_TITLE

# Prompt for story excerpt
echo -n "📄 Enter story excerpt: "
read -r STORY_EXCERPT

# Prompt for story URL
echo -n "🔗 Enter story URL: "
read -r STORY_URL

# Prompt for image URL
echo -n "🖼️  Enter image URL: "
read -r IMAGE_URL

echo ""
echo "📊 Summary of data to send:"
echo "   Title: $STORY_TITLE"
echo "   Excerpt: $STORY_EXCERPT"
echo "   URL: $STORY_URL"
echo "   Image: $IMAGE_URL"
echo ""

# Confirm before sending
echo -n "🚀 Send to webhook? (y/N): "
read -r CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 0
fi

# Prepare JSON payload
JSON_PAYLOAD=$(cat << EOF
{
  "title": "$STORY_TITLE",
  "excerpt": "$STORY_EXCERPT",
  "url": "$STORY_URL",
  "imageUrl": "$IMAGE_URL"
}
EOF
)

echo "📤 Sending data to webhook..."
echo ""

# Send POST request with curl
HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD" \
  "$WEBHOOK_URL")

# Extract status code and body
HTTP_BODY=$(echo "$HTTP_RESPONSE" | head -n -1)
HTTP_STATUS=$(echo "$HTTP_RESPONSE" | tail -n 1)

echo "📊 Response Status: $HTTP_STATUS"
echo "📄 Response Body: $HTTP_BODY"
echo ""

if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "✅ Success! Story data sent successfully to webhook."
else
    echo "❌ Error! Failed to send data to webhook."
    echo "   Status: $HTTP_STATUS"
    echo "   Response: $HTTP_BODY"
fi

echo ""