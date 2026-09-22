import { useCallback, useRef, useState } from 'react'
import { useMediaRecorder, type RecorderCallbacks } from '@/hooks/useMediaRecorder'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { newIdempotencyKey, uploadAudio } from '@/lib/api-client'
import { enqueueAudio, type QueuedAudio } from '@/lib/offline-db'
import type { VoiceState } from '@/types'

export interface VoiceTransactionResult {
  state: VoiceState
  durationSec: number
  error: string | null
  audioQueued: boolean
  start: () => Promise<void>
  stop: () => void
  cancel: () => void
  retryUpload: () => void
  clear: () => void
}

/**
 * Voice transaction flow owned here and driven by recorder callbacks:
 * idle -> requesting_permission -> recording -> upload -> processing
 * or offline -> queued_offline. Calls started from user actions, so no
 * synchronous effect writes are needed.
 */
export function useRecordTransaction(): VoiceTransactionResult {
  const online = useOnlineStatus()
  const [state, setState] = useState<VoiceState>('idle')
  const [audioQueued, setAudioQueued] = useState(false)
  const idempotencyKeyRef = useRef<string | null>(null)

  const handleRecorded = useCallback(
    (audio: { blob: Blob; mimeType: string; durationSec: number }) => {
      const key = idempotencyKeyRef.current ?? newIdempotencyKey()
      idempotencyKeyRef.current = key

      if (!online) {
        const queued: QueuedAudio = {
          idempotencyKey: key,
          createdAt: Date.now(),
          blob: audio.blob,
          mimeType: audio.mimeType,
          durationSec: audio.durationSec,
          status: 'local_recorded',
          attemptCount: 0,
        }
        enqueueAudio(queued)
          .then(() => {
            setAudioQueued(true)
            setState('queued_offline')
          })
          .catch(() => setState('failed'))
        return
      }

      setState('uploading')
      uploadAudio(audio.blob, key)
        .then(() => {
          setAudioQueued(false)
          setState('processing')
        })
        .catch(() => setState('failed'))
    },
    [online],
  )

  const callbacks: RecorderCallbacks = {
    onRecorded: handleRecorded,
    onError: () => {
      setAudioQueued(false)
      setState('failed')
    },
  }

  const { audio, durationSec, error, start, stop, cancel, clear } = useMediaRecorder(callbacks)

  const handleStart = useCallback(async () => {
    idempotencyKeyRef.current = null
    setState('requesting_permission')
    try {
      await start()
      setState('recording')
    } catch {
      setState('failed')
    }
  }, [start])

  const retryUpload = useCallback(() => {
    if (!audio) return
    const key = idempotencyKeyRef.current ?? newIdempotencyKey()
    idempotencyKeyRef.current = key

    if (!online) {
      enqueueAudio({
        idempotencyKey: key,
        createdAt: Date.now(),
        blob: audio.blob,
        mimeType: audio.mimeType,
        durationSec: audio.durationSec,
        status: 'queued',
        attemptCount: 0,
      })
        .then(() => {
          setAudioQueued(true)
          setState('queued_offline')
        })
        .catch(() => undefined)
      return
    }

    setState('uploading')
    uploadAudio(audio.blob, key)
      .then(() => {
        setAudioQueued(false)
        setState('processing')
      })
      .catch(() => setState('failed'))
  }, [audio, online])

  const handleClear = useCallback(() => {
    idempotencyKeyRef.current = null
    setAudioQueued(false)
    clear()
    setState('idle')
  }, [clear])

  return {
    state,
    durationSec,
    error,
    audioQueued,
    start: handleStart,
    stop,
    cancel,
    retryUpload,
    clear: handleClear,
  }
}