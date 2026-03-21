import type { NodeTreeData, StoryNode } from './mockCampaign'
import type { CampaignLevelDefinition } from './mockCampaignLevels'

export interface WorldRegion {
  id: string
  name: { cs: string; en: string }
  description: { cs: string; en: string }
  status: 'unlocked' | 'locked'
  countryCodes: string[]
  color: string
  totalRecipes: number
  completedRecipes: number
}

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

export const worldRegions: WorldRegion[] = [
  {
    id: 'europe',
    name: { cs: 'Evropa', en: 'Europe' },
    description: {
      cs: 'Od italské pasty přes francouzské omáčky až po řecké saláty. Poznej kořeny evropské kuchyně.',
      en: 'From Italian pasta to French sauces to Greek salads. Discover the roots of European cuisine.',
    },
    status: 'unlocked',
    countryCodes: ['IT', 'FR', 'GR'],
    color: '#E8A838',
    totalRecipes: 3,
    completedRecipes: 0,
  },
  {
    id: 'asia',
    name: { cs: 'Asie', en: 'Asia' },
    description: {
      cs: 'Preciznost japonského ramenu a intenzita indického koření. Dva světy, jedna vášeň.',
      en: 'The precision of Japanese ramen and the intensity of Indian spices. Two worlds, one passion.',
    },
    status: 'unlocked',
    countryCodes: ['JP', 'IN'],
    color: '#E85D4A',
    totalRecipes: 3,
    completedRecipes: 0,
  },
  {
    id: 'americas',
    name: { cs: 'Amerika', en: 'Americas' },
    description: {
      cs: 'Mexický street food plný chutí a barev. Tortilly, salsa a grilované maso přímo z ulice.',
      en: 'Mexican street food bursting with flavor and color. Tortillas, salsa, and grilled meats straight from the street.',
    },
    status: 'unlocked',
    countryCodes: ['MX'],
    color: '#4CAF50',
    totalRecipes: 2,
    completedRecipes: 0,
  },
  {
    id: 'africa',
    name: { cs: 'Afrika', en: 'Africa' },
    description: {
      cs: 'Africká kuchyně se připravuje. Už brzy — coming soon!',
      en: 'African cuisine is being prepared. Coming soon!',
    },
    status: 'locked',
    countryCodes: [],
    color: '#9E9E9E',
    totalRecipes: 0,
    completedRecipes: 0,
  },
  {
    id: 'oceania',
    name: { cs: 'Oceánie', en: 'Oceania' },
    description: {
      cs: 'Chutě Oceánie se teprve odhalují. Už brzy — coming soon!',
      en: 'Flavors of Oceania are still being uncovered. Coming soon!',
    },
    status: 'locked',
    countryCodes: [],
    color: '#9E9E9E',
    totalRecipes: 0,
    completedRecipes: 0,
  },
]

// ---------------------------------------------------------------------------
// Node trees
// ---------------------------------------------------------------------------

export const europeNodeTree: NodeTreeData = {
  nodes: [
    {
      id: 'eu-1',
      label: 'Italské základy',
      description: 'Italian Basics',
      x: 50,
      y: 15,
      status: 'locked',
      completion: 0,
      isBranching: true,
      isStart: true,
      mainTask: 'Pizza Margherita',
      subtasks: [],
    },
    {
      id: 'eu-2',
      label: 'Francouzská elegance',
      description: 'French Elegance',
      x: 30,
      y: 50,
      status: 'locked',
      completion: 0,
      isBranching: false,
      mainTask: 'Ratatouille',
      subtasks: [],
    },
    {
      id: 'eu-3',
      label: 'Řecké slunce',
      description: 'Greek Sunshine',
      x: 70,
      y: 50,
      status: 'locked',
      completion: 0,
      isBranching: false,
      mainTask: 'Moussaka',
      subtasks: [],
    },
  ],
  edges: [
    { from: 'eu-1', to: 'eu-2' },
    { from: 'eu-1', to: 'eu-3' },
  ],
}

export const asiaNodeTree: NodeTreeData = {
  nodes: [
    {
      id: 'as-1',
      label: 'Japonská preciznost',
      description: 'Japanese Precision',
      x: 50,
      y: 15,
      status: 'locked',
      completion: 0,
      isBranching: false,
      isStart: true,
      mainTask: 'Ramen',
      subtasks: [],
    },
    {
      id: 'as-2',
      label: 'Indické koření',
      description: 'Indian Spice',
      x: 50,
      y: 50,
      status: 'locked',
      completion: 0,
      isBranching: false,
      mainTask: 'Tikka Masala',
      subtasks: [],
    },
    {
      id: 'as-3',
      label: '?',
      description: '?',
      x: 50,
      y: 85,
      status: 'locked',
      completion: 0,
      isBranching: false,
      mainTask: '???',
      subtasks: [],
    },
  ],
  edges: [
    { from: 'as-1', to: 'as-2' },
    { from: 'as-2', to: 'as-3' },
  ],
}

export const americasNodeTree: NodeTreeData = {
  nodes: [
    {
      id: 'am-1',
      label: 'Mexický street food',
      description: 'Mexican Street Food',
      x: 50,
      y: 25,
      status: 'locked',
      completion: 0,
      isBranching: false,
      isStart: true,
      mainTask: 'Tacos al Pastor',
      subtasks: [],
    },
    {
      id: 'am-2',
      label: '?',
      description: '?',
      x: 50,
      y: 65,
      status: 'locked',
      completion: 0,
      isBranching: false,
      mainTask: '???',
      subtasks: [],
    },
  ],
  edges: [{ from: 'am-1', to: 'am-2' }],
}

// ---------------------------------------------------------------------------
// World levels
// ---------------------------------------------------------------------------

export const worldLevels: CampaignLevelDefinition[] = [
  // EU-1: Pizza Margherita
  {
    nodeId: 'eu-1',
    title: { cs: 'Italské základy', en: 'Italian Basics' },
    subtitle: {
      cs: 'Nauč se tradici neapolské pizzy',
      en: 'Learn the tradition of Neapolitan pizza',
    },
    recipeName: { cs: 'Pizza Margherita', en: 'Pizza Margherita' },
    objective: {
      cs: 'Připrav autentickou pizzu Margherita a pochop jednoduchost italské kuchyně.',
      en: 'Prepare an authentic Pizza Margherita and understand the simplicity of Italian cooking.',
    },
    estimatedTime: { cs: '30-40 min', en: '30-40 min' },
    difficulty: 2,
    xpReward: 120,
    requirements: [
      { cs: 'Trouba', en: 'Oven' },
      { cs: 'Plech na pečení', en: 'Baking tray' },
    ],
    ingredients: [
      {
        id: 'eu1-i1',
        name: { cs: 'Těsto na pizzu', en: 'Pizza dough' },
        amount: { cs: '250 g', en: '250 g' },
      },
      {
        id: 'eu1-i2',
        name: { cs: 'San Marzano rajčata', en: 'San Marzano tomatoes' },
        amount: { cs: '150 g', en: '150 g' },
      },
      {
        id: 'eu1-i3',
        name: { cs: 'Mozzarella', en: 'Mozzarella' },
        amount: { cs: '125 g', en: '125 g' },
      },
      {
        id: 'eu1-i4',
        name: { cs: 'Bazalka', en: 'Basil' },
        amount: { cs: 'pár lístků', en: 'a few leaves' },
      },
      {
        id: 'eu1-i5',
        name: { cs: 'Olivový olej', en: 'Olive oil' },
        amount: { cs: '1 lžíce', en: '1 tbsp' },
      },
    ],
    cutscene: {
      title: {
        cs: 'Chuť Neapole',
        en: 'A Taste of Naples',
      },
      setting: {
        cs: 'Slunná italská ulička s vůní čerstvé pizzy.',
        en: 'A sunny Italian alley filled with the scent of fresh pizza.',
      },
      backgroundOptions: [
        '/cutscenes/naples-street.jpg',
        '/cutscenes/pizza-oven-glow.jpg',
        '/cutscenes/italian-kitchen.jpg',
      ],
      characters: [
        {
          id: 'narrator',
          name: { cs: 'Průvodce', en: 'Guide' },
          side: 'left',
        },
      ],
      lines: [
        {
          speakerId: 'narrator',
          text: {
            cs: 'Pizza Margherita vznikla v Neapoli na konci 19. století jako pocta italské královně. Tři barvy — rajčata, mozzarella, bazalka — představují italskou vlajku.',
            en: 'Pizza Margherita was born in Naples in the late 19th century as a tribute to the Italian queen. Three colors — tomatoes, mozzarella, basil — represent the Italian flag.',
          },
        },
        {
          speakerId: 'narrator',
          text: {
            cs: 'Tajemství skvělé pizzy je v jednoduchosti. Kvalitní suroviny a správná teplota udělají víc než tucet přísad.',
            en: 'The secret of great pizza is simplicity. Quality ingredients and the right temperature do more than a dozen toppings.',
          },
        },
        {
          speakerId: 'narrator',
          text: {
            cs: 'Pojďme si to zkusit. Připrav těsto, rozetři rajčata a nech troubu udělat zbytek.',
            en: 'Let us try it. Prepare the dough, spread the tomatoes, and let the oven do the rest.',
          },
        },
      ],
    },
    steps: [
      {
        id: 'eu1-s1',
        title: { cs: 'Předehřej troubu', en: 'Preheat oven' },
        instruction: {
          cs: 'Nastav troubu na maximum (ideálně 250 °C) a vlož plech.',
          en: 'Set the oven to maximum (ideally 250 °C) and place the tray inside.',
        },
      },
      {
        id: 'eu1-s2',
        title: { cs: 'Připrav omáčku', en: 'Prepare sauce' },
        instruction: {
          cs: 'San Marzano rajčata rozmačkej vidličkou, přidej špetku soli a lžíci olivového oleje.',
          en: 'Crush San Marzano tomatoes with a fork, add a pinch of salt and a tablespoon of olive oil.',
        },
      },
      {
        id: 'eu1-s3',
        title: { cs: 'Rozválejte těsto', en: 'Roll out dough' },
        instruction: {
          cs: 'Těsto rozválejte do kruhu na pomoučněném povrchu.',
          en: 'Roll the dough into a circle on a floured surface.',
        },
        tip: {
          cs: 'Nepoužívej válek — rukama to bude autentičtější.',
          en: 'Skip the rolling pin — hands give a more authentic result.',
        },
      },
      {
        id: 'eu1-s4',
        title: { cs: 'Nanes omáčku', en: 'Spread sauce' },
        instruction: {
          cs: 'Lžící rozetři rajčatovou omáčku po těstě, nech okraj volný.',
          en: 'Spread tomato sauce on the dough with a spoon, leaving the edge clear.',
        },
      },
      {
        id: 'eu1-s5',
        title: { cs: 'Přidej mozzarellu', en: 'Add mozzarella' },
        instruction: {
          cs: 'Mozzarellu natrh na kousky a rozlož po povrchu.',
          en: 'Tear mozzarella into pieces and distribute over the surface.',
        },
      },
      {
        id: 'eu1-s6',
        title: { cs: 'Peč a dokonči', en: 'Bake and finish' },
        instruction: {
          cs: 'Peč 8-12 minut, dokud okraj nezezlátne. Po vyndání přidej čerstvou bazalku.',
          en: 'Bake 8-12 minutes until the crust turns golden. Add fresh basil after removing from the oven.',
        },
        suggestedSeconds: 600,
      },
    ],
    completion: {
      title: { cs: 'Italská lekce splněna', en: 'Italian lesson complete' },
      subtitle: {
        cs: 'Zvládl jsi základní kámen italské kuchyně. Jednoduchost je síla.',
        en: 'You mastered a cornerstone of Italian cuisine. Simplicity is power.',
      },
      reflectionPrompts: [
        {
          cs: 'Jak vypadal okraj tvé pizzy?',
          en: 'How did the crust of your pizza look?',
        },
        {
          cs: 'Co bys příště přidal nebo ubral?',
          en: 'What would you add or remove next time?',
        },
      ],
    },
  },

  // AS-1: Ramen
  {
    nodeId: 'as-1',
    title: { cs: 'Japonská preciznost', en: 'Japanese Precision' },
    subtitle: {
      cs: 'Objev umění japonského ramenu',
      en: 'Discover the art of Japanese ramen',
    },
    recipeName: { cs: 'Ramen', en: 'Ramen' },
    objective: {
      cs: 'Připrav misku ramenu s vyváženým vývarem, nudlemi a toppingy.',
      en: 'Prepare a bowl of ramen with balanced broth, noodles, and toppings.',
    },
    estimatedTime: { cs: '25-35 min', en: '25-35 min' },
    difficulty: 3,
    xpReward: 150,
    requirements: [
      { cs: 'Hrnec na vývar', en: 'Pot for broth' },
      { cs: 'Malý hrnec na vejce', en: 'Small pot for eggs' },
    ],
    ingredients: [
      {
        id: 'as1-i1',
        name: { cs: 'Ramen nudle', en: 'Ramen noodles' },
        amount: { cs: '150 g', en: '150 g' },
      },
      {
        id: 'as1-i2',
        name: { cs: 'Dashi vývar', en: 'Dashi broth' },
        amount: { cs: '500 ml', en: '500 ml' },
      },
      {
        id: 'as1-i3',
        name: { cs: 'Sójová omáčka', en: 'Soy sauce' },
        amount: { cs: '2 lžíce', en: '2 tbsp' },
      },
      {
        id: 'as1-i4',
        name: { cs: 'Vejce', en: 'Egg' },
        amount: { cs: '1 ks', en: '1 pc' },
      },
      {
        id: 'as1-i5',
        name: { cs: 'Nori', en: 'Nori' },
        amount: { cs: '2 plátky', en: '2 sheets' },
      },
      {
        id: 'as1-i6',
        name: { cs: 'Jarní cibulka', en: 'Green onion' },
        amount: { cs: '1 stonek', en: '1 stalk' },
      },
    ],
    cutscene: {
      title: {
        cs: 'Duše v misce',
        en: 'Soul in a Bowl',
      },
      setting: {
        cs: 'Malý ramen bar v úzké tokijské uličce. Z okénka stoupá pára.',
        en: 'A tiny ramen bar in a narrow Tokyo alley. Steam rises from the window.',
      },
      backgroundOptions: [
        '/cutscenes/tokyo-ramen-bar.jpg',
        '/cutscenes/steamy-noodle-shop.jpg',
        '/cutscenes/japanese-street-night.jpg',
      ],
      characters: [
        {
          id: 'narrator',
          name: { cs: 'Průvodce', en: 'Guide' },
          side: 'left',
        },
      ],
      lines: [
        {
          speakerId: 'narrator',
          text: {
            cs: 'Ramen není jen polévka — je to celá filozofie. Každá oblast Japonska má svou variantu a každý kuchař svůj příběh.',
            en: 'Ramen is not just soup — it is a whole philosophy. Every region of Japan has its own variant, and every cook has their own story.',
          },
        },
        {
          speakerId: 'narrator',
          text: {
            cs: 'Klíčem je vývar. Čistý, hluboký, plný umami. Vše ostatní se staví kolem něj.',
            en: 'The key is the broth. Clean, deep, full of umami. Everything else is built around it.',
          },
        },
        {
          speakerId: 'narrator',
          text: {
            cs: 'Dnes si připravíš jednoduchý šóju ramen. Soustřeď se a dodržuj kroky přesně.',
            en: 'Today you will make a simple shoyu ramen. Focus and follow the steps precisely.',
          },
        },
      ],
    },
    steps: [
      {
        id: 'as1-s1',
        title: { cs: 'Připrav vývar', en: 'Prepare broth' },
        instruction: {
          cs: 'Dashi vývar přiveď k varu a přidej sójovou omáčku. Sniž plamen a nech táhnout.',
          en: 'Bring dashi broth to a boil and add soy sauce. Lower heat and let it simmer.',
        },
        suggestedSeconds: 300,
      },
      {
        id: 'as1-s2',
        title: { cs: 'Uvař vejce', en: 'Cook egg' },
        instruction: {
          cs: 'Vejce vař v druhém hrnci přesně 6,5 minuty pro měkký středek. Pak zchlaď ve studené vodě.',
          en: 'Boil the egg in a second pot for exactly 6.5 minutes for a soft center. Cool in cold water.',
        },
        tip: {
          cs: 'Použij časovač — na sekundách záleží.',
          en: 'Use a timer — seconds matter.',
        },
        suggestedSeconds: 390,
      },
      {
        id: 'as1-s3',
        title: { cs: 'Uvař nudle', en: 'Cook noodles' },
        instruction: {
          cs: 'Ramen nudle uvař podle návodu. Sceď a rozděl do misky.',
          en: 'Cook ramen noodles according to package directions. Drain and place into a bowl.',
        },
      },
      {
        id: 'as1-s4',
        title: { cs: 'Nakrájej toppingy', en: 'Slice toppings' },
        instruction: {
          cs: 'Jarní cibulku nakrájej na kolečka. Vejce oloupej a rozpul.',
          en: 'Slice green onion into rings. Peel the egg and cut in half.',
        },
      },
      {
        id: 'as1-s5',
        title: { cs: 'Sestav misku', en: 'Assemble bowl' },
        instruction: {
          cs: 'Na nudle nalij horký vývar. Přidej půlku vejce, nori a cibulku.',
          en: 'Pour hot broth over noodles. Add egg half, nori, and green onion.',
        },
      },
      {
        id: 'as1-s6',
        title: { cs: 'Servíruj ihned', en: 'Serve immediately' },
        instruction: {
          cs: 'Ramen se jí hned — nudle jinak nasáknou vývar. Dobrou chuť!',
          en: 'Ramen is eaten immediately — otherwise the noodles absorb the broth. Enjoy!',
        },
      },
    ],
    completion: {
      title: { cs: 'Japonská lekce splněna', en: 'Japanese lesson complete' },
      subtitle: {
        cs: 'Tvůj první ramen je hotový. Preciznost a trpělivost se vyplatily.',
        en: 'Your first ramen is done. Precision and patience paid off.',
      },
      reflectionPrompts: [
        {
          cs: 'Jak vypadal střed tvého vejce?',
          en: 'How did the center of your egg look?',
        },
        {
          cs: 'Byl vývar dostatečně chuťově bohatý?',
          en: 'Was the broth rich enough in flavor?',
        },
      ],
    },
  },

  // AM-1: Tacos al Pastor
  {
    nodeId: 'am-1',
    title: { cs: 'Mexický street food', en: 'Mexican Street Food' },
    subtitle: {
      cs: 'Poznej kulturu mexických tacos',
      en: 'Experience the culture of Mexican tacos',
    },
    recipeName: { cs: 'Tacos al Pastor', en: 'Tacos al Pastor' },
    objective: {
      cs: 'Připrav tacos al pastor s marinovaným masem, ananasem a čerstvými přísadami.',
      en: 'Prepare tacos al pastor with marinated meat, pineapple, and fresh toppings.',
    },
    estimatedTime: { cs: '25-30 min', en: '25-30 min' },
    difficulty: 2,
    xpReward: 120,
    requirements: [
      { cs: 'Pánev', en: 'Pan' },
      { cs: 'Prkénko a nůž', en: 'Cutting board and knife' },
    ],
    ingredients: [
      {
        id: 'am1-i1',
        name: { cs: 'Tortilly', en: 'Tortillas' },
        amount: { cs: '4 ks', en: '4 pcs' },
      },
      {
        id: 'am1-i2',
        name: { cs: 'Vepřové / kuřecí maso', en: 'Pork / chicken' },
        amount: { cs: '200 g', en: '200 g' },
      },
      {
        id: 'am1-i3',
        name: { cs: 'Ananas', en: 'Pineapple' },
        amount: { cs: '2 plátky', en: '2 slices' },
      },
      {
        id: 'am1-i4',
        name: { cs: 'Cibule', en: 'Onion' },
        amount: { cs: '1/2 ks', en: '1/2 piece' },
      },
      {
        id: 'am1-i5',
        name: { cs: 'Koriandr', en: 'Cilantro' },
        amount: { cs: 'hrst', en: 'a handful' },
      },
      {
        id: 'am1-i6',
        name: { cs: 'Limetka', en: 'Lime' },
        amount: { cs: '1 ks', en: '1 pc' },
      },
    ],
    cutscene: {
      title: {
        cs: 'Ulice plná vůní',
        en: 'A Street Full of Aromas',
      },
      setting: {
        cs: 'Rušný mexický trh za soumraku. Stánky s tacos svítí barvami a zní hudba.',
        en: 'A bustling Mexican market at dusk. Taco stands glow with color and music fills the air.',
      },
      backgroundOptions: [
        '/cutscenes/mexican-market-night.jpg',
        '/cutscenes/taco-stand-glow.jpg',
        '/cutscenes/street-food-mexico.jpg',
      ],
      characters: [
        {
          id: 'narrator',
          name: { cs: 'Průvodce', en: 'Guide' },
          side: 'left',
        },
      ],
      lines: [
        {
          speakerId: 'narrator',
          text: {
            cs: 'Tacos al pastor jsou ikonou mexického street foodu. Vznikly inspirací libanonského šawarma, který přivezli přistěhovalci.',
            en: 'Tacos al pastor are an icon of Mexican street food. They were inspired by Lebanese shawarma brought by immigrants.',
          },
        },
        {
          speakerId: 'narrator',
          text: {
            cs: 'Maso se marinuje v chili a koření, griluje na svislém rožni a podává s ananasem a koriandrem. Je to fúze dvou kultur na jedné tortille.',
            en: 'The meat is marinated in chili and spices, grilled on a vertical spit, and served with pineapple and cilantro. It is a fusion of two cultures on one tortilla.',
          },
        },
        {
          speakerId: 'narrator',
          text: {
            cs: 'Dnes si připravíme domácí verzi — jednoduchou, ale plnou autentických chutí.',
            en: 'Today we will make a home version — simple but full of authentic flavor.',
          },
        },
      ],
    },
    steps: [
      {
        id: 'am1-s1',
        title: { cs: 'Marinuj maso', en: 'Marinate meat' },
        instruction: {
          cs: 'Maso nakrájej na tenké plátky a promíchej s trochou chili, česnekem a limetkou.',
          en: 'Slice meat thin and toss with a bit of chili, garlic, and lime.',
        },
        tip: {
          cs: 'I 10 minut marinování změní chuť.',
          en: 'Even 10 minutes of marinating changes the flavor.',
        },
        suggestedSeconds: 600,
      },
      {
        id: 'am1-s2',
        title: { cs: 'Opécej ananas', en: 'Sear pineapple' },
        instruction: {
          cs: 'Plátky ananasu opécej na suché pánvi z obou stran do zlatova.',
          en: 'Sear pineapple slices in a dry pan on both sides until golden.',
        },
      },
      {
        id: 'am1-s3',
        title: { cs: 'Griluj maso', en: 'Grill meat' },
        instruction: {
          cs: 'Na rozpálené pánvi opécej maso po dávkách, dokud není křupavé a propečené.',
          en: 'Cook meat in batches on a hot pan until crispy and cooked through.',
        },
      },
      {
        id: 'am1-s4',
        title: { cs: 'Připrav toppingy', en: 'Prepare toppings' },
        instruction: {
          cs: 'Nakrájej cibuli a ananas na drobno, natrh koriandr a rozčtvrt limetku.',
          en: 'Finely dice onion and pineapple, tear cilantro, and quarter the lime.',
        },
      },
      {
        id: 'am1-s5',
        title: { cs: 'Zahřej tortilly', en: 'Warm tortillas' },
        instruction: {
          cs: 'Tortilly krátce prohřej na suché pánvi z obou stran.',
          en: 'Briefly warm tortillas on a dry pan on both sides.',
        },
      },
      {
        id: 'am1-s6',
        title: { cs: 'Sestav tacos', en: 'Assemble tacos' },
        instruction: {
          cs: 'Na tortillu polož maso, ananas, cibuli, koriandr a stříkni limetkou. Podávej ihned.',
          en: 'Top tortilla with meat, pineapple, onion, cilantro, and a squeeze of lime. Serve immediately.',
        },
      },
    ],
    completion: {
      title: { cs: 'Mexická lekce splněna', en: 'Mexican lesson complete' },
      subtitle: {
        cs: 'Tvé první tacos al pastor jsou na světě. Ulice by byly hrdé.',
        en: 'Your first tacos al pastor are ready. The streets would be proud.',
      },
      reflectionPrompts: [
        {
          cs: 'Jak se lišila chuť opečeného ananasu od syrového?',
          en: 'How did the flavor of seared pineapple differ from raw?',
        },
        {
          cs: 'Co bys příště přidal jako extra topping?',
          en: 'What extra topping would you add next time?',
        },
      ],
    },
  },
]

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getWorldRegions(): WorldRegion[] {
  return worldRegions
}

export function getRegionById(id: string): WorldRegion | undefined {
  return worldRegions.find((r) => r.id === id)
}

const regionNodeTreeMap: Record<string, NodeTreeData> = {
  europe: europeNodeTree,
  asia: asiaNodeTree,
  americas: americasNodeTree,
}

export function getRegionNodeTree(regionId: string): NodeTreeData | null {
  return regionNodeTreeMap[regionId] ?? null
}

export function getWorldLevelByNodeId(
  _regionId: string,
  nodeId: string,
): CampaignLevelDefinition | null {
  return worldLevels.find((level) => level.nodeId === nodeId) ?? null
}
