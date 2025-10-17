import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, Utensils, AlertTriangle, Calendar, Search, Loader2 } from "lucide-react";
import { getPatient, getPatientAll, getPatients } from "@/lib/api";
import DietTableView from "@/components/Dietician/DietTableView";

interface Patient {
  id: string;
  fullName: string;
  age?: number;
  contactNumber?: string;
  email?: string;
  medicalHistory?: string;
  allergies?: string[];
  currentDiet?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  // Load patients from API
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const response = await getPatientAll();
        
        // Transform API response to local format
        const transformedPatients: Patient[] = (response.data || []).map((patient: any) => ({
          id: patient.id,
          fullName: patient.fullName || patient.name || "Unknown Patient",
          age: patient.age || patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : undefined,
          contactNumber: patient.contactNumber || patient.phone,
          email: patient.email,
          medicalHistory: patient.medicalHistory || patient.condition,
          allergies: patient.allergies ? (Array.isArray(patient.allergies) ? patient.allergies : [patient.allergies]) : [],
          currentDiet: patient.currentDiet || "Not specified",
        }));
        
        setPatients(transformedPatients);
      } catch (error) {
        console.error("Error loading patients:", error);
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [toast]);

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return undefined;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter patients based on search
  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contactNumber?.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-soft via-background to-wellness-soft/30">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-2">
              Dietician Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Weekly meal planning with calendar view
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Patients Sidebar */}
            <div className="lg:col-span-1">
              <Card className="wellness-card wellness-shadow-soft sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-wellness-primary">
                    <User className="w-5 h-5" />
                    Patients ({filteredPatients.length})
                  </CardTitle>
                  {/* Search Bar */}
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search patients..."
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? "No patients found" : "No patients available"}
                      </p>
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedPatient === patient.id 
                            ? 'bg-wellness-primary/10 border-wellness-primary ring-2 ring-wellness-primary/20' 
                            : 'bg-card hover:bg-wellness-soft/30 border-wellness-muted'
                        }`}
                        onClick={() => setSelectedPatient(patient.id)}
                      >
                        <h3 className="font-semibold text-foreground">{patient.fullName}</h3>
                        {patient.age && (
                          <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                        )}
                        {patient.contactNumber && (
                          <p className="text-xs text-muted-foreground">{patient.contactNumber}</p>
                        )}
                        {patient.medicalHistory && (
                          <p className="text-sm text-muted-foreground mt-1">{patient.medicalHistory}</p>
                        )}
                        {patient.currentDiet && (
                          <div className="flex items-center gap-1 mt-2">
                            <Utensils className="h-3 w-3 text-wellness-primary" />
                            <span className="text-xs text-muted-foreground">{patient.currentDiet}</span>
                          </div>
                        )}
                        {patient.allergies && patient.allergies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {patient.allergies.map((allergy, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                <AlertTriangle className="h-2 w-2 mr-1" />
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-4">
              {selectedPatient && selectedPatientData ? (
                <DietTableView 
                  patientId={selectedPatient} 
                  patientName={selectedPatientData.fullName}
                />
              ) : (
                <Card className="wellness-card-gradient wellness-shadow-soft">
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Select a Patient</h3>
                      <p className="text-muted-foreground">
                        Choose a patient from the sidebar to create their weekly diet plan
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;