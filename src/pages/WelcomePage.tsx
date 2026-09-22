import { Link } from 'react-router-dom'

const primaryLink =
  'block w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white text-center transition-colors hover:bg-brand-700'
const secondaryLink =
  'block w-full rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-800 text-center ring-1 ring-slate-200 transition-colors hover:bg-slate-50'

export default function WelcomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-slate-900 px-6 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/10 ring-1 ring-brand-400/30">
          <svg viewBox="0 0 512 512" className="h-12 w-12" role="img" aria-label="VoiceFirst logo">
            <rect x="130" y="90" width="252" height="300" rx="126" fill="none" stroke="#4ade80" strokeWidth="44" />
            <path d="M115 230a141 141 0 0 0 282 0" fill="none" stroke="#4ade80" strokeWidth="44" strokeLinecap="round" />
            <rect x="200" y="412" width="112" height="40" rx="14" fill="#4ade80" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Your bookkeeping, <span className="text-brand-400">your voice.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-300">
            Record sales, stock, expenses, and debts by speaking naturally.
            No long forms. No notebook.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <Link to="/register" className={primaryLink}>
            Get started
          </Link>
          <Link to="/login" className={secondaryLink}>
            I already have an account
          </Link>
        </div>
      </div>

      <div className="bg-white px-6 py-6">
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-4 text-center">
          {[
            { value: 'Voice', label: 'Speak transactions' },
            { value: 'Ledger', label: 'Automatic records' },
            { value: 'Profit', label: 'Clear daily numbers' },
          ].map((item) => (
            <div key={item.value}>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}