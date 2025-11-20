import { useState, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Dashboard } from '@/components/Dashboard'
import { Members } from '@/components/Members'
import { Contributions } from '@/components/Contributions'
import { Loans } from '@/components/Loans'
import { Meetings } from '@/components/Meetings'
import { Reports } from '@/components/Reports'
import { Toaster } from '@/components/ui/sonner'

type Page = 'dashboard' | 'members' | 'contributions' | 'loans' | 'meetings' | 'reports'

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      window.location.href = '/index.html';
    }
    setIsLoading(false);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />
      case 'members':
        return <Members />
      case 'contributions':
        return <Contributions />
      case 'loans':
        return <Loans />
      case 'meetings':
        return <Meetings />
      case 'reports':
        return <Reports />
      default:
        return <Dashboard />
    }
  }

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return null; // This will not be reached because of the redirect
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar activePage={activePage} onPageChange={setActivePage} />
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto p-6">
            {renderPage()}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

export default App
