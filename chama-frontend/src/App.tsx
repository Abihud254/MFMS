import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Dashboard } from '@/components/Dashboard';
import { Members } from '@/components/Members';
import { Contributions } from '@/components/Contributions';
import { Loans } from '@/components/Loans';
import { Meetings } from '@/components/Meetings';
import { Reports } from '@/components/Reports';
import { Toaster } from '@/components/ui/sonner';
import { Login } from '@/components/Login';
import { Register } from '@/components/Register';
import { ForgotPassword } from '@/components/ForgotPassword'; // Import the new component
import { ResetPassword } from '@/components/ResetPassword'; // Import the new component
import { EmailVerification } from '@/components/EmailVerification'; // Import the new component
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

type Page = 'dashboard' | 'members' | 'contributions' | 'loans' | 'meetings' | 'reports';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [activePage, setActivePage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return <Members />;
      case 'contributions':
        return <Contributions />;
      case 'loans':
        return <Loans />;
      case 'meetings':
        return <Meetings />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  // Redirect unauthenticated users to login, but allow access to /forgot-password, /register, /reset-password and /verifyemail
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password/:token', '/verifyemail/:token'];
  if (!user && !publicPaths.some(path => location.pathname.startsWith(path.replace('/:token', '')))) {
    return <Navigate to="/login" />;
  }

  if (user && publicPaths.some(path => location.pathname.startsWith(path.replace('/:token', '')))) {
    return <Navigate to="/" />;
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar activePage={activePage} onPageChange={setActivePage} />
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto p-6">{renderPage()}</div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verifyemail/:token" element={<EmailVerification />} /> {/* New route */}
      <Route path="/*" element={<AppContent />} />
    </Routes>
  );
}

export default App;