'use client'

/**
 * Enhanced Navigation Component
 * Modern responsive navigation with user menu and theme toggle
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Settings, LogOut, Activity, Zap, Shield, Code2, Leaf, Heart, Scale, ShieldCheck, Building, ChevronDown } from 'lucide-react'
import { ThemeToggleCompact } from './theme-toggle'
import { authAPI } from '@/lib/api'

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPortalsMenu, setShowPortalsMenu] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    async function checkAuth() {
      try {
        const currentUser = await authAPI.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        setUser(null)
      }
    }
    checkAuth()
  }, [])

  const portalLinks = [
    { href: '/portals/environmental', label: 'Environmental', icon: Leaf, color: 'from-green-600 to-blue-600' },
    { href: '/portals/medical', label: 'Medical', icon: Heart, color: 'from-blue-600 to-purple-600' },
    { href: '/portals/legal', label: 'Legal', icon: Scale, color: 'from-amber-600 to-orange-600' },
    { href: '/portals/military', label: 'Military', icon: ShieldCheck, color: 'from-red-600 to-slate-600' },
    { href: '/portals/enterprise', label: 'Enterprise', icon: Building, color: 'from-indigo-600 to-purple-600' },
  ]

  const navLinks = [
    { href: '/', label: 'Home', icon: Zap },
    { href: '/arena', label: 'Arena', icon: Activity },
    { href: '/aura', label: 'Dev Arena', icon: Code2 },
    { href: '/experiments', label: 'Experiments' },
    { href: '/organisms', label: 'Organisms' },
    { href: '/admin', label: 'Admin', icon: Shield },
    { href: '/docs', label: 'Docs' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      setUser(null)
      setShowUserMenu(false)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">Σₛ</span>
            </div>
            <span className="hidden sm:inline">dna::{'}{'}::lang</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Portals Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPortalsMenu(!showPortalsMenu)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    pathname.startsWith('/portals')
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Activity className="w-4 h-4" />
                Portals
                <ChevronDown className={`w-4 h-4 transition-transform ${showPortalsMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Portals Dropdown Menu */}
              {showPortalsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPortalsMenu(false)}
                  />
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {portalLinks.map((portal) => {
                      const Icon = portal.icon
                      return (
                        <Link
                          key={portal.href}
                          href={portal.href}
                          className={`
                            flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                            ${isActive(portal.href) ? 'bg-gray-50 dark:bg-gray-700/50' : ''}
                          `}
                          onClick={() => setShowPortalsMenu(false)}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${portal.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{portal.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {portal.label === 'Environmental' && 'Impact & Sustainability'}
                              {portal.label === 'Medical' && 'Quantum Genomics'}
                              {portal.label === 'Legal' && 'Compliance & Risk'}
                              {portal.label === 'Military' && 'Defense Operations'}
                              {portal.label === 'Enterprise' && 'Business Analytics'}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive(link.href)
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggleCompact />

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-white">
                    {user.username}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <Link
                        href="/settings/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-1">
              {/* Portals Section in Mobile */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Enterprise Portals
              </div>
              {portalLinks.map((portal) => {
                const Icon = portal.icon
                return (
                  <Link
                    key={portal.href}
                    href={portal.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive(portal.href)
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${portal.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span>{portal.label}</span>
                  </Link>
                )
              })}

              <div className="px-4 py-2 mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Navigation
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive(link.href)
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {link.label}
                  </Link>
                )
              })}

              {!user && (
                <>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  <Link
                    href="/auth/login"
                    className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-3 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
