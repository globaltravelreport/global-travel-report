#!/bin/bash

# Global Travel Report - Make.com Automation Setup Script
# This script helps configure the Make.com scenario with all required credentials

set -e

echo "🚀 Global Travel Report - Make.com Automation Setup"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for input
prompt_secret() {
    local var_name=$1
    local description=$2
    local current_value=${!var_name}

    if [ -n "$current_value" ]; then
        echo -e "${BLUE}$description (current: ${current_value:0:10}...):${NC}"
    else
        echo -e "${BLUE}$description:${NC}"
    fi

    read -s -p "Enter value (or press Enter to keep current): " input
    echo ""

    if [ -n "$input" ]; then
        eval "$var_name=\"$input\""
    elif [ -z "$current_value" ]; then
        echo -e "${RED}Error: $description is required${NC}"
        return 1
    fi

    return 0
}

# Function to test API endpoint
test_api() {
    local url=$1
    local method=${2:-GET}
    local headers=$3
    local data=$4
    local description=$5

    echo -e "${YELLOW}Testing: $description${NC}"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$url" ${headers:+-H "$headers"})
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" ${headers:+-H "$headers"} ${data:+-d "$data"})
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success ($http_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed ($http_code)${NC}"
        echo "Response: $body"
        return 1
    fi
}

# Load existing environment variables if available
if [ -f ".env.local" ]; then
    echo "Loading existing environment variables..."
    export $(grep -v '^#' .env.local | xargs)
fi

# Collect API credentials
echo "📝 API Credentials Setup"
echo "========================"

if ! prompt_secret GEMINI_API_KEY "Google Gemini API Key"; then exit 1; fi
if ! prompt_secret UNSPLASH_ACCESS_KEY "Unsplash Access Key"; then exit 1; fi
if ! prompt_secret ADMIN_TOKEN "Website Admin Token"; then exit 1; fi

echo ""
echo "📱 Social Media Credentials Setup"
echo "================================="

if ! prompt_secret FACEBOOK_ACCESS_TOKEN "Facebook Access Token"; then exit 1; fi
if ! prompt_secret FACEBOOK_PAGE_ID "Facebook Page ID"; then exit 1; fi
if ! prompt_secret TWITTER_BEARER_TOKEN "Twitter Bearer Token"; then exit 1; fi
if ! prompt_secret LINKEDIN_ACCESS_TOKEN "LinkedIn Access Token"; then exit 1; fi
if ! prompt_secret LINKEDIN_ORG_ID "LinkedIn Organization ID"; then exit 1; fi

echo ""
echo "🧪 Testing API Endpoints"
echo "========================"

# Test Gemini API
test_api "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY" \
    "POST" \
    "Content-Type: application/json" \
    '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
    "Gemini API"

# Test Unsplash API
test_api "https://api.unsplash.com/search/photos?query=test&per_page=1" \
    "GET" \
    "Authorization: Client-ID $UNSPLASH_ACCESS_KEY" \
    "" \
    "Unsplash API"

# Test Website API
test_api "https://globaltravelreport.com/api/admin/ingest-content" \
    "POST" \
    "Authorization: Bearer $ADMIN_TOKEN
Content-Type: application/json" \
    '{"title":"Test","content":"Test content","publish":false}' \
    "Website Admin API"

# Test Facebook API
test_api "https://graph.facebook.com/v18.0/$FACEBOOK_PAGE_ID" \
    "GET" \
    "" \
    "" \
    "Facebook Page API"

# Test Twitter API
test_api "https://api.twitter.com/2/users/me" \
    "GET" \
    "Authorization: Bearer $TWITTER_BEARER_TOKEN" \
    "" \
    "Twitter API"

# Test LinkedIn API
test_api "https://api.linkedin.com/v2/organizations/$LINKEDIN_ORG_ID" \
    "GET" \
    "Authorization: Bearer $LINKEDIN_ACCESS_TOKEN" \
    "" \
    "LinkedIn API"

# Test RSS Feed
test_api "https://globaltravelreport.com/rss/new" \
    "GET" \
    "" \
    "" \
    "RSS Feed"

echo ""
echo "📋 Make.com Scenario Configuration"
echo "=================================="

cat << EOF
Copy these values into your Make.com Data Store:

GEMINI_API_KEY: $GEMINI_API_KEY
UNSPLASH_ACCESS_KEY: $UNSPLASH_ACCESS_KEY
ADMIN_TOKEN: $ADMIN_TOKEN
FACEBOOK_ACCESS_TOKEN: $FACEBOOK_ACCESS_TOKEN
FACEBOOK_PAGE_ID: $FACEBOOK_PAGE_ID
TWITTER_BEARER_TOKEN: $TWITTER_BEARER_TOKEN
LINKEDIN_ACCESS_TOKEN: $LINKEDIN_ACCESS_TOKEN
LINKEDIN_ORG_ID: $LINKEDIN_ORG_ID

EOF

echo "📄 Make.com Scenario Files"
echo "=========================="
echo "1. Import make-scenario-export.json into Make.com"
echo "2. Follow docs/make-com-scenario-blueprint.md for detailed setup"
echo "3. Set the schedule trigger to 10:00 AM AEST"
echo "4. Test with a single story before going live"

echo ""
echo "⚠️  Important Notes:"
echo "- Schedule runs daily at 10:00 AM AEST (00:00 UTC)"
echo "- Processes up to 8 stories per day"
echo "- Preserves original publication dates"
echo "- Includes comprehensive error handling"
echo "- Sends completion notifications"

echo ""
echo -e "${GREEN}✅ Setup complete! Ready to import into Make.com${NC}"