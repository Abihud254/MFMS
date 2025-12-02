import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, Users, Clock, MapPin, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Meeting {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  agenda: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
  attendees: string[];
  minutes?: string;
  decisions: string[];
}

interface Member {
  _id: string;
  name: string;
}

export function Meetings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isMinutesDialogOpen, setIsMinutesDialogOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    agenda: '',
  });
  const [meetings, setMeetings] = useState<Meeting[]>([]);
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
        const [meetingsRes, membersRes] = await Promise.all([
          fetch(`${apiUrl}/api/meetings`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          fetch(`${apiUrl}/api/members`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

        const meetingsData = await meetingsRes.json();
        const membersData = await membersRes.json();

        if (meetingsData.success) {
          setMeetings(meetingsData.data);
        } else {
          setError(meetingsData.error || 'Failed to fetch meetings');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleScheduleMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time || !newMeeting.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const agendaItems = newMeeting.agenda.split('\n').filter(item => item.trim() !== '');

    try {
      const res = await fetch(`${apiUrl}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ ...newMeeting, agenda: agendaItems }),
      });

      const data = await res.json();

      if (data.success) {
        setMeetings([data.data, ...meetings]);
        setNewMeeting({ title: '', date: '', time: '', location: '', agenda: '' });
        setIsScheduleDialogOpen(false);
        toast.success('Meeting scheduled successfully');
      } else {
        toast.error(data.error || 'Failed to schedule meeting');
      }
    } catch (err) {
      toast.error('An error occurred while scheduling the meeting');
    }
  };

  const handleMeetingStatusChange = async (meetingId: string, status: 'completed' | 'cancelled') => {
    try {
      const res = await fetch(`${apiUrl}/api/meetings/${meetingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.success) {
        setMeetings(meetings.map(meeting => (meeting._id === meetingId ? data.data : meeting)));
        toast.success(`Meeting ${status === 'completed' ? 'marked as completed' : 'cancelled'}`);
      } else {
        toast.error(data.error || `Failed to update meeting status`);
      }
    } catch (err) {
      toast.error('An error occurred while updating the meeting status');
    }
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    upcomingMeetings: meetings.filter(m => m.status === 'upcoming').length,
    completedMeetings: meetings.filter(m => m.status === 'completed').length,
    averageAttendance: meetings.filter(m => m.status === 'completed').length > 0 ?
      Math.round(meetings.filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + m.attendees.length, 0) /
        meetings.filter(m => m.status === 'completed').length) : 0,
    totalDecisions: meetings.reduce((sum, m) => sum + m.decisions.length, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <Calendar className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-4 md:grid-cols-4">
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
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">
            Schedule and manage chama meetings
          </p>
        </div>
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="Monthly Shares Review"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                  placeholder="Community Center"
                />
              </div>
              <div>
                <Label htmlFor="agenda">Agenda (one item per line)</Label>
                <textarea
                  id="agenda"
                  value={newMeeting.agenda}
                  onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                  placeholder="Review monthly shares&#10;Discuss loan applications&#10;Plan investment strategy"
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none rounded-md"
                />
              </div>
              <Button onClick={handleScheduleMeeting} className="w-full">
                Schedule Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedMeetings}</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance}</div>
            <p className="text-xs text-muted-foreground">
              Members per meeting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decisions Made</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDecisions}</div>
            <p className="text-xs text-muted-foreground">
              Total decisions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search meetings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Meetings Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
          <TabsTrigger value="completed">Past Meetings</TabsTrigger>
          <TabsTrigger value="all">All Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid gap-4">
            {filteredMeetings.filter(meeting => meeting.status === 'upcoming').map((meeting) => (
              <Card key={meeting._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{meeting.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(meeting.date)} at {meeting.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {meeting.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Agenda:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {meeting.agenda.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMeetingStatusChange(meeting._id, 'completed')}
                      >
                        Mark as Completed
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleMeetingStatusChange(meeting._id, 'cancelled')}
                      >
                        Cancel Meeting
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMeetings.filter(meeting => meeting.status === 'upcoming').length === 0 && (
              <Card>
                <CardContent className="text-center py-6">
                  <p className="text-muted-foreground">No upcoming meetings scheduled</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {filteredMeetings.filter(meeting => meeting.status === 'completed').map((meeting) => (
              <Card key={meeting._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{meeting.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(meeting.date)} at {meeting.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {meeting.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {meeting.attendees.length} attendees
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(meeting.status)}>
                      {meeting.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Attendees:</h4>
                      <div className="flex flex-wrap gap-2">
                        {/* {meeting.attendeeNames.map((name, index) => (
                          <Badge key={index} variant="secondary">{name}</Badge>
                        ))} */}
                      </div>
                    </div>

                    {meeting.minutes && (
                      <div>
                        <h4 className="font-medium mb-2">Meeting Minutes:</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {meeting.minutes}
                        </p>
                      </div>
                    )}

                    {meeting.decisions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Decisions Made:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {meeting.decisions.map((decision, index) => (
                            <li key={index} className="text-sm text-muted-foreground">{decision}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4">
            {filteredMeetings.map((meeting) => (
              <Card key={meeting._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{meeting.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(meeting.date)} at {meeting.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {meeting.location}
                        </div>
                        {meeting.status === 'completed' && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {meeting.attendees.length} attendees
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(meeting.status)}
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Agenda:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {meeting.agenda.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {meeting.status === 'completed' && meeting.decisions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Decisions:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {meeting.decisions.map((decision, index) => (
                            <li key={index} className="text-sm text-muted-foreground">{decision}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {meeting.status === 'upcoming' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMeetingStatusChange(meeting._id, 'completed')}
                        >
                          Mark as Completed
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleMeetingStatusChange(meeting._id, 'cancelled')}
                        >
                          Cancel Meeting
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
