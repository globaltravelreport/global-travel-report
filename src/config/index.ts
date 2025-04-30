// Configuration settings for the application

export const config = {
  // Site information
  site: {
    name: 'Global Travel Report',
    description: 'Discover travel stories from around the world',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com',
  },
  
  // Contact form settings
  contact: {
    email: process.env.CONTACT_EMAIL || 'info@globaltravelreport.com',
    recipients: process.env.CONTACT_RECIPIENTS?.split(',') || ['info@globaltravelreport.com'],
  },
  
  // API settings
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
  
  // Social media links
  social: {
    twitter: 'https://twitter.com/globaltravelreport',
    facebook: 'https://facebook.com/globaltravelreport',
    instagram: 'https://instagram.com/globaltravelreport',
  },
};
