import { getDictionary, hasLocale, type Locale } from '../dictionaries'
import { notFound } from 'next/navigation'
import GameLayoutClient from './GameLayoutClient'
import Navbar from '@/app/components/Navbar'

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function GameLayout({ children, params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const d = await getDictionary(lang as Locale)

  return (
    <GameLayoutClient
      lang={lang}
      navbar={<Navbar lang={lang} />}
      labels={{
        play: d.game.play,
        campaign: d.game.campaign,
        world: d.game.world,
        freeplay: d.game.freeplay,
        social: d.game.social,
        profile: d.game.profile,
        settings: d.game.settings,
        notifications: d.game.notifications,
        chef: d.game.chef,
        chefDescription: d.game.chefDescription,
        chefGreeting: d.game.chefGreeting,
        chefInputPlaceholder: d.game.chefInputPlaceholder,
        chefSend: d.game.chefSend,
        chefThinking: d.game.chefThinking,
        chefError: d.game.chefError,
        chefClose: d.game.chefClose,
        chefVoiceStart: d.game.chefVoiceStart,
        chefVoiceStop: d.game.chefVoiceStop,
        chefVoiceConnecting: d.game.chefVoiceConnecting,
        chefVoiceUnsupported: d.game.chefVoiceUnsupported,
        chefUseTranscript: d.game.chefUseTranscript,
        badges: d.game.badges,
        pantry: d.game.pantry,
        shoppingList: d.game.shoppingList,
        mealPlan: d.game.mealPlan,
        reels: d.game.reels,
        groups: d.game.groups,
      }}
    >
      {children}
    </GameLayoutClient>
  )
}
