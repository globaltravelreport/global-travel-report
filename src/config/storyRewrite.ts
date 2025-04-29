export interface StoryRewriteConfig {
  dailyLimit: number;
  categoryDistribution: {
    cruise: number;
    other: number;
  };
  categories: {
    cruise: string[];
    other: string[];
  };
  contentRules: {
    style: {
      language: 'Australian';
      spellings: {
        favorite: 'favourite';
        organize: 'organise';
        vacation: 'holiday';
      };
    };
    headline: {
      maxLength: number;
      case: 'Title Case';
      requiredElements: string[];
    };
    meta: {
      descriptionMaxLength: number;
      requiredElements: string[];
    };
    tone: {
      style: string[];
      prohibited: string[];
    };
    safety: {
      prohibitedKeywords: string[];
      requiredChecks: string[];
    };
  };
  publishing: {
    intervalMinutes: number;
    priorityCategories: string[];
  };
  maxRetries: number;
  retryDelay: number;
  maxConcurrent: number;
  defaultLanguage: string;
  targetLength: {
    min: number;
    max: number;
  };
  preserveTags: boolean;
  maintainTone: boolean;
  keepKeywords: boolean;
}

export const storyRewriteConfig: StoryRewriteConfig = {
  dailyLimit: 8,
  categoryDistribution: {
    cruise: 2,
    other: 6
  },
  categories: {
    cruise: [
      'Cruise News',
      'Cruise Reviews',
      'Cruise Deals',
      'Cruise Destinations'
    ],
    other: [
      'Airlines',
      'Hotels',
      'Tours',
      'Destinations',
      'Travel News',
      'Experiences'
    ]
  },
  contentRules: {
    style: {
      language: 'Australian',
      spellings: {
        favorite: 'favourite',
        organize: 'organise',
        vacation: 'holiday'
      }
    },
    headline: {
      maxLength: 70,
      case: 'Title Case',
      requiredElements: ['destination', 'category', 'travel keyword']
    },
    meta: {
      descriptionMaxLength: 155,
      requiredElements: ['destination', 'holiday type']
    },
    tone: {
      style: [
        'professional',
        'factual',
        'positive',
        'family-friendly',
        'inclusive'
      ],
      prohibited: [
        'slang',
        'political opinions',
        'discriminatory language',
        'adult content',
        'violence',
        'drugs',
        'alcohol abuse',
        'illegal activities'
      ]
    },
    safety: {
      prohibitedKeywords: [
        // Add comprehensive list of prohibited keywords
        'adult',
        'explicit',
        'graphic',
        'violent',
        'offensive',
        'discriminatory'
      ],
      requiredChecks: [
        'family-friendly',
        'inclusive',
        'factual accuracy',
        'tone',
        'grammar',
        'SEO structure',
        'Australian English'
      ]
    }
  },
  publishing: {
    intervalMinutes: 180, // 3 hours between posts
    priorityCategories: ['Cruise News', 'Cruise Reviews']
  },
  maxRetries: 3,
  retryDelay: 1000,
  maxConcurrent: 5,
  defaultLanguage: 'en',
  targetLength: {
    min: 500,
    max: 2000
  },
  preserveTags: true,
  maintainTone: true,
  keepKeywords: true
}; 