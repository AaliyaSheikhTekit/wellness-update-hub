import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download, Calendar } from "lucide-react";
import IkshaLogo from "../../assets/iksha_logo.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DietChartView({ patient }: { patient: any }) {
  const appointments = patient?.appointment || [];

  // ✅ Gather all diet plans across appointments
  const allDietPlans = appointments
    .filter((apt: any) => Array.isArray(apt.dietPlan))
    .flatMap((apt: any) =>
      apt.dietPlan.map((plan: any) => ({
        ...plan,
        appointmentDate: apt.date,
        createdAt: plan.createdAt || apt.createdAt,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.appointmentDate).getTime() -
        new Date(a.createdAt || a.appointmentDate).getTime()
    );

  const hasDietPlan = allDietPlans.length > 0;

  // ✅ Print
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
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #000; padding: 8px; vertical-align: top; text-align: center; }
            th { background: #e5e7eb; }
            .footer { text-align: center; margin-top: 30px; border-top: 2px solid #ddd; font-size: 10px; color: #666; padding-top: 10px; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  // ✅ PDF Download
  const downloadPDF = async () => {
    const element = document.getElementById("diet-chart-print");
    if (!element) return;

    const filename = `Diet_Chart_${patient?.fullName?.replace(/\s+/g, "_") || "Patient"}.pdf`;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 20;

      pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 20, position - heightLeft, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (!hasDietPlan) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="shadow-lg max-w-7xl mx-auto">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl text-foreground">Diet Chart</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Diet Plans Available</h3>
            <p className="text-gray-500">This patient does not have any diet plans yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="shadow-lg max-w-7xl mx-auto">
        <CardHeader className="border-b border-border flex justify-between items-center">
          <CardTitle className="text-2xl text-foreground">Diet Chart</CardTitle>
          <div className="flex gap-2">
            <Button onClick={printDietChart} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button onClick={downloadPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div id="diet-chart-print">
            {/* Header */}
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
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm grid grid-cols-3 gap-4">
              <div><strong>Patient Name:</strong> {patient?.fullName || "N/A"}</div>
              <div><strong>Patient ID:</strong> {patient?.id || "N/A"}</div>
              <div><strong>Age/Gender:</strong> {patient?.age || "N/A"} / {patient?.sex || "N/A"}</div>
            </div>

            {/* ✅ Diet Chart in Image Format */}
            {allDietPlans.map((plan: any, planIndex: number) => (
              <div key={plan.id} className="border border-gray-300 rounded-lg p-4 mb-8 shadow-sm">
                <h2 className="text-lg font-bold bg-gray-200 p-2 rounded text-center mb-4">
                  Diet Plan #{planIndex + 1} —{" "}
                  {new Date(plan.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full border-2 border-gray-800 text-xs">
                    <thead>
                      <tr>
                        <th className="border-2 border-gray-800 bg-gray-300 p-2 text-center">Date</th>
                        {[
                          ...new Set(
                            plan.patientDietPlan.flatMap((pdp: any) =>
                              pdp.dietPlanItem.map((item: any) => item.time)
                            )
                          ),
                        ].map((time) => (
                          <th key={String(time)} className="border-2 border-gray-800 bg-gray-200 p-2 text-center">
                            {String(time)}
                            {time === "04:30AM-05:00AM" && <div className="text-[10px]">(Yoga Bhawan)</div>}
                            {time === "07:30AM-08:00AM" && <div className="text-[10px]">(Yoga Bhawan)</div>}
                            {time === "05:00PM-06:00PM" && <div className="text-[10px]">(Canteen)</div>}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {plan.patientDietPlan.map((pdp: any) => {
                        const allTimes = [
                          ...new Set(
                            plan.patientDietPlan.flatMap((p: any) =>
                              p.dietPlanItem.map((item: any) => item.time)
                            )
                          ),
                        ];
                        return (
                          <tr key={pdp.id}>
                            <td className="border-2 border-gray-800 p-3 font-semibold bg-gray-50 text-center">
                              {new Date(pdp.date).toLocaleDateString("en-IN")}
                            </td>
                            {allTimes.map((time) => {
                              const dietItem = pdp.dietPlanItem.find((i: any) => i.time === time);
                              return (
                                <td key={String(time)} className="border-2 border-gray-800 p-3 align-top">
                                  {dietItem ? (
                                    dietItem.dietItem.map((food: any, idx: number) => (
                                      <div key={idx} className="mb-1">
                                        <div className="font-medium">{food.name}</div>
                                        {food.subForm && (
                                          <div className="text-gray-600 text-[10px]">{food.subForm}</div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-gray-400 italic text-[10px] text-center">—</div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {plan.restrictions && (
                  <div className="mt-4 bg-amber-50 border-2 border-amber-400 rounded-lg p-3 text-sm font-semibold">
                    Restrictions: {plan.restrictions}
                  </div>
                )}
              </div>
            ))}

            {/* Footer */}
            <div className="text-center mt-8 pt-4 border-t-2 text-xs text-gray-600">
              <p>Integrated Natural Healing System for comprehensive wellness</p>
              <p>📞 +91 9343922950 | 📧 admin@ikshanaturopathy.com | 🌐 www.ikshanaturopathy.com</p>
              <p className="mt-2">© {new Date().getFullYear()} Iksha Naturopathy. All rights reserved.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
