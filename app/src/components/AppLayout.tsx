import { Outlet } from 'react-router'
import { SideNav } from './SideNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Fixed left sidebar — w-64 */}
      <SideNav />

      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
