'use client'

// app/leaderboard/page.tsx
// Leaderboard Page - DNA::}{::lang Multi-User Platform

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  quantumStatsAPI,
  formatStatValue,
  getMetricDisplayName,
  type LeaderboardEntry,
} from '@/lib/api'

type MetricType = 'phi' | 'lambda' | 'experiments' | 'organisms' | 'tokens'

export default function LeaderboardPage() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('phi')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLeaderboard()
  }, [selectedMetric])

  async function loadLeaderboard() {
    try {
      setLoading(true)
      setError(null)

      const data = await quantumStatsAPI.getLeaderboard(selectedMetric, 100)
      setLeaderboard(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const metrics: { value: MetricType; label: string; description: string; color: string }[] = [
    {
      value: 'phi',
      label: 'Φ (Consciousness)',
      description: 'Highest integrated information achieved',
      color: 'text-blue-400',
    },
    {
      value: 'lambda',
      label: 'Λ (Coherence)',
      description: 'Maximum quantum coherence',
      color: 'text-purple-400',
    },
    {
      value: 'experiments',
      label: 'Experiments',
      description: 'Total quantum experiments run',
      color: 'text-green-400',
    },
    {
      value: 'organisms',
      label: 'Organisms',
      description: 'Total quantum organisms created',
      color: 'text-yellow-400',
    },
    {
      value: 'tokens',
      label: 'Tokens',
      description: 'Total tokens earned',
      color: 'text-orange-400',
    },
  ]

  const currentMetric = metrics.find((m) => m.value === selectedMetric)!

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Quantum Leaderboard
          </h1>
          <p className="text-xl text-gray-400">
            Top researchers on the dna::{'}{'}::lang platform
          </p>
        </div>

        {/* Metric Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {metrics.map((metric) => (
              <button
                key={metric.value}
                onClick={() => setSelectedMetric(metric.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMetric === metric.value
                    ? `border-${metric.color.replace('text-', '')} bg-gray-900`
                    : 'border-gray-800 bg-gray-900/50 hover:bg-gray-900'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${metric.color}`}>
                  {metric.label}
                </div>
                <div className="text-xs text-gray-500">{metric.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Metric Info */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${currentMetric.color}`}>
                {currentMetric.label}
              </h2>
              <p className="text-gray-400">{currentMetric.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{leaderboard.length}</div>
              <div className="text-sm text-gray-500">Ranked Users</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-400">Loading leaderboard...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-8 text-red-300">
            {error}
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && !error && (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 p-8 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700">
                {/* 2nd Place */}
                <PodiumCard
                  entry={leaderboard[1]}
                  rank={2}
                  metric={selectedMetric}
                  color="text-gray-400"
                  height="h-32"
                />

                {/* 1st Place */}
                <PodiumCard
                  entry={leaderboard[0]}
                  rank={1}
                  metric={selectedMetric}
                  color="text-yellow-400"
                  height="h-40"
                />

                {/* 3rd Place */}
                <PodiumCard
                  entry={leaderboard[2]}
                  rank={3}
                  metric={selectedMetric}
                  color="text-orange-400"
                  height="h-24"
                />
              </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="divide-y divide-gray-800">
              {leaderboard.slice(3).map((entry) => (
                <LeaderboardRow
                  key={entry.user_id}
                  entry={entry}
                  metric={selectedMetric}
                />
              ))}
            </div>

            {/* Empty State */}
            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No users ranked for this metric yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Podium Card Component (Top 3)
function PodiumCard({
  entry,
  rank,
  metric,
  color,
  height,
}: {
  entry: LeaderboardEntry
  rank: number
  metric: MetricType
  color: string
  height: string
}) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <Link
      href={`/profile/${entry.username}`}
      className={`flex flex-col items-center justify-end ${height} hover:scale-105 transition-transform`}
    >
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{medals[rank - 1]}</div>
        <div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden mb-2 mx-auto border-2 border-gray-700">
          {entry.avatar_url && (
            <Image
              src={entry.avatar_url}
              alt={entry.display_name}
              width={64}
              height={64}
              className="object-cover"
            />
          )}
        </div>
        <div className="font-bold text-sm mb-1">{entry.display_name}</div>
        <div className="text-xs text-gray-500">@{entry.username}</div>
        <div className={`text-2xl font-bold mt-2 ${color}`}>
          {formatStatValue(entry.stat_value, metric)}
        </div>
      </div>
    </Link>
  )
}

// Leaderboard Row Component (4th place onwards)
function LeaderboardRow({
  entry,
  metric,
}: {
  entry: LeaderboardEntry
  metric: MetricType
}) {
  return (
    <Link
      href={`/profile/${entry.username}`}
      className="flex items-center gap-4 p-4 hover:bg-gray-800 transition-colors"
    >
      {/* Rank */}
      <div className="w-12 text-center">
        <div className="text-xl font-bold text-gray-500">#{entry.rank}</div>
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
        {entry.avatar_url && (
          <Image
            src={entry.avatar_url}
            alt={entry.display_name}
            width={48}
            height={48}
            className="object-cover"
          />
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{entry.display_name}</div>
        <div className="text-sm text-gray-500 truncate">@{entry.username}</div>
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="text-2xl font-bold font-mono">
          {formatStatValue(entry.stat_value, metric)}
        </div>
        <div className="text-xs text-gray-500">{getMetricDisplayName(metric)}</div>
      </div>
    </Link>
  )
}
