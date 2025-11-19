import { Outlet } from 'react-router-dom'
import Sidebar from '../navigation/Sidebar'
import TopBar from '../navigation/TopBar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="flex max-w-7xl mx-auto gap-6 px-4 pb-10">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
