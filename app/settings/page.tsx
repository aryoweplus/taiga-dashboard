'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

interface TeamMember {
  id: number
  taigaUserId: number
  fullName: string
  username: string
  role: string
}

interface TaigaMemberRaw {
  id: number
  user: number
  full_name: string
  role_name: string
  color: string
  photo: string | null
  is_admin: boolean
  is_owner: boolean
}

const ROLES = ['DEV', 'QA', 'PM']

const roleStyle: Record<string, string> = {
  DEV: 'bg-blue-50 text-blue-600 border-blue-200',
  QA: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  PM: 'bg-amber-50 text-amber-600 border-amber-200',
}

export default function SettingsPage() {
  const [members, setMembers] = useState<TaigaMemberRaw[]>([])
  const [savedRoles, setSavedRoles] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')

  const PROJECT_ID = '2'

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // Ambil members dari Taiga
      const [taigaRes, configRes] = await Promise.all([
        fetch(`/api/taiga/members?projectId=${PROJECT_ID}`),
        fetch(`/api/config/team?projectId=${PROJECT_ID}`),
      ])

      const taigaMembers: TaigaMemberRaw[] = await taigaRes.json()
      const savedConfig: TeamMember[] = await configRes.json()

      setMembers(taigaMembers)

      // Merge saved roles ke state
      const roleMap: Record<number, string> = {}
      taigaMembers.forEach(m => {
        const saved = savedConfig.find(c => c.taigaUserId === m.user)
        roleMap[m.user] = saved?.role || 'DEV'
      })
      setSavedRoles(roleMap)
    } catch (e) {
      console.error('Failed to load settings', e)
    } finally {
      setLoading(false)
    }
  }

  async function saveRole(member: TaigaMemberRaw) {
    setSaving(member.user)
    try {
      await fetch('/api/config/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taigaUserId: member.user,
          fullName: member.full_name,
          username: member.role_name,
          role: savedRoles[member.user] || 'DEV',
          projectId: PROJECT_ID,
        }),
      })
      setSavedIds(prev => [...prev, member.user])
      setTimeout(() => setSavedIds(prev => prev.filter(id => id !== member.user)), 2000)
    } catch (e) {
      console.error('Failed to save role', e)
    } finally {
      setSaving(null)
    }
  }

  async function saveAllRoles() {
    setSaving(-1)
    try {
      await Promise.all(
        members.map(m =>
          fetch('/api/config/team', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taigaUserId: m.user,
              fullName: m.full_name,
              username: m.role_name,
              role: savedRoles[m.user] || 'DEV',
              projectId: PROJECT_ID,
            }),
          })
        )
      )
      setSavedIds(members.map(m => m.user))
      setTimeout(() => setSavedIds([]), 2000)
    } finally {
      setSaving(null)
    }
  }

  async function testConnection() {
    setTestStatus('testing')
    try {
      const res = await fetch(`/api/taiga/stats?projectId=${PROJECT_ID}`)
      const data = await res.json()
      setTestStatus(data.error ? 'error' : 'ok')
    } catch {
      setTestStatus('error')
    }
    setTimeout(() => setTestStatus('idle'), 3000)
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-800">Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage Taiga connection and team role mapping
        </p>
      </div>

      {/* Connection Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-4 pb-3 border-b border-gray-100">
          Taiga connection
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Base URL</label>
            <input
              type="text"
              defaultValue="https://taiga.weplus.id/api/v1"
              readOnly
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Project ID</label>
            <input
              type="text"
              defaultValue={PROJECT_ID}
              readOnly
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Username</label>
            <input
              type="text"
              defaultValue="aryo@weplus.id"
              readOnly
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Password</label>
            <input
              type="password"
              defaultValue="••••••••"
              readOnly
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={testConnection}
            disabled={testStatus === 'testing'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            <RefreshCw size={12} className={testStatus === 'testing' ? 'animate-spin' : ''} />
            {testStatus === 'testing' ? 'Testing...' : 'Test connection'}
          </button>
          {testStatus === 'ok' && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle size={12} /> Connected successfully
            </span>
          )}
          {testStatus === 'error' && (
            <span className="flex items-center gap-1 text-xs text-red-500">
              <XCircle size={12} /> Connection failed
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          To change credentials, update your <code className="bg-gray-100 px-1 rounded">.env</code> file and restart the server.
        </p>
      </div>

      {/* Team Role Mapping */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Team role mapping</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Assign QA / DEV / PM roles to each member
            </p>
          </div>
          <button
            onClick={saveAllRoles}
            disabled={saving === -1 || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all"
          >
            <Save size={11} />
            {saving === -1 ? 'Saving...' : 'Save all'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Loading members...
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {members.map(m => (
              <div key={m.user} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-medium flex-shrink-0">
                    {m.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
<p className="text-xs font-medium text-gray-700">{m.full_name}</p>
<p className="text-[11px] text-gray-400">{m.role_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Role selector */}
                  <div className="flex gap-1">
                    {ROLES.map(role => (
                      <button
                        key={role}
                        onClick={() => setSavedRoles(prev => ({ ...prev, [m.user]: role }))}
                        className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all
                          ${savedRoles[m.user] === role
                            ? roleStyle[role]
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  {/* Save individual */}
                  <button
                    onClick={() => saveRole(m)}
                    disabled={saving === m.user}
                    className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all disabled:opacity-50"
                  >
                    {savedIds.includes(m.user)
                      ? <CheckCircle size={14} className="text-emerald-500" />
                      : saving === m.user
                        ? <RefreshCw size={14} className="animate-spin" />
                        : <Save size={14} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}