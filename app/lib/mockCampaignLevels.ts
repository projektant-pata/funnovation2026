export type CampaignLocale = 'cs' | 'en'

export type LocalizedText = Record<CampaignLocale, string>

export interface CampaignCutsceneCharacter {
  id: string
  name: LocalizedText
  side: 'left' | 'right'
  avatar?: string
}

export interface CampaignCutsceneLine {
  speakerId: string
  text: LocalizedText
}

export interface CampaignIngredient {
  id: string
  name: LocalizedText
  amount: LocalizedText
}

export interface CampaignStep {
  id: string
  title: LocalizedText
  instruction: LocalizedText
  tip?: LocalizedText
  suggestedSeconds?: number
}

export interface CampaignLevelDefinition {
  nodeId: string
  title: LocalizedText
  subtitle: LocalizedText
  recipeName: LocalizedText
  objective: LocalizedText
  estimatedTime: LocalizedText
  difficulty: number
  xpReward: number
  requirements: LocalizedText[]
  ingredients: CampaignIngredient[]
  cutscene: {
    title: LocalizedText
    setting: LocalizedText
    backgroundOptions: string[]
    characters: CampaignCutsceneCharacter[]
    lines: CampaignCutsceneLine[]
  }
  steps: CampaignStep[]
  completion: {
    title: LocalizedText
    subtitle: LocalizedText
    reflectionPrompts: LocalizedText[]
  }
}

export const campaignLevels: CampaignLevelDefinition[] = [
  {
    nodeId: 'n1',
    title: {
      cs: 'První večeře',
      en: 'First Dinner',
    },
    subtitle: {
      cs: 'Kde to všechno začalo',
      en: 'Where it all began',
    },
    recipeName: {
      cs: 'Špagety aglio e olio',
      en: 'Spaghetti Aglio e Olio',
    },
    objective: {
      cs: 'Uvař první plnohodnotnou večeři a zvládni práci s česnekem a těstovinou.',
      en: 'Cook your first complete dinner and master garlic and pasta timing.',
    },
    estimatedTime: {
      cs: '15-20 min',
      en: '15-20 min',
    },
    difficulty: 1,
    xpReward: 100,
    requirements: [
      {
        cs: 'Základní hrnec a pánev',
        en: 'Basic pot and pan',
      },
      {
        cs: 'Sporák',
        en: 'Stove',
      },
    ],
    ingredients: [
      {
        id: 'n1-i1',
        name: { cs: 'Špagety', en: 'Spaghetti' },
        amount: { cs: '120 g', en: '120 g' },
      },
      {
        id: 'n1-i2',
        name: { cs: 'Česnek', en: 'Garlic' },
        amount: { cs: '2 stroužky', en: '2 cloves' },
      },
      {
        id: 'n1-i3',
        name: { cs: 'Olivový olej', en: 'Olive oil' },
        amount: { cs: '2 lžíce', en: '2 tbsp' },
      },
      {
        id: 'n1-i4',
        name: { cs: 'Petržel', en: 'Parsley' },
        amount: { cs: '1 lžíce', en: '1 tbsp' },
      },
    ],
    cutscene: {
      title: {
        cs: 'První den na intru',
        en: 'First Day at the Dorm',
      },
      setting: {
        cs: 'Pátek odpoledne. Malý pokoj na internátě — dvě postele, skříň, výhled na parkoviště. Kufr ještě nerozbalený.',
        en: 'Friday afternoon. A small dorm room — two beds, a wardrobe, a view of the parking lot. Suitcase still packed.',
      },
      backgroundOptions: [
        '/scenes/first/dorm-room.jpg',
        '/scenes/first/dorm-room-evening.jpg',
      ],
      characters: [
        {
          id: 'hero',
          name: { cs: 'Ty', en: 'You' },
          side: 'right',
          avatar: '/chefs/stefy.png',
        },
      ],
      lines: [
        {
          speakerId: 'hero',
          text: {
            cs: 'Vlastně to není žádné velké loučení. Za čtrnáct dní jsem zase doma.',
            en: 'It is not really a big goodbye. I will be home again in two weeks.',
          },
        },
        {
          speakerId: 'hero',
          text: {
            cs: 'Máma mi napakovala jídlo na celý měsíc. Salám, fazole, tři druhy těstovin. Vzal jsem si.',
            en: 'Mom packed enough food for a month. Sausage, beans, three kinds of pasta. I took it.',
          },
        },
        {
          speakerId: 'hero',
          text: {
            cs: 'Takže tohle je to. Deset metrů čtverečních, výhled na kontejnery. Krásné.',
            en: 'So this is it. Ten square metres, a view of the bins. Beautiful.',
          },
        },
        {
          speakerId: 'hero',
          text: {
            cs: 'Říkali, že tu je společná kuchyňka. Čas zjistit, co se dá udělat z těchhle věcí.',
            en: 'They said there is a shared kitchen. Time to find out what I can make with this stuff.',
          },
        },
      ],
    },
    steps: [
      {
        id: 'n1-s1',
        title: { cs: 'Připrav vodu', en: 'Prep the water' },
        instruction: {
          cs: 'Dej vařit osolenou vodu na těstoviny.',
          en: 'Bring salted water to a boil for pasta.',
        },
      },
      {
        id: 'n1-s2',
        title: { cs: 'Nakrájej česnek', en: 'Slice garlic' },
        instruction: {
          cs: 'Česnek nakrájej na tenké plátky.',
          en: 'Slice garlic into thin pieces.',
        },
      },
      {
        id: 'n1-s3',
        title: { cs: 'Uvař špagety', en: 'Cook spaghetti' },
        instruction: {
          cs: 'Špagety vař al dente podle obalu.',
          en: 'Cook spaghetti al dente according to package instructions.',
        },
        tip: {
          cs: 'Schovej si půl hrnku vody z těstovin.',
          en: 'Reserve half a cup of pasta water.',
        },
      },
      {
        id: 'n1-s4',
        title: { cs: 'Rozehřej olej', en: 'Heat oil' },
        instruction: {
          cs: 'Na pánvi zahřej olivový olej na mírném plameni.',
          en: 'Heat olive oil in a pan over low heat.',
        },
      },
      {
        id: 'n1-s5',
        title: { cs: 'Krátce orestuj česnek', en: 'Quickly saute garlic' },
        instruction: {
          cs: 'Přidej česnek a míchej 30-40 sekund.',
          en: 'Add garlic and stir for 30-40 seconds.',
        },
      },
      {
        id: 'n1-s6',
        title: { cs: 'Spoj s těstovinami', en: 'Combine with pasta' },
        instruction: {
          cs: 'Vmíchej špagety a trochu vody z těstovin.',
          en: 'Toss in spaghetti and a bit of pasta water.',
        },
      },
      {
        id: 'n1-s7',
        title: { cs: 'Dochucení', en: 'Final seasoning' },
        instruction: {
          cs: 'Přidej petržel a dochuť solí.',
          en: 'Add parsley and season with salt.',
        },
      },
    ],
    completion: {
      title: {
        cs: 'První večeře hotová',
        en: 'First dinner completed',
      },
      subtitle: {
        cs: 'Skvělé. První samostatná večeře je za tebou.',
        en: 'Great. Your first independent dinner is done.',
      },
      reflectionPrompts: [
        {
          cs: 'Co se povedlo nejvíc?',
          en: 'What went best?',
        },
        {
          cs: 'Který krok byl nejtěžší?',
          en: 'Which step felt hardest?',
        },
      ],
    },
  },
  {
    nodeId: 'n2',
    title: {
      cs: 'Základní techniky',
      en: 'Core Techniques',
    },
    subtitle: {
      cs: 'Nůž, pánev, trouba',
      en: 'Knife, pan, oven',
    },
    recipeName: {
      cs: 'Francouzská omeleta s pažitkou',
      en: 'French Omelette with Chives',
    },
    objective: {
      cs: 'Nauč se kontrolovat teplotu pánve a načasování textury vajec.',
      en: 'Learn to control pan temperature and egg texture timing.',
    },
    estimatedTime: {
      cs: '12-15 min',
      en: '12-15 min',
    },
    difficulty: 2,
    xpReward: 100,
    requirements: [
      {
        cs: 'Nepřilnavá pánev',
        en: 'Non-stick pan',
      },
      {
        cs: 'Stěrka',
        en: 'Spatula',
      },
    ],
    ingredients: [
      {
        id: 'n2-i1',
        name: { cs: 'Vejce', en: 'Eggs' },
        amount: { cs: '3 ks', en: '3 pcs' },
      },
      {
        id: 'n2-i2',
        name: { cs: 'Máslo', en: 'Butter' },
        amount: { cs: '10 g', en: '10 g' },
      },
      {
        id: 'n2-i3',
        name: { cs: 'Sůl', en: 'Salt' },
        amount: { cs: 'Špetka', en: 'Pinch' },
      },
      {
        id: 'n2-i4',
        name: { cs: 'Pažitka', en: 'Chives' },
        amount: { cs: '1 lžíce', en: '1 tbsp' },
      },
      {
        id: 'n2-i5',
        name: { cs: 'Chléb', en: 'Bread' },
        amount: { cs: '1 krajíc', en: '1 slice' },
      },
    ],
    cutscene: {
      title: {
        cs: 'Spolubydlící',
        en: 'The Roommate',
      },
      setting: {
        cs: 'Druhý den. Spolubydlící přijel v noci, hodil věci na postel a spad. Ráno se potkáte na chodbě.',
        en: 'Second day. Roommate arrived in the night, dumped his stuff and crashed. Morning, you meet in the hallway.',
      },
      backgroundOptions: [
        '/scenes/second/dorm-hallway.jpg',
        '/scenes/second/dorm-kitchen.jpg',
      ],
      characters: [
        {
          id: 'hero',
          name: { cs: 'Ty', en: 'You' },
          side: 'right',
          avatar: '/chefs/stefy.png',
        },
        {
          id: 'pata',
          name: { cs: 'Páťa', en: 'Páťa' },
          side: 'left',
          avatar: '/chefs/pata.png',
        },
      ],
      lines: [
        {
          speakerId: 'hero',
          text: {
            cs: 'Spolubydlící přijel v noci. Hodil věci na postel a spad. Já taky. Dobrej první den.',
            en: 'Roommate arrived in the night. Dropped his stuff and crashed. Me too. Good first day.',
          },
        },
        {
          speakerId: 'pata',
          text: {
            cs: 'Čau, já jsem Páťa. Z Ostravy.',
            en: 'Hey, I am Páťa. From Ostrava.',
          },
        },
        {
          speakerId: 'hero',
          text: {
            cs: 'Čau. Já ze Ždírce.',
            en: 'Hey. From Ždírec.',
          },
        },
        {
          speakerId: 'pata',
          text: {
            cs: 'Kde to je?',
            en: 'Where is that?',
          },
        },
        {
          speakerId: 'hero',
          text: {
            cs: 'Přesně.',
            en: 'Exactly.',
          },
        },
        {
          speakerId: 'hero',
          text: {
            cs: 'Zmínil, že měl k obědu tyčinku z automatu. Mohl bych uvařit pro oba. Nevím co mu chutná, tak udělám něco normálního.',
            en: 'He mentioned his lunch was a vending machine bar. I could cook for both of us. No idea what he likes, so I will make something normal.',
          },
        },
      ],
    },
    steps: [
      {
        id: 'n2-s1',
        title: { cs: 'Příprava stanice', en: 'Prep your station' },
        instruction: {
          cs: 'Připrav misku, metličku, pánev a stěrku.',
          en: 'Set out a bowl, whisk, pan, and spatula.',
        },
      },
      {
        id: 'n2-s2',
        title: { cs: 'Vejce do misky', en: 'Eggs in the bowl' },
        instruction: {
          cs: 'Rozklep 3 vejce, přidej špetku soli a krátce prošlehej.',
          en: 'Crack 3 eggs, add a pinch of salt, whisk briefly.',
        },
      },
      {
        id: 'n2-s3',
        title: { cs: 'Kontrola teploty', en: 'Heat check' },
        instruction: {
          cs: 'Rozehřej pánev na střední výkon.',
          en: 'Heat the pan to medium.',
        },
        tip: {
          cs: 'Pánev má být teplá, ne kouřící.',
          en: 'The pan should be warm, not smoking.',
        },
        suggestedSeconds: 60,
      },
      {
        id: 'n2-s4',
        title: { cs: 'Přidej máslo', en: 'Add butter' },
        instruction: {
          cs: 'Rozpusť máslo a hned sniž plamen.',
          en: 'Melt butter and lower heat right away.',
        },
      },
      {
        id: 'n2-s5',
        title: { cs: 'Vlij vejce', en: 'Pour in eggs' },
        instruction: {
          cs: 'Vlij vejce a jemně míchej stěrkou po dně pánve.',
          en: 'Pour eggs in and stir gently across the pan bottom.',
        },
        suggestedSeconds: 90,
      },
      {
        id: 'n2-s6',
        title: { cs: 'Tvarování', en: 'Shape it' },
        instruction: {
          cs: 'Jakmile vejce houstnou, přestaň míchat a omeletu vytvaruj.',
          en: 'When eggs thicken, stop stirring and shape the omelette.',
        },
      },
      {
        id: 'n2-s7',
        title: { cs: 'Přeložení', en: 'Fold' },
        instruction: {
          cs: 'Přelož omeletu na třetiny a nech dojít 20-30 sekund.',
          en: 'Fold into thirds and let it finish for 20-30 seconds.',
        },
        suggestedSeconds: 30,
      },
      {
        id: 'n2-s8',
        title: { cs: 'Servírování', en: 'Serve' },
        instruction: {
          cs: 'Posyp pažitkou, přidej opečený chléb a podávej.',
          en: 'Top with chives, add toasted bread, and serve.',
        },
      },
    ],
    completion: {
      title: {
        cs: 'Technika zvládnuta',
        en: 'Technique mastered',
      },
      subtitle: {
        cs: 'Skvělá práce. Udržel jsi kontrolu nad teplotou i texturou.',
        en: 'Great job. You kept control of heat and texture.',
      },
      reflectionPrompts: [
        {
          cs: 'Kdy sis byl jistý, že je pánev správně nahřátá?',
          en: 'When did you know the pan was at the right heat?',
        },
        {
          cs: 'Co bys příště udělal ještě jemněji?',
          en: 'What would you do more gently next time?',
        },
        {
          cs: 'Který krok tě nejvíc posunul?',
          en: 'Which step improved your skill the most?',
        },
      ],
    },
  },
  {
    nodeId: 'n3',
    title: {
      cs: 'Odstěhování',
      en: 'Moving Out',
    },
    subtitle: {
      cs: 'Čas se postavit na vlastní nohy',
      en: 'Time to stand on your own feet',
    },
    recipeName: {
      cs: 'Jednohrncové rajčatové těstoviny',
      en: 'One-Pot Tomato Pasta',
    },
    objective: {
      cs: 'Uvař praktické jídlo z minima nádobí a naplánuj si porci i na zítra.',
      en: 'Cook a practical meal with minimal dishes and plan one portion for tomorrow.',
    },
    estimatedTime: {
      cs: '20-25 min',
      en: '20-25 min',
    },
    difficulty: 2,
    xpReward: 100,
    requirements: [
      {
        cs: 'Jeden větší hrnec',
        en: 'One medium-large pot',
      },
      {
        cs: 'Základní suroviny ze spíže',
        en: 'Basic pantry staples',
      },
    ],
    ingredients: [
      {
        id: 'n3-i1',
        name: { cs: 'Penne', en: 'Penne' },
        amount: { cs: '160 g', en: '160 g' },
      },
      {
        id: 'n3-i2',
        name: { cs: 'Drcená rajčata', en: 'Crushed tomatoes' },
        amount: { cs: '200 g', en: '200 g' },
      },
      {
        id: 'n3-i3',
        name: { cs: 'Cibule', en: 'Onion' },
        amount: { cs: '1/2 ks', en: '1/2 piece' },
      },
      {
        id: 'n3-i4',
        name: { cs: 'Česnek', en: 'Garlic' },
        amount: { cs: '1 stroužek', en: '1 clove' },
      },
      {
        id: 'n3-i5',
        name: { cs: 'Parmezán', en: 'Parmesan' },
        amount: { cs: 'dle chuti', en: 'to taste' },
      },
    ],
    cutscene: {
      title: {
        cs: 'Víkend solo',
        en: 'Solo Weekend',
      },
      setting: {
        cs: 'Pátek odpoledne. Páťa odjel domů. Pokoj je divně tichý.',
        en: 'Friday afternoon. Páťa went home. The room feels weirdly quiet.',
      },
      backgroundOptions: [
        '/scenes/third/dorm-room.jpg',
        '/scenes/third/dorm-kitchen.jpg',
      ],
      characters: [
        {
          id: 'hero',
          name: { cs: 'Ty', en: 'You' },
          side: 'right',
          avatar: '/chefs/stefy.png',
        },
      ],
      lines: [
        {
          speakerId: 'hero',
          text: {
            cs: 'Páťa odjel ve čtvrtek večer. Ostrava není za rohem.',
            en: 'Páťa left Thursday night. Ostrava is not exactly around the corner.',
          },
        },
        {
          speakerId: 'hero',
          text: {
            cs: 'Pokoj je divně ticho. Ani jsem nevěděl, že si na něj za tejden zvyknu.',
            en: 'The room is weirdly quiet. Did not know I would get used to him in just a week.',
          },
        },
        {
          speakerId: 'hero',
          text: {
            cs: 'Vařím sám. Zase. Ale teď je to jiný než první den. Tehdy jsem nevěděl co dělám. Teď… víceméně vím.',
            en: 'Cooking alone. Again. But it feels different from day one. Back then I had no idea. Now… more or less I do.',
          },
        },
        {
          speakerId: 'hero',
          text: {
            cs: 'Dám si něco, na co jsem měl celej týden chuť a Páťa by řekl že to zní divně. Jeho loss.',
            en: 'I will make something I have been craving all week that Páťa would say sounds weird. His loss.',
          },
        },
      ],
    },
    steps: [
      {
        id: 'n3-s1',
        title: { cs: 'Nakrájej základ', en: 'Chop base ingredients' },
        instruction: {
          cs: 'Nadrobno nakrájej cibuli a česnek.',
          en: 'Finely chop onion and garlic.',
        },
      },
      {
        id: 'n3-s2',
        title: { cs: 'Krátké orestování', en: 'Quick saute' },
        instruction: {
          cs: 'Na troše oleje orestuj cibuli a česnek.',
          en: 'Saute onion and garlic in a bit of oil.',
        },
      },
      {
        id: 'n3-s3',
        title: { cs: 'Přidej rajčata', en: 'Add tomatoes' },
        instruction: {
          cs: 'Vmíchej drcená rajčata a krátce provař.',
          en: 'Stir in crushed tomatoes and simmer briefly.',
        },
      },
      {
        id: 'n3-s4',
        title: { cs: 'Těstoviny přímo do hrnce', en: 'Pasta straight in' },
        instruction: {
          cs: 'Přidej penne a zalij vodou tak, aby byly ponořené.',
          en: 'Add penne and pour water until covered.',
        },
      },
      {
        id: 'n3-s5',
        title: { cs: 'Kontroluj konzistenci', en: 'Control consistency' },
        instruction: {
          cs: 'Vař na mírném ohni a občas promíchej.',
          en: 'Cook on low heat and stir occasionally.',
        },
        tip: {
          cs: 'Když je tekutiny málo, přidej trochu vody.',
          en: 'If liquid is low, add a splash of water.',
        },
      },
      {
        id: 'n3-s6',
        title: { cs: 'Dokončení', en: 'Finish' },
        instruction: {
          cs: 'Dochut solí, naservíruj a přidej parmezán.',
          en: 'Season with salt, plate, and add parmesan.',
        },
      },
    ],
    completion: {
      title: {
        cs: 'Samostatnost potvrzena',
        en: 'Independence unlocked',
      },
      subtitle: {
        cs: 'Zvládl jsi praktické jídlo, které funguje i druhý den.',
        en: 'You cooked a practical meal that also works for tomorrow.',
      },
      reflectionPrompts: [
        {
          cs: 'Kolik nádobí jsi použil?',
          en: 'How many dishes did you use?',
        },
        {
          cs: 'Co by sis příště připravil dopředu?',
          en: 'What would you prep ahead next time?',
        },
      ],
    },
  },
]

export function getCampaignLevelByNodeId(nodeId: string): CampaignLevelDefinition | null {
  return campaignLevels.find((level) => level.nodeId === nodeId) ?? null
}

export function hasDecision(nodeId: string): boolean {
  return nodeId === 'n3'
}
