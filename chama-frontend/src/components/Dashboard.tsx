import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  DollarSign,
  Banknote,
  TrendingUp,
  Calendar,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalSavings: 0,
    activeLoans: 0,
    totalLoaned: 0,
    nextMeeting: null,
    pendingContributions: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]); // New state for recent activities
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch dashboard stats
        const statsRes = await fetch('https://mfms-1.onrender.com/api/dashboard', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        } else {
          setError(statsData.error || 'Failed to fetch dashboard stats');
        }

        // Fetch recent activities
        const activitiesRes = await fetch('https://mfms-1.onrender.com/api/dashboard/recent-activities', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const activitiesData = await activitiesRes.json();
        if (activitiesData.success) {
          setRecentActivities(activitiesData.data);
        } else {
          setError(prev => prev + (prev ? ' and ' : '') + (activitiesData.error || 'Failed to fetch recent activities'));
        }

      } catch (err: any) {
        setError(prev => prev + (prev ? ' and ' : '' ) + (err.message || 'An error occurred while fetching data'));
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchData();
    }
  }, [user]);

  const handleClearDatabase = async () => {
    try {
      const res = await fetch('https://mfms-1.onrender.com/api/admin/clear-database', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Database cleared successfully. Please log in again.');
        logout(); // Log out the user after clearing the database
      } else {
        toast.error(data.error || 'Failed to clear database');
      }
    } catch (err) {
      toast.error('An error occurred while clearing the database');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'loan':
        return <Banknote className="h-4 w-4 text-blue-600" />;
      case 'repayment':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'bg-green-100 text-green-800';
      case 'loan':
        return 'bg-blue-100 text-blue-800';
      case 'repayment':
        return 'bg-purple-100 text-purple-800';
      case 'meeting':
        return 'bg-blue-100 text-blue-800'; // Meetings can also have a color
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your chama management dashboard
        </p>
      </div>

      {user?.role === 'admin' && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Clear Database</h3>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all members, loans, contributions, and meetings. This action cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Database
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all data from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearDatabase}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active group members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSavings)}</div>
            <p className="text-xs text-muted-foreground">
              Combined group savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalLoaned)} outstanding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Meeting</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.nextMeeting ? new Date(stats.nextMeeting).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingContributions} pending contributions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="text-sm font-medium">
                        {activity.type === 'meeting' ? activity.title : activity.member}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.amount && (
                      <span className="text-sm font-medium">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    <Badge className={getActivityColor(activity.type)}>
                      {activity.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No recent activities</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
