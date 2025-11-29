import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Loan {
  _id: string;
  member: {
    _id: string;
    name: string;
  };
  amount: number;
  interestRate: number;
  termMonths: number;
  applicationDate: string;
  approvalDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  monthlyPayment: number;
  totalRepaid: number;
  remainingBalance: number;
  nextPaymentDate: string;
}

interface Member {
  _id: string;
  name: string;
}

export function Loans() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isRepaymentDialogOpen, setIsRepaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [newApplication, setNewApplication] = useState({
    member: '',
    amount: '',
    termMonths: '12',
  });
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [loansRes, membersRes] = await Promise.all([
          fetch('https://mfms-1.onrender.com/api/loans', {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          fetch('https://mfms-1.onrender.com/api/members', {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

        const loansData = await loansRes.json();
        const membersData = await membersRes.json();

        if (loansData.success) {
          setLoans(loansData.data);
        } else {
          setError(loansData.error || 'Failed to fetch loans');
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

  const calculateMonthlyPayment = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                   (Math.pow(1 + monthlyRate, months) - 1)
    return Math.round(payment)
  }

  const handleLoanApplication = async () => {
    if (!newApplication.member || !newApplication.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('https://mfms-1.onrender.com/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(newApplication),
      });

      const data = await res.json();

      if (data.success) {
        setLoans([data.data, ...loans]);
        setNewApplication({ member: '', amount: '', termMonths: '12' });
        setIsApplicationDialogOpen(false);
        toast.success('Loan application submitted successfully');
      } else {
        toast.error(data.error || 'Failed to submit loan application');
      }
    } catch (err) {
      toast.error('An error occurred while submitting the loan application');
    }
  };

  const handleLoanAction = async (loanId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`https://mfms-1.onrender.com/api/loans/${loanId}/action`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (data.success) {
        setLoans(loans.map(loan => (loan._id === loanId ? data.data : loan)));
        toast.success(`Loan ${action}d successfully`);
      } else {
        toast.error(data.error || `Failed to ${action} loan`);
      }
    } catch (err) {
      toast.error(`An error occurred while ${action}ing the loan`);
    }
  };

  const handleRepayment = async () => {
    if (!selectedLoan || !repaymentAmount) {
      toast.error('Please enter a valid repayment amount');
      return;
    }

    try {
      const res = await fetch(`https://mfms-1.onrender.com/api/loans/${selectedLoan._id}/repayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ amount: repaymentAmount }),
      });

      const data = await res.json();

      if (data.success) {
        setLoans(loans.map(loan => (loan._id === selectedLoan._id ? data.data : loan)));
        setRepaymentAmount('');
        setSelectedLoan(null);
        setIsRepaymentDialogOpen(false);
        toast.success('Repayment recorded successfully');
      } else {
        toast.error(data.error || 'Failed to record repayment');
      }
    } catch (err) {
      toast.error('An error occurred while recording the repayment');
    }
  };

  const filteredLoans = loans.filter(loan =>
    loan.member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalLoaned: loans.filter(l => l.status === 'active' || l.status === 'completed').reduce((sum, l) => sum + l.amount, 0),
    activeLoans: loans.filter(l => l.status === 'active').length,
    totalOutstanding: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.remainingBalance, 0),
    pendingApplications: loans.filter(l => l.status === 'pending').length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'approved':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground">
            Manage member loans and repayments
          </p>
        </div>
        <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Loan Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Loan Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="member">Member</Label>
                <Select value={newApplication.member} onValueChange={(value) =>
                  setNewApplication({ ...newApplication, member: value })
                }>
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
                <Label htmlFor="amount">Loan Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newApplication.amount}
                  onChange={(e) => setNewApplication({ ...newApplication, amount: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="term">Loan Term (Months)</Label>
                <Select value={newApplication.termMonths} onValueChange={(value) =>
                  setNewApplication({ ...newApplication, termMonths: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleLoanApplication} className="w-full">
                Submit Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loaned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalLoaned)}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">
              To be repaid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Need review
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

      {/* Loans Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Loans</TabsTrigger>
          <TabsTrigger value="pending">Pending Applications</TabsTrigger>
          <TabsTrigger value="active">Active Loans</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <Skeleton className="w-full h-[25px]" />
                        <Skeleton className="w-full h-[25px] mt-2" />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <Alert variant="destructive">
                          <AlertCircle className="h-5 w-5" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : filteredLoans.map((loan) => (
                    <TableRow key={loan._id}>
                      <TableCell className="font-medium">{loan.member.name}</TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>{loan.termMonths} months</TableCell>
                      <TableCell>{formatCurrency(loan.monthlyPayment)}</TableCell>
                      <TableCell>{formatCurrency(loan.remainingBalance)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(loan.status)}
                          <Badge className={getStatusColor(loan.status)}>
                            {loan.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {loan.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleLoanAction(loan._id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleLoanAction(loan._id, 'reject')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {loan.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLoan(loan)
                                setIsRepaymentDialogOpen(true)
                              }}
                            >
                              Record Payment
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.filter(loan => loan.status === 'pending').map((loan) => (
                    <TableRow key={loan._id}>
                      <TableCell className="font-medium">{loan.member.name}</TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>{loan.termMonths} months</TableCell>
                      <TableCell>{new Date(loan.applicationDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoanAction(loan._id, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleLoanAction(loan._id, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.filter(loan => loan.status === 'active').map((loan) => (
                    <TableRow key={loan._id}>
                      <TableCell className="font-medium">{loan.member.name}</TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>{formatCurrency(loan.monthlyPayment)}</TableCell>
                      <TableCell>{formatCurrency(loan.remainingBalance)}</TableCell>
                      <TableCell>{new Date(loan.nextPaymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLoan(loan)
                            setIsRepaymentDialogOpen(true)
                          }}
                        >
                          Record Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Total Repaid</TableHead>
                    <TableHead>Completion Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.filter(loan => loan.status === 'completed').map((loan) => (
                    <TableRow key={loan._id}>
                      <TableCell className="font-medium">{loan.member.name}</TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>{formatCurrency(loan.totalRepaid)}</TableCell>
                      <TableCell>{new Date(loan.nextPaymentDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Repayment Dialog */}
      <Dialog open={isRepaymentDialogOpen} onOpenChange={setIsRepaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Loan Repayment</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Member:</strong> {selectedLoan.member.name}</p>
                <p><strong>Loan Amount:</strong> {formatCurrency(selectedLoan.amount)}</p>
                <p><strong>Remaining Balance:</strong> {formatCurrency(selectedLoan.remainingBalance)}</p>
                <p><strong>Monthly Payment:</strong> {formatCurrency(selectedLoan.monthlyPayment)}</p>
              </div>
              <div>
                <Label htmlFor="repayment">Repayment Amount (KES)</Label>
                <Input
                  id="repayment"
                  type="number"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  placeholder={selectedLoan.monthlyPayment.toString()}
                  max={selectedLoan.remainingBalance}
                />
              </div>
              <Button onClick={handleRepayment} className="w-full">
                Record Repayment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
