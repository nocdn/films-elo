import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

const ioskeleyMono = localFont({
  src: [
    {
      path: "./fonts/IoskeleyMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/IoskeleyMono-Medium.woff2",
      weight: "500",
      style: "medium",
    },
    {
      path: "./fonts/IoskeleyMono-SemiBold.woff2",
      weight: "600",
      style: "semibold",
    },
  ],
  variable: "--font-ioskeley-mono",
})

export const metadata: Metadata = {
  title: "Films ranking",
  description: "A tool to help you rank the films you've seen",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jetBrainsMono.variable} ${ioskeleyMono.variable} bg-background flex h-svh flex-col items-center`}
      >
        {children}
      </body>
    </html>
  )
}
