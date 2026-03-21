'use client'

import BottomNav from '@/app/components/game/BottomNav'
import ChefFab from '@/app/components/game/ChefFab'

type Labels = {
  play: string
  campaign: string
  world: string
  freeplay: string
  social: string
  profile: string
  settings: string
  notifications: string
  chef: string
  chefDescription: string
  comingSoon: string
  badges: string
  pantry: string
  shoppingList: string
  mealPlan: string
  reels: string
  groups: string
}

type Props = {
  lang: string
  labels: Labels
  children: React.ReactNode
  navbar: React.ReactNode
}

export default function GameLayoutClient({ lang, labels, children, navbar }: Props) {

  return (
    <div className="bg-[#FFF3E0] min-h-screen font-[family-name:var(--font-geist-sans)] flex flex-col">
      {navbar}

      {/* Content with fade-in animation */}
      <main className="flex-1 overflow-auto pb-24 animate-[fadeIn_200ms_ease-out]">
        {children}
      </main>

      {/* Bottom nav */}
      <BottomNav
        lang={lang}
        labels={{
          play: labels.play,
          campaign: labels.campaign,
          world: labels.world,
          freeplay: labels.freeplay,
          reels: labels.reels,
          groups: labels.groups,
        }}
      />

      {/* Chef FAB */}
      <ChefFab
        labels={{
          chef: labels.chef,
          chefDescription: labels.chefDescription,
          comingSoon: labels.comingSoon,
        }}
      />
    </div>
  )
}
