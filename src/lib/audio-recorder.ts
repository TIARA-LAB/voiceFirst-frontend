/**
 * Thin wrapper around the browser MediaRecorder API.
 * The first browser target is Android Chrome (mobile-first).
 */

export interface RecordedAudio {
  blob: Blob
  mimeType: string
  durationSec: number
  sizeBytes: number
}

export interface AudioRecorderOptions {
  onStop?: (audio: RecordedAudio) => void
  onError?: (error: Error) => void
}

export async function requestMicrophonePermission(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      'This browser does not support microphone recording. Try Android Chrome or a recent mobile browser.',
    )
  }
  return navigator.mediaDevices.getUserMedia({ audio: true })
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private startedAt: number | null = null
  private _durationSec = 0
  private stream: MediaStream | null = null
  private mimeType = ''

  constructor(private readonly options: AudioRecorderOptions = {}) {}

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  get durationSec(): number {
    return this._durationSec
  }

  static preferredMimeType(): string {
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
    for (const candidate of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(candidate)) {
        return candidate
      }
    }
    return ''
  }

  async start(): Promise<void> {
    if (this.mediaRecorder?.state === 'recording') return

    this.stream = await requestMicrophonePermission()
    if (!this.stream || this.stream.getAudioTracks().length === 0) {
      throw new Error('No audio input was detected on this device.')
    }

    this.mimeType = AudioRecorder.preferredMimeType()
    const recorder = new MediaRecorder(this.stream, {
      ...(this.mimeType ? { mimeType: this.mimeType } : {}),
      audioBitsPerSecond: 128_000,
    })

    this.chunks = []
    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data)
      }
    }

    recorder.onstop = () => {
      this._durationSec = this.startedAt
        ? (Date.now() - this.startedAt) / 1000
        : 0
      const blob = new Blob(this.chunks, { type: recorder.mimeType || 'audio/webm' })
      this.options.onStop?.({
        blob,
        mimeType: blob.type,
        durationSec: this._durationSec,
        sizeBytes: blob.size,
      })
      this.release()
    }

    recorder.onerror = (event: Event) => {
      const error = (event as unknown as { error: Error }).error
      this.options.onError?.(error ?? new Error('Recording failed'))
      this.release()
    }

    this.mediaRecorder = recorder
    this.startedAt = Date.now()
    recorder.start()
  }

  stop(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop()
    }
  }

  cancel(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.onstop = null
      this.mediaRecorder.onerror = null
      this.mediaRecorder.stop()
    }
    this.chunks = []
    this._durationSec = 0
    this.release()
  }

  private release(): void {
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    this.mediaRecorder = null
    this.startedAt = null
  }
}