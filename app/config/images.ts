interface UnsplashImage {
  url: string;
  photographer: {
    name: string;
    username: string;
  };
  alt: string;
}

interface HeroImages {
  [key: string]: UnsplashImage;
}

export const heroImages: HeroImages = {
  home: {
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
    photographer: {
      name: 'Thomas Tucker',
      username: 'tents_and_tread'
    },
    alt: 'Scenic mountain road winding through a dramatic landscape at sunset'
  },
  news: {
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
    photographer: {
      name: 'Sasha Freemind',
      username: 'sashafreemind'
    },
    alt: 'Airplane wing view over clouds during sunset'
  },
  deals: {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    photographer: {
      name: 'Daniel Leone',
      username: 'danielleone'
    },
    alt: 'Mountain range with snow-capped peaks under a dramatic sky'
  },
  destinations: {
    url: 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7',
    photographer: {
      name: 'Simon Zhu',
      username: 'smnzhu'
    },
    alt: 'Aerial view of a tropical beach with crystal clear turquoise water'
  },
  tips: {
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
    photographer: {
      name: 'Dino Reichmuth',
      username: 'dinoreichmuth'
    },
    alt: 'Person standing on cliff edge overlooking mountain valley'
  },
  contact: {
    url: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a',
    photographer: {
      name: 'Crew',
      username: 'crew'
    },
    alt: 'Modern office workspace with laptop and coffee cup'
  },
  notFound: {
    url: 'https://images.unsplash.com/photo-1499591934245-40b55745b905',
    photographer: {
      name: 'Heather Shevlin',
      username: 'heathershevlin'
    },
    alt: 'Lost sign in a natural setting indicating a 404 not found page'
  },
  rewrite: {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
    photographer: {
      name: 'Patrick Tomasso',
      username: 'impatrickt'
    },
    alt: 'Vintage typewriter on wooden desk with paper'
  }
}; 