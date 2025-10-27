import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download, Calendar } from "lucide-react";
import IkshaLogo from "../../assets/iksha_logo.png";

export default function DietChartView({ 
  patient
}: { 
  patient: any;
}) {
  // Get all appointments that have diet plans
  const appointments = patient?.appointment || [];
  const appointmentsWithDiet = appointments.filter((apt: any) => 
    apt.dietPlan && apt.dietPlan.length > 0
  );

  const [selectedAppointmentIndex, setSelectedAppointmentIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(0);

  // Get current selected appointment
  const selectedAppointment = appointmentsWithDiet[selectedAppointmentIndex];

  // Check if diet plan exists
  const hasDietPlan = selectedAppointment?.dietPlan && selectedAppointment.dietPlan.length > 0;

  const printDietChart = () => {
    const printContent = document.getElementById("diet-chart-print");
    if (!printContent) return;

    const newWindow = window.open("", "_blank", "width=1200,height=800");
    if (!newWindow) return;

    newWindow.document.write(`
      <html>
        <head>
          <title>Diet Chart - ${patient?.fullName || "Patient"}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              font-size: 12px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 4px solid #F59E0B;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header img { height: 60px; }
            .header-info { text-align: right; font-size: 10px; }
            .patient-info {
              background: #f3f4f6;
              padding: 10px;
              margin-bottom: 15px;
              border-radius: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 10px 0;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left;
              vertical-align: top;
            }
            th { 
              background: #e5e7eb; 
              font-weight: bold;
              text-align: center;
            }
            .time-header {
              background: #f3f4f6;
              font-weight: bold;
              text-align: center;
              font-size: 10px;
            }
            .diet-item {
              margin: 3px 0;
              line-height: 1.4;
            }
            .restrictions {
              background: #fef3c7;
              border: 2px solid #f59e0b;
              padding: 10px;
              margin: 15px 0;
              border-radius: 5px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #ddd;
              font-size: 10px;
              color: #666;
            }
            @media print {
              body { margin: 0; padding: 15px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  const activeDietPlan = hasDietPlan 
    ? selectedAppointment.dietPlan[0]?.patientDietPlan?.[selectedDate]
    : null;
  const restrictions = hasDietPlan ? selectedAppointment.dietPlan[0]?.restrictions : null;

  

  // If no appointments have diet plans
  if (appointmentsWithDiet.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="shadow-lg max-w-7xl mx-auto">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl text-foreground">Diet Chart</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Diet Plans Available</h3>
              <p className="text-gray-500">This patient does not have any diet plans assigned yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset date selection when appointment changes
  const handleAppointmentChange = (index: number) => {
    setSelectedAppointmentIndex(index);
    setSelectedDate(0); // Reset to first date of new appointment
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="shadow-lg max-w-7xl mx-auto">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-foreground">Diet Chart</CardTitle>
            <div className="flex gap-2">
              <Button onClick={printDietChart} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
          
          {/* Appointment Selector - Only show if multiple appointments with diet plans */}
          {appointments.length > 1 && (
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Select Appointment:
              </label>
              <div className="flex gap-2 flex-wrap">
                {appointments.map((apt, idx) => {
                  const hasDiet = apt.dietPlan && apt.dietPlan.length > 0;
                  if (!hasDiet) return null;
                  
                  return (
                    <Button
                      key={apt.id}
                      variant={selectedAppointmentIndex === idx ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAppointmentChange(idx)}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(apt.date).toLocaleDateString("en-IN")}</span>
                      {apt.consultationType && (
                        <span className="text-xs opacity-70">
                          ({apt.consultationType.replace(/_/g, " ")})
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6">
          <div id="diet-chart-print">
            {/* Header with Logo */}
            <div className="flex justify-between items-start border-b-4 border-amber-500 pb-4 mb-6">
              <div>
                <img src={IkshaLogo} alt="Iksha Logo" className="h-16 mb-2" />
                <p className="text-xs text-gray-600">Integrated Natural Healing System</p>
              </div>
              <div className="text-right text-xs space-y-1">
                <p>📞 +91 9343922950</p>
                <p>📧 admin@ikshanaturopathy.com</p>
                <p>📍 Bhopal, Madhya Pradesh</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><strong>Patient Name:</strong> {patient?.fullName || "N/A"}</div>
                <div><strong>Patient ID:</strong> {patient?.id || "N/A"}</div>
                <div><strong>Age/Gender:</strong> {patient?.age || "N/A"}Y / {patient?.sex || "N/A"}</div>
              </div>
            </div>

            {/* Date Selector - for multiple dates within same appointment */}
            {selectedAppointment.dietPlan[0]?.patientDietPlan?.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Select Date:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {selectedAppointment.dietPlan[0].patientDietPlan.map((plan: any, idx: number) => (
                    <Button
                      key={plan.id}
                      variant={selectedDate === idx ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDate(idx)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(plan.date).toLocaleDateString("en-IN")}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Diet Chart Title */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold bg-gray-200 py-2 rounded">Diet</h2>
              {activeDietPlan && (
                <p className="text-sm text-gray-600 mt-1">
                  Date: {new Date(activeDietPlan.date).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>

            {/* Diet Table */}
            {activeDietPlan && (
              <div className="overflow-x-auto">
                <table className="w-full border-2 border-gray-800 text-xs">
                  <thead>
                    <tr>
                      <th className="border-2 border-gray-800 bg-gray-200 p-2">Date</th>
                      {activeDietPlan.dietPlanItem.map((item: any, idx: number) => (
                        <th key={item.id} className="border-2 border-gray-800 bg-gray-200 p-2 text-center">
                          <div className="font-bold">{item.time}</div>
                          {idx === 0 && <div className="text-[10px] mt-1">(Yoga Bhawan)</div>}
                          {idx === 1 && <div className="text-[10px] mt-1">(Yoga Bhawan)</div>}
                          {idx === 5 && <div className="text-[10px] mt-1">(Canteen)</div>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-2 border-gray-800 p-3 font-semibold bg-gray-50">
                        {new Date(activeDietPlan.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </td>
                      {activeDietPlan.dietPlanItem.map((item: any) => (
                        <td key={item.id} className="border-2 border-gray-800 p-3">
                          {item.dietItem.map((food: any, foodIdx: number) => (
                            <div key={foodIdx} className="mb-2 last:mb-0">
                              <div className="font-medium">{food.name}</div>
                              {food.subForm && (
                                <div className="text-gray-600 text-[10px]">{food.subForm}</div>
                              )}
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Special Diet Instructions */}
            {restrictions && (
              <div className="mt-6 bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
                <p className="font-bold text-sm mb-2">Special Diet Instructions:</p>
                <p className="text-sm">{restrictions}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-8 pt-4 border-t-2 text-xs text-gray-600">
              <p className="mb-1">Integrated Natural Healing System for comprehensive wellness</p>
              <p>📞 +91 9343922950 | 📧 admin@ikshanaturopathy.com | 🌐 www.ikshanaturopathy.com</p>
              <p className="mt-2">© {new Date().getFullYear()} Iksha Naturopathy. All rights reserved.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}