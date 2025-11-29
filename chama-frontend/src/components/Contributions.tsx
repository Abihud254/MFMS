import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Contribution {
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

export function Contributions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContribution, setNewContribution] = useState({
    member: '',
    amount: '',
    type: 'monthly' as 'monthly' | 'special',
  });
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [contributionsRes, membersRes] = await Promise.all([
          fetch('https://mfms-1.onrender.com/api/contributions', {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          fetch('https://mfms-1.onrender.com/api/members', {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

        const contributionsData = await contributionsRes.json();
        const membersData = await membersRes.json();

        if (contributionsData.success) {
          setContributions(contributionsData.data);
        } else {
          setError(contributionsData.error || 'Failed to fetch contributions');
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

  const filteredContributions = contributions.filter(contribution =>
    contribution.member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalContributions = contributions
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingContributions = contributions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleAddContribution = async () => {
    if (!newContribution.member || !newContribution.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('https://mfms-1.onrender.com/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(newContribution),
      });

      const data = await res.json();

      if (data.success) {
        setContributions([data.data, ...contributions]);
        setNewContribution({ member: '', amount: '', type: 'monthly' });
        setIsAddDialogOpen(false);
        toast.success('Contribution recorded successfully');
      } else {
        toast.error(data.error || 'Failed to record contribution');
      }
    } catch (err) {
      toast.error('An error occurred while recording the contribution');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contributions</h1>
          <p className="text-muted-foreground">
            Track member contributions and payments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Contribution
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Contribution</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="member">Member</Label>
                <Select
                  value={newContribution.member}
                  onValueChange={(value) =>
                    setNewContribution({ ...newContribution, member: value })
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
                  value={newContribution.amount}
                  onChange={(e) =>
                    setNewContribution({
                      ...newContribution,
                      amount: e.target.value,
                    })
                  }
                  placeholder="15000"
                />
              </div>
              <div>
                <Label htmlFor="type">Contribution Type</Label>
                <Select
                  value={newContribution.type}
                  onValueChange={(value: 'monthly' | 'special') =>
                    setNewContribution({ ...newContribution, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Contribution</SelectItem>
                    <SelectItem value="special">Special Contribution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddContribution} className="w-full">
                Record Contribution
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalContributions)}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(pendingContributions)}</div>
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
              {formatCurrency(totalContributions / (contributions.filter(c => c.status === 'completed').length || 1))}
            </div>
            <p className="text-xs text-muted-foreground">
              Per contribution
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

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
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
              ) : filteredContributions.map((contribution) => (
                <TableRow key={contribution._id}>
                  <TableCell className="font-medium">
                    {contribution.member.name}
                  </TableCell>
                  <TableCell>{formatCurrency(contribution.amount)}</TableCell>
                  <TableCell>{new Date(contribution.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={contribution.type === 'monthly' ? 'default' : 'secondary'}>
                      {contribution.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={contribution.status === 'completed' ? 'default' : 'destructive'}>
                      {contribution.status}
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
