import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shinmen Takezo IDE',
  description: 'A comprehensive web-based IDE featuring Monaco Editor integration and AI-powered development assistance',
  keywords: ['IDE', 'web-based', 'monaco-editor', 'ai-powered', 'development'],
  authors: [{ name: 'Shinmen Takezo IDE Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Cross-Origin-Embedder-Policy" content="require-corp" />
        <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin" />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <div id="root" className="h-screen w-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
