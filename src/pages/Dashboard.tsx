import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientForm from "@/components/PatientForm";
import {
  Users,
  FileText,
  Pill,
  Calendar,
  Search,
  LogOut,
  Menu,
  X,
  Phone,
  Mail,
  Leaf,
  Plus,
  Stethoscope,
  UserCheck
} from "lucide-react";

// Mock patient data
const mockPatients = [
  {
    id: "1",
    name: "Sarah Johnson",
    age: 34,
    phone: "+91 98765 43201",
    email: "sarah.j@email.com",
    condition: "Chronic Fatigue",
    lastVisit: "2024-01-15",
    status: "Active",
    nextAppointment: "2024-02-01"
  },
  {
    id: "2",
    name: "Michael Chen",
    age: 42,
    phone: "+91 98765 43202",
    email: "m.chen@email.com",
    condition: "Digestive Issues",
    lastVisit: "2024-01-20",
    status: "Active",
    nextAppointment: "2024-01-30"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    age: 28,
    phone: "+91 98765 43203",
    email: "emily.r@email.com",
    condition: "Stress Management",
    lastVisit: "2024-01-18",
    status: "Completed",
    nextAppointment: null
  },
  {
    id: "4",
    name: "David Wilson",
    age: 55,
    phone: "+91 98765 43204",
    email: "d.wilson@email.com",
    condition: "Pain Management",
    lastVisit: "2024-01-22",
    status: "Active",
    nextAppointment: "2024-02-05"
  }
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  // Get user role from localStorage
  const userRole = localStorage.getItem("userRole") || "doctor";
  const userName = localStorage.getItem("userName") || "User";

  // Load patients from localStorage
  useEffect(() => {
    const storedPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    setPatients([...mockPatients, ...storedPatients]);
  }, []);

  const handlePatientAdded = (newPatient: any) => {
    setPatients(prev => [...prev, newPatient]);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.condition && patient.condition.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.currentCondition && patient.currentCondition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sidebarItems = [
    { name: "Overview", icon: Users, path: "/dashboard", active: activeTab === "overview" },
    ...(userRole === "receptionist" ? [
      { name: "Add Patient", icon: Plus, path: "/dashboard", active: activeTab === "add-patient" }
    ] : []),
    { name: "Appointments", icon: Calendar, path: "/appointments" },
    { name: "Prescriptions", icon: Pill, path: "/prescriptions" },
    { name: "Invoices", icon: FileText, path: "/invoices" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-wellness-sage-light text-wellness-sage-dark border-wellness-sage/30";
      case "Completed":
        return "bg-wellness-beige-light text-wellness-beige-dark border-wellness-beige/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 wellness-card-gradient border-r border-border/50 transform wellness-transition duration-300 z-30 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}>
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-wellness-sage flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display text-xl font-semibold text-foreground">Iksha</span>
                <p className="text-xs text-muted-foreground">Practice Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                if (item.name === "Overview") setActiveTab("overview");
                if (item.name === "Add Patient") setActiveTab("add-patient");
              }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg wellness-transition w-full text-left ${
                item.active
                  ? "bg-wellness-sage-light/20 text-wellness-sage border border-wellness-sage/20"
                  : "text-muted-foreground hover:bg-wellness-sage-light/10 hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-wellness-sage-light/10 rounded-lg wellness-transition w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="wellness-card-gradient border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  {userRole === "doctor" ? "Doctor Dashboard" : "Receptionist Dashboard"}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  {userRole === "doctor" ? (
                    <Stethoscope className="h-4 w-4 text-wellness-sage" />
                  ) : (
                    <UserCheck className="h-4 w-4 text-wellness-sage" />
                  )}
                  <span className="text-sm text-muted-foreground">Welcome back, {userName}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {activeTab === "overview" ? (
            <>
              {/* Search and Stats */}
              <div className="mb-6 space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="wellness-card-gradient border-0 wellness-shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-wellness-sage" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Patients</p>
                          <p className="text-2xl font-bold text-foreground">{patients.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="wellness-card-gradient border-0 wellness-shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-wellness-sage" />
                        <div>
                          <p className="text-sm text-muted-foreground">Active Cases</p>
                          <p className="text-2xl font-bold text-foreground">{patients.filter(p => p.status === "Active").length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="wellness-card-gradient border-0 wellness-shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Pill className="h-5 w-5 text-wellness-sage" />
                        <div>
                          <p className="text-sm text-muted-foreground">Prescriptions</p>
                          <p className="text-2xl font-bold text-foreground">12</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="wellness-card-gradient border-0 wellness-shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-wellness-sage" />
                        <div>
                          <p className="text-sm text-muted-foreground">Pending Invoices</p>
                          <p className="text-2xl font-bold text-foreground">3</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Patient List */}
              <Card className="wellness-card-gradient border-0 wellness-shadow">
                <CardHeader>
                  <CardTitle className="font-display text-2xl text-foreground flex items-center justify-between">
                    <span>Patient List</span>
                    {userRole === "receptionist" && (
                      <Button 
                        variant="wellness" 
                        onClick={() => setActiveTab("add-patient")}
                        className="ml-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Patient
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => navigate(`/patient/${patient.id}`)}
                          className="p-4 border border-border/30 rounded-lg hover:bg-wellness-sage-light/10 cursor-pointer wellness-transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarFallback className="bg-wellness-sage-light/20 text-wellness-sage">
                                  {patient.name.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <h3 className="font-semibold text-foreground">{patient.name}</h3>
                                <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{patient.phone}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{patient.email}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="text-right space-y-2">
                              <Badge className={`${getStatusColor(patient.status)}`}>
                                {patient.status}
                              </Badge>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {patient.condition || patient.currentCondition}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Last visit: {patient.lastVisit || patient.dateAdded}
                                </p>
                                {patient.nextAppointment && (
                                  <p className="text-xs text-wellness-sage">Next: {patient.nextAppointment}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No patients found. {userRole === "receptionist" && "Click 'Add New Patient' to get started."}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : activeTab === "add-patient" ? (
            <PatientForm onPatientAdded={handlePatientAdded} />
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;