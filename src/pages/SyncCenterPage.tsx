import { useLiveQuery } from 'dexie-react-hooks'
import { CloudOff, CloudUpload, Trash2, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import {
  listQueuedAudio,
  offlineDb,
  removeQueuedAudio,
} from '@/lib/offline-db'
import { formatDateTime, formatDuration } from '@/lib/formatters'

export default function SyncCenterPage() {
  const online = useOnlineStatus()
  const queued = useLiveQuery(() => listQueuedAudio(), [])

  return (
    <div>
      <PageHeader
        title="Sync center"
        subtitle={online ? 'Online — recordings upload right away.' : 'Offline — recordings are queued safely.'}
      />

      {queued && queued.length === 0 && (
        <Card className="py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <CloudUpload className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm text-slate-600">Everything is up to date.</p>
        </Card>
      )}

      <div className="space-y-2">
        {queued?.map((item) => (
          <Card key={item.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <CloudOff className="h-4 w-4 text-amber-600" />
                Recording {formatDuration(item.durationSec)}
              </p>
              <span className="text-xs text-slate-400">{item.status}</span>
            </div>
            <p className="text-xs text-slate-500">
              {formatDateTime(item.createdAt)} · key {item.idempotencyKey.slice(0, 8)}…
            </p>
            {item.attemptCount > 0 && (
              <p className="text-xs text-amber-700">{item.attemptCount} attempt(s) so far</p>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              {!online && (
                <span className="mr-auto h-2 w-2 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={() => void offlineDb.queuedAudio.update(item.id!, { status: 'queued' })}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retry
              </button>
              <button
                type="button"
                aria-label={`Remove recording ${item.id}`}
                onClick={() => void removeQueuedAudio(item.id!)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}