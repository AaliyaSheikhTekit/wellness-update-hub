import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import IkshaLogo from "../../assets/iksha_logo.png";
import { generateDietPDF } from "@/lib/api";

export default function DietChartView({ patient }: { patient: any }) {
  const appointments = patient?.appointment || [];

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // ✅ Backend PDF generator per appointment
 const downloadPDF = async (appointmentId: string) => {
  try {
    setDownloadingId(appointmentId);
    const blob = await generateDietPDF(appointmentId);

    // ✅ Create a URL from the blob
    const url = window.URL.createObjectURL(blob);

    // ✅ Download or open PDF
    const link = document.createElement("a");
    link.href = url;
    link.download = `Diet_Chart_${patient?.fullName?.replace(/\s+/g, "_") || "Patient"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Optional: auto-open in a new tab instead of download
    // window.open(url, "_blank");

    // ✅ Clean up URL after use
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  } catch (err: any) {
    console.error("Diet PDF download failed:", err);
    alert(err.message || "Failed to download PDF.");
  } finally {
    setDownloadingId(null);
  }
};


  // ✅ Filter only appointments that have a diet plan
  const appointmentsWithDiet = appointments.filter(
    (apt: any) => apt.dietPlan && apt.dietPlan.length > 0
  );

  if (appointmentsWithDiet.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="shadow-lg max-w-7xl mx-auto">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl text-foreground">Diet Chart</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Diet Plans Available
            </h3>
            <p className="text-gray-500">
              This patient does not have any diet plans yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="shadow-lg max-w-7xl mx-auto">
        <CardHeader className="border-b border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-foreground">Diet Chart</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Clinic Header */}
          <div className="flex justify-between items-start border-b-4 border-amber-500 pb-4 mb-6">
            <div>
              <img src={IkshaLogo} alt="Iksha Logo" className="h-16 mb-2" />
              <p className="text-xs text-gray-600">
                Integrated Natural Healing System
              </p>
            </div>
            <div className="text-right text-xs space-y-1">
              <p>📞 +91 9343922950</p>
              <p>📧 admin@ikshanaturopathy.com</p>
              <p>📍 Bhopal, Madhya Pradesh</p>
            </div>
          </div>

          {/* ✅ Appointment-based Diet Plans */}
          {appointmentsWithDiet.map((apt: any, index: number) => (
            <div
              key={apt.id}
              className="border border-gray-400 rounded-lg p-4 mb-8 bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">
                  Appointment #{index + 1} —{" "}
                  {new Date(apt.date).toLocaleDateString("en-IN")} (
                  {apt.consultationType})
                </h2>
                <Button
                  onClick={() => downloadPDF(apt.id)}
                  variant="outline"
                  size="sm"
                  disabled={downloadingId === apt.id}
                >
                  {downloadingId === apt.id ? "Downloading..." : (
                    <>
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </>
                  )}
                </Button>
              </div>

              {apt.dietPlan.map((plan: any, planIndex: number) => (
                <div
                  key={plan.id}
                  className="border border-gray-300 rounded-lg p-4 mb-6 shadow-sm"
                >
                  <h3 className="text-md font-bold bg-gray-200 p-2 rounded text-center mb-4">
                    Diet Plan #{planIndex + 1} —{" "}
                    {new Date(plan.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </h3>

                  {/* ✅ Table Display per Diet Plan */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-2 border-gray-800 text-xs">
                      <thead>
                        <tr>
                          <th className="border-2 border-gray-800 bg-gray-300 p-2 text-center">
                            Date
                          </th>
                          {[
                            ...new Set(
                              plan.patientDietPlan.flatMap((pdp: any) =>
                                pdp.dietPlanItem.map((item: any) => item.time)
                              )
                            ),
                          ].map((time) => (
                            <th
                              key={String(time)}
                              className="border-2 border-gray-800 bg-gray-200 p-2 text-center"
                            >
                              {String(time)}
                              {time === "04:30AM-05:00AM" && (
                                <div className="text-[10px]">(Yoga Bhawan)</div>
                              )}
                              {time === "07:30AM-08:00AM" && (
                                <div className="text-[10px]">(Yoga Bhawan)</div>
                              )}
                              {time === "05:00PM-06:00PM" && (
                                <div className="text-[10px]">(Canteen)</div>
                              )}
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
                                const dietItem = pdp.dietPlanItem.find(
                                  (i: any) => i.time === time
                                );
                                return (
                                  <td
                                    key={String(time)}
                                    className="border-2 border-gray-800 p-3 align-top"
                                  >
                                    {dietItem ? (
                                      dietItem.dietItem.map(
                                        (food: any, idx: number) => (
                                          <div key={idx} className="mb-1">
                                            <div className="font-medium">
                                              {food.name}
                                            </div>
                                            {food.subForm && (
                                              <div className="text-gray-600 text-[10px]">
                                                {food.subForm}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <div className="text-gray-400 italic text-[10px] text-center">
                                        —
                                      </div>
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
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
