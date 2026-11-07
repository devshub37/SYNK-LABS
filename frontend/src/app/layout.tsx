import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://synk-labs.vercel.app'),
  title: 'SYNK LABS',
  description: 'Seamlessly sync your clipboard and files across devices in real time.',
  applicationName: 'SYNK LABS',
  appleWebApp: {
    capable: true,
    title: 'SYNK LABS',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    title: 'SYNK LABS',
    description: 'Seamlessly sync your clipboard and files across devices in real time.',
    url: 'https://synk-labs.vercel.app',
    siteName: 'SYNK LABS',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FAF8F5',
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
