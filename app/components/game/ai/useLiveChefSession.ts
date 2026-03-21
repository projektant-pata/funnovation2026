'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleGenAI } from '@google/genai'

export type LiveTranscriptEvent = {
  id: string
  role: 'user' | 'assistant'
  text: string
  source: 'input_transcription' | 'output_transcription'
}

export type LiveToolAction =
  | { type: 'timer_set'; seconds: number }
  | { type: 'timer_start'; seconds?: number }
  | { type: 'timer_pause' }
  | { type: 'timer_resume' }
  | { type: 'timer_cancel' }
  | { type: 'step_next' }
  | { type: 'step_previous' }
  | { type: 'step_go_to'; stepNumber: number }

type ToolActionResult = {
  ok: boolean
  message?: string
  payload?: unknown
}

type UseLiveChefSessionOptions = {
  locale: 'cs' | 'en'
  screenContext: string
  cookingSessionId?: string
  cookingContext?: unknown
  onToolAction?: (action: LiveToolAction) => Promise<ToolActionResult> | ToolActionResult
}

type TranscriptStreamKey = 'user_input' | 'assistant_output'

type LiveSessionLike = {
  sendRealtimeInput: (payload: unknown) => void
  sendToolResponse: (payload: unknown) => void
  close: () => Promise<void> | void
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Live session error'
}

function isClosedSocketMessage(message: string): boolean {
  const normalized = message.toLowerCase()
  return normalized.includes('websocket') && (normalized.includes('closing') || normalized.includes('closed'))
}

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function int16ToBase64(data: Int16Array): string {
  const bytes = new Uint8Array(data.buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

const MIC_CAPTURE_WORKLET_URL = '/audio-worklets/mic-capture-processor.js'
const PLAYBACK_WORKLET_URL = '/audio-worklets/live-playback-processor.js'

function mergeTranscriptChunk(previous: string, incoming: string): string {
  const prev = previous
  const next = incoming

  if (!prev) return next
  if (!next) return prev

  if (next.startsWith(prev)) return next
  if (prev.startsWith(next)) return prev
  if (prev.includes(next)) return prev
  if (next.includes(prev)) return next

  const maxOverlap = Math.min(prev.length, next.length)
  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    if (prev.slice(-overlap) === next.slice(0, overlap)) {
      return prev + next.slice(overlap)
    }
  }

  const needsSpace = !prev.endsWith(' ') && !/^[\s,.;:!?)]/.test(next)
  return `${prev}${needsSpace ? ' ' : ''}${next}`
}

async function normalizeIncomingLiveMessage(message: unknown): Promise<Record<string, unknown> | null> {
  const isBlob = typeof Blob !== 'undefined' && message instanceof Blob

  if (
    message &&
    typeof message === 'object' &&
    !isBlob &&
    !ArrayBuffer.isView(message) &&
    !(message instanceof ArrayBuffer)
  ) {
    return message as Record<string, unknown>
  }

  let raw: string | null = null
  if (typeof message === 'string') {
    raw = message
  } else if (message instanceof ArrayBuffer) {
    raw = new TextDecoder().decode(new Uint8Array(message))
  } else if (ArrayBuffer.isView(message)) {
    raw = new TextDecoder().decode(new Uint8Array(message.buffer, message.byteOffset, message.byteLength))
  } else if (isBlob) {
    raw = await message.text()
  }

  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function downsampleTo16k(input: Float32Array, inputSampleRate: number): Int16Array {
  if (inputSampleRate === 16000) {
    const out = new Int16Array(input.length)
    for (let i = 0; i < input.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, input[i]))
      out[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
    }
    return out
  }

  const ratio = inputSampleRate / 16000
  const length = Math.max(1, Math.floor(input.length / ratio))
  const result = new Int16Array(length)

  let offsetResult = 0
  let offsetBuffer = 0

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio)
    let accum = 0
    let count = 0

    for (let i = offsetBuffer; i < nextOffsetBuffer && i < input.length; i += 1) {
      accum += input[i]
      count += 1
    }

    const sample = count > 0 ? accum / count : 0
    const clamped = Math.max(-1, Math.min(1, sample))
    result[offsetResult] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff

    offsetResult += 1
    offsetBuffer = nextOffsetBuffer
  }

  return result
}

function parseToolAction(call: { name?: string; args?: unknown }): LiveToolAction | null {
  const name = call.name
  const argsRaw = call.args
  const args =
    typeof argsRaw === 'string'
      ? (() => {
          try {
            return JSON.parse(argsRaw) as Record<string, unknown>
          } catch {
            return {} as Record<string, unknown>
          }
        })()
      : argsRaw && typeof argsRaw === 'object'
        ? (argsRaw as Record<string, unknown>)
        : ({} as Record<string, unknown>)

  switch (name) {
    case 'timer_set': {
      const seconds = typeof args.seconds === 'number' && Number.isFinite(args.seconds) ? args.seconds : null
      if (!seconds || seconds <= 0) return null
      return { type: 'timer_set', seconds: Math.round(seconds) }
    }
    case 'timer_start': {
      const seconds = typeof args.seconds === 'number' && Number.isFinite(args.seconds) ? Math.round(args.seconds) : undefined
      return seconds && seconds > 0 ? { type: 'timer_start', seconds } : { type: 'timer_start' }
    }
    case 'timer_pause':
      return { type: 'timer_pause' }
    case 'timer_resume':
      return { type: 'timer_resume' }
    case 'timer_cancel':
      return { type: 'timer_cancel' }
    case 'step_next':
      return { type: 'step_next' }
    case 'step_previous':
      return { type: 'step_previous' }
    case 'step_go_to': {
      const stepNumber = typeof args.step_number === 'number' && Number.isFinite(args.step_number) ? args.step_number : null
      if (!stepNumber || stepNumber <= 0) return null
      return { type: 'step_go_to', stepNumber: Math.round(stepNumber) }
    }
    default:
      return null
  }
}

export function useLiveChefSession({
  locale,
  screenContext,
  cookingSessionId,
  cookingContext,
  onToolAction,
}: UseLiveChefSessionOptions) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [transcriptEvents, setTranscriptEvents] = useState<LiveTranscriptEvent[]>([])
  const [lastUserTranscript, setLastUserTranscript] = useState('')

  const sessionRef = useRef<LiveSessionLike | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const captureContextRef = useRef<AudioContext | null>(null)
  const captureSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const captureProcessorRef = useRef<AudioWorkletNode | null>(null)
  const captureMuteRef = useRef<GainNode | null>(null)

  const playbackContextRef = useRef<AudioContext | null>(null)
  const playbackNodeRef = useRef<AudioWorkletNode | null>(null)

  const inputTranscriptBufferRef = useRef('')
  const onToolActionRef = useRef(onToolAction)
  const recoveryInFlightRef = useRef(false)
  const activeTranscriptIdRef = useRef<Partial<Record<TranscriptStreamKey, string>>>({})
  const transcriptStreamTextRef = useRef<Record<TranscriptStreamKey, string>>({ user_input: '', assistant_output: '' })
  const latestOutputTranscriptRef = useRef('')

  useEffect(() => {
    onToolActionRef.current = onToolAction
  }, [onToolAction])

  const isSupported = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      !!window.navigator?.mediaDevices?.getUserMedia &&
      typeof window.AudioContext !== 'undefined' &&
      typeof window.AudioWorkletNode !== 'undefined'
    )
  }, [])

  const clearPlayback = useCallback(() => {
    if (playbackNodeRef.current) {
      playbackNodeRef.current.port.postMessage('interrupt')
    }
  }, [])

  const appendTranscriptEvent = useCallback((role: 'user' | 'assistant', text: string, source: LiveTranscriptEvent['source']) => {
    const cleaned = text
    if (cleaned.trim().length === 0) return

    const key: TranscriptStreamKey = role === 'user' ? 'user_input' : 'assistant_output'
    transcriptStreamTextRef.current[key] = cleaned

    if (role === 'user') {
      activeTranscriptIdRef.current.user_input = undefined
      inputTranscriptBufferRef.current = cleaned
      setLastUserTranscript(cleaned)
    } else {
      activeTranscriptIdRef.current.assistant_output = undefined
      latestOutputTranscriptRef.current = cleaned
    }

    setTranscriptEvents((prev) => [
      ...prev,
      {
        id: newId(),
        role,
        text: cleaned,
        source,
      },
    ])
  }, [])

  const upsertTranscriptStream = useCallback((role: 'user' | 'assistant', text: string, source: LiveTranscriptEvent['source']) => {
    const cleaned = text
    if (cleaned.trim().length === 0) return

    const key: TranscriptStreamKey = role === 'user' ? 'user_input' : 'assistant_output'
    const merged = mergeTranscriptChunk(transcriptStreamTextRef.current[key], cleaned)
    transcriptStreamTextRef.current[key] = merged
    const existingId = activeTranscriptIdRef.current[key]

    if (!existingId) {
      const nextId = newId()
      activeTranscriptIdRef.current[key] = nextId
      setTranscriptEvents((prev) => [
        ...prev,
        {
          id: nextId,
          role,
          text: merged,
          source,
        },
      ])
    } else {
      setTranscriptEvents((prev) =>
        prev.map((event) => (event.id === existingId ? { ...event, role, text: merged, source } : event))
      )
    }

    if (role === 'user') {
      inputTranscriptBufferRef.current = merged
      setLastUserTranscript(merged)
    } else {
      latestOutputTranscriptRef.current = merged
    }
  }, [])

  const finalizeTranscriptStream = useCallback((role: 'user' | 'assistant') => {
    const key: TranscriptStreamKey = role === 'user' ? 'user_input' : 'assistant_output'
    activeTranscriptIdRef.current[key] = undefined
    transcriptStreamTextRef.current[key] = ''
  }, [])

  const ensurePlaybackContext = useCallback(async () => {
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 })
    }

    const context = playbackContextRef.current
    if (context.state === 'suspended') {
      await context.resume()
    }

    if (!playbackNodeRef.current) {
      await context.audioWorklet.addModule(PLAYBACK_WORKLET_URL)
      const node = new AudioWorkletNode(context, 'live-pcm-playback-processor', {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      })
      node.connect(context.destination)
      playbackNodeRef.current = node
    }

    const node = playbackNodeRef.current
    if (!node) {
      throw new Error('Live playback node unavailable')
    }

    return { context, node }
  }, [])

  const enqueueAudioChunk = useCallback(
    async (base64Chunk: string) => {
      if (!base64Chunk) return

      const { node } = await ensurePlaybackContext()
      const bytes = base64ToBytes(base64Chunk)
      const sampleCount = Math.floor(bytes.byteLength / 2)
      if (sampleCount <= 0) return

      const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, sampleCount)
      const float32 = new Float32Array(int16.length)
      for (let i = 0; i < int16.length; i += 1) {
        float32[i] = int16[i] / 32768
      }
      node.port.postMessage(float32, [float32.buffer])
    },
    [ensurePlaybackContext]
  )

  const closeSession = useCallback(async () => {
    const existing = sessionRef.current
    sessionRef.current = null
    if (existing) {
      try {
        await existing.close()
      } catch {
        // ignore close errors
      }
    }
    setIsConnected(false)
  }, [])

  const stopListening = useCallback(async () => {
    const currentSession = sessionRef.current
    if (currentSession) {
      try {
        currentSession.sendRealtimeInput({ audioStreamEnd: true })
      } catch {
        // ignore closed-session races
      }
    }
    finalizeTranscriptStream('user')

    if (captureProcessorRef.current) {
      try {
        captureProcessorRef.current.disconnect()
      } catch {
        // ignore
      }
      captureProcessorRef.current.port.onmessage = null
      captureProcessorRef.current = null
    }

    if (captureSourceRef.current) {
      try {
        captureSourceRef.current.disconnect()
      } catch {
        // ignore
      }
      captureSourceRef.current = null
    }

    if (captureMuteRef.current) {
      try {
        captureMuteRef.current.disconnect()
      } catch {
        // ignore
      }
      captureMuteRef.current = null
    }

    if (micStreamRef.current) {
      for (const track of micStreamRef.current.getTracks()) {
        track.stop()
      }
      micStreamRef.current = null
    }

    if (captureContextRef.current) {
      try {
        await captureContextRef.current.close()
      } catch {
        // ignore
      }
      captureContextRef.current = null
    }

    setIsListening(false)
  }, [finalizeTranscriptStream])

  const recoverClosedSession = useCallback((reason: unknown) => {
    if (recoveryInFlightRef.current) return

    const rawMessage = errorMessage(reason)
    const message = isClosedSocketMessage(rawMessage)
      ? 'Live connection was closed. Start voice again to reconnect.'
      : rawMessage

    setLastError(message)
    recoveryInFlightRef.current = true

    void (async () => {
      await stopListening()
      await closeSession()
      recoveryInFlightRef.current = false
    })()
  }, [closeSession, stopListening])

  const logTurn = useCallback(async (inputTranscript: string, outputTranscript: string) => {
    try {
      await fetch('/api/ai/live/log-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context_screen: screenContext,
          cooking_session_id: cookingSessionId ?? null,
          input_transcript: inputTranscript,
          output_transcript: outputTranscript,
          success: true,
        }),
      })
    } catch {
      // non-blocking logging
    }
  }, [cookingSessionId, screenContext])

  const ensureLiveSession = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current

    setLastError(null)
    setIsConnecting(true)

    try {
      let connectedSession: LiveSessionLike | null = null

      const requestBody = {
        locale,
        screen_context: screenContext,
        cooking_session_id: cookingSessionId,
        cooking_context: cookingContext ?? null,
      }

      const tokenResponse = await fetch('/api/ai/live/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const tokenPayload = await tokenResponse.json()

      if (!tokenResponse.ok || !tokenPayload?.success) {
        throw new Error(tokenPayload?.message ?? 'Failed to create live token')
      }

      const token = tokenPayload.data?.token as string | undefined
      let model = tokenPayload.data?.model as string | undefined
      let config = tokenPayload.data?.config

      if (!model || !config) {
        const sessionConfigResponse = await fetch('/api/ai/live/session-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })
        const sessionConfigPayload = await sessionConfigResponse.json()
        if (!sessionConfigResponse.ok || !sessionConfigPayload?.success) {
          throw new Error(sessionConfigPayload?.message ?? 'Failed to get live session config')
        }
        model = (model ?? sessionConfigPayload.data?.model) as string | undefined
        config = config ?? sessionConfigPayload.data?.config
      }

      const apiVersion = 'v1alpha'

      if (!token || !model || !config) {
        throw new Error('Invalid live setup payload')
      }

      const ai = new GoogleGenAI({
        apiKey: token,
        apiVersion,
        httpOptions: {
          apiVersion,
        },
      })
      const session = (await ai.live.connect({
        model,
        config,
        callbacks: {
          onopen: () => {
            setIsConnected(true)
            setLastError(null)
          },
          onerror: (event: unknown) => {
            const message =
              event && typeof event === 'object' && 'message' in event && typeof (event as { message?: unknown }).message === 'string'
                ? (event as { message: string }).message
                : 'Live session error'
            setLastError(message)

            if (isClosedSocketMessage(message)) {
              recoverClosedSession(new Error(message))
            }
          },
          onclose: (event: unknown) => {
            activeTranscriptIdRef.current = {}
            transcriptStreamTextRef.current = { user_input: '', assistant_output: '' }
            latestOutputTranscriptRef.current = ''

            if (event && typeof event === 'object') {
              const closeEvent = event as { code?: unknown; reason?: unknown }
              const code = typeof closeEvent.code === 'number' ? closeEvent.code : null
              const reason = typeof closeEvent.reason === 'string' ? closeEvent.reason.trim() : ''
              if (code !== null || reason.length > 0) {
                const details = [code !== null ? `code ${code}` : null, reason.length > 0 ? reason : null]
                  .filter(Boolean)
                  .join(' - ')
                setLastError(`Live connection closed${details ? ` (${details})` : ''}`)
              }
            }
            if (sessionRef.current === connectedSession) {
              sessionRef.current = null
            }
            setIsConnected(false)
            setIsListening(false)
            void stopListening()
          },
          onmessage: async (message: unknown) => {
            const m = await normalizeIncomingLiveMessage(message)
            if (!m) return

            const serverContent =
              m.serverContent && typeof m.serverContent === 'object'
                ? (m.serverContent as Record<string, unknown>)
                : null

            const inputTranscription =
              serverContent?.inputTranscription && typeof serverContent.inputTranscription === 'object'
                ? (serverContent.inputTranscription as Record<string, unknown>)
                : null
            if (typeof inputTranscription?.text === 'string' && inputTranscription.text.trim().length > 0) {
              upsertTranscriptStream('user', inputTranscription.text, 'input_transcription')
            }
            if (inputTranscription?.finished === true) {
              finalizeTranscriptStream('user')
            }

            const outputTranscription =
              serverContent?.outputTranscription && typeof serverContent.outputTranscription === 'object'
                ? (serverContent.outputTranscription as Record<string, unknown>)
                : null
            if (typeof outputTranscription?.text === 'string' && outputTranscription.text.trim().length > 0) {
              upsertTranscriptStream('assistant', outputTranscription.text, 'output_transcription')
            }
            if (outputTranscription?.finished === true) {
              finalizeTranscriptStream('assistant')
            }

            if (serverContent?.interrupted === true) {
              clearPlayback()
              finalizeTranscriptStream('assistant')
            }

            const modelTurn =
              serverContent?.modelTurn && typeof serverContent.modelTurn === 'object'
                ? (serverContent.modelTurn as Record<string, unknown>)
                : null

            const parts = Array.isArray(modelTurn?.parts) ? (modelTurn.parts as Array<Record<string, unknown>>) : []
            for (const part of parts) {
              const inlineData =
                part.inlineData && typeof part.inlineData === 'object'
                  ? (part.inlineData as Record<string, unknown>)
                  : null
              if (typeof inlineData?.data === 'string' && inlineData.data.length > 0) {
                void enqueueAudioChunk(inlineData.data)
              }
            }

            const turnComplete = serverContent?.turnComplete === true
            const generationComplete = serverContent?.generationComplete === true
            if (turnComplete || generationComplete) {
              finalizeTranscriptStream('assistant')
              finalizeTranscriptStream('user')

              const outputTranscript = latestOutputTranscriptRef.current.trim()
              if (outputTranscript.length > 0) {
                void logTurn(inputTranscriptBufferRef.current, outputTranscript)
                latestOutputTranscriptRef.current = ''
              }
            }

            const toolCall = m.toolCall && typeof m.toolCall === 'object' ? (m.toolCall as Record<string, unknown>) : null
            const functionCalls = Array.isArray(toolCall?.functionCalls)
              ? (toolCall?.functionCalls as Array<Record<string, unknown>>)
              : []

            if (functionCalls.length > 0 && sessionRef.current) {
              const functionResponses: Array<{
                id?: string
                name?: string
                response: Record<string, unknown>
              }> = []

              for (const call of functionCalls) {
                const action = parseToolAction({
                  name: typeof call.name === 'string' ? call.name : undefined,
                  args: call.args,
                })

                const actionHandler = onToolActionRef.current

                if (!action || !actionHandler) {
                  functionResponses.push({
                    id: typeof call.id === 'string' ? call.id : undefined,
                    name: typeof call.name === 'string' ? call.name : undefined,
                    response: {
                      result: 'error',
                      message: 'Action is not available in this context',
                    },
                  })
                  continue
                }

                try {
                  const result = await actionHandler(action)
                  functionResponses.push({
                    id: typeof call.id === 'string' ? call.id : undefined,
                    name: typeof call.name === 'string' ? call.name : undefined,
                    response: {
                      result: result.ok ? 'ok' : 'error',
                      message: result.message ?? null,
                      payload: result.payload ?? null,
                    },
                  })
                } catch (error) {
                  functionResponses.push({
                    id: typeof call.id === 'string' ? call.id : undefined,
                    name: typeof call.name === 'string' ? call.name : undefined,
                    response: {
                      result: 'error',
                      message: error instanceof Error ? error.message : 'Action failed',
                    },
                  })
                }
              }

              try {
                sessionRef.current.sendToolResponse({ functionResponses })
              } catch (error) {
                recoverClosedSession(error)
              }
            }
          },
        },
      })) as LiveSessionLike

      connectedSession = session
      sessionRef.current = session
      setIsConnected(true)
      return session
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to initialize live session'
      setLastError(message)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [
    clearPlayback,
    cookingContext,
    cookingSessionId,
    enqueueAudioChunk,
    finalizeTranscriptStream,
    locale,
    logTurn,
    recoverClosedSession,
    screenContext,
    stopListening,
    upsertTranscriptStream,
  ])

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setLastError('Live voice is not supported in this browser')
      return
    }

    if (isListening) return

    try {
      const session = await ensureLiveSession()
      if (!session) throw new Error('Live session unavailable')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      })

      const context = new AudioContext()
      if (context.state === 'suspended') {
        await context.resume()
      }

      if (typeof AudioWorkletNode === 'undefined') {
        throw new Error('AudioWorklet is not supported in this browser')
      }

      await context.audioWorklet.addModule(MIC_CAPTURE_WORKLET_URL)

      const source = context.createMediaStreamSource(stream)
      const processor = new AudioWorkletNode(context, 'mic-capture-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 1,
      })
      const mute = context.createGain()
      mute.gain.value = 0

      processor.port.onmessage = (event: MessageEvent<Float32Array>) => {
        const currentSession = sessionRef.current
        if (!currentSession) return

        const channel = event.data
        if (!(channel instanceof Float32Array) || channel.length === 0) return

        const pcm16 = downsampleTo16k(channel, context.sampleRate)
        if (pcm16.length === 0) return

        const base64 = int16ToBase64(pcm16)
        try {
          currentSession.sendRealtimeInput({
            audio: {
              data: base64,
              mimeType: 'audio/pcm;rate=16000',
            },
          })
        } catch (error) {
          recoverClosedSession(error)
        }
      }

      source.connect(processor)
      processor.connect(mute)
      mute.connect(context.destination)

      micStreamRef.current = stream
      captureContextRef.current = context
      captureSourceRef.current = source
      captureProcessorRef.current = processor
      captureMuteRef.current = mute

      setIsListening(true)
      setLastError(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not access microphone'
      setLastError(message)
      await stopListening()
    }
  }, [ensureLiveSession, isListening, isSupported, recoverClosedSession, stopListening])

  const toggleListening = useCallback(async () => {
    if (isListening) {
      await stopListening()
      return
    }
    await startListening()
  }, [isListening, startListening, stopListening])

  const sendRealtimeText = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const session = await ensureLiveSession()
      try {
        session.sendRealtimeInput({ text: trimmed })
        appendTranscriptEvent('user', trimmed, 'input_transcription')
      } catch (error) {
        recoverClosedSession(error)
      }
    },
    [appendTranscriptEvent, ensureLiveSession, recoverClosedSession]
  )

  const disconnect = useCallback(async () => {
    await stopListening()
    await closeSession()
    clearPlayback()

    if (playbackContextRef.current) {
      try {
        await playbackContextRef.current.close()
      } catch {
        // ignore
      }
      playbackNodeRef.current = null
      playbackContextRef.current = null
    }
  }, [clearPlayback, closeSession, stopListening])

  useEffect(() => {
    return () => {
      void disconnect()
    }
  }, [disconnect])

  const clearTranscripts = useCallback(() => {
    setTranscriptEvents([])
    setLastUserTranscript('')
    inputTranscriptBufferRef.current = ''
    latestOutputTranscriptRef.current = ''
    activeTranscriptIdRef.current = {}
    transcriptStreamTextRef.current = { user_input: '', assistant_output: '' }
  }, [])

  return {
    isSupported,
    isConnecting,
    isConnected,
    isListening,
    lastError,
    transcriptEvents,
    lastUserTranscript,
    clearTranscripts,
    startListening,
    stopListening,
    toggleListening,
    sendRealtimeText,
    disconnect,
  }
}
