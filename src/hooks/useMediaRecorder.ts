import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AudioRecorder,
  type RecordedAudio,
} from '@/lib/audio-recorder'
import type { VoiceState } from '@/types'

export interface RecorderCallbacks {
  onRecorded?: (audio: RecordedAudio) => void
  onError?: (err: Error) => void
}

interface UseMediaRecorderResult {
  state: VoiceState
  audio: RecordedAudio | null
  durationSec: number
  error: string | null
  start: () => Promise<void>
  stop: () => void
  cancel: () => void
  clear: () => void
}

/**
 * Wraps the browser MediaRecorder and exposes recording states.
 * Accepts onRecorded/onError callbacks so callers can orchestrate
 * state transitions without syncing via effects.
 */
export function useMediaRecorder(callbacks: RecorderCallbacks = {}): UseMediaRecorderResult {
  const recorderRef = useRef<AudioRecorder | null>(null)
  const callbacksRef = useRef(callbacks)
  const [state, setState] = useState<VoiceState>('idle')
  const [audio, setAudio] = useState<RecordedAudio | null>(null)
  const [durationSec, setDurationSec] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  const clearTimer = useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startedAtRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      recorderRef.current?.cancel()
      clearTimer()
    }
  }, [clearTimer])

  const start = useCallback(async () => {
    setError(null)
    setState('requesting_permission')
    const recorder = new AudioRecorder({
      onStop: (recorded) => {
        clearTimer()
        setAudio(recorded)
        setDurationSec(recorded.durationSec)
        setState('recorded')
        callbacksRef.current.onRecorded?.(recorded)
      },
      onError: (err) => {
        clearTimer()
        setState('failed')
        setError(err.message)
        setAudio(null)
        callbacksRef.current.onError?.(err)
      },
    })
    recorderRef.current = recorder
    try {
      await recorder.start()
      setState('recording')
      setDurationSec(0)
      startedAtRef.current = Date.now()
      intervalRef.current = window.setInterval(() => {
        const startedAt = startedAtRef.current ?? Date.now()
        setDurationSec((Date.now() - startedAt) / 1000)
      }, 250)
    } catch {
      clearTimer()
      setState('failed')
      setError('Could not access the microphone.')
    }
  }, [clearTimer])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
  }, [])

  const cancel = useCallback(() => {
    clearTimer()
    recorderRef.current?.cancel()
    setAudio(null)
    setDurationSec(0)
    setState('idle')
    setError(null)
  }, [clearTimer])

  const clear = useCallback(() => {
    clearTimer()
    recorderRef.current?.cancel()
    setAudio(null)
    setDurationSec(0)
    setState('idle')
    setError(null)
  }, [clearTimer])

  return { state, audio, durationSec, error, start, stop, cancel, clear }
}