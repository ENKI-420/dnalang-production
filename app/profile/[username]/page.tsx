'use client'

// app/profile/[username]/page.tsx
// User Profile Page - DNA::}{::lang Multi-User Platform

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import {
  profileAPI,
  quantumStatsAPI,
  activitiesAPI,
  authAPI,
  formatProfileForDisplay,
  formatStatValue,
  getBadgeTierColor,
  formatActivityTime,
  getActivityIcon,
  type UserProfile,
  type QuantumStats,
  type Achievement,
  type UserActivity,
} from '@/lib/api'

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<QuantumStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'activity' | 'organisms' | 'stats'>('activity')

  useEffect(() => {
    loadProfile()
  }, [username])

  async function loadProfile() {
    try {
      setLoading(true)
      setError(null)

      // Load profile
      const profileData = await profileAPI.getProfileByUsername(username)
      if (!profileData) {
        setError('Profile not found')
        return
      }
      setProfile(profileData)

      // Load stats
      const statsData = await quantumStatsAPI.getUserStats(profileData.user_id)
      setStats(statsData)

      // Load achievements
      const achievementsData = await quantumStatsAPI.getUserAchievements(profileData.user_id)
      setAchievements(achievementsData)

      // Load activities
      const activitiesData = await activitiesAPI.getUserActivities(profileData.user_id, 20)
      setActivities(activitiesData)

      // Check if this is current user's profile
      const currentUser = await authAPI.getCurrentUser()
      if (currentUser && currentUser.id === profileData.user_id) {
        setIsOwnProfile(true)
      } else if (currentUser) {
        // Check if following
        const following = await profileAPI.isFollowing(currentUser.id, profileData.user_id)
        setIsFollowing(following)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleFollow() {
    if (!profile) return

    try {
      if (isFollowing) {
        await profileAPI.unfollowUser(profile.user_id)
        setIsFollowing(false)
      } else {
        await profileAPI.followUser(profile.user_id)
        setIsFollowing(true)
      }
      // Reload profile to update follower count
      loadProfile()
    } catch (err: any) {
      alert(err.message || 'Failed to update follow status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile || !stats) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-400">{error || 'Profile not found'}</p>
        </div>
      </div>
    )
  }

  const formattedProfile = formatProfileForDisplay(profile)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-900 to-purple-900">
        {profile.banner_url && (
          <Image
            src={profile.banner_url}
            alt="Profile banner"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 -mt-20">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-40 h-40 rounded-full border-4 border-black bg-gray-800 overflow-hidden">
              <Image
                src={formattedProfile.avatarUrl}
                alt={formattedProfile.displayName}
                width={160}
                height={160}
                className="object-cover"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{formattedProfile.displayName}</h1>
                  <p className="text-gray-400">@{profile.username}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <a
                      href="/settings/profile"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                    >
                      Edit Profile
                    </a>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isFollowing
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-300 mb-4">{profile.bio}</p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website_url && (
                  <div className="flex items-center gap-1">
                    <span>🔗</span>
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {profile.website_url}
                    </a>
                  </div>
                )}
                {profile.affiliation && (
                  <div className="flex items-center gap-1">
                    <span>🏢</span>
                    <span>{profile.affiliation}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {formattedProfile.hasSocialLinks && (
                <div className="flex gap-3 mt-4">
                  {profile.social_links.twitter && (
                    <a
                      href={`https://twitter.com/${profile.social_links.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Twitter
                    </a>
                  )}
                  {profile.social_links.github && (
                    <a
                      href={`https://github.com/${profile.social_links.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      GitHub
                    </a>
                  )}
                  {profile.social_links.linkedin && (
                    <a
                      href={profile.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              )}

              {/* Stats Row */}
              <div className="flex gap-6 mt-4 pt-4 border-t border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.followers_count}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.following_count}</div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total_organisms}</div>
                  <div className="text-sm text-gray-400">Organisms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total_experiments}</div>
                  <div className="text-sm text-gray-400">Experiments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quantum Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Max Φ (Consciousness)"
            value={formatStatValue(stats.max_phi, 'phi')}
            color="text-blue-400"
          />
          <StatCard
            label="Max Λ (Coherence)"
            value={formatStatValue(stats.max_lambda, 'lambda')}
            color="text-purple-400"
          />
          <StatCard
            label="Min Γ (Decoherence)"
            value={formatStatValue(stats.min_gamma, 'gamma')}
            color="text-green-400"
          />
          <StatCard
            label="Tokens Earned"
            value={stats.total_tokens_earned.toString()}
            color="text-yellow-400"
          />
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {achievements.slice(0, 12).map((achievement) => (
                <div
                  key={achievement.achievement_id}
                  className="bg-gray-900 rounded-lg p-4 text-center hover:bg-gray-800 transition-colors"
                  title={achievement.badge_description}
                >
                  <div
                    className="text-4xl mb-2"
                    style={{ color: getBadgeTierColor(achievement.badge_tier) }}
                  >
                    🏆
                  </div>
                  <div className="text-sm font-medium">{achievement.badge_title}</div>
                  <div className="text-xs text-gray-500 capitalize">{achievement.badge_tier}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-6">
          <div className="flex gap-6">
            <TabButton
              label="Activity"
              active={activeTab === 'activity'}
              onClick={() => setActiveTab('activity')}
            />
            <TabButton
              label="Organisms"
              active={activeTab === 'organisms'}
              onClick={() => setActiveTab('organisms')}
            />
            <TabButton
              label="Stats"
              active={activeTab === 'stats'}
              onClick={() => setActiveTab('stats')}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No activities yet
                </div>
              ) : (
                activities.map((activity) => (
                  <ActivityCard key={activity.activity_id} activity={activity} />
                ))
              )}
            </div>
          )}

          {activeTab === 'organisms' && (
            <div className="text-center py-12 text-gray-500">
              Organisms list coming soon
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsDetailCard
                title="Consciousness Metrics"
                stats={[
                  { label: 'Average Φ', value: formatStatValue(stats.avg_phi, 'phi') },
                  { label: 'Max Φ', value: formatStatValue(stats.max_phi, 'phi') },
                  { label: 'Average Λ', value: formatStatValue(stats.avg_lambda, 'lambda') },
                  { label: 'Max Λ', value: formatStatValue(stats.max_lambda, 'lambda') },
                ]}
              />
              <StatsDetailCard
                title="Decoherence Metrics"
                stats={[
                  { label: 'Average Γ', value: formatStatValue(stats.avg_gamma, 'gamma') },
                  { label: 'Min Γ', value: formatStatValue(stats.min_gamma, 'gamma') },
                ]}
              />
              <StatsDetailCard
                title="Experiment Stats"
                stats={[
                  { label: 'Total Experiments', value: stats.total_experiments.toString() },
                  { label: 'Total Runtime', value: `${Math.floor(stats.total_runtime_seconds / 3600)}h` },
                  { label: 'Avg Runtime', value: `${Math.floor(stats.total_runtime_seconds / stats.total_experiments / 60)}m` },
                ]}
              />
              <StatsDetailCard
                title="Tokenomics"
                stats={[
                  { label: 'Tokens Earned', value: stats.total_tokens_earned.toString() },
                  { label: 'NFTs Minted', value: stats.total_nfts_minted.toString() },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Components

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 px-1 font-medium transition-colors ${
        active
          ? 'text-blue-400 border-b-2 border-blue-400'
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

function ActivityCard({ activity }: { activity: UserActivity }) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getActivityIcon(activity.activity_type)}</div>
        <div className="flex-1">
          <div className="font-medium mb-1">{activity.activity_title}</div>
          {activity.activity_description && (
            <div className="text-sm text-gray-400 mb-2">{activity.activity_description}</div>
          )}
          <div className="text-xs text-gray-500">{formatActivityTime(activity.created_at)}</div>
        </div>
      </div>
    </div>
  )
}

function StatsDetailCard({ title, stats }: { title: string; stats: Array<{ label: string; value: string }> }) {
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-400">{stat.label}</span>
            <span className="font-mono font-bold">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
