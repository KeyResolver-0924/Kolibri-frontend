'use client'

import { Navbar } from "@/components/navbar"
import { UserProvider } from "@/contexts/user-context"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <Navbar />
        <main className="container mx-auto p-4 max-w-7xl">{children}</main>
      </div>
    </UserProvider>
  )
} 