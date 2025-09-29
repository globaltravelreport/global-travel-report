declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Core Application
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_SITE_URL?: string;
      NEXT_PUBLIC_BASE_URL?: string;

      // Security
      AUTH_ENCRYPTION_KEY?: string;
      CRON_SECRET_KEY?: string;
      SESSION_SECRET?: string;
      CSRF_SECRET?: string;

      // APIs
      OPENAI_API_KEY?: string;
      UNSPLASH_ACCESS_KEY?: string;
      BREVO_API_KEY?: string;
      EMAIL_SERVICE_API_KEY?: string;

      // Social Media
      TWITTER_BEARER_TOKEN?: string;
      FACEBOOK_APP_ID?: string;
      FACEBOOK_APP_SECRET?: string;

      // Analytics
      NEXT_PUBLIC_GA_ID?: string;
      GOOGLE_SITE_VERIFICATION?: string;

      // Email & Communication
      SLACK_WEBHOOK?: string;
      SLACK_CHANNEL?: string;

      // Development/Production Flags
      NEXT_PUBLIC_ENABLE_AI_ASSISTANT?: string;
      NEXT_PUBLIC_ENABLE_ADS?: string;
    }
  }
}

export {};