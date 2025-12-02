import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
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
import { ForgotPassword } from '@/components/ForgotPassword';
import { ResetPassword } from '@/components/ResetPassword';
import { EmailVerification } from '@/components/EmailVerification';
import { useAuth } from '@/contexts/AuthContext';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { isMobile } = useSidebar();

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verifyemail'];
  const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));

  if (!user && !isPublicPath) {
    return <Navigate to="/login" />;
  }

  if (user && isPublicPath) {
    return <Navigate to="/" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-background">
        {isMobile && (
          <header className="flex items-center justify-between border-b bg-card p-4">
            <div>{/* You can add a logo or page title here */}</div>
            <SidebarTrigger />
          </header>
        )}
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/contributions" element={<Contributions />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </main>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verifyemail/:token" element={<EmailVerification />} />
      <Route path="/*" element={<AppContent />} />
    </Routes>
  );
}

export default App;