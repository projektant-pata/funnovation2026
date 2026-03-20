export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface StoryNode {
  id: string
  label: string
  description: string
  x: number // 0–100 (% of canvas)
  y: number // 0–100 (% of canvas)
  status: NodeStatus
  completion: number // 0–100
  isBranching: boolean
  mainTask: string
  subtasks: string[]
}

export interface TreeEdge {
  from: string
  to: string
}

export interface NodeTreeData {
  nodes: StoryNode[]
  edges: TreeEdge[]
}

export const campaignData: NodeTreeData = {
  nodes: [
    {
      id: 'n1',
      label: 'První večeře',
      description: 'Kde to všechno začalo',
      x: 50,
      y: 8,
      status: 'completed',
      completion: 100,
      isBranching: false,
      mainTask: 'Špagety aglio e olio',
      subtasks: ['Jednoduchý salát', 'Česnekový chléb'],
    },
    {
      id: 'n2',
      label: 'Základní techniky',
      description: 'Nůž, pánev, trouba',
      x: 50,
      y: 24,
      status: 'in_progress',
      completion: 60,
      isBranching: false,
      mainTask: 'Francouzská omeleta',
      subtasks: ['Blanšírovaná zelenina', 'Redukce balsamic'],
    },
    {
      id: 'n3',
      label: 'Odstěhování',
      description: 'Čas se postavit na vlastní nohy',
      x: 50,
      y: 40,
      status: 'available',
      completion: 0,
      isBranching: true,
      mainTask: 'Nákup a plánování jídelníčku',
      subtasks: ['Organizace lednice'],
    },
    {
      id: 'n4',
      label: 'Sólo cesta',
      description: 'Vařím jen pro sebe',
      x: 25,
      y: 56,
      status: 'locked',
      completion: 0,
      isBranching: false,
      mainTask: 'Rychlé jednoporcové jídlo',
      subtasks: ['Meal prep na týden', 'Levný a výživný oběd'],
    },
    {
      id: 'n5',
      label: 'S partnerem',
      description: 'Vaříme spolu',
      x: 75,
      y: 56,
      status: 'locked',
      completion: 0,
      isBranching: false,
      mainTask: 'Romantická večeře pro dva',
      subtasks: ['Domácí těstoviny', 'Dezert pro dva'],
    },
    {
      id: 'n6',
      label: 'První večírek',
      description: 'Hosté přichází!',
      x: 50,
      y: 72,
      status: 'locked',
      completion: 0,
      isBranching: false,
      mainTask: 'Tříchodové menu pro šest',
      subtasks: ['Jednohubky na uvítanou', 'Míchaný drink'],
    },
    {
      id: 'n7',
      label: 'Mistr kuchyně',
      description: 'Závěrečná zkouška',
      x: 50,
      y: 88,
      status: 'locked',
      completion: 0,
      isBranching: false,
      mainTask: 'Vlastní autorský recept',
      subtasks: ['Fusion pokrm', 'Food styling a prezentace'],
    },
  ],
  edges: [
    { from: 'n1', to: 'n2' },
    { from: 'n2', to: 'n3' },
    { from: 'n3', to: 'n4' },
    { from: 'n3', to: 'n5' },
    { from: 'n4', to: 'n6' },
    { from: 'n5', to: 'n6' },
    { from: 'n6', to: 'n7' },
  ],
}
