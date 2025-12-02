import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  Banknote,
  FileText,
  PieChart,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [financialSummary, setFinancialSummary] = useState<any>({});
  const [memberContributions, setMemberContributions] = useState<any[]>([]);
  const [loanPerformance, setLoanPerformance] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [summaryRes, contributionsRes, loanPerformanceRes, trendsRes] = await Promise.all([
          fetch(`${apiUrl}/api/reports/financial-summary`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          fetch(`${apiUrl}/api/reports/contributions`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          fetch(`${apiUrl}/api/reports/loan-performance`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          fetch(`${apiUrl}/api/reports/trends`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

        const summaryData = await summaryRes.json();
        const contributionsData = await contributionsRes.json();
        const loanPerformanceData = await loanPerformanceRes.json();
        const trendsData = await trendsRes.json();

        if (summaryData.success) {
          setFinancialSummary(summaryData.data);
        } else {
          setError(summaryData.error || 'Failed to fetch financial summary');
        }

        if (contributionsData.success) {
          setMemberContributions(contributionsData.data);
        } else {
          setError(prev => prev + (prev ? ' and ' : '') + (contributionsData.error || 'Failed to fetch member contributions'));
        }

        if (loanPerformanceData.success) {
          setLoanPerformance(loanPerformanceData.data.loans);
        } else {
          setError(prev => prev + (prev ? ' and ' : '') + (loanPerformanceData.error || 'Failed to fetch loan performance'));
        }

        if (trendsData.success) {
          setMonthlyData(trendsData.data);
        } else {
          setError(prev => prev + (prev ? ' and ' : '') + (trendsData.error || 'Failed to fetch monthly trends'));
        }

      } catch (err: any) {
        setError(prev => prev + (prev ? ' and ' : '') + (err.message || 'An error occurred while fetching reports data'));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up-to-date':
      case 'current':
        return 'bg-green-100 text-green-800';
      case 'behind':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportReport = (reportType: string) => {
    // In a real application, this would generate and download a PDF/Excel file
    console.log(`Exporting ${reportType} report...`);
    // For demo purposes, just show a toast
    alert(`${reportType} report would be downloaded as PDF/Excel`);
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return '0.0';
    return (((current - previous) / previous) * 100).toFixed(1);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            View financial reports and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('Financial Summary')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('Detailed Report')}>
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalSavings)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary.memberCount}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 new members
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loans Outstanding</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalLoansIssued - financialSummary.totalRepayments)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {financialSummary.loanDefaultRate}% default rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.netCashFlow)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Positive cash flow
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial Summary</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="loans">Loan Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Contributions</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(financialSummary.totalContributions)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Loans Issued</span>
                    <span className="text-sm font-bold text-blue-600">
                      {formatCurrency(financialSummary.totalLoansIssued)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Loan Repayments</span>
                    <span className="text-sm font-bold text-purple-600">
                      {formatCurrency(financialSummary.totalRepayments)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Net Position</span>
                      <span className="text-sm font-bold">
                        {formatCurrency(financialSummary.totalSavings)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Monthly Contribution</span>
                    <span className="text-sm font-bold">
                      {formatCurrency(financialSummary.averageContribution)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Members</span>
                    <span className="text-sm font-bold">{financialSummary.memberCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Loan Default Rate</span>
                    <span className="text-sm font-bold text-green-600">
                      {financialSummary.loanDefaultRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Savings per Member</span>
                    <span className="text-sm font-bold">
                      {formatCurrency(financialSummary.totalSavings / financialSummary.memberCount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle>Member Contribution Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Total Contributions</TableHead>
                    <TableHead>Monthly Average</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Percentage of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberContributions.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{formatCurrency(member.totalContributions)}</TableCell>
                      <TableCell>{formatCurrency(member.monthlyAverage)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {((member.totalContributions / financialSummary.totalContributions) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Loan Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Outstanding Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Payment Date</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanPerformance.map((loan: any) => (
                      <TableRow key={loan._id}>
                        <TableCell className="font-medium">{loan.member}</TableCell>
                        <TableCell>{formatCurrency(loan.amount)}</TableCell>
                        <TableCell>{formatCurrency(loan.outstanding)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(loan.status)}>
                            {loan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{loan.nextPayment ? new Date(loan.nextPayment).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-2 bg-blue-600 rounded-full"
                                style={{
                                  width: `${((loan.amount - loan.outstanding) / loan.amount) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {(((loan.amount - loan.outstanding) / loan.amount) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Loans Issued</CardTitle>
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalLoansIssued)}</div>
                  <p className="text-xs text-muted-foreground">
                    {loanPerformance.filter((l: any) => l.status === 'active').length} active loans
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Repayment Rate</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {financialSummary.repaymentRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    On-time payments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Loan Size</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(financialSummary.averageLoanSize)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per loan
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends (2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Contributions</TableHead>
                      <TableHead>Loans Issued</TableHead>
                      <TableHead>Repayments</TableHead>
                      <TableHead>Net Change</TableHead>
                      <TableHead>Growth Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.map((data, index) => {
                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const month = monthNames[data.month - 1] + ` ${data.year}`;

                      const netChange = data.contributions + data.repayments - data.loans;
                      const previousNet = index > 0 ?
                        (monthlyData[index - 1].contributions + monthlyData[index - 1].repayments - monthlyData[index - 1].loans) :
                        netChange;

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{month}</TableCell>
                          <TableCell>{formatCurrency(data.contributions)}</TableCell>
                          <TableCell>{formatCurrency(data.loans)}</TableCell>
                          <TableCell>{formatCurrency(data.repayments)}</TableCell>
                          <TableCell className={netChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(netChange)}
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 ${
                              Number.parseFloat(calculateGrowthRate(netChange, previousNet)) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <TrendingUp className="h-3 w-3" />
                              {calculateGrowthRate(netChange, previousNet)}%
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <span className="text-sm">Consistent monthly growth in contributions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-sm">100% loan repayment rate maintained</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full" />
                      <span className="text-sm">Average member contribution: {formatCurrency(financialSummary.averageContribution)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full" />
                      <span className="text-sm">Zero defaults on loan portfolio</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Investment Opportunity</p>
                      <p className="text-xs text-blue-700">
                        Consider investing surplus funds in government bonds for better returns
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-900">Member Engagement</p>
                      <p className="text-xs text-green-700">
                        Follow up with Sarah Johnson on contribution schedule
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-900">Loan Policy</p>
                      <p className="text-xs text-purple-700">
                        Consider increasing loan limits due to excellent repayment record
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
