import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Calendar, Search } from 'lucide-react'
import { toast } from 'sonner'

interface Contribution {
  id: number
  memberId: number
  memberName: string
  amount: number
  date: string
  type: 'monthly' | 'special'
  status: 'completed' | 'pending'
}

export function Contributions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newContribution, setNewContribution] = useState({
    memberId: '',
    amount: '',
    type: 'monthly' as 'monthly' | 'special'
  })

  // Mock data
  const [contributions, setContributions] = useState<Contribution[]>([
    {
      id: 1,
      memberId: 1,
      memberName: 'John Doe',
      amount: 15000,
      date: '2025-06-25',
      type: 'monthly',
      status: 'completed'
    },
    {
      id: 2,
      memberId: 2,
      memberName: 'Jane Smith',
      amount: 15000,
      date: '2025-06-20',
      type: 'monthly',
      status: 'completed'
    },
    {
      id: 3,
      memberId: 3,
      memberName: 'Mike Wilson',
      amount: 20000,
      date: '2025-06-18',
      type: 'special',
      status: 'completed'
    },
    {
      id: 4,
      memberId: 4,
      memberName: 'Sarah Johnson',
      amount: 15000,
      date: '2025-06-25',
      type: 'monthly',
      status: 'pending'
    }
  ])

  const members = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Wilson' },
    { id: 4, name: 'Sarah Johnson' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredContributions = contributions.filter(contribution =>
    contribution.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalContributions = contributions
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0)

  const pendingContributions = contributions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0)

  const handleAddContribution = () => {
    if (!newContribution.memberId || !newContribution.amount) {
      toast.error('Please fill in all fields')
      return
    }

    const member = members.find(m => m.id === Number.parseInt(newContribution.memberId))
    if (!member) {
      toast.error('Invalid member selected')
      return
    }

    const contribution: Contribution = {
      id: Date.now(),
      memberId: Number.parseInt(newContribution.memberId),
      memberName: member.name,
      amount: Number.parseFloat(newContribution.amount),
      date: new Date().toISOString().split('T')[0],
      type: newContribution.type,
      status: 'completed'
    }

    setContributions([contribution, ...contributions])
    setNewContribution({ memberId: '', amount: '', type: 'monthly' })
    setIsAddDialogOpen(false)
    toast.success('Contribution recorded successfully')
  }

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
                <Select value={newContribution.memberId} onValueChange={(value) =>
                  setNewContribution({ ...newContribution, memberId: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
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
                  onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                  placeholder="15000"
                />
              </div>
              <div>
                <Label htmlFor="type">Contribution Type</Label>
                <Select value={newContribution.type} onValueChange={(value: 'monthly' | 'special') =>
                  setNewContribution({ ...newContribution, type: value })
                }>
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
              {filteredContributions.map((contribution) => (
                <TableRow key={contribution.id}>
                  <TableCell className="font-medium">
                    {contribution.memberName}
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
