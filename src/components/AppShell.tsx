import { Home, LayoutList, Mic, Package, Settings } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useAuth } from '@/features/auth'

const navItems = [
  { to: '/app/dashboard', label: 'Home', icon: Home },
  { to: '/app/ledger', label: 'Ledger', icon: LayoutList },
  { to: '/app/record', label: 'Record', icon: Mic },
  { to: '/app/products', label: 'Products', icon: Package },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  const { business } = useAuth()
  const online = useOnlineStatus()
  const businessName = business?.name ?? 'My Business'

  return (
    <div className="min-h-dvh bg-slate-50 pb-24">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-medium text-brand-700">VoiceFirst</p>
            <p className="truncate text-sm font-semibold text-slate-900">{businessName}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              online ? 'bg-brand-100 text-brand-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-brand-600' : 'bg-amber-600'}`}
            />
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 pt-4">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {navItems.map((item) =>
            item.to === '/app/record' ? (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex flex-col items-center justify-center gap-1 py-2 text-slate-400"
              >
                <span className="absolute -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg">
                  <item.icon className="h-6 w-6" />
                </span>
                <span className="mt-7 text-[11px] font-medium">{item.label}</span>
              </NavLink>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
                    isActive ? 'text-brand-700' : 'text-slate-400'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ),
          )}
        </div>
      </nav>
    </div>
  )
}