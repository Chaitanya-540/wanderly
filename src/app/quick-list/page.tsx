import QuickList from '@/components/discovery/QuickList'

export const metadata = { title: 'Quick List — BHĀRAT3D' }

export default function QuickListPage() {
  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-white">Quick List</h1>
        <p className="text-white/50 mt-1 text-sm">Browse and filter all 84 Indian attractions</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <QuickList />
      </div>
    </div>
  )
}
