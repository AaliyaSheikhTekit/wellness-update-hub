import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

import PatientForm from "@/components/PatientForm";
import ReceptionDashboard from "@/components/ReceptionistDashboard";
import Appointments from "./Appointments";
import Prescriptions from "./Prescriptions";
import Invoices from "./Invoices";
import Dietitians from "./Dietitians";

import {
  FileText,
  Pill,
  Calendar,
  Search,
  LogOut,
  Menu,
  X,
  Phone,
  Mail,
  Users,
  Plus,
  Stethoscope,
  UserCheck,
  ChartArea,
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
    nextAppointment: "2024-02-01",
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
    nextAppointment: "2024-01-30",
  },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  // Get role from localStorage
  const userName = localStorage.getItem("userName") || "";
  let userRole = "Naturopathy Doctor"; // default

  if (userName.includes("superAdmin")) userRole = "superAdmin";
  else if (userName.includes("Naturopathy Recptionist")) userRole = "Naturopathy Recptionist";
  else if (userName.includes("Naturopathy Doctor")) userRole = "Naturopathy Doctor";

  // Sidebar items by role
  const sidebarItems =
    userRole === "superAdmin"
      ? [
          { name: "Overview", icon: Users },
          { name: "Add Patient", icon: Plus },
          { name: "Appointments", icon: Calendar },
          { name: "Prescriptions", icon: Pill },
          { name: "Dietitians", icon: ChartArea },
          { name: "Invoices", icon: FileText },
        ]
      : userRole === "Naturopathy Doctor"
      ? [
          { name: "Overview", icon: Users },
          { name: "Prescriptions", icon: Pill },
          { name: "Dietitians", icon: ChartArea },
        ]
      : [
          // Receptionist
  { name: "Overview", icon: Users },
        { name: "Add Patient", icon: Plus },       // Added
        { name: "Appointments", icon: Calendar },
        { name: "Invoices", icon: FileText },  
        ];

  // Load patients from localStorage
  useEffect(() => {
    const storedPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    setPatients([...mockPatients, ...storedPatients]);
  }, []);

  const handlePatientAdded = (newPatient: any) => {
    setPatients((prev) => [...prev, newPatient]);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.condition &&
        patient.condition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success/10 text-success border-success/30";
      case "Completed":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  // Main content based on role & tab
  const renderMainContent = () => {
    if (userRole === "Naturopathy Recptionist") {
      switch (activeTab.toLowerCase()) {
        case "overview":
          return <ReceptionDashboard />;
        case "appointments":
          return <Appointments />;
             case "add-patient":
        return <PatientForm onPatientAdded={handlePatientAdded} />;
        default:
          return <ReceptionDashboard />;
      }
    }

    // SuperAdmin & Doctor
    switch (activeTab.toLowerCase()) {
      case "overview":
        return (
          <Card className="bg-white border-0 shadow-soft rounded-xl p-6">
            <h2 className="text-xl font-bold">Patient Overview</h2>
            <p>Total Patients: {patients.length}</p>
          </Card>
        );
      case "add-patient":
        return <PatientForm onPatientAdded={handlePatientAdded} />;
      case "appointments":
        return <Appointments />;
      case "prescriptions":
        return <Prescriptions />;
      case "dietitians":
        return <Dietitians />;
      case "invoices":
        return <Invoices />;
      default:
        return null;
    }
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
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-border/50 transform transition-transform duration-300 z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Healthcare Dashboard</h2>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item, id) => (
            <button
              key={id}
              onClick={() => setActiveTab(item.name.toLowerCase().replace(" ", "-"))}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
                activeTab.toLowerCase() === item.name.toLowerCase().replace(" ", "-")
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
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
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-lg transition-colors w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-6">
        {/* Header */}
        <header className="bg-white border-b border-border/50 p-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            {userRole === "superAdmin"
              ? "Admin Dashboard"
              : userRole === "Naturopathy Doctor"
              ? "Doctor Dashboard"
              : "Receptionist Dashboard"}
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </header>

        {/* Render content based on role & active tab */}
        {renderMainContent()}
      </div>
    </div>
  );
};

export default Dashboard;
