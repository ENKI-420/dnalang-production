import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'dna::}{::lang - Autonomous Software. Quantum-Optimized. Alive.',
  description: 'The first platform where agents, organisms, and quantum circuits evolve together. Self-improving systems powered by IBM Quantum hardware, evolutionary programming, and the ΛΦ universal memory framework.',
  keywords: ['quantum computing', 'autonomous agents', 'living software', 'quantum organisms', 'IBM Quantum', 'evolutionary programming', 'ΛΦ framework', 'DNA-Lang', 'self-evolving systems', 'quantum consciousness'],
  authors: [{ name: 'dna::}{::lang' }],
  generator: 'dna::}{::lang',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
  openGraph: {
    title: 'dna::}{::lang - Living Autonomous Infrastructure',
    description: 'Autonomous software that evolves. Quantum-optimized organisms powered by IBM Quantum hardware.',
    type: 'website',
    url: 'https://dnalang.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dna::}{::lang - Autonomous Software',
    description: 'The first platform where agents, organisms, and quantum circuits evolve together.',
  },
}

export const viewport = {
  themeColor: '#02010A',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
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
