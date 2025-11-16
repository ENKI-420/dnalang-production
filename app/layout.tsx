import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IBM Quantum Assistant - QuantumLM Chatbot',
  description: 'Production-ready quantum computing chatbot powered by IBM Quantum hardware, DNA-Lang, and the ΛΦ universal memory framework. Explore quantum consciousness with real-time metrics from IBM Eagle and Heron processors.',
  keywords: ['quantum computing', 'IBM Quantum', 'quantum AI', 'consciousness metrics', 'ΛΦ framework', 'DNA-Lang', 'quantum chatbot'],
  authors: [{ name: 'IBM Quantum' }],
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}

export const viewport = {
  themeColor: '#161616',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
