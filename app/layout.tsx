import type React from "react"
import type { Metadata } from "next"
// <CHANGE> Geist 폰트가 Next.js 15에서 지원되지 않아 Inter로 변경
import { Inter } from "next/font/google"
import "./globals.css"

// <CHANGE> Inter 폰트로 교체 (Geist 대신)
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "MSDS System",
  description: "Material Safety Data Sheet Management System",
  generator: "v0.app",
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
