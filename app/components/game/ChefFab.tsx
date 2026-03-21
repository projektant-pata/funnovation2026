'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { usePathname } from 'next/navigation'
import { useLiveChefSession } from '@/app/components/game/ai/useLiveChefSession'

type Props = {
  lang: 'cs' | 'en'
  labels: {
    chef: string
    chefDescription: string
    chefGreeting: string
    chefInputPlaceholder: string
    chefSend: string
    chefThinking: string
    chefError: string
    chefClose: string
    chefVoiceStart: string
    chefVoiceStop: string
    chefVoiceConnecting: string
    chefVoiceUnsupported: string
    chefUseTranscript: string
  }
}

type Message = {
  id: string
  role: 'assistant' | 'user'
  text: string
  source?: 'chat' | 'live'
}

export default function ChefFab({ lang, labels }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const listRef = useRef<HTMLDivElement | null>(null)

  const liveSession = useLiveChefSession({
    locale: lang,
    screenContext: pathname,
  })

  const {
    transcriptEvents,
    isListening,
    isConnecting,
    lastError,
    lastUserTranscript,
    isSupported,
    toggleListening,
    stopListening,
    disconnect,
  } = liveSession

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: crypto.randomUUID(), role: 'assistant', text: labels.chefGreeting }])
    }
  }, [open, messages.length, labels.chefGreeting])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isLoading, liveSession.isListening, liveSession.isConnecting])

  useEffect(() => {
    setMessages((current) => {
      const liveEventsById = new Map(transcriptEvents.map((event) => [event.id, event]))

      const nextMessages = current
        .filter((message) => message.source !== 'live' || liveEventsById.has(message.id))
        .map((message) => {
          if (message.source !== 'live') return message
          const event = liveEventsById.get(message.id)
          if (!event) return message
          if (message.role === event.role && message.text === event.text) return message
          return {
            ...message,
            role: event.role,
            text: event.text,
          }
        })

      for (const event of transcriptEvents) {
        const hasMessage = nextMessages.some((message) => message.source === 'live' && message.id === event.id)
        if (!hasMessage) {
          nextMessages.push({
            id: event.id,
            role: event.role,
            text: event.text,
            source: 'live',
          })
        }
      }

      return nextMessages
    })
  }, [transcriptEvents])

  useEffect(() => {
    return () => {
      void disconnect()
    }
  }, [disconnect])

  useEffect(() => {
    if (!open) {
      void disconnect()
    }
  }, [disconnect, open])

  async function handleSend(overrideText?: string) {
    const text = typeof overrideText === 'string' ? overrideText.trim() : input.trim()
    if (!text || isLoading) return

    setError(null)
    if (!overrideText) {
      setInput('')
    }

    const nextUserMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      source: 'chat',
    }

    const nextMessages = [...messages, nextUserMessage]
    setMessages(nextMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: lang,
          message: text,
          screen: pathname,
          history: nextMessages.slice(-8).map((item) => ({
            role: item.role,
            content: item.text,
          })),
        }),
      })

      const payload = (await response.json()) as {
        success?: boolean
        data?: { reply?: string }
      }

      const assistantReply =
        typeof payload.data?.reply === 'string' && payload.data.reply.length > 0
          ? payload.data.reply
          : labels.chefError

      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', text: assistantReply }])
    } catch {
      setError(labels.chefError)
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', text: labels.chefError }])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleVoice() {
    setError(null)

    if (!isSupported) {
      setError(labels.chefVoiceUnsupported)
      return
    }

    try {
      await toggleListening()
    } catch {
      setError(labels.chefError)
    }
  }

  async function handleUseTranscript() {
    const transcript = lastUserTranscript.trim()
    if (!transcript) return

    await stopListening()
    await handleSend(transcript)
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white border-l border-[#4E342E]/10 z-[60] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#4E342E]/10">
          <div className="flex items-center gap-3">
            <ChefHatIcon className="w-6 h-6 text-[#E57373]" />
            <span className="text-[#4E342E] font-bold text-lg">{labels.chef}</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-[#6D4C41]/50 hover:text-[#4E342E] hover:bg-[#4E342E]/10 transition-colors duration-150"
            aria-label={labels.chefClose}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FFF8EC]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === 'assistant'
                  ? 'bg-white border border-[#4E342E]/10 text-[#4E342E]'
                  : 'bg-[#FEDC56]/80 text-[#4E342E] ml-auto'
              }`}
            >
              {message.text}
            </div>
          ))}

          {isLoading && (
            <div className="max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm bg-white border border-[#4E342E]/10 text-[#6D4C41]/70">
              {labels.chefThinking}
            </div>
          )}

          {(isConnecting || isListening) && (
            <div className="max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs bg-[#FFF8E1] border border-[#4E342E]/10 text-[#6D4C41]">
              {isConnecting ? labels.chefVoiceConnecting : labels.chefVoiceStop}
            </div>
          )}

          {(error || lastError) && <div className="text-xs text-[#E57373] px-1">{error ?? lastError}</div>}
        </div>

        <div className="border-t border-[#4E342E]/10 p-3 bg-white">
          {lastUserTranscript.trim().length > 0 && (
            <button
              onClick={() => void handleUseTranscript()}
              disabled={isLoading}
              className="mb-2 text-xs font-semibold text-[#4E342E] underline decoration-[#FEDC56] disabled:opacity-50"
            >
              {labels.chefUseTranscript}
            </button>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder={labels.chefInputPlaceholder}
              className="flex-1 resize-none rounded-xl border border-[#4E342E]/15 bg-white px-3 py-2 text-sm text-[#4E342E] placeholder-[#6D4C41]/45 focus:outline-none focus:border-[#FEDC56]"
            />
            <button
              onClick={() => void handleSend()}
              disabled={isLoading || input.trim().length === 0}
              className="h-10 px-3 rounded-xl bg-[#FEDC56] text-[#4E342E] font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {labels.chefSend}
            </button>

            <button
              onClick={() => void handleToggleVoice()}
              disabled={isConnecting}
              className={`h-10 w-10 rounded-xl text-[#FFF8E1] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening ? 'bg-[#E57373]' : 'bg-[#4E342E]'
              }`}
              title={
                isConnecting
                  ? labels.chefVoiceConnecting
                  : isListening
                    ? labels.chefVoiceStop
                    : labels.chefVoiceStart
              }
            >
              <MicIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/30 z-[55] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-[#FEDC56] hover:bg-[#f5d430] hover:scale-105 text-[#4E342E] shadow-lg flex items-center justify-center transition-all duration-200"
          aria-label={labels.chef}
        >
          <ChefHatIcon className="w-7 h-7" />
        </button>
      )}
    </>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function ChefHatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9.24 2 7 4.24 7 7c-2.21 0-4 1.79-4 4 0 1.95 1.4 3.57 3.25 3.92L7 19h10l.75-4.08C19.6 14.57 21 12.95 21 11c0-2.21-1.79-4-4-4 0-2.76-2.24-5-5-5zM7 21h10v1H7v-1z" />
    </svg>
  )
}
