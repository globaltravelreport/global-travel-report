interface UnsplashImage {
  url: string;
  photographer: {
    name: string;
    username: string;
  };
  alt: string;
  downloadLocation?: string;
}

interface HeroImages {
  [key: string]: UnsplashImage;
}

export const heroImages: HeroImages = {
  home: {
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=600&fit=crop&q=80',
    photographer: {
      name: 'Thomas Tucker',
      username: 'tents_and_tread'
    },
    alt: 'Scenic mountain road winding through a dramatic landscape at sunset',
    downloadLocation: 'https://api.unsplash.com/photos/m7VNKaBOk0g/download'
  },
  news: {
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=600&fit=crop&q=80',
    photographer: {
      name: 'Sasha Freemind',
      username: 'sashafreemind'
    },
    alt: 'Airplane wing view over clouds during sunset',
    downloadLocation: 'https://api.unsplash.com/photos/nKcx6jbFE-A/download'
  },
  deals: {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&h=600&fit=crop&q=80',
    photographer: {
      name: 'Daniel Leone',
      username: 'danielleone'
    },
    alt: 'Mountain range with snow-capped peaks under a dramatic sky',
    downloadLocation: 'https://api.unsplash.com/photos/g30P1zcOzXo/download'
  },
  destinations: {
    url: 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=1920&h=600&fit=crop&q=80',
    photographer: {
      name: 'Simon Zhu',
      username: 'smnzhu'
    },
    alt: 'Aerial view of a tropical beach with crystal clear turquoise water',
    downloadLocation: 'https://api.unsplash.com/photos/8wbxjJBrl3k/download'
  },
  tips: {
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=600&fit=crop&q=80',
    photographer: {
      name: 'Dino Reichmuth',
      username: 'dinoreichmuth'
    },
    alt: 'Person standing on cliff edge overlooking mountain valley',
    downloadLocation: 'https://api.unsplash.com/photos/A5rCN8626Ck/download'
  },
  contact: {
    url: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=600&fit=crop&q=80',
    photographer: {
      name: 'Crew',
      username: 'crew'
    },
    alt: 'Modern office workspace with laptop and coffee cup',
    downloadLocation: 'https://api.unsplash.com/photos/JJSqrwIV5FY/download'
  },
  notFound: {
    url: 'https://images.unsplash.com/photo-1499591934245-40b55745b905?w=1920&h=600&fit=crop&q=80',
    photographer: {
      name: 'Heather Shevlin',
      username: 'heathershevlin'
    },
    alt: 'Lost sign in a natural setting indicating a 404 not found page',
    downloadLocation: 'https://api.unsplash.com/photos/ctRgcY-lY8I/download'
  },
  rewrite: {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&h=600&fit=crop&q=80',
    photographer: {
      name: 'Patrick Tomasso',
      username: 'impatrickt'
    },
    alt: 'Vintage typewriter on wooden desk with paper',
    downloadLocation: 'https://api.unsplash.com/photos/Oaqk7qqNh_c/download'
  }
}; 