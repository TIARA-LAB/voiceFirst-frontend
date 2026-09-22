import { Link } from 'react-router-dom'
import { Mic, Square, RotateCcw, CheckCircle2, CloudOff, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { useRecordTransaction } from '@/features/voice-transactions'
import { formatDuration } from '@/lib/formatters'
import type { VoiceState } from '@/types'

const VOICE_PROMPTS: Partial<Record<VoiceState, string>> = {
  idle: 'Tap the microphone and speak your transaction.',
  recording: 'Recording — keep speaking.',
  uploading: 'Uploading your recording…',
  processing: 'Understanding your transaction…',
  queued_offline: 'Saved on this device. It will upload when you are back online.',
  failed: 'Something went wrong. Try again.',
}

export default function RecordTransactionPage() {
  const { state, durationSec, error, audioQueued, start, stop, cancel, retryUpload, clear } =
    useRecordTransaction()

  const isRecording = state === 'recording' || state === 'requesting_permission'
  const busyUpload =
    state === 'uploading' || state === 'processing' || state === 'queued_offline'

  return (
    <div>
      <PageHeader
        title="Record transaction"
        subtitle="Speak naturally. We'll turn it into your records."
      />

      <Card className="flex flex-col items-center gap-6 py-10">
        <div className="w-full">
          <p className="text-center text-sm text-slate-600">{VOICE_PROMPTS[state] ?? ''}</p>

          {isRecording && (
            <p className="mt-2 text-center font-mono text-2xl font-bold tabular-nums text-red-600">
              {formatDuration(durationSec)}
            </p>
          )}

          {error && state === 'failed' && (
            <p className="mx-auto mt-3 max-w-xs text-center text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-center">
          {state === 'recording' ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop recording"
              className="flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform active:scale-95"
            >
              <Square className="h-9 w-9 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void start()}
              disabled={isRecording || busyUpload}
              aria-label="Start recording"
              className="group flex h-24 w-24 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform active:scale-95 disabled:opacity-60"
            >
              <Mic className="h-9 w-9 group-disabled:animate-pulse" />
            </button>
          )}
        </div>

        {(state === 'recording' || state === 'requesting_permission') && (
          <Button variant="ghost" onClick={cancel}>
            Cancel recording
          </Button>
        )}

        {state === 'recorded' && (
          <div className="flex flex-col items-center gap-2">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
              <CheckCircle2 className="h-4 w-4" /> Recording captured {formatDuration(durationSec)}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={retryUpload}>
                <RotateCcw className="h-4 w-4" /> Process again
              </Button>
              <Button variant="ghost" size="sm" onClick={clear}>
                Start over
              </Button>
            </div>
          </div>
        )}

        {(state === 'uploading' || state === 'processing') && (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            {state === 'uploading' ? 'Sending to your books…' : 'The AI is understanding it…'}
          </p>
        )}

        {state === 'queued_offline' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-700">
              <CloudOff className="h-4 w-4" />
              {audioQueued ? 'Saved on this device' : 'Waiting for connection'}
            </p>
            <Link to="/app/sync" className="text-sm font-semibold text-brand-700">
              View sync center →
            </Link>
          </div>
        )}

        {state === 'failed' && (
          <div className="flex gap-2">
            <Button size="sm" onClick={retryUpload}>
              <RotateCcw className="h-4 w-4" /> Retry
            </Button>
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear
            </Button>
          </div>
        )}
      </Card>

      <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
        Nothing is saved to your ledger until you confirm it on the confirmation card.
      </p>
    </div>
  )
}