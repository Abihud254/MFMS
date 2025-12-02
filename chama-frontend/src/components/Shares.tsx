import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Share {
  _id: string;
  member: {
    _id: string;
    name: string;
  };
  amount: number;
  date: string;
  type: 'monthly' | 'special';
  status: 'completed' | 'pending';
}

interface Member {
  _id: string;
  name: string;
}

export function Shares() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newShare, setNewShare] = useState({
    member: '',
    amount: '',
    type: 'monthly' as 'monthly' | 'special',
  });
  const [shares, setShares] = useState<Share[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [sharesRes, membersRes] = await Promise.all([
          fetch(`${apiUrl}/api/shares`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          fetch(`${apiUrl}/api/members`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

        const sharesData = await sharesRes.json();
        const membersData = await membersRes.json();

        if (sharesData.success) {
          setShares(sharesData.data);
        } else {
          setError(sharesData.error || 'Failed to fetch shares');
        }

        if (membersData.success) {
          setMembers(membersData.data);
        } else {
          setError(prev => prev + (prev ? ' and ' : '') + (membersData.error || 'Failed to fetch members'));
        }
      } catch (err: any) {
        setError(prev => prev + (prev ? ' and ' : '') + (err.message || 'An error occurred while fetching data'));
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchData();
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredShares = shares.filter(share =>
    share.member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalShares = shares
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingShares = shares
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleAddShare = async () => {
    if (!newShare.member || !newShare.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(newShare),
      });

      const data = await res.json();

      if (data.success) {
        setShares([data.data, ...shares]);
        setNewShare({ member: '', amount: '', type: 'monthly' });
        setIsAddDialogOpen(false);
        toast.success('Share recorded successfully');
      } else {
        toast.error(data.error || 'Failed to record share');
      }
    } catch (err) {
      toast.error('An error occurred while recording the share');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shares</h1>
          <p className="text-muted-foreground">
            Track member shares and payments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Share
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Record New Share</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="member">Member</Label>
                <Select
                  value={newShare.member}
                  onValueChange={(value) =>
                    setNewShare({ ...newShare, member: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newShare.amount}
                  onChange={(e) =>
                    setNewShare({
                      ...newShare,
                      amount: e.target.value,
                    })
                  }
                  placeholder="15000"
                />
              </div>
              <div>
                <Label htmlFor="type">Share Type</Label>
                <Select
                  value={newShare.type}
                  onValueChange={(value: 'monthly' | 'special') =>
                    setNewShare({ ...newShare, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Share</SelectItem>
                    <SelectItem value="special">Special Share</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddShare} className="w-full">
                Record Share
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalShares)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingShares)}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalShares / (shares.filter(c => c.status === 'completed').length || 1))}
            </div>
            <p className="text-xs text-muted-foreground">
              Per share
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by member name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Shares Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shares</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Skeleton className="w-full h-[25px]" />
                    <Skeleton className="w-full h-[25px] mt-2" />
                    <Skeleton className="w-full h-[25px] mt-2" />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Alert variant="destructive">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : filteredShares.map((share) => (
                <TableRow key={share._id}>
                  <TableCell className="font-medium">
                    {share.member.name}
                  </TableCell>
                  <TableCell>{formatCurrency(share.amount)}</TableCell>
                  <TableCell>{new Date(share.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={share.type === 'monthly' ? 'default' : 'secondary'}>
                      {share.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={share.status === 'completed' ? 'default' : 'destructive'}>
                      {share.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
