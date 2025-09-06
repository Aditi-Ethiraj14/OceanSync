
import { useState, useEffect } from "react";
import { Users, AlertTriangle, Clock, CheckCircle, MapPin, Filter, Search, Plus, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hazardReportApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'field_officer';
  isOnline: boolean;
  location?: { lat: number; lng: number };
}

interface ReportWithStatus extends any {
  status: 'incoming' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  assignedTeam?: AdminUser[];
  notes?: string;
}

export function AdminPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedReport, setSelectedReport] = useState<ReportWithStatus | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 13.0827, lng: 80.2707 });
  const [zoom, setZoom] = useState(10);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock admin users data
  const [adminUsers] = useState<AdminUser[]>([
    { id: 'admin-1', name: 'Sarah Johnson', email: 'sarah@authority.gov', role: 'admin', isOnline: true, location: { lat: 13.0827, lng: 80.2707 } },
    { id: 'admin-2', name: 'Mike Chen', email: 'mike@authority.gov', role: 'supervisor', isOnline: true, location: { lat: 13.0900, lng: 80.2800 } },
    { id: 'admin-3', name: 'Lisa Rodriguez', email: 'lisa@authority.gov', role: 'field_officer', isOnline: false, location: { lat: 13.0750, lng: 80.2650 } },
    { id: 'admin-4', name: 'David Park', email: 'david@authority.gov', role: 'field_officer', isOnline: true, location: { lat: 13.0950, lng: 80.2900 } },
  ]);

  // Fetch reports with admin enhancements
  const { data, isLoading } = useQuery({
    queryKey: ['/api/hazard-reports'],
    queryFn: hazardReportApi.getAll,
  });

  // Convert reports to admin format with status
  const [reportsWithStatus, setReportsWithStatus] = useState<ReportWithStatus[]>([]);

  useEffect(() => {
    if (data?.reports) {
      const enhancedReports = data.reports.map((report: any) => ({
        ...report,
        status: Math.random() > 0.7 ? 'incoming' : Math.random() > 0.5 ? 'in_progress' : 'resolved',
        priority: getPriorityFromDescription(report.description),
        assignedTo: Math.random() > 0.6 ? adminUsers[Math.floor(Math.random() * adminUsers.length)].id : undefined,
        notes: Math.random() > 0.7 ? 'Initial assessment completed' : undefined,
      }));
      setReportsWithStatus(enhancedReports);
    }
  }, [data, adminUsers]);

  function getPriorityFromDescription(description: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('emergency') || lowerDesc.includes('dangerous') || lowerDesc.includes('critical')) {
      return 'critical';
    }
    if (lowerDesc.includes('severe') || lowerDesc.includes('warning')) {
      return 'high';
    }
    if (lowerDesc.includes('moderate') || lowerDesc.includes('caution')) {
      return 'medium';
    }
    return 'low';
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'incoming': return 'bg-blue-500 text-white';
      case 'in_progress': return 'bg-orange-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Filter reports
  const filteredReports = reportsWithStatus.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || report.priority === filterPriority;
    const searchMatch = searchTerm === '' || 
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.author?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && priorityMatch && searchMatch;
  });

  const handleAssignReport = (reportId: string, userId: string) => {
    setReportsWithStatus(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, assignedTo: userId, status: 'in_progress' }
        : report
    ));
    toast({ title: "Report assigned successfully" });
  };

  const handleStatusChange = (reportId: string, newStatus: string) => {
    setReportsWithStatus(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: newStatus }
        : report
    ));
    toast({ title: "Status updated successfully" });
  };

  // Statistics
  const stats = {
    total: reportsWithStatus.length,
    incoming: reportsWithStatus.filter(r => r.status === 'incoming').length,
    inProgress: reportsWithStatus.filter(r => r.status === 'in_progress').length,
    resolved: reportsWithStatus.filter(r => r.status === 'resolved').length,
    critical: reportsWithStatus.filter(r => r.priority === 'critical').length,
    onlineTeam: adminUsers.filter(u => u.isOnline).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marine Authority Portal</h1>
              <p className="text-sm text-gray-600">Ocean Hazard Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{stats.onlineTeam} Team Online</span>
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="map">Live Map</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">All time reports</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Incoming</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.incoming}</div>
                  <p className="text-xs text-muted-foreground">Awaiting assignment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Users className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                  <p className="text-xs text-muted-foreground">Being handled</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                  <p className="text-xs text-muted-foreground">High priority</p>
                </CardContent>
              </Card>
            </div>

            {/* Mini Map */}
            <Card>
              <CardHeader>
                <CardTitle>Live Hazard Map Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 bg-gradient-to-br from-blue-200 via-blue-100 to-cyan-100 rounded-lg overflow-hidden">
                  {/* Map points */}
                  {filteredReports.map((report, index) => {
                    const x = 20 + (index * 15) % 60;
                    const y = 20 + (index * 10) % 40;
                    return (
                      <div
                        key={report.id}
                        className={`absolute w-3 h-3 rounded-full border border-white cursor-pointer ${
                          report.priority === 'critical' ? 'bg-red-600' :
                          report.priority === 'high' ? 'bg-red-500' :
                          report.priority === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                        }}
                        title={report.description}
                      />
                    );
                  })}
                  
                  {/* Team locations */}
                  {adminUsers.filter(u => u.isOnline && u.location).map((user, index) => (
                    <div
                      key={user.id}
                      className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white"
                      style={{
                        left: `${30 + (index * 20)}%`,
                        top: `${60 + (index * 10) % 20}%`,
                      }}
                      title={`${user.name} - ${user.role}`}
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Reports</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(report.createdAt || Date.now()), { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Report #{report.id.slice(0, 8)}</h3>
                        <p className="text-gray-700 mb-2">{report.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                          </span>
                          <span>Reporter: {report.author || 'Anonymous'}</span>
                          {report.assignedTo && (
                            <span>
                              Assigned to: {adminUsers.find(u => u.id === report.assignedTo)?.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Users className="w-4 h-4 mr-2" />
                              Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Report</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Assign to Team Member</Label>
                                <Select onValueChange={(value) => handleAssignReport(report.id, value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select team member" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {adminUsers.map((user) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        <div className="flex items-center space-x-2">
                                          <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                          <span>{user.name} ({user.role})</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Update Status</Label>
                                <Select onValueChange={(value) => handleStatusChange(report.id, value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="incoming">Incoming</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Add Notes</Label>
                                <Textarea placeholder="Add any notes or comments..." />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Live Hazard Map</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative h-96 bg-gradient-to-br from-blue-200 via-blue-100 to-cyan-100 rounded-lg overflow-hidden">
                  {/* Enhanced Map Visualization */}
                  <div className="absolute inset-0 opacity-30">
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.2) 0%, transparent 50%),
                          radial-gradient(circle at 70% 70%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
                          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px, 80px 80px, 15px 15px, 15px 15px'
                      }}
                    />
                  </div>

                  {/* Zoom controls */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col">
                    <button 
                      onClick={() => setZoom(prev => Math.min(prev + 2, 20))}
                      className="px-3 py-2 text-sm font-medium hover:bg-gray-100 border-b border-gray-200"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => setZoom(prev => Math.max(prev - 2, 5))}
                      className="px-3 py-2 text-sm font-medium hover:bg-gray-100"
                    >
                      −
                    </button>
                  </div>

                  {/* Hazard report markers */}
                  {filteredReports.map((report, index) => {
                    const x = 20 + (index * 15) % 60;
                    const y = 20 + (index * 10) % 40;
                    
                    return (
                      <div
                        key={report.id}
                        className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform ${
                          report.priority === 'critical' ? 'bg-red-600' :
                          report.priority === 'high' ? 'bg-red-500' :
                          report.priority === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                        } ${report.status === 'incoming' ? 'animate-pulse' : ''}`}
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                        }}
                        title={`${report.description} - ${report.status}`}
                        onClick={() => setSelectedReport(report)}
                      >
                        {report.status === 'incoming' && (
                          <div className="absolute inset-0 bg-current rounded-full animate-ping opacity-75"></div>
                        )}
                      </div>
                    );
                  })}

                  {/* Team member locations */}
                  {adminUsers.filter(u => u.isOnline && u.location).map((user, index) => (
                    <div
                      key={user.id}
                      className="absolute w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg"
                      style={{
                        left: `${30 + (index * 20)}%`,
                        top: `${60 + (index * 10) % 20}%`,
                      }}
                      title={`${user.name} - ${user.role}`}
                    >
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                  ))}

                  {/* Map legend */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <h4 className="font-medium text-sm mb-2">Legend</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        <span>Critical Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>High Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Medium Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Low Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span>Team Member</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Management</CardTitle>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminUsers.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-lg font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.role.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            {user.isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
