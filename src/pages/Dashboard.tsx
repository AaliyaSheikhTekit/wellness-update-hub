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
import DoctorForm from "@/components/DoctoreForm";
import NewTreatmentForm from "@/pages/NewTreatmentForm";

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
  const [patients, setPatients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "";
  let userRole = "Naturopathy Doctor"; // default
  if (userName.includes("superAdmin")) userRole = "superAdmin";
  else if (userName.includes("Naturopathy Recptionist")) userRole = "Naturopathy Recptionist";

  // Sidebar items with keys
  const sidebarItems = userRole === "superAdmin"
    ? [
        { key: "overview", name: "Overview", icon: Users },
        { key: "add-patient", name: "Add Patient", icon: Plus },
        { key: "appointments", name: "Appointments", icon: Calendar },
        { key: "prescriptions", name: "Prescriptions", icon: Pill },
        { key: "dietitians", name: "Dietitians", icon: ChartArea },
        { key: "invoices", name: "Invoices", icon: FileText },
        { key: "add-new-treatment", name: "Add New Treatment", icon: FileText },
        { key: "add-post-treatment", name: "Add Post-Treatment", icon: Stethoscope },
        { key: "add-medicine-post", name: "Add Medicine Post", icon: Pill },
      ]
    : userRole === "Naturopathy Doctor"
    ? [
        { key: "overview", name: "Overview", icon: Users },
        { key: "prescriptions", name: "Prescriptions", icon: Pill },
        { key: "dietitians", name: "Dietitians", icon: ChartArea },
        { key: "doctor", name: "Doctor", icon: FileText },
        { key: "add-new-treatment", name: "Add New Treatment", icon: FileText },
        { key: "add-post-treatment", name: "Add Post-Treatment", icon: Stethoscope },
        { key: "add-medicine-post", name: "Add Medicine Post", icon: Pill },
      ]
    : [
        { key: "overview", name: "Overview", icon: Users },
        { key: "add-patient", name: "Add Patient", icon: Plus },
        { key: "appointments", name: "Appointments", icon: Calendar },
        { key: "invoices", name: "Invoices", icon: FileText },
      ];

  // Load patients
  useEffect(() => {
    const storedPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    setPatients([...mockPatients, ...storedPatients]);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "overview":
        return <ReceptionDashboard />;
      case "add-patient":
        return <PatientForm />;
      case "appointments":
        return <Appointments />;
      case "prescriptions":
        return <Prescriptions />;
      case "dietitians":
        return <Dietitians />;
      case "invoices":
        return <Invoices />;
      case "doctor":
        return <DoctorForm />;
      case "add-new-treatment":
        return <NewTreatmentForm />;
      case "add-post-treatment":
        return (
          <Card className="bg-white shadow-soft rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Add Post-Treatment</h2>
          </Card>
        );
      case "add-medicine-post":
        return (
          <Card className="bg-white shadow-soft rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Add Medicine Post</h2>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
   <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-border/50 z-30`}>
        <div className="p-6 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Healthcare Dashboard</h2>
        </div>
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left ${
                activeTab === item.key
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

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

        {renderMainContent()}
      </div>
    </div>
  );
};

export default Dashboard;
