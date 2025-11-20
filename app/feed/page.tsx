'use client'

// app/feed/page.tsx
// Activity Feed Page - DNA::}{::lang Multi-User Platform

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  activitiesAPI,
  authAPI,
  formatActivityTime,
  getActivityIcon,
  parseActivityMetadata,
  type UserActivity,
  type ActivityFeedOptions,
} from '@/lib/api'

type FeedFilter = 'all' | 'following' | 'organisms' | 'experiments' | 'achievements'

export default function FeedPage() {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FeedFilter>('all')
  const [hasMore, setHasMore] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const ACTIVITIES_PER_PAGE = 20

  useEffect(() => {
    checkAuth()
    loadActivities(true)
  }, [filter])

  async function checkAuth() {
    const user = await authAPI.getCurrentUser()
    setIsAuthenticated(!!user)
  }

  async function loadActivities(reset: boolean = false) {
    try {
      if (reset) {
        setLoading(true)
        setActivities([])
      } else {
        setLoadingMore(true)
      }

      setError(null)

      const options: ActivityFeedOptions = {
        limit: ACTIVITIES_PER_PAGE,
        offset: reset ? 0 : activities.length,
      }

      // Apply filters
      if (filter === 'organisms') {
        options.activityTypes = ['organism_created']
      } else if (filter === 'experiments') {
        options.activityTypes = ['experiment_completed']
      } else if (filter === 'achievements') {
        options.activityTypes = ['achievement_unlocked']
      } else if (filter === 'following') {
        // Following filter is handled by API automatically
        options.visibility = ['public', 'followers']
      }

      const data = await activitiesAPI.getActivityFeed(options)

      if (reset) {
        setActivities(data)
      } else {
        setActivities([...activities, ...data])
      }

      setHasMore(data.length === ACTIVITIES_PER_PAGE)
    } catch (err: any) {
      setError(err.message || 'Failed to load activity feed')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const filterOptions: { value: FeedFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All Activity', icon: '📋' },
    { value: 'following', label: 'Following', icon: '👥' },
    { value: 'organisms', label: 'Organisms', icon: '🧬' },
    { value: 'experiments', label: 'Experiments', icon: '⚛️' },
    { value: 'achievements', label: 'Achievements', icon: '🏆' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Activity Feed</h1>
          <p className="text-gray-400">
            Latest updates from the dna::{'}{'}::lang community
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                disabled={option.value === 'following' && !isAuthenticated}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Auth Notice for Following Filter */}
        {filter === 'following' && !isAuthenticated && (
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mb-6 text-blue-300">
            <Link href="/auth/login" className="underline hover:text-blue-200">
              Login
            </Link>{' '}
            to see activities from users you follow
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-400">Loading activities...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {/* Activity Feed */}
        {!loading && (
          <>
            <div className="space-y-4 mb-8">
              {activities.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-lg">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500 text-lg">No activities yet</p>
                  <p className="text-gray-600 text-sm mt-2">
                    Be the first to create an organism or run an experiment!
                  </p>
                </div>
              ) : (
                activities.map((activity) => (
                  <ActivityCard key={activity.activity_id} activity={activity} />
                ))
              )}
            </div>

            {/* Load More Button */}
            {hasMore && activities.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => loadActivities(false)}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-800 rounded-lg font-medium transition-colors"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}

            {/* End of Feed */}
            {!hasMore && activities.length > 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p>You've reached the end of the feed</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Activity Card Component
function ActivityCard({ activity }: { activity: UserActivity }) {
  const metadata = parseActivityMetadata(activity.activity_type, activity.metadata)

  return (
    <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <Link href={`/profile/${activity.username}`} className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden">
            {activity.avatar_url && (
              <Image
                src={activity.avatar_url}
                alt={activity.display_name || activity.username || 'User'}
                width={48}
                height={48}
                className="object-cover"
              />
            )}
          </div>
        </Link>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/profile/${activity.username}`}
              className="font-bold hover:underline"
            >
              {activity.display_name || activity.username}
            </Link>
            <span className="text-gray-500">•</span>
            <span className="text-sm text-gray-500">
              {formatActivityTime(activity.created_at)}
            </span>
          </div>

          {/* Activity Title */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getActivityIcon(activity.activity_type)}</span>
            <span className="font-medium">{activity.activity_title}</span>
            {metadata && (
              <span className="text-sm text-gray-400">
                {metadata}
              </span>
            )}
          </div>

          {/* Activity Description */}
          {activity.activity_description && (
            <p className="text-gray-400 text-sm mb-3">{activity.activity_description}</p>
          )}

          {/* Activity Target Link */}
          {activity.target_id && activity.target_type && (
            <Link
              href={getTargetLink(activity.target_type, activity.target_id)}
              className="inline-block text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              View {activity.target_type} →
            </Link>
          )}

          {/* Metadata Display */}
          {activity.metadata && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(activity.metadata).map(([key, value]) => {
                if (typeof value === 'number' && (key === 'phi' || key === 'lambda' || key === 'gamma')) {
                  return (
                    <div
                      key={key}
                      className="px-2 py-1 bg-gray-800 rounded text-xs font-mono"
                    >
                      {key}: {typeof value === 'number' ? value.toFixed(4) : value}
                    </div>
                  )
                }
                return null
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to get target link
function getTargetLink(targetType: string, targetId: string): string {
  switch (targetType) {
    case 'organism':
      return `/organisms/${targetId}`
    case 'experiment':
      return `/experiments/${targetId}`
    case 'nft':
      return `/nfts/${targetId}`
    case 'user':
      return `/profile/${targetId}`
    default:
      return '#'
  }
}
