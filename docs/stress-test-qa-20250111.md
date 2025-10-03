🧪 Codex QA Task: Global Travel Report Website Stress Test

GOAL:
Systematically test the Global Travel Report publishing workflow end-to-end and push it to its operational limits. Validate that Gemini-powered content rewriting, image fetching, site publishing, RSS updates, and social media pushes all function as intended and respect Australian formatting and tone guidelines.

---

🔍 TEST OBJECTIVES:

1. ✅ **Trigger Daily Publish Flow**
   - Simulate or manually trigger the scheduled cron job or webhook for the daily run.
   - Confirm 8 stories are processed, not more.
   - Ensure stories are not duplicated.

2. ✍️ **AI Rewrite Test (Gemini)**
   - Confirm all stories are rewritten using Australian English.
   - Validate formatting: `HEADLINE: ...`, `SUMMARY: ...`
   - Tone should be professional, friendly, and localised (e.g., "travelling" not "traveling").

3. 🖼️ **Image Fetching (Unsplash)**
   - Ensure each story includes a landscape image.
   - Check attribution to photographers.
   - Test fallback logic if keywords return no results.

4. 📑 **Website Posting**
   - Stories should appear on https://globaltravelreport.com immediately after publication.
   - Category should be auto-assigned (Flight, Cruise, etc.)
   - Publishing date should remain **static** to when content is generated — not change on re-syncs.

5. 📤 **Social Media Posting**
   - Facebook Page: Confirm post is created with correct title, image, link, and hashtags.
   - Twitter/X: Confirm post format and hashtags.
   - LinkedIn: UGC format — include title, short excerpt, and original URL.

6. 📰 **RSS Feed Update**
   - Confirm https://globaltravelreport.com/rss/new is updated after each publish.
   - Check story order, categories, timestamps, and link integrity.

7. ⚠️ **Error Handling**
   - Force errors in each module (e.g., invalid API key, missing image).
   - Confirm system retries or gracefully exits with logs.
   - Check whether email/Discord error notifications are triggered (if configured).

8. 📅 **Cron & Scheduling**
   - Confirm the automation runs **once daily at 10:00 AM AEST**
   - Validate time zone logic
   - Confirm it doesn't run multiple times or skip days

---

📋 ENVIRONMENT VARIABLES (Ensure these are live & populated):

- `GEMINI_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `ADMIN_TOKEN`
- `FACEBOOK_ACCESS_TOKEN`
- `FACEBOOK_PAGE_ID`
- `TWITTER_BEARER_TOKEN`
- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_ORG_ID`
- `CRON_SECRET_KEY`

---

🚨 FINAL VERIFICATION

Once complete, confirm:
- All content appears cleanly formatted on the live site
- Socials reflect the exact rewritten content
- No duplicate stories
- RSS is accurate
- Logs contain no critical errors

---

🧠 Assumptions:
- Platform is hosted on Vercel
- Automation is driven by either Make.com or custom `dailyAutoPublisher.mjs` script
- Social API keys are set correctly in env

Return a report summarising:
- ✅ Pass/Fail for each test block above
- ❌ Any breaking issues or misconfigurations
- 🛠️ Suggested fixes or improvements