/**
 * mockRecipes.ts
 * ──────────────
 * In-memory mock dataset keyed by ISO 3166-1 alpha-2 country codes.
 */

export interface Recipe {
  id: string;
  name: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  description: string;
}

export interface CountryData {
  countryName: string;
  flag: string;
  recipes: Recipe[];
}

export const mockRecipes: Record<string, CountryData> = {
  IT: {
    countryName: 'Italy',
    flag: '🇮🇹',
    recipes: [
      {
        id: 'it-01',
        name: 'Neapolitan Pizza Margherita',
        difficulty: 'Medium',
        prepTime: '30 min',
        cookTime: '10 min',
        ingredients: [
          'pizza dough',
          'San Marzano tomatoes',
          'mozzarella di bufala',
          'fresh basil',
          'extra-virgin olive oil',
        ],
        description:
          'The classic Neapolitan pizza with a puffy, leopard-charred crust. Certified STG by the EU.',
      },
      {
        id: 'it-02',
        name: 'Cacio e Pepe',
        difficulty: 'Hard',
        prepTime: '5 min',
        cookTime: '15 min',
        ingredients: [
          'tonnarelli pasta',
          'Pecorino Romano DOP',
          'Parmigiano-Reggiano',
          'freshly cracked black pepper',
        ],
        description:
          'A deceptively simple Roman pasta — only three ingredients, but technique is everything.',
      },
    ],
  },

  JP: {
    countryName: 'Japan',
    flag: '🇯🇵',
    recipes: [
      {
        id: 'jp-01',
        name: 'Tonkotsu Ramen',
        difficulty: 'Hard',
        prepTime: '30 min',
        cookTime: '10 hours',
        ingredients: [
          'pork trotters & neck bones',
          'ramen noodles',
          'soy tare',
          'chashu pork belly',
          'soft-boiled marinated egg',
          'nori',
          'green onion',
        ],
        description:
          'Rich, milky pork-bone broth ramen from Fukuoka. Long simmer is non-negotiable.',
      },
      {
        id: 'jp-02',
        name: 'Tamagoyaki',
        difficulty: 'Easy',
        prepTime: '5 min',
        cookTime: '10 min',
        ingredients: ['eggs', 'dashi', 'soy sauce', 'mirin', 'sugar'],
        description:
          'A sweet, layered rolled omelette — a staple of Japanese bento boxes.',
      },
    ],
  },

  MX: {
    countryName: 'Mexico',
    flag: '🇲🇽',
    recipes: [
      {
        id: 'mx-01',
        name: 'Tacos al Pastor',
        difficulty: 'Medium',
        prepTime: '4 hours',
        cookTime: '25 min',
        ingredients: [
          'pork shoulder',
          'dried guajillo & ancho chiles',
          'achiote paste',
          'pineapple',
          'corn tortillas',
          'cilantro',
          'white onion',
          'lime',
        ],
        description:
          'Vertical spit-roasted marinated pork with caramelised pineapple — street food royalty.',
      },
    ],
  },

  IN: {
    countryName: 'India',
    flag: '🇮🇳',
    recipes: [
      {
        id: 'in-01',
        name: 'Chicken Tikka Masala',
        difficulty: 'Medium',
        prepTime: '1 hour',
        cookTime: '30 min',
        ingredients: [
          'chicken thighs',
          'full-fat yogurt',
          'garam masala',
          'crushed tomatoes',
          'heavy cream',
          'ginger',
          'garlic',
          'fenugreek leaves',
        ],
        description:
          'Charred tandoor-marinated chicken in a velvety tomato-cream sauce.',
      },
      {
        id: 'in-02',
        name: 'Dal Makhani',
        difficulty: 'Easy',
        prepTime: '8 hours (soaking)',
        cookTime: '1 hour',
        ingredients: [
          'whole black urad lentils',
          'red kidney beans',
          'butter',
          'double cream',
          'tomato puree',
          'cumin',
          'coriander',
          'garam masala',
        ],
        description:
          'Slow-cooked midnight-black lentils enriched with butter and cream. Better the next day.',
      },
    ],
  },

  FR: {
    countryName: 'France',
    flag: '🇫🇷',
    recipes: [
      {
        id: 'fr-01',
        name: 'Boeuf Bourguignon',
        difficulty: 'Hard',
        prepTime: '30 min',
        cookTime: '3 hours',
        ingredients: [
          'beef chuck',
          'red Burgundy wine',
          'lardon bacon',
          'cremini mushrooms',
          'pearl onions',
          'carrots',
          'thyme',
          'bay leaf',
        ],
        description:
          "Julia Child's definitive slow-braised Burgundian beef stew. Don't rush the wine.",
      },
    ],
  },

  GR: {
    countryName: 'Greece',
    flag: '🇬🇷',
    recipes: [
      {
        id: 'gr-01',
        name: 'Spanakopita',
        difficulty: 'Medium',
        prepTime: '40 min',
        cookTime: '45 min',
        ingredients: [
          'phyllo pastry',
          'fresh spinach',
          'feta cheese',
          'eggs',
          'dill',
          'spring onions',
          'olive oil',
        ],
        description:
          'Crispy layered phyllo pie stuffed with spinach and salty feta.',
      },
    ],
  },
};

export const getRecipesByCountryName = (countryName: string): CountryData | null =>
  Object.values(mockRecipes).find(
    (entry) => entry.countryName.toLowerCase() === countryName.toLowerCase()
  ) ?? null;
