import { Story } from '../../types/Story';

/**
 * Mock stories for development and testing
 */
export const mockStories: Story[] = [
  {
    id: '1',
    slug: 'exploring-paris',
    title: 'Exploring the Hidden Gems of Paris',
    excerpt: 'Discover the lesser-known attractions of the City of Light that most tourists never see.',
    content: 'Paris is more than just the Eiffel Tower and Louvre Museum. Beyond the crowded tourist attractions lies a city full of hidden gems waiting to be discovered. From secret gardens tucked away in historic neighborhoods to underground art galleries showcasing local talent, Paris offers endless opportunities for authentic experiences. Join us as we explore the lesser-known side of the City of Light, where locals gather and true Parisian culture thrives away from the spotlight.',
    author: 'John Doe',
    category: 'destinations',
    country: 'France',
    tags: ['Paris', 'Travel', 'Culture', 'Hidden Gems'],
    featured: true,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&q=80&w=2400',
    photographer: {
      name: 'Paris Photographer',
      url: 'https://unsplash.com/@paris'
    },
    metaTitle: 'Hidden Gems of Paris - Secret Places Locals Love',
    metaDescription: 'Discover Paris beyond the Eiffel Tower. Explore secret gardens, underground galleries, and authentic local neighborhoods in the City of Light.'
  },
  {
    id: '2',
    slug: 'best-hotels-paris',
    title: 'Best Hotels in Paris',
    excerpt: 'Discover the best hotels in Paris, from historic palaces to trendy boutiques.',
    content: 'Paris offers an incredible array of accommodation options, from historic palace hotels that have hosted royalty and celebrities to modern boutique properties that capture the city\'s contemporary vibe. Whether you\'re seeking the timeless elegance of a Left Bank institution or the cutting-edge design of a Marais newcomer, the French capital delivers exceptional hospitality at every price point. Our comprehensive guide covers everything from five-star luxury to charming boutique hotels, ensuring you find the perfect base for your Parisian adventure.',
    author: 'Travel Expert',
    category: 'hotels',
    country: 'France',
    tags: ['Paris', 'Hotels', 'Luxury', 'Boutique'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&q=80&w=2400',
    photographer: {
      name: 'Paris Photographer',
      url: 'https://unsplash.com/@parisphoto'
    },
    metaTitle: 'Luxury and Boutique Hotels in Paris',
    metaDescription: 'Explore top luxury and boutique hotels in the City of Light.',
    holidayType: 'Hotel'
  },
  {
    id: '3',
    slug: 'top-airlines-business-class',
    title: 'Top Airlines for Business Class',
    excerpt: 'Fly in style with the finest business class airlines offering superior service and comfort.',
    content: 'When it comes to business class travel, not all airlines are created equal. The world\'s leading carriers compete fiercely to offer the most luxurious and efficient flying experience for discerning travelers. From lie-flat seats that transform into comfortable beds to chef-designed meals served on fine china, business class has evolved into a premium travel category of its own. Our comprehensive analysis covers the top performers in international business class, evaluating everything from seat design and in-flight entertainment to ground services and route networks.',
    author: 'Aviation Expert',
    category: 'airlines',
    country: 'Global',
    tags: ['Airlines', 'Business Class', 'Luxury Travel', 'Aviation'],
    featured: false,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&q=80&w=2400',
    photographer: {
      name: 'Aviation Photographer',
      url: 'https://unsplash.com/@aviationphoto'
    },
    metaTitle: 'Top Business Class Airlines Compared',
    metaDescription: 'A detailed comparison of the best business class airlines worldwide.',
    holidayType: 'Air'
  },
  {
    id: '4',
    slug: 'safari-lodges-africa',
    title: 'Safari Lodges in Africa',
    excerpt: 'Stay at the world\'s best safari lodges in Africa and witness stunning wildlife.',
    content: 'Africa\'s safari lodges represent the pinnacle of wildlife tourism, combining luxury accommodation with unparalleled access to nature\'s most spectacular show. From the vast plains of the Serengeti to the lush waterways of the Okavango Delta, these exclusive retreats offer front-row seats to the greatest wildlife spectacle on Earth. Our guide explores the continent\'s most exceptional safari lodges, from intimate tented camps that put you at eye level with elephants to opulent lodges with private plunge pools overlooking lion territories.',
    author: 'Safari Expert',
    category: 'adventure',
    country: 'Africa',
    tags: ['Safari', 'Africa', 'Wildlife', 'Luxury', 'Nature'],
    featured: true,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&q=80&w=2400',
    photographer: {
      name: 'Wildlife Photographer',
      url: 'https://unsplash.com/@wildlifephoto'
    },
    metaTitle: 'Best Safari Lodges for Adventure',
    metaDescription: 'Experience the wild with Africa\'s top luxury safari lodges.',
    holidayType: 'Tours'
  },
  {
    id: '5',
    slug: 'first-class-train-journeys',
    title: 'First Class Train Journeys',
    excerpt: 'Experience elegance on rails with these luxury first-class train journeys.',
    content: 'There\'s something inherently romantic about train travel, and when you elevate it to first-class standards, it becomes an unforgettable journey through both landscapes and luxury. From the legendary Venice Simplon-Orient-Express that recreates the golden age of rail travel to Japan\'s Shinkansen bullet trains that whisk you across the country in unparalleled comfort, first-class train journeys offer a unique blend of nostalgia, adventure, and sophistication. Our comprehensive guide explores the world\'s most extraordinary rail experiences.',
    author: 'Rail Expert',
    category: 'adventure',
    country: 'Europe',
    tags: ['Train', 'Luxury', 'Europe', 'Rail Travel'],
    featured: false,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1553773077-91673524aafa?auto=format&q=80&w=2400',
    photographer: {
      name: 'Rail Photographer',
      url: 'https://unsplash.com/@railphoto'
    },
    metaTitle: 'World\'s Most Luxurious Train Journeys',
    metaDescription: 'Travel in ultimate comfort aboard first-class train routes.',
    holidayType: 'Tours'
  },
  {
    id: '6',
    slug: 'luxury-resorts-maldives',
    title: 'Luxury Resorts in the Maldives',
    excerpt: 'Swim with dolphins, dine underwater, and relax in stunning overwater villas.',
    content: 'The Maldives represents the ultimate tropical paradise, where luxury resorts are built on their own private islands, offering unparalleled exclusivity and natural beauty. These overwater villas and beachfront retreats provide the perfect blend of Robinson Crusoe adventure and five-star luxury. From underwater restaurants where you can dine while watching marine life swim by to private infinity pools that seem to merge with the Indian Ocean, Maldives resorts redefine the concept of tropical luxury. Our detailed guide covers the archipelago\'s most exceptional properties.',
    author: 'Island Expert',
    category: 'hotels',
    country: 'Maldives',
    tags: ['Maldives', 'Resort', 'Luxury', 'Beach', 'Tropical'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&q=80&w=2400',
    photographer: {
      name: 'Island Photographer',
      url: 'https://unsplash.com/@islandphoto'
    },
    metaTitle: 'Best Maldives Resorts',
    metaDescription: 'Your guide to the most luxurious resorts in the Maldives.',
    holidayType: 'Hotel'
  },
  {
    id: '7',
    slug: 'tokyo-hidden-gems',
    title: 'Tokyo\'s Hidden Gems: Beyond the Tourist Trail',
    excerpt: 'Discover the secret neighborhoods and local experiences that most visitors never see in Japan\'s bustling capital.',
    content: 'While Shibuya Crossing and Senso-ji Temple draw millions of visitors each year, Tokyo\'s true magic lies in its hidden neighborhoods where locals live and work. From the artisanal workshops of Yanaka to the retro shopping streets of Shimokitazawa, these areas offer authentic experiences far removed from the typical tourist itinerary. Join us as we explore the city\'s best-kept secrets, from hidden gardens and local izakayas to traditional craft centers that have remained unchanged for generations.',
    author: 'Tokyo Explorer',
    category: 'culture',
    country: 'Japan',
    tags: ['Tokyo', 'Hidden Gems', 'Local Culture', 'Neighborhoods'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&q=80&w=2400',
    photographer: {
      name: 'Tokyo Photographer',
      url: 'https://unsplash.com/@tokyophoto'
    },
    metaTitle: 'Tokyo Hidden Gems and Local Secrets',
    metaDescription: 'Discover authentic Tokyo beyond the tourist attractions.'
  },
  {
    id: '8',
    slug: 'best-travel-credit-cards',
    title: 'Best Travel Credit Cards for 2024',
    excerpt: 'Maximize your travel rewards with these top-rated credit cards offering the best benefits and perks.',
    content: 'The right travel credit card can transform your vacation budget, offering everything from airport lounge access to bonus points on flights and hotels. With so many options available, choosing the perfect card depends on your spending habits, travel frequency, and preferred destinations. Our comprehensive guide analyzes the top travel credit cards of 2024, comparing annual fees, sign-up bonuses, earning rates, and redemption options to help you make an informed decision.',
    author: 'Finance Expert',
    category: 'travel-tips',
    country: 'Global',
    tags: ['Credit Cards', 'Travel Rewards', 'Finance', 'Tips'],
    featured: false,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&q=80&w=2400',
    photographer: {
      name: 'Finance Photographer',
      url: 'https://unsplash.com/@financephoto'
    },
    metaTitle: 'Best Travel Credit Cards 2024',
    metaDescription: 'Compare top travel credit cards and maximize your rewards.'
  },
  {
    id: '9',
    slug: 'bangkok-street-food',
    title: 'Bangkok Street Food: A Culinary Adventure',
    excerpt: 'Navigate Bangkok\'s vibrant street food scene like a local, from pad Thai stalls to exotic fruit markets.',
    content: 'Bangkok\'s street food scene is a symphony of flavors, aromas, and textures that tells the story of Thailand\'s rich culinary heritage. From the iconic pad Thai vendors of Thip Samai to the bustling night markets where exotic fruits and traditional sweets tempt passersby, the city\'s street food offers an authentic taste of Thai culture. Our insider\'s guide takes you beyond the tourist traps to discover hidden gems where locals gather, sharing the best stalls, must-try dishes, and cultural etiquette for navigating this delicious world.',
    author: 'Food Writer',
    category: 'food',
    country: 'Thailand',
    tags: ['Bangkok', 'Street Food', 'Thai Cuisine', 'Food Tour'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&q=80&w=2400',
    photographer: {
      name: 'Bangkok Photographer',
      url: 'https://unsplash.com/@bangkokphoto'
    },
    metaTitle: 'Bangkok Street Food Guide',
    metaDescription: 'Discover authentic Thai street food in Bangkok.'
  },
  {
    id: '10',
    slug: 'iceland-road-trip',
    title: 'Iceland Ring Road: Ultimate 10-Day Road Trip',
    excerpt: 'Drive the famous Route 1 around Iceland and discover stunning landscapes, hot springs, and Viking history.',
    content: 'Iceland\'s Ring Road (Route 1) is one of the world\'s most spectacular drives, circling the entire island nation and offering access to some of nature\'s most dramatic displays. From the black sand beaches of Reynisfjara to the geothermal wonders of Geysir and the majestic waterfalls of Seljalandsfoss and Skógafoss, this 1,332-kilometer journey showcases Iceland\'s incredible diversity. Our comprehensive 10-day itinerary includes the best stops, accommodation options, driving tips, and seasonal considerations for an unforgettable adventure.',
    author: 'Adventure Guide',
    category: 'adventure',
    country: 'Iceland',
    tags: ['Iceland', 'Road Trip', 'Nature', 'Driving'],
    featured: true,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&q=80&w=2400',
    photographer: {
      name: 'Iceland Photographer',
      url: 'https://unsplash.com/@icelandphoto'
    },
    metaTitle: 'Iceland Ring Road Trip Guide',
    metaDescription: 'Complete guide to driving Iceland\'s famous Route 1.'
  },
  {
    id: '11',
    slug: 'machu-picchu-guide',
    title: 'Machu Picchu: Complete Visitor\'s Guide',
    excerpt: 'Plan your perfect trip to the ancient Incan citadel with our comprehensive guide to permits, hikes, and tips.',
    content: 'Perched high in the Andes Mountains, Machu Picchu stands as one of humanity\'s greatest architectural achievements and most mysterious archaeological sites. Built by the Inca Empire in the 15th century and abandoned during the Spanish conquest, this UNESCO World Heritage site continues to captivate visitors with its sophisticated stonework, terraced fields, and breathtaking mountain setting. Our complete guide covers everything you need to know, from securing permits and choosing the best time to visit to hiking options and cultural insights.',
    author: 'Archaeology Expert',
    category: 'culture',
    country: 'Peru',
    tags: ['Machu Picchu', 'Peru', 'Inca', 'Archaeology'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1587595437715-1b0e0f8b01dd?auto=format&q=80&w=2400',
    photographer: {
      name: 'Peru Photographer',
      url: 'https://unsplash.com/@peruphoto'
    },
    metaTitle: 'Machu Picchu Visitor Guide',
    metaDescription: 'Complete guide to visiting the ancient Incan citadel.'
  },
  {
    id: '12',
    slug: 'santorini-greece',
    title: 'Santorini: Beyond the Sunset Photos',
    excerpt: 'Discover the real Santorini with authentic Greek experiences, local tavernas, and hidden beaches.',
    content: 'While Santorini\'s iconic blue-domed churches and dramatic sunsets draw millions of visitors annually, the island offers so much more than picture-perfect moments. Beyond the crowded tourist spots lies an authentic Greek island experience featuring family-run tavernas serving fresh seafood, volcanic beaches with unique red and black sands, and traditional villages where life moves at a slower pace. Our insider\'s guide reveals the best ways to experience Santorini like a local, from wine tasting at family vineyards to exploring archaeological sites that predate the famous eruption.',
    author: 'Greece Expert',
    category: 'destinations',
    country: 'Greece',
    tags: ['Santorini', 'Greece', 'Islands', 'Mediterranean'],
    featured: false,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&q=80&w=2400',
    photographer: {
      name: 'Santorini Photographer',
      url: 'https://unsplash.com/@santoriniphoto'
    },
    metaTitle: 'Authentic Santorini Travel Guide',
    metaDescription: 'Experience real Santorini beyond the tourist spots.'
  },
  {
    id: '13',
    slug: 'vietnam-coffee-culture',
    title: 'Vietnam\'s Coffee Culture: From Bean to Cup',
    excerpt: 'Explore Vietnam\'s unique coffee scene, from traditional phin filters to trendy cafes in Ho Chi Minh City.',
    content: 'Vietnam\'s coffee culture is as rich and complex as the beverage itself, reflecting centuries of French colonial influence blended with local innovation and resourcefulness. From the slow-drip phin filters that produce the perfect ca phe sua da to the bustling coffee shops that serve as social hubs in every neighborhood, coffee is deeply woven into Vietnamese daily life. Our comprehensive guide explores the country\'s coffee regions, traditional brewing methods, and the evolution of Vietnam\'s coffee scene from a French import to a global export powerhouse.',
    author: 'Coffee Expert',
    category: 'food',
    country: 'Vietnam',
    tags: ['Vietnam', 'Coffee', 'Culture', 'Food'],
    featured: false,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&q=80&w=2400',
    photographer: {
      name: 'Vietnam Photographer',
      url: 'https://unsplash.com/@vietnamphoto'
    },
    metaTitle: 'Vietnam Coffee Culture Guide',
    metaDescription: 'Discover Vietnam\'s unique coffee traditions and scene.'
  },
  {
    id: '14',
    slug: 'norway-fjords-cruise',
    title: 'Norway Fjords: Ultimate Cruise Guide',
    excerpt: 'Navigate Norway\'s stunning fjords with our complete guide to cruise routes, ports, and shore excursions.',
    content: 'Norway\'s fjords represent nature\'s grandest masterpiece, where towering cliffs plunge into mirror-like waters, creating landscapes of breathtaking beauty that have inspired artists and adventurers for centuries. From the UNESCO-listed Geirangerfjord with its cascading waterfalls to the dramatic Sognefjord, the longest and deepest fjord in Norway, these natural wonders offer an unparalleled cruising experience. Our comprehensive guide covers the best cruise itineraries, must-visit ports, shore excursion options, and practical tips for making the most of your Norwegian fjord adventure.',
    author: 'Cruise Specialist',
    category: 'cruises',
    country: 'Norway',
    tags: ['Norway', 'Fjords', 'Cruise', 'Scandinavia'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=2400',
    photographer: {
      name: 'Norway Photographer',
      url: 'https://unsplash.com/@norwayphoto'
    },
    metaTitle: 'Norway Fjords Cruise Guide',
    metaDescription: 'Complete guide to cruising Norway\'s spectacular fjords.'
  },
  {
    id: '15',
    slug: 'marrakech-souks',
    title: 'Marrakech Souks: A Shopper\'s Paradise',
    excerpt: 'Navigate the labyrinthine markets of Marrakech with insider tips on bargaining, authentic crafts, and hidden gems.',
    content: 'The souks of Marrakech are a sensory overload of sights, sounds, and smells that transport visitors into a medieval marketplace where traditional crafts and modern commerce coexist. From the intricate metalwork of the Seffarine Square to the colorful textiles of the dyers\' souk, each area specializes in different crafts passed down through generations. Our insider\'s guide provides practical advice for navigating this bustling bazaar, from mastering the art of bargaining to identifying quality authentic crafts and discovering the hidden gems that most tourists miss.',
    author: 'Shopping Expert',
    category: 'culture',
    country: 'Morocco',
    tags: ['Marrakech', 'Souks', 'Shopping', 'Markets'],
    featured: false,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73fb6?auto=format&q=80&w=2400',
    photographer: {
      name: 'Morocco Photographer',
      url: 'https://unsplash.com/@moroccophoto'
    },
    metaTitle: 'Marrakech Souks Shopping Guide',
    metaDescription: 'Navigate Marrakech markets like a local.'
  },
  {
    id: '16',
    slug: 'patagonia-hiking',
    title: 'Patagonia Hiking: Torres del Paine Trek',
    excerpt: 'Conquer one of the world\'s most spectacular hiking routes through Patagonia\'s dramatic landscapes.',
    content: 'Torres del Paine National Park in Chilean Patagonia offers some of the world\'s most spectacular hiking experiences, where turquoise lakes reflect granite towers, glaciers calve into milky rivers, and guanacos roam freely across the steppe. The W Trek and O Circuit are legendary routes that challenge and reward hikers with breathtaking scenery at every turn. Our comprehensive guide covers everything from choosing the right itinerary and packing essentials to navigating park logistics and understanding the unique Patagonian ecosystem.',
    author: 'Hiking Guide',
    category: 'adventure',
    country: 'Chile',
    tags: ['Patagonia', 'Hiking', 'Torres del Paine', 'Chile'],
    featured: true,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=2400',
    photographer: {
      name: 'Patagonia Photographer',
      url: 'https://unsplash.com/@patagoniaphoto'
    },
    metaTitle: 'Torres del Paine Hiking Guide',
    metaDescription: 'Complete guide to hiking in Patagonia\'s Torres del Paine.'
  },
  {
    id: '17',
    slug: 'dubai-modern-marvels',
    title: 'Dubai: City of Superlatives',
    excerpt: 'Explore Dubai\'s architectural wonders, luxury shopping, and cultural attractions in this desert metropolis.',
    content: 'Dubai has transformed from a small fishing village into a glittering metropolis that pushes the boundaries of what\'s possible in architecture, luxury, and entertainment. From the world\'s tallest building, the Burj Khalifa, to the palm-shaped artificial islands that have become engineering marvels, Dubai showcases humanity\'s capacity for ambitious dreams. Our comprehensive guide explores the city\'s most iconic attractions, luxury experiences, cultural sites, and practical tips for navigating this dynamic destination.',
    author: 'Luxury Travel Expert',
    category: 'urban',
    country: 'UAE',
    tags: ['Dubai', 'Luxury', 'Architecture', 'Modern'],
    featured: false,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&q=80&w=2400',
    photographer: {
      name: 'Dubai Photographer',
      url: 'https://unsplash.com/@dubaiphoto'
    },
    metaTitle: 'Dubai Travel Guide',
    metaDescription: 'Discover Dubai\'s luxury and modern attractions.'
  },
  {
    id: '18',
    slug: 'kyoto-temples',
    title: 'Kyoto Temple Guide: Ancient and Modern',
    excerpt: 'Discover Kyoto\'s 2,000+ temples and shrines, from the famous Golden Pavilion to hidden local favorites.',
    content: 'Kyoto serves as Japan\'s spiritual and cultural heart, home to over 2,000 temples and shrines that represent 1,200 years of Buddhist and Shinto traditions. From the iconic golden walls of Kinkaku-ji (Golden Pavilion) to the serene rock gardens of Ryoan-ji and the mystical red gates of Fushimi Inari Shrine, each site offers unique insights into Japanese religious and aesthetic traditions. Our comprehensive guide helps you navigate this spiritual landscape, providing historical context, visiting tips, and insights into temple etiquette.',
    author: 'Cultural Guide',
    category: 'culture',
    country: 'Japan',
    tags: ['Kyoto', 'Temples', 'Japan', 'Spirituality'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&q=80&w=2400',
    photographer: {
      name: 'Kyoto Photographer',
      url: 'https://unsplash.com/@kyotophoto'
    },
    metaTitle: 'Kyoto Temples and Shrines Guide',
    metaDescription: 'Explore Kyoto\'s spiritual heritage and temple culture.'
  },
  {
    id: '19',
    slug: 'amalfi-coast-driving',
    title: 'Amalfi Coast: Scenic Driving Guide',
    excerpt: 'Navigate Italy\'s most beautiful coastal road with tips for parking, viewpoints, and avoiding the crowds.',
    content: 'The Amalfi Coast\'s SS163 highway is widely regarded as one of the world\'s most scenic drives, clinging precariously to cliffs that plunge dramatically into the Tyrrhenian Sea. This 50-kilometer stretch of road connects colorful villages perched on steep terraces, offering breathtaking views at every turn. Our detailed driving guide covers the best routes, parking strategies, viewpoints, and timing tips to help you experience this UNESCO World Heritage site safely and memorably.',
    author: 'Italy Expert',
    category: 'adventure',
    country: 'Italy',
    tags: ['Amalfi Coast', 'Driving', 'Italy', 'Scenic Routes'],
    featured: false,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73fb6?auto=format&q=80&w=2400',
    photographer: {
      name: 'Amalfi Photographer',
      url: 'https://unsplash.com/@amalfiphoto'
    },
    metaTitle: 'Amalfi Coast Driving Guide',
    metaDescription: 'Navigate Italy\'s spectacular coastal roads safely.'
  },
  {
    id: '20',
    slug: 'cappadocia-balloon-ride',
    title: 'Cappadocia: Hot Air Balloon Adventure',
    excerpt: 'Soar above Turkey\'s otherworldly landscapes in a hot air balloon for the ultimate Cappadocia experience.',
    content: 'Cappadocia\'s surreal landscape of fairy chimneys, rock formations, and underground cities takes on an otherworldly beauty when viewed from above. A hot air balloon ride at sunrise offers a unique perspective on this geological wonder, floating silently over valleys that have been shaped by millions of years of volcanic activity and erosion. Our comprehensive guide covers everything you need to know about this bucket-list experience, from choosing the right operator and best time of year to what to expect during the flight.',
    author: 'Adventure Writer',
    category: 'adventure',
    country: 'Turkey',
    tags: ['Cappadocia', 'Balloon', 'Turkey', 'Aerial'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&q=80&w=2400',
    photographer: {
      name: 'Cappadocia Photographer',
      url: 'https://unsplash.com/@cappadociaphoto'
    },
    metaTitle: 'Cappadocia Balloon Ride Guide',
    metaDescription: 'Experience Cappadocia from above in a hot air balloon.'
  },
  {
    id: '21',
    slug: 'singapore-food-guide',
    title: 'Singapore Food Guide: Hawker to High-End',
    excerpt: 'Navigate Singapore\'s diverse food scene, from Michelin-starred hawker stalls to rooftop fine dining.',
    content: 'Singapore\'s food scene is a perfect reflection of its multicultural heritage, offering everything from $3 Michelin-starred hawker dishes to world-class fine dining with city views. The city-state\'s hawker centers preserve culinary traditions from Chinese, Malay, Indian, and Peranakan communities, while innovative chefs push boundaries in rooftop restaurants and hidden speakeasies. Our comprehensive guide helps you navigate this delicious landscape, from must-try dishes and famous hawker centers to booking strategies for popular restaurants.',
    author: 'Food Critic',
    category: 'food',
    country: 'Singapore',
    tags: ['Singapore', 'Food', 'Hawker', 'Fine Dining'],
    featured: false,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&q=80&w=2400',
    photographer: {
      name: 'Singapore Photographer',
      url: 'https://unsplash.com/@singaporephoto'
    },
    metaTitle: 'Singapore Food Scene Guide',
    metaDescription: 'Explore Singapore\'s diverse culinary landscape.'
  },
  {
    id: '22',
    slug: 'yellowstone-winter',
    title: 'Yellowstone in Winter: Magical and Mysterious',
    excerpt: 'Experience America\'s first national park transformed by snow, with fewer crowds and unique wildlife viewing.',
    content: 'Yellowstone National Park takes on an entirely different character in winter, when snow transforms the landscape into a pristine wonderland and geothermal features create dramatic steam displays against the cold. With most roads closed to cars, winter visitors can explore via snowmobile, snowcoach, or cross-country skis, offering intimate encounters with wildlife that has adapted to the harsh conditions. Our winter guide covers the best ways to experience Yellowstone\'s magic, from photography tips to wildlife viewing strategies.',
    author: 'Nature Guide',
    category: 'nature',
    country: 'United States',
    tags: ['Yellowstone', 'Winter', 'National Parks', 'Wildlife'],
    featured: false,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&q=80&w=2400',
    photographer: {
      name: 'Yellowstone Photographer',
      url: 'https://unsplash.com/@yellowstonephoto'
    },
    metaTitle: 'Yellowstone Winter Guide',
    metaDescription: 'Experience Yellowstone National Park in winter.'
  },
  {
    id: '23',
    slug: 'prague-christmas-markets',
    title: 'Prague Christmas Markets: Holiday Magic',
    excerpt: 'Experience the most beautiful Christmas markets in Europe with mulled wine, crafts, and medieval charm.',
    content: 'Prague\'s Christmas markets transform the city\'s historic squares into winter wonderlands, where the scent of mulled wine and roasted chestnuts fills the air and medieval architecture provides a stunning backdrop for holiday festivities. From the famous Old Town Square market with its massive Christmas tree to the charming markets in Wenceslas Square and Prague Castle, each venue offers unique crafts, traditional foods, and cultural performances. Our guide helps you make the most of this magical season, with tips on the best markets, must-try treats, and timing to avoid crowds.',
    author: 'Holiday Expert',
    category: 'culture',
    country: 'Czech Republic',
    tags: ['Prague', 'Christmas', 'Markets', 'Holiday'],
    featured: false,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1544737151-6e4b789de6b4?auto=format&q=80&w=2400',
    photographer: {
      name: 'Prague Photographer',
      url: 'https://unsplash.com/@praguephoto'
    },
    metaTitle: 'Prague Christmas Markets Guide',
    metaDescription: 'Experience magical Christmas markets in Prague.'
  },
  {
    id: '24',
    slug: 'great-barrier-reef',
    title: 'Great Barrier Reef: Snorkeling and Diving Guide',
    excerpt: 'Explore the world\'s largest coral reef system with our complete guide to the best dive sites and marine life.',
    content: 'The Great Barrier Reef is nature\'s underwater masterpiece, stretching over 2,300 kilometers along Australia\'s northeast coast and home to an incredible diversity of marine life. From vibrant coral gardens teeming with tropical fish to encounters with majestic sea turtles and reef sharks, this UNESCO World Heritage site offers unforgettable underwater experiences for snorkelers and divers of all levels. Our comprehensive guide covers the best time to visit, top dive sites, safety considerations, and conservation efforts to protect this natural wonder.',
    author: 'Marine Expert',
    category: 'nature',
    country: 'Australia',
    tags: ['Great Barrier Reef', 'Snorkeling', 'Diving', 'Marine Life'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&q=80&w=2400',
    photographer: {
      name: 'Reef Photographer',
      url: 'https://unsplash.com/@reefphoto'
    },
    metaTitle: 'Great Barrier Reef Diving Guide',
    metaDescription: 'Explore the world\'s largest coral reef system.'
  },
  {
    id: '25',
    slug: 'budapest-thermal-baths',
    title: 'Budapest Thermal Baths: Historic and Healing',
    excerpt: 'Discover Budapest\'s famous thermal baths, from the magnificent Széchenyi to hidden local favorites.',
    content: 'Budapest\'s thermal baths are living links to the city\'s rich history, where healing waters that have flowed beneath the city for millennia are channeled into architectural masterpieces that blend Ottoman, Art Nouveau, and contemporary designs. From the grand Széchenyi Baths with their yellow facade and outdoor pools to the intimate Rudas Baths in a 16th-century Ottoman building, each facility offers unique experiences and therapeutic benefits. Our comprehensive guide covers the history, etiquette, and practical tips for making the most of Budapest\'s thermal bathing culture.',
    author: 'Wellness Writer',
    category: 'culture',
    country: 'Hungary',
    tags: ['Budapest', 'Thermal Baths', 'Spa', 'Wellness'],
    featured: false,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&q=80&w=2400',
    photographer: {
      name: 'Budapest Photographer',
      url: 'https://unsplash.com/@budapestphoto'
    },
    metaTitle: 'Budapest Thermal Baths Guide',
    metaDescription: 'Experience Budapest\'s historic thermal bathing culture.'
  },
  {
    id: '26',
    slug: 'swiss-alps-train',
    title: 'Swiss Alps by Train: Scenic Rail Journeys',
    excerpt: 'Travel through the Swiss Alps on legendary trains like the Glacier Express and Bernina Express.',
    content: 'Switzerland\'s alpine railway system is an engineering marvel that allows travelers to experience some of Europe\'s most spectacular landscapes from the comfort of panoramic train cars. The Glacier Express, known as the slowest express train in the world, takes eight hours to travel between Zermatt and St. Moritz, offering breathtaking views of the Swiss Alps. Our comprehensive guide covers the most scenic routes, ticket options, booking strategies, and tips for making the most of these unforgettable rail journeys.',
    author: 'Rail Travel Expert',
    category: 'adventure',
    country: 'Switzerland',
    tags: ['Swiss Alps', 'Train', 'Scenic Routes', 'Europe'],
    featured: false,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=2400',
    photographer: {
      name: 'Swiss Photographer',
      url: 'https://unsplash.com/@swissphoto'
    },
    metaTitle: 'Swiss Alps Train Journeys',
    metaDescription: 'Experience Switzerland\'s scenic rail routes.'
  },
  {
    id: '27',
    slug: 'rio-carnival-guide',
    title: 'Rio Carnival: Ultimate Guide to the World\'s Biggest Party',
    excerpt: 'Experience Rio de Janeiro\'s world-famous Carnival with tips on parades, samba schools, and safety.',
    content: 'Rio de Janeiro\'s Carnival is the world\'s largest and most famous festival, a spectacular celebration of music, dance, and culture that transforms the city into a non-stop party for four days. From the elaborate parades of the Sambadrome where samba schools compete with dazzling costumes and floats to the street parties (blocos) that take over every neighborhood, Carnival offers an unparalleled cultural experience. Our comprehensive guide provides practical advice for experiencing this incredible event, from choosing the best seats to understanding the cultural significance.',
    author: 'Festival Expert',
    category: 'culture',
    country: 'Brazil',
    tags: ['Rio', 'Carnival', 'Festival', 'Brazil'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&q=80&w=2400',
    photographer: {
      name: 'Rio Photographer',
      url: 'https://unsplash.com/@riophoto'
    },
    metaTitle: 'Rio Carnival Complete Guide',
    metaDescription: 'Experience the world\'s biggest party in Rio de Janeiro.'
  },
  {
    id: '28',
    slug: 'scotland-highlands',
    title: 'Scottish Highlands: Castles and Lochs',
    excerpt: 'Explore Scotland\'s dramatic Highlands with visits to ancient castles, mysterious lochs, and whisky distilleries.',
    content: 'Scotland\'s Highlands are a landscape of raw natural beauty and ancient history, where mist-shrouded mountains meet deep lochs and medieval castles stand as silent witnesses to centuries of clan warfare and royal intrigue. From the mysterious waters of Loch Ness to the imposing walls of Stirling Castle and the windswept Isle of Skye, the Highlands offer endless opportunities for exploration and discovery. Our comprehensive guide covers the best driving routes, must-visit sites, accommodation options, and cultural experiences in this legendary region.',
    author: 'Scotland Expert',
    category: 'culture',
    country: 'United Kingdom',
    tags: ['Scotland', 'Highlands', 'Castles', 'Lochs'],
    featured: false,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&q=80&w=2400',
    photographer: {
      name: 'Scotland Photographer',
      url: 'https://unsplash.com/@scotlandphoto'
    },
    metaTitle: 'Scottish Highlands Travel Guide',
    metaDescription: 'Explore Scotland\'s dramatic landscapes and history.'
  },
  {
    id: '29',
    slug: 'bali-rice-terraces',
    title: 'Bali Rice Terraces: Cultural Landscape Guide',
    excerpt: 'Discover Bali\'s UNESCO-listed rice terraces and learn about the island\'s unique agricultural traditions.',
    content: 'Bali\'s rice terraces are not just agricultural marvels but living cultural landscapes that represent the harmonious relationship between the Balinese people and their environment. The subak system, recognized by UNESCO as a World Heritage site, demonstrates sophisticated water management techniques developed over 1,000 years ago. Our comprehensive guide explores the most beautiful rice terrace locations, explains the cultural significance of rice in Balinese life, and provides tips for respectful and meaningful visits to these working agricultural sites.',
    author: 'Cultural Anthropologist',
    category: 'culture',
    country: 'Indonesia',
    tags: ['Bali', 'Rice Terraces', 'Agriculture', 'UNESCO'],
    featured: false,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&q=80&w=2400',
    photographer: {
      name: 'Bali Photographer',
      url: 'https://unsplash.com/@baliphoto'
    },
    metaTitle: 'Bali Rice Terraces Guide',
    metaDescription: 'Explore Bali\'s cultural agricultural landscapes.'
  },
  {
    id: '30',
    slug: 'canadian-rockies',
    title: 'Canadian Rockies: Banff and Jasper Adventure',
    excerpt: 'Explore Canada\'s spectacular Rocky Mountain national parks with wildlife viewing and outdoor activities.',
    content: 'The Canadian Rockies offer some of North America\'s most spectacular mountain scenery, where turquoise lakes reflect snow-capped peaks and wildlife roams freely through pristine wilderness. Banff and Jasper National Parks provide endless opportunities for outdoor adventure, from hiking trails that lead to hidden alpine meadows to scenic drives that offer breathtaking viewpoints at every turn. Our comprehensive guide covers the best times to visit, must-see attractions, wildlife viewing tips, and outdoor activity options for every skill level.',
    author: 'Outdoor Adventure Guide',
    category: 'nature',
    country: 'Canada',
    tags: ['Canadian Rockies', 'Banff', 'Jasper', 'Wildlife'],
    featured: true,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&q=80&w=2400',
    photographer: {
      name: 'Canada Photographer',
      url: 'https://unsplash.com/@canadaphoto'
    },
    metaTitle: 'Canadian Rockies Travel Guide',
    metaDescription: 'Explore Banff and Jasper National Parks.'
  }
 ];

/**
 * Mock categories for development and testing
 */
export const mockCategories = [
  "adventure",
  "culture",
  "food",
  "nature",
  "urban",
  "hotels",
  "airlines",
  "cruises",
  "destinations"
];

/**
 * Mock countries for development and testing
 */
export const mockCountries = [
  "japan",
  "tanzania",
  "italy",
  "france",
  "thailand",
  "australia",
  "united-states",
  "brazil",
  "south-africa"
];

/**
 * Mock tags for development and testing
 */
export const mockTags = [
  "temples",
  "wildlife",
  "culinary",
  "history",
  "beaches",
  "mountains",
  "cities",
  "luxury",
  "budget"
];
