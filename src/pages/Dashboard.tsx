import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import IkshaLogo from "../assets/iksha_logo.png";
import PatientForm from "@/components/PatientForm";
import ReceptionDashboard from "@/components/ReceptionistDashboard";
import Appointments from "./Appointments";
import Prescriptions from "./Prescriptions";
import Invoices from "./Invoices";
import Dietitians from "./Dietitians";
import QrUpload from "@/pages/QrUpload";
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
  QrCode ,
  ChartArea,
} from "lucide-react";
import DoctorForm from "@/components/DoctoreForm";
import NewTreatmentForm from "@/pages/NewTreatmentForm";
import DoctorDashboard from "@/components/DoctorDashboard";

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

        { key: "invoices", name: "Invoices", icon: FileText },
        { key: "add-new-treatment", name: "Add New Treatment", icon: FileText },
        { key: "add-post-treatment", name: "Add Post-Treatment", icon: Stethoscope },
        { key: "add-medicine-post", name: "Add Medicine Post", icon: Pill },
     { key: "upload-qr", name: "Upload QR Code", icon: QrCode }, 
      ]
    : userRole === "Naturopathy Doctor"
    ? [
        { key: "overview", name: "Overview", icon: Users },
        { key: "prescriptions", name: "Prescriptions", icon: Pill },
      

        { key: "add-new-treatment", name: "Add New Treatment", icon: FileText },
        { key: "add-post-treatment", name: "Add Post-Treatment", icon: Stethoscope },
        { key: "add-medicine-post", name: "Add Medicine Post", icon: Pill },
      ]
    : [
        { key: "overview", name: "Overview", icon: Users },
        // { key: "add-patient", name: "Add Patient", icon: Plus },
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
  // If we're NOT on "overview", route by tab normally
  if (activeTab !== "overview") {
    switch (activeTab) {
      // case "add-patient":
      //   return <PatientForm />;
      case "appointments":
        return <Appointments />;
      case "prescriptions":
        return <Prescriptions />;
     
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
      case "upload-qr":
        return <QrUpload />;
      default:
        return null;
    }
  }

  // === activeTab === "overview" ===
  if (userRole === "superAdmin") {
    // use your role toggle
    if (activeRole === "doctor") return <DoctorDashboard />;
    if (activeRole === "reception") return <ReceptionDashboard />;

    // optionally show BOTH when "super_admin" is selected
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DoctorDashboard />
        <ReceptionDashboard />
      </div>
    );
  }

  if (userRole === "Naturopathy Doctor") return <DoctorDashboard />;
  // receptionist
  return <ReceptionDashboard />;
};

const [open, setOpen] = useState(false);

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // lock body scroll when open (mobile)
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [open]);
  // below existing state
const [activeRole, setActiveRole] = useState<
  "super_admin" | "doctor" | "reception"
>(() => {
  if (userRole === "superAdmin") return "super_admin";
  if (userRole === "Naturopathy Doctor") return "doctor";
  return "reception";
});
  return (
   <div className="min-h-screen bg-background">
      {/* Sidebar */}
        <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="h-14 px-3 flex items-center justify-between">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="p-2 rounded-md hover:bg-muted transition"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src={IkshaLogo} alt="Iksha Naturopathy" className="h-8 w-auto" />
          </div>
          <div className="w-10" /> {/* spacer */}
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-border/50 z-30">
        <div className="mb-6 mt-8 h-12 flex items-center justify-center">
          <img src={IkshaLogo} alt="Iksha Naturopathy Logo" className="h-36 w-auto object-contain" />
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
      </aside>

      {/* Mobile drawer + overlay */}
      {/* Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Drawer */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-white border-r border-border/50 z-50
        transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <div className="flex items-center gap-2">
            <img src={IkshaLogo} alt="Iksha Naturopathy Logo" className="h-8 w-auto" />
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="p-2 rounded-md hover:bg-muted transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setOpen(false);
              }}
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
            onClick={() => {
              setOpen(false);
              handleLogout();
            }}
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-lg transition-colors w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 p-6">
       <header className="bg-white border-b border-border/50 p-4 flex flex-wrap gap-3 justify-between items-center">
  <h1 className="text-3xl font-bold text-foreground">
    {activeRole === "super_admin"
      ? "Admin Dashboard"
      : activeRole === "doctor"
      ? "Doctor Dashboard"
      : "Receptionist Dashboard"}
  </h1>

  <div className="flex items-center gap-3">
    {userRole === "superAdmin" && (
      <div className="flex gap-2">
        <Button
          variant={activeRole === "super_admin" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveRole("super_admin")}
        >
          Super Admin
        </Button>
        <Button
          variant={activeRole === "doctor" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveRole("doctor")}
        >
          Doctor
        </Button>
        <Button
          variant={activeRole === "reception" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveRole("reception")}
        >
          Reception
        </Button>
      </div>
    )}

    <Button variant="outline" onClick={handleLogout}>
      <LogOut className="h-4 w-4 mr-2" /> Logout
    </Button>
  </div>
</header>
        {renderMainContent()}
      </div>
    </div>
  );
};

export default Dashboard;
