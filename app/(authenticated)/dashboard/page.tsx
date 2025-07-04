import { DashboardContent } from '@/components/dashboard-content'

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Översikt</h1>
      <DashboardContent />
    </main>
  )
}