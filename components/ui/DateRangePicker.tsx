'use client'

import { useState } from 'react'
import { Calendar, ChevronDown, X } from 'lucide-react'

export interface DateRange {
  start: string  // YYYY-MM-DD
  end: string    // YYYY-MM-DD
  label: string
}

const SPRINT_PRESETS: DateRange[] = [
  {
    label: 'Sprint current (27 Apr – 17 Mei)',
    start: '2026-04-27',
    end: '2026-05-17',
  },
  {
    label: 'Sprint prev (6 Apr – 26 Apr)',
    start: '2026-04-06',
    end: '2026-04-26',
  },
  {
    label: '30 hari terakhir',
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  {
    label: 'Semua waktu',
    start: '',
    end: '',
  },
]

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

export default function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [customStart, setCustomStart] = useState(value.start)
  const [customEnd, setCustomEnd] = useState(value.end)

  function applyCustom() {
    if (customStart && customEnd) {
      onChange({ start: customStart, end: customEnd, label: 'Custom range' })
      setOpen(false)
    }
  }

  function selectPreset(preset: DateRange) {
    setCustomStart(preset.start)
    setCustomEnd(preset.end)
    onChange(preset)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-all bg-white"
      >
        <Calendar size={12} className="text-gray-400" />
        <span className="text-gray-600 font-medium">{value.label || 'Pilih range'}</span>
        {value.start && (
          <span className="text-gray-400">
            {value.start} → {value.end}
          </span>
        )}
        <ChevronDown size={12} className="text-gray-400" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-9 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-72 p-3">
            {/* Presets */}
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 px-1">
              Sprint presets
            </p>
            <div className="space-y-0.5 mb-3">
              {SPRINT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => selectPreset(preset)}
                  className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition-all
                    ${value.label === preset.label
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom range */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 px-1">
                Custom range
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">Start</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={e => setCustomStart(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">End</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={e => setCustomEnd(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={applyCustom}
                disabled={!customStart || !customEnd}
                className="w-full py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-40 transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}