import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wayback Machine Downloader',
  description: 'Download archived websites from the Wayback Machine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}