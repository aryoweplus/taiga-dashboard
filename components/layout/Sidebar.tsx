'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Settings,
  Layers,
  RefreshCw,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/team',      label: 'Team',      icon: Users },
  { href: '/scoring',   label: 'Scoring',   icon: Trophy },
  { href: '/settings',  label: 'Settings',  icon: Settings },
  { href: '/widgets',   label: 'Widgets',   icon: Layers },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/cron/sync')
      const data = await res.json()
      if (data.success) {
        setLastSync(new Date().toLocaleTimeString('id-ID'))
      }
    } catch (e) {
      console.error('Sync failed', e)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <aside className={`${collapsed ? 'w-14 min-w-14' : 'w-52 min-w-52'} bg-[#0f1923] flex flex-col transition-all duration-200`}>

      {/* Logo */}
      <div className={`px-4 py-5 border-b border-white/8 flex items-center justify-between`}>
        {!collapsed && (
          <div>
            <div className="text-sm font-medium text-slate-200 tracking-wide">
              TaigaView WE+ [IT]
            </div>
            <div className="text-xs text-white/30 mt-0.5">
              Project Dashboard
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className={`p-1 rounded-md text-white/30 hover:text-white/70 hover:bg-white/5 transition-all flex-shrink-0
            ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <ChevronLeft size={14} />
          }
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {!collapsed && (
          <span className="text-[10px] tracking-widest text-white/20 px-2 pt-2 pb-1 uppercase">
            Overview
          </span>
        )}
        {navItems.slice(0, 3).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-all
              ${collapsed ? 'justify-center' : ''}
              ${pathname === href
                ? 'bg-blue-500/15 text-blue-400'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
          >
            <Icon size={14} className="flex-shrink-0" />
            {!collapsed && label}
          </Link>
        ))}

        {!collapsed && (
          <span className="text-[10px] tracking-widest text-white/20 px-2 pt-4 pb-1 uppercase">
            Config
          </span>
        )}
        {collapsed && <div className="my-2 border-t border-white/8" />}

        {navItems.slice(3).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-all
              ${collapsed ? 'justify-center' : ''}
              ${pathname === href
                ? 'bg-blue-500/15 text-blue-400'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
          >
            <Icon size={14} className="flex-shrink-0" />
            {!collapsed && label}
          </Link>
        ))}
      </nav>

      {/* Sync button */}
      <div className="px-3 py-4 border-t border-white/8">
        {!collapsed && lastSync && (
          <p className="text-[10px] text-white/25 mb-2 text-center">
            Last sync: {lastSync}
          </p>
        )}
        <button
          onClick={handleSync}
          disabled={syncing}
          title={collapsed ? (syncing ? 'Syncing...' : 'Sync Now') : undefined}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md
            bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
            text-white text-xs font-medium transition-all`}
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          {!collapsed && (syncing ? 'Syncing...' : 'Sync Now')}
        </button>
      </div>
    </aside>
  )
}