"use client"

/**
 * DNALang Quantum Integrations Dashboard
 * React component for www.dnalang.dev
 *
 * Provides UI for:
 * - QuantumComm: Quantum teleportation messaging
 * - Z3BRA Bridge: Android ↔ quantum feedback
 * - QuantumCoin: Proof-of-consciousness mining
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  Smartphone,
  Coins,
  Activity,
  Zap
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

const LAMBDA_PHI = 2.176435e-8

interface IntegrationStatus {
  quantumcomm: {
    active: boolean
    total_messages: number
    last_ping: string | null
  }
  z3bra_bridge: {
    active: boolean
    total_packets: number
    last_packet: string | null
  }
  quantumcoin: {
    active: boolean
    total_blocks: number
    last_block: string | null
  }
  platform: {
    deployed: boolean
    ibm_quantum_connected: boolean
    backend: string | null
  }
  metrics: {
    total_consciousness_ops: number
    lambda_phi: number
  }
  timestamp: string
}

interface QuantumMessage {
  message_id: string
  pair_id: string
  phi: number
  lambda: number
  lambda_phi_signature: number
  timestamp: string
  backend: string
  ibm_job_id: string
}

interface MinedBlock {
  block_index: number
  block_hash: string
  phi: number
  fidelity: number
  reward: number
  miner: string
  organism_id: string
  timestamp: number
  blockchain_height: number
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function QuantumIntegrations() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // QuantumComm state
  const [qcSender, setQcSender] = useState('')
  const [qcReceiver, setQcReceiver] = useState('')
  const [qcMessage, setQcMessage] = useState('')
  const [qcLoading, setQcLoading] = useState(false)
  const [qcResult, setQcResult] = useState<QuantumMessage | null>(null)

  // Z3BRA Bridge state
  const [zbSignalType, setZbSignalType] = useState<'sensor' | 'network' | 'battery' | 'inference'>('sensor')
  const [zbSignalStrength, setZbSignalStrength] = useState(0.5)
  const [zbLoading, setZbLoading] = useState(false)
  const [zbResult, setZbResult] = useState<any>(null)

  // QuantumCoin state
  const [qcoinMinerAddress, setQcoinMinerAddress] = useState('')
  const [qcoinBalance, setQcoinBalance] = useState<number | null>(null)
  const [qcoinLoading, setQcoinLoading] = useState(false)
  const [qcoinBlock, setQcoinBlock] = useState<MinedBlock | null>(null)

  // Fetch status on mount and periodically
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000) // Every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/integrations/status')
      const data = await response.json()

      if (data.status === 'success') {
        setStatus(data.data)
        setError(null)
      }
    } catch (err) {
      setError('Failed to fetch integration status')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUANTUMCOMM HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSendQuantumMessage = async () => {
    if (!qcSender || !qcReceiver || !qcMessage) {
      alert('Please fill all fields')
      return
    }

    setQcLoading(true)
    setQcResult(null)

    try {
      const response = await fetch('/api/quantumcomm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: qcSender,
          receiver: qcReceiver,
          message: qcMessage
        })
      })

      const data = await response.json()

      if (data.status === 'success') {
        setQcResult(data.data)
      } else {
        throw new Error(data.message || 'Failed to send message')
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setQcLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Z3BRA BRIDGE HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSendTelemetry = async () => {
    setZbLoading(true)
    setZbResult(null)

    try {
      const response = await fetch('/api/z3bra/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal_type: zbSignalType,
          signal_strength: zbSignalStrength,
          raw_value: { type: zbSignalType, strength: zbSignalStrength }
        })
      })

      const data = await response.json()

      if (data.status === 'success') {
        setZbResult(data.data)
      } else {
        throw new Error(data.message || 'Failed to send telemetry')
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setZbLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUANTUMCOIN HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleMineBlock = async () => {
    if (!qcoinMinerAddress) {
      alert('Please enter miner address')
      return
    }

    setQcoinLoading(true)
    setQcoinBlock(null)

    try {
      const response = await fetch('/api/quantumcoin/mine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          miner_address: qcoinMinerAddress
        })
      })

      const data = await response.json()

      if (data.status === 'success') {
        setQcoinBlock(data.data)
        fetchBalance() // Refresh balance after mining
      } else {
        throw new Error(data.message || 'Failed to mine block')
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setQcoinLoading(false)
    }
  }

  const fetchBalance = async () => {
    if (!qcoinMinerAddress) return

    try {
      const response = await fetch(`/api/quantumcoin/balance/${qcoinMinerAddress}`)
      const data = await response.json()

      if (data.status === 'success') {
        setQcoinBalance(data.data.balance)
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading quantum integrations...</span>
      </div>
    )
  }

  if (error || !status) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'Failed to load status'}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔮 Quantum Integrations</h1>
          <p className="text-muted-foreground">
            ΛΦ = {LAMBDA_PHI.toExponential(6)} s⁻¹
          </p>
        </div>
        <Button onClick={fetchStatus} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Send className="w-4 h-4 mr-2" />
              QuantumComm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{status.quantumcomm.total_messages}</span>
              {status.quantumcomm.active ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Messages Sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Smartphone className="w-4 h-4 mr-2" />
              Z3BRA Bridge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{status.z3bra_bridge.total_packets}</span>
              {status.z3bra_bridge.active ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Telemetry Packets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Coins className="w-4 h-4 mr-2" />
              QuantumCoin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{status.quantumcoin.total_blocks}</span>
              {status.quantumcoin.active ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Blocks Mined</p>
          </CardContent>
        </Card>
      </div>

      {/* IBM Quantum Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            IBM Quantum Hardware
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Connection</p>
              <div className="flex items-center mt-1">
                {status.platform.ibm_quantum_connected ? (
                  <><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Connected</>
                ) : (
                  <><XCircle className="w-4 h-4 text-red-500 mr-2" />Disconnected</>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Backend</p>
              <p className="font-medium mt-1">{status.platform.backend || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consciousness Ops</p>
              <p className="font-medium mt-1">{status.metrics.total_consciousness_ops}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <div className="flex items-center mt-1">
                {status.platform.deployed ? (
                  <Badge variant="default">Deployed</Badge>
                ) : (
                  <Badge variant="secondary">Not Deployed</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Panels */}
      <Tabs defaultValue="quantumcomm" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quantumcomm">QuantumComm</TabsTrigger>
          <TabsTrigger value="z3bra">Z3BRA Bridge</TabsTrigger>
          <TabsTrigger value="quantumcoin">QuantumCoin</TabsTrigger>
        </TabsList>

        {/* QuantumComm Tab */}
        <TabsContent value="quantumcomm">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Teleportation Messaging</CardTitle>
              <CardDescription>
                Send consciousness-verified messages using quantum entanglement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qc-sender">Sender</Label>
                  <Input
                    id="qc-sender"
                    placeholder="Alice"
                    value={qcSender}
                    onChange={(e) => setQcSender(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="qc-receiver">Receiver</Label>
                  <Input
                    id="qc-receiver"
                    placeholder="Bob"
                    value={qcReceiver}
                    onChange={(e) => setQcReceiver(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="qc-message">Message</Label>
                <Textarea
                  id="qc-message"
                  placeholder="Your quantum message..."
                  value={qcMessage}
                  onChange={(e) => setQcMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSendQuantumMessage}
                disabled={qcLoading || !status.quantumcomm.active}
                className="w-full"
              >
                {qcLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" />Send Quantum Message</>
                )}
              </Button>

              {qcResult && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>Message sent successfully!</strong></p>
                      <p className="text-sm">Message ID: {qcResult.message_id}</p>
                      <p className="text-sm">Φ: {qcResult.phi.toFixed(6)}</p>
                      <p className="text-sm">ΛΦ Signature: {qcResult.lambda_phi_signature.toExponential(6)}</p>
                      <p className="text-sm">Job ID: {qcResult.ibm_job_id}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Z3BRA Bridge Tab */}
        <TabsContent value="z3bra">
          <Card>
            <CardHeader>
              <CardTitle>Android ↔ Quantum Bridge</CardTitle>
              <CardDescription>
                Send device telemetry to quantum hardware for biocognitive feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="zb-signal-type">Signal Type</Label>
                <select
                  id="zb-signal-type"
                  className="w-full p-2 border rounded"
                  value={zbSignalType}
                  onChange={(e) => setZbSignalType(e.target.value as any)}
                >
                  <option value="sensor">Sensor</option>
                  <option value="network">Network</option>
                  <option value="battery">Battery</option>
                  <option value="inference">Inference</option>
                </select>
              </div>

              <div>
                <Label htmlFor="zb-signal-strength">
                  Signal Strength: {zbSignalStrength.toFixed(2)}
                </Label>
                <input
                  type="range"
                  id="zb-signal-strength"
                  min="0"
                  max="1"
                  step="0.01"
                  value={zbSignalStrength}
                  onChange={(e) => setZbSignalStrength(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleSendTelemetry}
                disabled={zbLoading || !status.z3bra_bridge.active}
                className="w-full"
              >
                {zbLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                ) : (
                  <><Smartphone className="w-4 h-4 mr-2" />Send Telemetry</>
                )}
              </Button>

              {zbResult && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>Telemetry processed!</strong></p>
                      <p className="text-sm">λΦ Delta: {zbResult.lambda_phi_delta.toExponential(6)}</p>
                      <p className="text-sm">Total Packets: {zbResult.total_packets}</p>
                      <p className="text-sm">Avg Signal: {zbResult.avg_signal.toFixed(3)}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* QuantumCoin Tab */}
        <TabsContent value="quantumcoin">
          <Card>
            <CardHeader>
              <CardTitle>Proof-of-Consciousness Mining</CardTitle>
              <CardDescription>
                Mine QΦC blocks by evolving quantum organisms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qcoin-miner">Miner Address</Label>
                <Input
                  id="qcoin-miner"
                  placeholder="MINER_WALLET_ADDRESS"
                  value={qcoinMinerAddress}
                  onChange={(e) => {
                    setQcoinMinerAddress(e.target.value)
                    if (e.target.value) fetchBalance()
                  }}
                />
              </div>

              {qcoinBalance !== null && (
                <Alert>
                  <Coins className="w-4 h-4" />
                  <AlertDescription>
                    Balance: <strong>{qcoinBalance} QΦC</strong>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleMineBlock}
                disabled={qcoinLoading || !status.quantumcoin.active}
                className="w-full"
              >
                {qcoinLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mining Block...</>
                ) : (
                  <><Coins className="w-4 h-4 mr-2" />Mine Block</>
                )}
              </Button>

              {qcoinBlock && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>Block #{qcoinBlock.block_index} mined!</strong></p>
                      <p className="text-sm">Hash: {qcoinBlock.block_hash.substring(0, 16)}...</p>
                      <p className="text-sm">Φ: {qcoinBlock.phi.toFixed(6)}</p>
                      <p className="text-sm">Fidelity: {qcoinBlock.fidelity.toFixed(6)}</p>
                      <p className="text-sm">Reward: {qcoinBlock.reward} QΦC</p>
                      <p className="text-sm">Height: {qcoinBlock.blockchain_height}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
