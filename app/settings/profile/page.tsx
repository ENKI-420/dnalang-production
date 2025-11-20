'use client'

// app/settings/profile/page.tsx
// Profile Settings Page - Edit Profile, Upload Images, Privacy Settings

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  profileAPI,
  authAPI,
  validateBio,
  validateURL,
  formatProfileForDisplay,
  API_CONFIG,
  type UserProfile,
  type ProfileUpdatePayload,
} from '@/lib/api'

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [researchInterests, setResearchInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState('')
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    github: '',
    linkedin: '',
    website: '',
  })
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public')
  const [showEmail, setShowEmail] = useState(false)
  const [showStats, setShowStats] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const user = await authAPI.getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      const profileData = await profileAPI.getMyProfile()
      if (!profileData) {
        setError('Profile not found')
        return
      }

      setProfile(profileData)

      // Set form state from profile
      setDisplayName(profileData.display_name || '')
      setBio(profileData.bio || '')
      setLocation(profileData.location || '')
      setWebsiteUrl(profileData.website_url || '')
      setAffiliation(profileData.affiliation || '')
      setResearchInterests(profileData.research_interests || [])
      setSocialLinks(profileData.social_links || { twitter: '', github: '', linkedin: '', website: '' })
      setVisibility(profileData.visibility)
      setShowEmail(profileData.show_email)
      setShowStats(profileData.show_stats)
    } catch (err: any) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      // Validate bio
      const bioValidation = validateBio(bio)
      if (!bioValidation.valid) {
        setError(bioValidation.error || 'Invalid bio')
        return
      }

      // Validate website URL if provided
      if (websiteUrl) {
        const urlValidation = validateURL(websiteUrl)
        if (!urlValidation.valid) {
          setError(urlValidation.error || 'Invalid website URL')
          return
        }
      }

      const updates: ProfileUpdatePayload = {
        display_name: displayName,
        bio: bio || undefined,
        location: location || undefined,
        website_url: websiteUrl || undefined,
        affiliation: affiliation || undefined,
        research_interests: researchInterests,
        social_links: socialLinks,
        visibility,
        show_email: showEmail,
        show_stats: showStats,
      }

      const updatedProfile = await profileAPI.updateProfile(updates)
      setProfile(updatedProfile)
      setSuccessMessage('Profile updated successfully!')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingAvatar(true)
      setError(null)

      const url = await profileAPI.uploadAvatar(file)

      // Reload profile to show new avatar
      await loadProfile()
      setSuccessMessage('Avatar updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingBanner(true)
      setError(null)

      const url = await profileAPI.uploadBanner(file)

      // Reload profile to show new banner
      await loadProfile()
      setSuccessMessage('Banner updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload banner')
    } finally {
      setUploadingBanner(false)
    }
  }

  async function handleDeleteAvatar() {
    if (!confirm('Are you sure you want to remove your avatar?')) return

    try {
      await profileAPI.deleteAvatar()
      await loadProfile()
      setSuccessMessage('Avatar removed successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to remove avatar')
    }
  }

  function addResearchInterest() {
    if (!newInterest.trim()) return
    if (researchInterests.includes(newInterest.trim())) return

    setResearchInterests([...researchInterests, newInterest.trim()])
    setNewInterest('')
  }

  function removeResearchInterest(interest: string) {
    setResearchInterests(researchInterests.filter(i => i !== interest))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-400">Profile not found</p>
        </div>
      </div>
    )
  }

  const formattedProfile = formatProfileForDisplay(profile)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-400">Customize your public profile</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-lg text-green-300">
            {successMessage}
          </div>
        )}

        {/* Banner Upload */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Profile Banner</label>
          <div className="relative h-48 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg overflow-hidden mb-4">
            {profile.banner_url && (
              <Image
                src={profile.banner_url}
                alt="Profile banner"
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex gap-2">
            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors">
              {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
                disabled={uploadingBanner}
              />
            </label>
            <span className="text-sm text-gray-500 py-2">Max {API_CONFIG.MAX_BANNER_SIZE / 1024 / 1024}MB</span>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Avatar</label>
          <div className="flex items-center gap-6 mb-4">
            <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden">
              <Image
                src={formattedProfile.avatarUrl}
                alt={formattedProfile.displayName}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
            <div className="flex gap-2">
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors">
                {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
              {formattedProfile.hasCustomAvatar && (
                <button
                  onClick={handleDeleteAvatar}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">Max {API_CONFIG.MAX_AVATAR_SIZE / 1024 / 1024}MB</p>
        </div>

        {/* Basic Info */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={API_CONFIG.MAX_BIO_LENGTH}
                rows={4}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
              <div className="text-sm text-gray-500 mt-1">
                {bio.length}/{API_CONFIG.MAX_BIO_LENGTH} characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Affiliation</label>
              <input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="University, Company, etc."
              />
            </div>
          </div>
        </div>

        {/* Research Interests */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Research Interests</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addResearchInterest()}
              className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Add research interest..."
            />
            <button
              onClick={addResearchInterest}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {researchInterests.map((interest, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-blue-900/50 border border-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {interest}
                <button
                  onClick={() => removeResearchInterest(interest)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Social Links</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Twitter Username</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">@</span>
                <input
                  type="text"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">GitHub Username</label>
              <input
                type="text"
                value={socialLinks.github}
                onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Privacy Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Profile Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'followers' | 'private')}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="public">Public - Anyone can view</option>
                <option value="followers">Followers Only</option>
                <option value="private">Private - Only you</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showEmail"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showEmail" className="text-sm">Show email on profile</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showStats"
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showStats" className="text-sm">Show quantum stats on profile</label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => router.push(`/profile/${profile.username}`)}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
