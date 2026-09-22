/**
 * Local offline store built on Dexie (IndexedDB).
 * Holds queued audio and locally created drafts until they are synced.
 * Every locally created record carries an idempotency key so retries never
 * create duplicates on the backend.
 */

import Dexie, { type EntityTable } from 'dexie'

export type QueuedAudioStatus = 'local_recorded' | 'queued' | 'uploading' | 'failed'

export interface QueuedAudio {
  id?: number
  idempotencyKey: string
  createdAt: number
  blob: Blob
  mimeType: string
  durationSec: number
  status: QueuedAudioStatus
  attemptCount: number
  lastError?: string | null
}

export interface SyncMarker {
  key: string
  updatedAt: number
  status: 'syncing' | 'synced' | 'confirmed'
}

class VoiceFirstDB extends Dexie {
  queuedAudio!: EntityTable<QueuedAudio, 'id'>
  syncMarkers!: EntityTable<SyncMarker, 'key'>

  constructor() {
    super('voicefirst')
    this.version(1).stores({
      queuedAudio: '++id, idempotencyKey, createdAt, status',
      syncMarkers: 'key, updatedAt, status',
    })
  }
}

export const offlineDb = new VoiceFirstDB()

export async function enqueueAudio(audio: QueuedAudio): Promise<number | undefined> {
  return offlineDb.queuedAudio.add(audio)
}

export async function listQueuedAudio(): Promise<QueuedAudio[]> {
  return offlineDb.queuedAudio.orderBy('createdAt').toArray()
}

export async function markQueuedAudio(
  id: number,
  patch: Partial<QueuedAudio>,
): Promise<void> {
  await offlineDb.queuedAudio.update(id, patch)
}

export async function removeQueuedAudio(id: number): Promise<void> {
  await offlineDb.queuedAudio.delete(id)
}

export async function getSyncMarker(key: string): Promise<SyncMarker | undefined> {
  return offlineDb.syncMarkers.get(key)
}

export async function setSyncMarker(marker: SyncMarker): Promise<void> {
  await offlineDb.syncMarkers.put(marker)
}