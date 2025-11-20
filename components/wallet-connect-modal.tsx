'use client'

// components/wallet-connect-modal.tsx
// Wallet Connection Modal - MetaMask, WalletConnect, etc.

import { useState, useEffect } from 'react'
import {
  walletAPI,
  formatWalletAddress,
  validateWalletAddress,
  type WalletTransaction,
} from '@/lib/api'

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect?: (address: string) => void
}

export default function WalletConnectModal({
  isOpen,
  onClose,
  onConnect,
}: WalletConnectModalProps) {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)

  useEffect(() => {
    checkMetaMask()
    if (isOpen) {
      loadWalletInfo()
    }
  }, [isOpen])

  function checkMetaMask() {
    if (typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined') {
      setIsMetaMaskInstalled(true)
    }
  }

  async function loadWalletInfo() {
    try {
      const address = await walletAPI.getWalletAddress()
      setConnectedAddress(address)

      if (address) {
        const txs = await walletAPI.getTransactions(undefined, 10)
        setTransactions(txs)
      }
    } catch (err: any) {
      console.error('Failed to load wallet info:', err)
    }
  }

  async function connectMetaMask() {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask extension.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      })

      const address = accounts[0]

      // Validate address format
      if (!validateWalletAddress(address)) {
        throw new Error('Invalid wallet address')
      }

      // Connect wallet to user account
      await walletAPI.connectWallet(address)

      setConnectedAddress(address)

      if (onConnect) {
        onConnect(address)
      }

      // Reload transactions
      await loadWalletInfo()
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  async function disconnectWallet() {
    try {
      setLoading(true)
      setError(null)

      await walletAPI.disconnectWallet()
      setConnectedAddress(null)
      setTransactions([])
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet')
    } finally {
      setLoading(false)
    }
  }

  async function switchNetwork() {
    try {
      setLoading(true)
      setError(null)

      // Switch to Base network (chain ID 8453)
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet
      })
    } catch (err: any) {
      // If network doesn't exist, add it
      if (err.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          })
        } catch (addError: any) {
          setError(addError.message || 'Failed to add Base network')
        }
      } else {
        setError(err.message || 'Failed to switch network')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Connected State */}
          {connectedAddress ? (
            <>
              {/* Wallet Info */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Connected Address</div>
                <div className="font-mono text-lg mb-4">{formatWalletAddress(connectedAddress)}</div>
                <div className="text-xs text-gray-500 break-all">{connectedAddress}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={switchNetwork}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Switch to Base
                </button>
                <button
                  onClick={disconnectWallet}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>

              {/* Recent Transactions */}
              {transactions.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3">Recent Transactions</h3>
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <TransactionItem key={tx.transaction_id} transaction={tx} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Wallet Options */}
              <div className="space-y-3">
                {/* MetaMask */}
                <button
                  onClick={connectMetaMask}
                  disabled={loading || !isMetaMaskInstalled}
                  className="w-full px-4 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-3"
                >
                  <MetaMaskIcon />
                  <span>{loading ? 'Connecting...' : 'Connect MetaMask'}</span>
                </button>

                {!isMetaMaskInstalled && (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-center transition-colors text-sm"
                  >
                    Install MetaMask
                  </a>
                )}

                {/* WalletConnect (Coming Soon) */}
                <button
                  disabled
                  className="w-full px-4 py-4 bg-gray-800 rounded-lg font-medium transition-colors flex items-center justify-center gap-3 opacity-50 cursor-not-allowed"
                >
                  <WalletConnectIcon />
                  <span>WalletConnect (Coming Soon)</span>
                </button>

                {/* Coinbase Wallet (Coming Soon) */}
                <button
                  disabled
                  className="w-full px-4 py-4 bg-gray-800 rounded-lg font-medium transition-colors flex items-center justify-center gap-3 opacity-50 cursor-not-allowed"
                >
                  <CoinbaseIcon />
                  <span>Coinbase Wallet (Coming Soon)</span>
                </button>
              </div>

              {/* Info */}
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm text-blue-300">
                <p className="font-medium mb-2">Why connect a wallet?</p>
                <ul className="space-y-1 text-xs">
                  <li>• Mint quantum organisms as NFTs</li>
                  <li>• Earn and spend platform tokens</li>
                  <li>• Trade NFTs on secondary markets</li>
                  <li>• Participate in governance</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Transaction Item Component
function TransactionItem({ transaction }: { transaction: WalletTransaction }) {
  const statusColors = {
    pending: 'text-yellow-400',
    confirmed: 'text-green-400',
    failed: 'text-red-400',
  }

  const typeIcons = {
    token_earn: '💰',
    token_spend: '💸',
    nft_mint: '🖼️',
    nft_transfer: '↔️',
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeIcons[transaction.transaction_type]}</span>
          <span className="font-medium capitalize">
            {transaction.transaction_type.replace('_', ' ')}
          </span>
        </div>
        <span className={`text-xs font-medium ${statusColors[transaction.status]}`}>
          {transaction.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{transaction.amount} {transaction.token_type}</span>
        <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
      </div>
      {transaction.blockchain_tx_hash && (
        <div className="mt-2 font-mono text-xs text-gray-500 truncate">
          {transaction.blockchain_tx_hash}
        </div>
      )}
    </div>
  )
}

// Icons
function MetaMaskIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21.5 7.5L13.5 2.5L6 7L7.5 11.5L4.5 13L6.5 16.5L4 18.5L7.5 21.5L13.5 18.5L19.5 21.5L23 18.5L20.5 16.5L22.5 13L19.5 11.5L21.5 7.5Z"
        fill="#E2761B"
        stroke="#E2761B"
        strokeWidth="0.5"
      />
    </svg>
  )
}

function WalletConnectIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5.5 9.5C9.09 5.91 14.91 5.91 18.5 9.5L19 10L21.5 7.5L21 7C16.03 2.03 7.97 2.03 3 7L2.5 7.5L5 10L5.5 9.5Z"
        fill="#3B99FC"
      />
      <circle cx="12" cy="17" r="3" fill="#3B99FC" />
    </svg>
  )
}

function CoinbaseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="9" fill="#0052FF" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="white" />
    </svg>
  )
}
