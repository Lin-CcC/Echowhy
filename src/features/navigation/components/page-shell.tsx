import { useEffect, useState } from 'react'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Start' },
  { to: '/library', label: 'Library' },
  { to: '/review', label: 'Review' },
] as const

export function PageShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isStartPage = pathname === '/'
  const [headerVisible, setHeaderVisible] = useState(pathname !== '/')

  useEffect(() => {
    if (pathname !== '/') {
      setHeaderVisible(true)
      return
    }

    setHeaderVisible(false)

    const timeoutId = window.setTimeout(() => {
      setHeaderVisible(true)
    }, 3500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [pathname])

  return (
    <div
      className={cn(
        'min-h-screen',
        isStartPage ? 'px-0 py-0' : 'px-4 py-4 sm:px-6',
      )}
    >
      <div
        className={cn(
          'mx-auto flex flex-col',
          isStartPage ? 'min-h-screen max-w-none' : 'min-h-[calc(100vh-2rem)] max-w-7xl',
        )}
      >
        <header
          className={cn(
            'z-20 flex items-center justify-between px-1 py-3 transition-all duration-700 sm:px-2',
            isStartPage ? 'absolute inset-x-0 top-0 px-6 py-6 sm:px-8' : 'sticky top-4',
            headerVisible
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-6 opacity-0',
          )}
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.32em] text-slate-500">
              Echowhy
            </span>
            <h1 className="mt-1 text-sm font-semibold text-slate-50 sm:text-base">
              Question-driven learning
            </h1>
          </div>

          <nav className="flex items-center gap-2 bg-transparent p-1">
            {navItems.map((item) => {
              const active =
                item.to === '/'
                  ? pathname === item.to
                  : pathname.startsWith(item.to)

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'rounded-full px-3 py-2 text-sm text-slate-400 transition-colors hover:text-slate-100',
                    active && 'text-slate-50',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>

        <main
          className={cn(
            'flex-1',
            isStartPage ? 'px-0 py-0' : 'px-1 py-6 sm:px-2 sm:py-8',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
