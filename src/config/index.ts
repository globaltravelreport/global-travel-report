// Configuration settings for the application

const config = {
  // Site information
  site: {
    name: 'Global Travel Report',
    description: 'Discover travel stories from around the world',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com',
  },

  // Contact form settings
  contact: {
    email: process.env.CONTACT_EMAIL || 'editorial@globaltravelreport.com',
    recipients: process.env.CONTACT_RECIPIENTS?.split(',') || ['editorial@globaltravelreport.com'],
  },

  // Email settings
  email: {
    from: process.env.EMAIL_FROM || 'noreply@globaltravelreport.com',
    contact: process.env.CONTACT_EMAIL || 'editorial@globaltravelreport.com',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },

  // API settings
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    recaptcha: {
      siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
    },
  },

  // Social media links
  social: {
    twitter: 'https://twitter.com/globaltravelreport',
    facebook: 'https://facebook.com/globaltravelreport',
    instagram: 'https://instagram.com/globaltravelreport',
  },
};

export default config;
