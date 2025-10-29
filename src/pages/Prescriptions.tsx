import { useEffect, useState } from "react";
import { Search, User, Calendar, Download, Printer, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPatients, getPatientById } from "@/lib/api"; // <-- your API functions
import IkshaLogo from "../assets/iksha_logo.png";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-500";
    case "completed": return "bg-blue-500";
    case "pending": return "bg-yellow-500";
    default: return "bg-gray-500";
  }
};

const Prescriptions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Fetch patients list
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await getPatients(searchTerm);
        setPatients(res.data || []);
        if (res.data.length > 0) setSelectedPatientId(res.data[0].id);
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };
    fetchPatients();
  }, []);

  // Fetch patient & appointment by ID
  useEffect(() => {
    if (!selectedPatientId) return;

    const fetchPatient = async () => {
      try {
        const res = await getPatientById(selectedPatientId);
        const patient = res.data[0]; // assuming API returns data array
        setSelectedPatient(patient);
        // Set first appointment by default
        setSelectedAppointment(patient.appointment?.[0] || null);
      } catch (err) {
        console.error("Error fetching patient:", err);
      }
    };

    fetchPatient();
  }, [selectedPatientId]);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedPatient || !selectedAppointment) return <p>Loading...</p>;
const printTableWithHeaderFooter = (tableId: string) => {
    const table = document.getElementById(tableId);
    if (!table) return;

    const newWindow = window.open("", "_blank", "width=1000,height=800");
    newWindow!.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            table, .prescription-card { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .header, .footer { width: 100%; text-align: center; margin: 10px 0; }
            .footer { font-size: 10px; color: #555; }
            img { max-height: 80px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:4px solid #F59E0B; padding-bottom:10px;">
              <div>
                <img src="${IkshaLogo}" alt="Iksha Logo" style="height: 80px;" />
                <p style="font-size:12px; color:#555;">Integrated Natural Healing system for a comprehensive</p>
              </div>
              <div style="text-align:right; font-size:12px;">
                <p>📞 +91 9343922950</p>
                <p>📧 admin@ikshanaturopathy.com</p>
                <p>📍 Bhopal, Madhya Pradesh</p>
              </div>
            </div>
          </div>

          ${table.outerHTML}

          <div class="footer">
            <p>Integrated Natural Healing system for a comprehensive</p>
            <p>📞 +91 9343922950 | 📧 admin@ikshanaturopathy.com | 🌐 www.ikshanaturopathy.com</p>
            <p>© ${new Date().getFullYear()} Iksha Naturopathy. All rights reserved.</p>
          </div>
        </body>
      </html>
    `);
    newWindow!.document.close();
    newWindow!.print();
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Prescriptions</h1>
          <p className="text-muted-foreground">View and manage patient prescriptions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
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
              {filteredPatients.map((patient) => (
                <Card
                  key={patient.id}
                  className={`cursor-pointer transition-all shadow-natural hover:shadow-card-hover ${
                    selectedPatientId === patient.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedPatientId(patient.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{patient.fullName}</h3>
                        <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                      </div>
                      <Badge className={`bg-gray-500 text-white text-xs`}>
                        {patient.status || "active"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(patient.formDate).toLocaleDateString("en-IN")}</span>
                    </div>
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
                    <p className="text-muted-foreground">ID: {selectedAppointment.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => printTableWithHeaderFooter("prescription-table")} variant="outline" size="sm">
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

        <CardContent id="prescription-table" className="p-8 space-y-6">
                {/* Header with Logo and Contact */}
                <div className="flex justify-between items-start border-b-4 border-amber-500 pb-4">
                  <div>
                    <img src={IkshaLogo} alt="Iksha Logo" className="h-20 mb-2" />
                    <p className="text-xs text-gray-600">Integrated Natural Healing system</p>
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <p>📞 +91 9343922950</p>
                    <p>📧 admin@ikshanaturopathy.com</p>
                    <p>📍 Indore, Madhya Pradesh</p>
                  </div>
                </div>

                {/* Patient & Date Info */}
                <div className="flex justify-between text-sm">
                  <div>
                    <p><strong>ID:</strong> {selectedPatient.id}</p>
                    <p><strong>Patient:</strong> {selectedPatient.fullName} / {selectedPatient.age}Y / {selectedPatient.sex}</p>
                    <p><strong>Mob. No.:</strong> {selectedPatient.mobileNumber || "N/A"}</p>
                    <p><strong>Address:</strong> {selectedPatient.address || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>

                {/* Vitals */}
                <div className="border-t border-b border-gray-300 py-3">
                  <p className="text-sm">
                    <strong>Vitals:</strong> Weight (Kg): {selectedPatient.weight || "N/A"}, 
                    Height (Cm): {selectedPatient.height || "N/A"}, 
                    BP: {selectedPatient.bloodPressure || "N/A"}, 
                    Pulse: {selectedPatient.pulse || "N/A"}
                  </p>
                </div>

                {/* Chief Complaints */}
                <div>
                  <h3 className="font-bold text-base mb-2 underline">Chief Complaints</h3>
                  <p className="text-sm whitespace-pre-line">{selectedPatient.chiefComplaints || "Not specified"}</p>
                </div>

                {/* Clinical Findings */}
                {selectedPatient.clinicalFindings && (
                  <div>
                    <h3 className="font-bold text-base mb-2 underline">Clinical Findings</h3>
                    <p className="text-sm whitespace-pre-line">{selectedPatient.clinicalFindings}</p>
                  </div>
                )}

                {/* Diagnosis */}
                {selectedAppointment.diagnosis && (
                  <div>
                    <h3 className="font-bold text-base mb-2 underline">Diagnosis:</h3>
                    <p className="text-sm">* {selectedAppointment.diagnosis}</p>
                  </div>
                )}

                {/* Prescriptions Table */}
                <div>
                  <h3 className="font-bold text-base mb-3 underline">℞ Prescription</h3>
                  {selectedAppointment.prescriptions.length === 0 ? (
                    <p className="text-sm text-gray-600">No prescriptions available</p>
                  ) : (
                    <table className="w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 p-2 text-left">Medicine Name</th>
                          <th className="border border-gray-300 p-2 text-left">Dosage</th>
                          <th className="border border-gray-300 p-2 text-left">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAppointment.prescriptions.map((presc: any, idx: number) => (
                          <tr key={presc.id}>
                            <td className="border border-gray-300 p-2">
                              {idx + 1}) {presc.medicine.name}
                              {presc.instructions && (
                                <div className="text-xs text-gray-600 mt-1">{presc.instructions}</div>
                              )}
                            </td>
                            <td className="border border-gray-300 p-2">{presc.quantity}</td>
                            <td className="border border-gray-300 p-2">{presc.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Advice */}
                {selectedAppointment.advice && (
                  <div>
                    <h3 className="font-bold text-base mb-2 underline">Advice:</h3>
                    <p className="text-sm whitespace-pre-line">{selectedAppointment.advice}</p>
                  </div>
                )}

                {/* Follow Up */}
                {selectedAppointment.followUpDate && (
                  <div>
                    <p className="text-sm"><strong>Follow Up:</strong> {new Date(selectedAppointment.followUpDate).toLocaleDateString("en-IN")}</p>
                  </div>
                )}

                {/* Footer Note */}
                <div className="text-center text-xs text-gray-500 border-t pt-4 mt-6">
                  <p className="italic">This is not for medico-legal purpose.</p>
                  <p className="mt-2">📞 +91 9343922950 | 📧 admin@ikshanaturopathy.com | 🌐 www.ikshanaturopathy.com</p>
                  <p>© {new Date().getFullYear()} Iksha Naturopathy. All rights reserved.</p>
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
// import { useEffect, useState } from "react";
// import { Search, User, Calendar, Printer, Plus, FileText } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { getPatients, getPatientById } from "@/lib/api";
// import PrescriptionView from "@/components/PrescriptionView";
// import AddPrescriptionForm from "@/components/AddPrescriptionView";

// const Prescriptions = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [patients, setPatients] = useState<any[]>([]);
//   const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
//   const [selectedPatient, setSelectedPatient] = useState<any>(null);
//   const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
//   const [isAddingPrescription, setIsAddingPrescription] = useState(false);

//   useEffect(() => {
//     const fetchPatients = async () => {
//       try {
//         const res = await getPatients(searchTerm);
//         setPatients(res.data || []);
//         if (res.data.length > 0) setSelectedPatientId(res.data[0].id);
//       } catch (err) {
//         console.error("Error fetching patients:", err);
//       }
//     };
//     fetchPatients();
//   }, []);

//   useEffect(() => {
//     if (!selectedPatientId) return;

//     const fetchPatient = async () => {
//       try {
//         const res = await getPatientById(selectedPatientId);
//         const patient = res.data[0];
//         setSelectedPatient(patient);
//         setSelectedAppointment(patient.appointment?.[0] || null);
//       } catch (err) {
//         console.error("Error fetching patient:", err);
//       }
//     };

//     fetchPatient();
//   }, [selectedPatientId]);

//   const filteredPatients = patients.filter(
//     (patient) =>
//       patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       patient.id.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSavePrescription = (prescriptionData: any) => {
//     // In a real app, this would save to your backend
//     console.log("Saving prescription:", prescriptionData);
    
//     // Mock: add to current patient's appointments
//     if (selectedPatient) {
//       const newAppointment = {
//         id: `A${Date.now()}`,
//         date: prescriptionData.date,
//         paymentMethod: prescriptionData.paymentMethod,
//         consultationType: prescriptionData.consultationType,
//         status: "Completed",
//         note: prescriptionData.note,
//         prescriptions: prescriptionData.medicines.map((m: any, idx: number) => ({
//           id: `PR${Date.now()}_${idx}`,
//           ...m
//         }))
//       };
      
//       // Update selected appointment to show the new one
//       setSelectedAppointment(newAppointment);
//       setIsAddingPrescription(false);
//     }
//   };

//   if (!selectedPatient || !selectedAppointment) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <p className="text-muted-foreground">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8 flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground mb-2">Prescriptions</h1>
//             <p className="text-muted-foreground">View and manage patient prescriptions</p>
//           </div>
//           {selectedPatient && !isAddingPrescription && (
//             <Button 
//               onClick={() => setIsAddingPrescription(true)} 
//               className="bg-medical-green hover:bg-medical-green/90"
//             >
//               <FileText className="h-4 w-4 mr-2" />
//               New Prescription
//             </Button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Patient List */}
//           <div className="lg:col-span-1 space-y-4">
//             <div className="flex gap-2">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search patients..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//               <Button className="bg-primary hover:bg-primary-dark">
//                 <Plus className="h-4 w-4" />
//               </Button>
//             </div>

//             <div className="space-y-3 max-h-[600px] overflow-y-auto">
//               {filteredPatients.map((patient) => (
//                 <Card
//                   key={patient.id}
//                   className={`cursor-pointer transition-all shadow-natural hover:shadow-card-hover ${
//                     selectedPatientId === patient.id ? "ring-2 ring-primary" : ""
//                   }`}
//                   onClick={() => setSelectedPatientId(patient.id)}
//                 >
//                   <CardContent className="p-4">
//                     <div className="flex items-start justify-between mb-2">
//                       <div>
//                         <h3 className="font-semibold text-foreground">{patient.fullName}</h3>
//                         <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
//                       </div>
//                       <Badge className="bg-medical-green text-white text-xs">
//                         {patient.status || "active"}
//                       </Badge>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                       <Calendar className="h-3 w-3" />
//                       <span>{new Date(patient.formDate).toLocaleDateString("en-IN")}</span>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>

//           {/* Prescription View or Add Form */}
//           <div className="lg:col-span-2">
//             {isAddingPrescription ? (
//               <AddPrescriptionForm
//                 patient={selectedPatient}
//                 onSave={handleSavePrescription}
//                 onCancel={() => setIsAddingPrescription(false)}
//               />
//             ) : (
//               <PrescriptionView
//                 patient={selectedPatient}
//                 appointment={selectedAppointment}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Prescriptions;
