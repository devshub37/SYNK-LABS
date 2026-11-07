import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'synk',
  description: 'Seamlessly sync your clipboard across devices in real-time.',
  applicationName: 'synk',
  appleWebApp: {
    capable: true,
    title: 'synk',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icons/icon-192x192.svg',
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    title: 'synk',
    description: 'Seamlessly sync your clipboard across devices in real-time.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#090412',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans`}>{children}</body>
    </html>
  )
}
