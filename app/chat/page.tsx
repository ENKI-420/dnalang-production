'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Send, Paperclip, Image as ImageIcon, Camera, Monitor, Globe,
  FileText, File, X, Upload, Cloud, Loader2, Check, AlertCircle,
  Maximize2, Minimize2, RefreshCw, Download, Eye, Trash2,
  FolderOpen, Video, Mic, MicOff, VideoOff, Sparkles, Atom,
  ChevronDown, Settings
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  attachments?: Attachment[]
  sourceType?: 'text' | 'file' | 'screen' | 'camera' | 'web'
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url?: string
  preview?: string
  status: 'uploading' | 'complete' | 'error'
}

interface CloudFile {
  id: string
  name: string
  provider: 'google' | 'dropbox' | 'onedrive'
  mimeType: string
  size: number
}

export default function EnhancedChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])

  // Media states
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isWebBrowserOpen, setIsWebBrowserOpen] = useState(false)
  const [webUrl, setWebUrl] = useState('https://www.google.com')
  const [isMicActive, setIsMicActive] = useState(false)

  // Cloud integration
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([])
  const [isCloudPickerOpen, setIsCloudPickerOpen] = useState(false)

  // UI states
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAttachmentPanel, setShowAttachmentPanel] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const webIframeRef = useRef<HTMLIFrameElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup media streams on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // File upload handler
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading' as const
    }))

    setAttachments(prev => [...prev, ...newAttachments])
    setShowAttachmentPanel(true)

    // Upload files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const attachment = newAttachments[i]

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          setAttachments(prev => prev.map(a =>
            a.id === attachment.id
              ? { ...a, status: 'complete', url: data.url, preview: data.preview }
              : a
          ))
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        console.error('File upload error:', error)
        setAttachments(prev => prev.map(a =>
          a.id === attachment.id ? { ...a, status: 'error' } : a
        ))
      }
    }
  }

  // Cloud file picker
  const handleCloudFilePicker = async (provider: 'google' | 'dropbox' | 'onedrive') => {
    try {
      // This would integrate with actual cloud APIs
      const response = await fetch(`/api/cloud/${provider}/picker`, {
        method: 'POST'
      })

      if (response.ok) {
        const files: CloudFile[] = await response.json()
        setCloudFiles(files)
        setIsCloudPickerOpen(true)
      }
    } catch (error) {
      console.error('Cloud picker error:', error)
    }
  }

  // Screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop())
        screenStreamRef.current = null
      }
      setIsScreenSharing(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' },
          audio: false
        })

        screenStreamRef.current = stream
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream
        }

        setIsScreenSharing(true)

        // Listen for when user stops sharing
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          screenStreamRef.current = null
        }
      } catch (error) {
        console.error('Screen share error:', error)
        alert('Failed to start screen sharing. Please allow screen access.')
      }
    }
  }

  // Camera
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      setIsCameraActive(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })

        mediaStreamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        setIsCameraActive(true)
      } catch (error) {
        console.error('Camera error:', error)
        alert('Failed to access camera. Please allow camera access.')
      }
    }
  }

  // Capture screen/camera frame
  const captureFrame = async (source: 'screen' | 'camera') => {
    const videoElement = source === 'screen' ? screenVideoRef.current : videoRef.current

    if (!videoElement) return

    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(videoElement, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) return

      const file = new File([blob], `${source}-capture-${Date.now()}.png`, { type: 'image/png' })
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          setAttachments(prev => [...prev, {
            id: `capture-${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            status: 'complete',
            url: data.url,
            preview: data.preview
          }])
          setShowAttachmentPanel(true)
        }
      } catch (error) {
        console.error('Capture upload error:', error)
      }
    }, 'image/png')
  }

  // Web browser screenshot
  const captureWebPage = async () => {
    try {
      // Send web page URL to backend for screenshot
      const response = await fetch('/api/web/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webUrl })
      })

      if (response.ok) {
        const data = await response.json()
        setAttachments(prev => [...prev, {
          id: `web-${Date.now()}`,
          name: `webpage-${new URL(webUrl).hostname}.png`,
          type: 'image/png',
          size: 0,
          status: 'complete',
          url: data.url,
          preview: data.preview
        }])
        setShowAttachmentPanel(true)
      }
    } catch (error) {
      console.error('Web capture error:', error)
    }
  }

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  // Send message
  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return
    if (isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachments.filter(a => a.status === 'complete'),
      sourceType: attachments.length > 0 ? 'file' : 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachments([])
    setShowAttachmentPanel(false)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          attachments: userMessage.attachments,
          history: messages.slice(-10)
        })
      })

      if (response.ok) {
        const data = await response.json()

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response || data.message,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'Failed to get response from AI. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#02010A] via-[#0F3D91]/10 to-[#02010A] text-white ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#02010A]/80 border-b border-[#6A00F4]/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Atom className="h-8 w-8 text-[#00FFD1] animate-spin-slow" />
              <div>
                <h1 className="text-2xl font-light">Enhanced AI Assistant</h1>
                <p className="text-sm text-gray-400">Powered by DNA-Lang × IBM Quantum</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse mr-2" />
                Online
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-gray-400 hover:text-white"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat */}
          <div className="lg:col-span-9">
            <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-2xl">
                      <Sparkles className="h-16 w-16 text-[#00FFD1] mx-auto mb-4" />
                      <h2 className="text-2xl font-light mb-4">Welcome to Enhanced AI Assistant</h2>
                      <p className="text-gray-400 mb-8">
                        Upload files, share your screen, use your camera, or browse the web - all integrated into one powerful AI chat.
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="p-4 bg-black/20 rounded-lg border border-[#6A00F4]/20">
                          <FileText className="h-8 w-8 text-[#00FFD1] mx-auto mb-2" />
                          <p>Upload Files</p>
                        </div>
                        <div className="p-4 bg-black/20 rounded-lg border border-[#6A00F4]/20">
                          <Monitor className="h-8 w-8 text-[#00FFD1] mx-auto mb-2" />
                          <p>Share Screen</p>
                        </div>
                        <div className="p-4 bg-black/20 rounded-lg border border-[#6A00F4]/20">
                          <Camera className="h-8 w-8 text-[#00FFD1] mx-auto mb-2" />
                          <p>Use Camera</p>
                        </div>
                        <div className="p-4 bg-black/20 rounded-lg border border-[#6A00F4]/20">
                          <Globe className="h-8 w-8 text-[#00FFD1] mx-auto mb-2" />
                          <p>Browse Web</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-[#00FFD1]/20 text-[#00FFD1]'
                        : message.role === 'system'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-[#6A00F4]/20 text-[#6A00F4]'
                    }`}>
                      {message.role === 'user' ? 'U' : message.role === 'system' ? '!' : 'AI'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-[#00FFD1]/10 border border-[#00FFD1]/30'
                          : message.role === 'system'
                          ? 'bg-red-500/10 border border-red-500/30'
                          : 'bg-[#6A00F4]/10 border border-[#6A00F4]/30'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {message.attachments.map(att => (
                              <div key={att.id} className="relative group">
                                {att.type.startsWith('image/') && att.preview ? (
                                  <img
                                    src={att.preview}
                                    alt={att.name}
                                    className="w-full h-32 object-cover rounded border border-[#6A00F4]/30"
                                  />
                                ) : (
                                  <div className="w-full h-32 bg-black/20 rounded border border-[#6A00F4]/30 flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                                <p className="text-xs mt-1 truncate">{att.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#6A00F4]/20 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-[#6A00F4] animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#6A00F4]/10 border border-[#6A00F4]/30 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Thinking...</p>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Preview Panel */}
              {showAttachmentPanel && attachments.length > 0 && (
                <div className="border-t border-[#6A00F4]/20 p-4 bg-black/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">Attachments ({attachments.length})</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAttachmentPanel(false)}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {attachments.map(att => (
                      <div key={att.id} className="relative group">
                        <div className="relative">
                          {att.type.startsWith('image/') && att.preview ? (
                            <img
                              src={att.preview}
                              alt={att.name}
                              className="w-full h-20 object-cover rounded border border-[#6A00F4]/30"
                            />
                          ) : (
                            <div className="w-full h-20 bg-black/40 rounded border border-[#6A00F4]/30 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                          )}

                          {att.status === 'uploading' && (
                            <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                              <Loader2 className="h-4 w-4 text-[#00FFD1] animate-spin" />
                            </div>
                          )}

                          {att.status === 'complete' && (
                            <div className="absolute top-1 right-1">
                              <Check className="h-3 w-3 text-green-400" />
                            </div>
                          )}

                          {att.status === 'error' && (
                            <div className="absolute top-1 right-1">
                              <AlertCircle className="h-3 w-3 text-red-400" />
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(att.id)}
                            className="absolute top-1 left-1 h-5 w-5 p-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-xs mt-1 truncate">{att.name}</p>
                        <p className="text-xs text-gray-500">{(att.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-[#6A00F4]/20 p-4">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-[#6A00F4]/30 hover:bg-[#6A00F4]/20"
                  >
                    <Paperclip className="h-4 w-4 mr-1" />
                    Files
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCamera}
                    className={`border-[#6A00F4]/30 ${
                      isCameraActive ? 'bg-[#00FFD1]/20 border-[#00FFD1]/50' : 'hover:bg-[#6A00F4]/20'
                    }`}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Camera
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleScreenShare}
                    className={`border-[#6A00F4]/30 ${
                      isScreenSharing ? 'bg-[#00FFD1]/20 border-[#00FFD1]/50' : 'hover:bg-[#6A00F4]/20'
                    }`}
                  >
                    <Monitor className="h-4 w-4 mr-1" />
                    Screen
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWebBrowserOpen(!isWebBrowserOpen)}
                    className={`border-[#6A00F4]/30 ${
                      isWebBrowserOpen ? 'bg-[#00FFD1]/20 border-[#00FFD1]/50' : 'hover:bg-[#6A00F4]/20'
                    }`}
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Web
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCloudPickerOpen(true)}
                    className="border-[#6A00F4]/30 hover:bg-[#6A00F4]/20"
                  >
                    <Cloud className="h-4 w-4 mr-1" />
                    Cloud
                  </Button>
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    className="flex-1 px-4 py-3 bg-black/20 border border-[#6A00F4]/30 rounded-lg text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#00FFD1]/50"
                    rows={3}
                  />

                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() && attachments.length === 0}
                    className="bg-[#00FFD1] hover:bg-[#00FFD1]/80 text-black h-auto px-6"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Camera Preview */}
            {isCameraActive && (
              <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Camera</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => captureFrame('camera')}
                      className="h-6 px-2"
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleCamera}
                      className="h-6 px-2 text-red-400"
                    >
                      <VideoOff className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded border border-[#6A00F4]/30"
                />
              </Card>
            )}

            {/* Screen Share Preview */}
            {isScreenSharing && (
              <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Screen Share</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => captureFrame('screen')}
                      className="h-6 px-2"
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleScreenShare}
                      className="h-6 px-2 text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded border border-[#6A00F4]/30"
                />
              </Card>
            )}

            {/* Web Browser */}
            {isWebBrowserOpen && (
              <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Web Browser</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={captureWebPage}
                      className="h-6 px-2"
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsWebBrowserOpen(false)}
                      className="h-6 px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={webUrl}
                      onChange={(e) => setWebUrl(e.target.value)}
                      placeholder="Enter URL..."
                      className="flex-1 px-3 py-1 text-sm bg-black/20 border border-[#6A00F4]/30 rounded text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FFD1]/50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (webIframeRef.current) {
                          webIframeRef.current.src = webUrl
                        }
                      }}
                      className="border-[#6A00F4]/30 px-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>

                  <iframe
                    ref={webIframeRef}
                    src={webUrl}
                    className="w-full h-64 border border-[#6A00F4]/30 rounded bg-white"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </Card>
            )}

            {/* System Info */}
            <Card className="bg-[#0F3D91]/20 border-[#6A00F4]/30 p-4">
              <h3 className="text-sm font-semibold mb-3">System Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">AI Model</span>
                  <span className="text-[#00FFD1]">DNA-Lang QLM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Messages</span>
                  <span>{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Attachments</span>
                  <span>{messages.reduce((acc, m) => acc + (m.attachments?.length || 0), 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ΛΦ</span>
                  <span className="font-mono">2.176435e-8</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Cloud File Picker Modal */}
      {isCloudPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <Card className="bg-[#02010A] border-[#6A00F4]/30 p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Cloud Storage</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCloudPickerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="google" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#0F3D91]/20">
                <TabsTrigger value="google">Google Drive</TabsTrigger>
                <TabsTrigger value="dropbox">Dropbox</TabsTrigger>
                <TabsTrigger value="onedrive">OneDrive</TabsTrigger>
              </TabsList>

              <TabsContent value="google" className="mt-4">
                <Button
                  onClick={() => handleCloudFilePicker('google')}
                  className="w-full bg-[#00FFD1] hover:bg-[#00FFD1]/80 text-black"
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  Connect Google Drive
                </Button>
              </TabsContent>

              <TabsContent value="dropbox" className="mt-4">
                <Button
                  onClick={() => handleCloudFilePicker('dropbox')}
                  className="w-full bg-[#00FFD1] hover:bg-[#00FFD1]/80 text-black"
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  Connect Dropbox
                </Button>
              </TabsContent>

              <TabsContent value="onedrive" className="mt-4">
                <Button
                  onClick={() => handleCloudFilePicker('onedrive')}
                  className="w-full bg-[#00FFD1] hover:bg-[#00FFD1]/80 text-black"
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  Connect OneDrive
                </Button>
              </TabsContent>
            </Tabs>

            {cloudFiles.length > 0 && (
              <div className="mt-4 max-h-64 overflow-y-auto">
                {cloudFiles.map(file => (
                  <div
                    key={file.id}
                    className="p-3 hover:bg-[#6A00F4]/10 rounded cursor-pointer border border-transparent hover:border-[#6A00F4]/30"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-[#00FFD1]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#6A00F4]/30"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
