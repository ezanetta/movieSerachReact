import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CineSearch — Movie & Series Finder',
  description: 'Search for movies and series powered by OMDb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
