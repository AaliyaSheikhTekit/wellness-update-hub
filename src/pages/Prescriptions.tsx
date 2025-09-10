import { useState } from "react";
import { Search, User, Calendar, FileText, Download, Printer, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockPrescriptions = [
  {
    id: "RX001",
    patientName: "Rahul Sharma",
    patientAge: 35,
    patientGender: "Male",
    date: "2024-01-15",
    doctorName: "Dr. Anita Verma",
    diagnosis: "Digestive Issues, Acidity",
    treatments: [
      {
        name: "Triphala Churna",
        dosage: "1 tsp twice daily",
        duration: "30 days",
        instructions: "Take with warm water after meals"
      },
      {
        name: "Pudina Ark",
        dosage: "2 tsp three times daily",
        duration: "15 days",
        instructions: "Take before meals for better digestion"
      }
    ],
    therapies: [
      {
        name: "Abhyanga Massage",
        frequency: "3 times per week",
        duration: "2 weeks"
      },
      {
        name: "Steam Therapy",
        frequency: "After each massage",
        duration: "2 weeks"
      }
    ],
    dietaryAdvice: [
      "Avoid spicy and oily foods",
      "Include more fiber-rich vegetables",
      "Drink warm water throughout the day",
      "Eat meals at regular intervals"
    ],
    followUp: "2024-01-29",
    status: "active"
  },
  {
    id: "RX002",
    patientName: "Priya Patel",
    patientAge: 28,
    patientGender: "Female",
    date: "2024-01-14",
    doctorName: "Dr. Anita Verma",
    diagnosis: "Stress, Insomnia",
    treatments: [
      {
        name: "Ashwagandha Powder",
        dosage: "1/2 tsp twice daily",
        duration: "45 days",
        instructions: "Take with warm milk before sleep"
      },
      {
        name: "Brahmi Oil",
        dosage: "External application",
        duration: "30 days",
        instructions: "Massage on scalp before bath"
      }
    ],
    therapies: [
      {
        name: "Shirodhara",
        frequency: "2 times per week",
        duration: "3 weeks"
      },
      {
        name: "Yoga & Meditation",
        frequency: "Daily",
        duration: "Ongoing"
      }
    ],
    dietaryAdvice: [
      "Avoid caffeine after 4 PM",
      "Include warm milk with turmeric before sleep",
      "Eat light dinner 2 hours before sleep",
      "Practice deep breathing exercises"
    ],
    followUp: "2024-01-28",
    status: "active"
  },
  {
    id: "RX003",
    patientName: "Amit Kumar",
    patientAge: 42,
    patientGender: "Male",
    date: "2024-01-12",
    doctorName: "Dr. Anita Verma",
    diagnosis: "Skin Condition, Eczema",
    treatments: [
      {
        name: "Neem Powder",
        dosage: "1 tsp with water",
        duration: "21 days",
        instructions: "Take on empty stomach in morning"
      },
      {
        name: "Coconut Oil with Turmeric",
        dosage: "External application",
        duration: "30 days",
        instructions: "Apply on affected areas twice daily"
      }
    ],
    therapies: [
      {
        name: "Mud Therapy",
        frequency: "3 times per week",
        duration: "4 weeks"
      },
      {
        name: "Herbal Steam Bath",
        frequency: "2 times per week",
        duration: "3 weeks"
      }
    ],
    dietaryAdvice: [
      "Avoid dairy products temporarily",
      "Include green leafy vegetables",
      "Drink plenty of water",
      "Avoid processed and packaged foods"
    ],
    followUp: "2024-01-26",
    status: "completed"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "completed":
      return "bg-blue-500";
    case "pending":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const Prescriptions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(mockPrescriptions[0]);

  const filteredPrescriptions = mockPrescriptions.filter(
    (prescription) =>
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Prescriptions</h1>
          <p className="text-muted-foreground">View and manage patient prescriptions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prescription List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredPrescriptions.map((prescription) => (
                <Card 
                  key={prescription.id} 
                  className={`cursor-pointer transition-all shadow-natural hover:shadow-card-hover ${
                    selectedPrescription.id === prescription.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{prescription.patientName}</h3>
                        <p className="text-sm text-muted-foreground">ID: {prescription.id}</p>
                      </div>
                      <Badge className={`${getStatusColor(prescription.status)} text-white text-xs`}>
                        {prescription.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(prescription.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{prescription.diagnosis}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Prescription Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-natural">
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground">Prescription Details</CardTitle>
                    <p className="text-muted-foreground">ID: {selectedPrescription.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Patient Information</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedPrescription.patientName}</span>
                      </div>
                      <p className="text-muted-foreground">Age: {selectedPrescription.patientAge} years</p>
                      <p className="text-muted-foreground">Gender: {selectedPrescription.patientGender}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Prescription Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{new Date(selectedPrescription.date).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="text-muted-foreground">Doctor: {selectedPrescription.doctorName}</p>
                      <p className="text-muted-foreground">Follow-up: {new Date(selectedPrescription.followUp).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Diagnosis</h3>
                  <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">{selectedPrescription.diagnosis}</p>
                </div>

                {/* Treatments */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Natural Treatments</h3>
                  <div className="space-y-3">
                    {selectedPrescription.treatments.map((treatment, index) => (
                      <div key={index} className="border border-border rounded-md p-4">
                        <h4 className="font-medium text-foreground">{treatment.name}</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="text-muted-foreground"><strong>Dosage:</strong> {treatment.dosage}</p>
                          <p className="text-muted-foreground"><strong>Duration:</strong> {treatment.duration}</p>
                          <p className="text-muted-foreground"><strong>Instructions:</strong> {treatment.instructions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Therapies */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Recommended Therapies</h3>
                  <div className="space-y-3">
                    {selectedPrescription.therapies.map((therapy, index) => (
                      <div key={index} className="border border-border rounded-md p-4">
                        <h4 className="font-medium text-foreground">{therapy.name}</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="text-muted-foreground"><strong>Frequency:</strong> {therapy.frequency}</p>
                          <p className="text-muted-foreground"><strong>Duration:</strong> {therapy.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dietary Advice */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Dietary Advice</h3>
                  <ul className="space-y-2">
                    {selectedPrescription.dietaryAdvice.map((advice, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-muted-foreground">{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;