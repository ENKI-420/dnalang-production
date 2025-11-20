'use client'

// app/nfts/page.tsx
// NFT Gallery Page - DNA::}{::lang Multi-User Platform

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  nftAPI,
  authAPI,
  formatWalletAddress,
  getBlockchainExplorerURL,
  getIPFSUrl,
  type NFTMetadata,
} from '@/lib/api'

type NFTFilter = 'all' | 'my_nfts' | 'organisms' | 'experiments' | 'achievements'

export default function NFTGalleryPage() {
  const [nfts, setNfts] = useState<(NFTMetadata & { username?: string; display_name?: string; avatar_url?: string })[]>([])
  const [myNfts, setMyNfts] = useState<NFTMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<NFTFilter>('all')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null)

  useEffect(() => {
    checkAuth()
    loadNFTs()
  }, [filter])

  async function checkAuth() {
    const user = await authAPI.getCurrentUser()
    setIsAuthenticated(!!user)
  }

  async function loadNFTs() {
    try {
      setLoading(true)
      setError(null)

      if (filter === 'my_nfts') {
        if (!isAuthenticated) {
          setError('Please login to view your NFTs')
          setNfts([])
          return
        }
        const data = await nftAPI.getUserNFTs()
        setMyNfts(data)
        setNfts(data as any)
      } else {
        const data = await nftAPI.getRecentMints(100)
        setNfts(data)

        // Apply filter
        if (filter === 'organisms') {
          setNfts(data.filter(n => n.nft_type === 'organism'))
        } else if (filter === 'experiments') {
          setNfts(data.filter(n => n.nft_type === 'experiment'))
        } else if (filter === 'achievements') {
          setNfts(data.filter(n => n.nft_type === 'achievement'))
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load NFTs')
    } finally {
      setLoading(false)
    }
  }

  const filterOptions: { value: NFTFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All NFTs', icon: '🖼️' },
    { value: 'my_nfts', label: 'My NFTs', icon: '👤' },
    { value: 'organisms', label: 'Organisms', icon: '🧬' },
    { value: 'experiments', label: 'Experiments', icon: '⚛️' },
    { value: 'achievements', label: 'Achievements', icon: '🏆' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">NFT Gallery</h1>
          <p className="text-xl text-gray-400">
            Quantum organisms, experiments, and achievements minted as NFTs
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 justify-center min-w-max">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total NFTs" value={nfts.length.toString()} />
          <StatCard
            label="Organisms"
            value={nfts.filter(n => n.nft_type === 'organism').length.toString()}
          />
          <StatCard
            label="Experiments"
            value={nfts.filter(n => n.nft_type === 'experiment').length.toString()}
          />
          <StatCard
            label="Achievements"
            value={nfts.filter(n => n.nft_type === 'achievement').length.toString()}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-400">Loading NFTs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-8 text-red-300">
            {error}
          </div>
        )}

        {/* NFT Grid */}
        {!loading && !error && (
          <>
            {nfts.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-lg">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-gray-500 text-lg">No NFTs yet</p>
                <p className="text-gray-600 text-sm mt-2">
                  Be the first to mint a quantum organism as an NFT!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {nfts.map((nft) => (
                  <NFTCard
                    key={nft.nft_id}
                    nft={nft}
                    onClick={() => setSelectedNFT(nft)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <NFTDetailModal
          nft={selectedNFT}
          onClose={() => setSelectedNFT(null)}
        />
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 text-center">
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  )
}

// NFT Card Component
function NFTCard({
  nft,
  onClick,
}: {
  nft: NFTMetadata & { username?: string; display_name?: string; avatar_url?: string }
  onClick: () => void
}) {
  const typeColors = {
    organism: 'border-blue-500',
    experiment: 'border-purple-500',
    achievement: 'border-yellow-500',
  }

  const typeIcons = {
    organism: '🧬',
    experiment: '⚛️',
    achievement: '🏆',
  }

  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform border-2 ${
        typeColors[nft.nft_type]
      }`}
    >
      {/* NFT Image */}
      <div className="aspect-square bg-gradient-to-br from-blue-900 to-purple-900 relative">
        {nft.metadata.image && (
          <Image
            src={nft.metadata.image}
            alt={nft.metadata.name}
            fill
            className="object-cover"
          />
        )}
        {!nft.metadata.image && (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {typeIcons[nft.nft_type]}
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 rounded text-xs font-medium capitalize">
          {nft.nft_type}
        </div>

        {/* Minted Badge */}
        {nft.token_id && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-600/80 rounded text-xs font-medium">
            Minted
          </div>
        )}
      </div>

      {/* NFT Info */}
      <div className="p-4">
        <h3 className="font-bold mb-2 truncate">{nft.metadata.name}</h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {nft.metadata.description}
        </p>

        {/* Creator Info */}
        {nft.username && (
          <Link
            href={`/profile/${nft.username}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:underline"
          >
            {nft.avatar_url && (
              <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden">
                <Image
                  src={nft.avatar_url}
                  alt={nft.display_name || nft.username}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-xs text-gray-500">
              by {nft.display_name || nft.username}
            </span>
          </Link>
        )}

        {/* Token ID */}
        {nft.token_id && (
          <div className="mt-2 text-xs text-gray-600 font-mono">
            #{nft.token_id}
          </div>
        )}
      </div>
    </div>
  )
}

// NFT Detail Modal
function NFTDetailModal({
  nft,
  onClose,
}: {
  nft: NFTMetadata
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Left: Image */}
          <div className="aspect-square bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg relative overflow-hidden">
            {nft.metadata.image ? (
              <Image
                src={nft.metadata.image}
                alt={nft.metadata.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-8xl">
                {nft.nft_type === 'organism' && '🧬'}
                {nft.nft_type === 'experiment' && '⚛️'}
                {nft.nft_type === 'achievement' && '🏆'}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold">{nft.metadata.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                <p className="text-gray-300">{nft.metadata.description}</p>
              </div>

              {/* Type */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Type</h3>
                <div className="inline-block px-3 py-1 bg-gray-800 rounded capitalize">
                  {nft.nft_type}
                </div>
              </div>

              {/* Attributes */}
              {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Attributes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {nft.metadata.attributes.map((attr, index) => (
                      <div key={index} className="bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-500 mb-1">
                          {attr.trait_type}
                        </div>
                        <div className="font-mono font-bold">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blockchain Info */}
              {nft.token_id && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Token ID</h3>
                    <div className="font-mono text-sm">{nft.token_id}</div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Contract</h3>
                    <div className="font-mono text-sm break-all">
                      {nft.contract_address || 'Not deployed'}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Blockchain</h3>
                    <div className="capitalize">{nft.blockchain}</div>
                  </div>
                </>
              )}

              {/* IPFS */}
              {nft.ipfs_hash && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">IPFS</h3>
                  <a
                    href={getIPFSUrl(nft.ipfs_hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm break-all"
                  >
                    {nft.ipfs_hash}
                  </a>
                </div>
              )}

              {/* Minted Date */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Minted</h3>
                <div className="text-sm">
                  {new Date(nft.minted_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              {/* External Links */}
              <div className="flex gap-2 pt-4">
                {nft.metadata.external_url && (
                  <a
                    href={nft.metadata.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Details
                  </a>
                )}
                {nft.contract_address && nft.token_id && (
                  <a
                    href={getBlockchainExplorerURL(
                      nft.blockchain,
                      nft.contract_address
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
