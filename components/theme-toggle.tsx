'use client'

/**
 * Theme Toggle Component
 * Allows users to switch between light, dark, and system themes
 */

import { useTheme } from '@/lib/theme/theme-provider'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  // Safely check if we're in the ThemeProvider context
  let theme: 'light' | 'dark' | 'system' = 'system'
  let setTheme: (theme: 'light' | 'dark' | 'system') => void = () => {}

  try {
    const context = useTheme()
    theme = context.theme
    setTheme = context.setTheme
  } catch (error) {
    // Not in ThemeProvider context, use defaults
    console.warn('ThemeToggle used outside ThemeProvider')
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200
            ${
              theme === value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }
          `}
          aria-label={`Switch to ${label} theme`}
          title={`${label} theme`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

export function ThemeToggleCompact() {
  // Safely check if we're in the ThemeProvider context
  let theme: 'light' | 'dark' | 'system' = 'system'
  let effectiveTheme: 'light' | 'dark' = 'dark'
  let setTheme: (theme: 'light' | 'dark' | 'system') => void = () => {}

  try {
    const context = useTheme()
    theme = context.theme
    effectiveTheme = context.effectiveTheme
    setTheme = context.setTheme
  } catch (error) {
    // Not in ThemeProvider context, use defaults
    console.warn('ThemeToggleCompact used outside ThemeProvider')
  }

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <button
      onClick={cycleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${
          effectiveTheme === 'dark'
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
        }
      `}
      aria-label={`Current theme: ${theme}. Click to cycle.`}
      title={`Theme: ${theme}`}
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}
