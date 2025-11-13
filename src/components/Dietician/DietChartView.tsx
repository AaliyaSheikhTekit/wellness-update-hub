import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import IkshaLogo from "../../assets/iksha_logo.png";
import { generateDietPDF } from "@/lib/api";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function DietChartView({ patient }: { patient: any }) {
  const appointments = patient?.appointment || [];
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | undefined>();

  // ✅ Extract consultations from patient.appointment
  useEffect(() => {
    if (!appointments.length) return;

    const allConsultations =
      appointments
        .flatMap((a: any) =>
          (a.consultation || []).map((c: any) => ({
            id: c.id,
            createdAt: c.createdAt,
            reason: c.reason,
          }))
        )
        ?.filter(Boolean) || [];

    const sorted = allConsultations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setConsultations(sorted);
    if (sorted.length > 0) setSelectedConsultationId(sorted[0].id);
  }, [appointments]);

  // ✅ Filter appointments based on selected consultation
  const filteredAppointments = selectedConsultationId
    ? appointments.filter((apt: any) =>
        apt.consultation?.some((c: any) => c.id === selectedConsultationId)
      )
    : appointments;

  const downloadPDF = async (appointmentId: string) => {
    try {
      setDownloadingId(appointmentId);
      const blob = await generateDietPDF(appointmentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Diet_Chart_${patient?.fullName?.replace(/\s+/g, "_") || "Patient"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      console.error("Diet PDF download failed:", err);
      alert(err.message || "Failed to download PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const appointmentsWithDiet = filteredAppointments.filter(
    (apt: any) => apt.dietPlan && apt.dietPlan.length > 0
  );

  const getLocationLabel = (time: string) => {
    if (time === "04:30AM-05:00AM" || time === "07:30AM-08:00AM") return "(Yoga Bhawan)";
    if (time === "05:00PM-06:00PM") return "(Canteen)";
    return "";
  };

  const parseIndianDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split(/[-/]/).map(Number);
    return new Date(year, month - 1, day);
  };

  if (appointmentsWithDiet.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="shadow-lg max-w-7xl mx-auto">
          <CardHeader className="border-b border-border flex justify-between items-center">
            <CardTitle className="text-2xl text-foreground">Diet Chart</CardTitle>

            {/* ✅ Consultation dropdown even when no diet exists */}
            <Select
              value={selectedConsultationId}
              onValueChange={(val) => setSelectedConsultationId(val)}
            >
              <SelectTrigger className="w-[250px] h-9">
                <SelectValue placeholder="Select Consultation" />
              </SelectTrigger>
              <SelectContent>
                {consultations.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {`${c.reason || "Consultation"} - ${new Date(c.createdAt).toLocaleDateString()}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent className="p-6 text-center">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Diet Plans Available
            </h3>
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

          {/* ✅ Consultation Dropdown */}
          <Select
            value={selectedConsultationId}
            onValueChange={(val) => setSelectedConsultationId(val)}
          >
            <SelectTrigger className="w-[250px] h-9">
              <SelectValue placeholder="Select Consultation" />
            </SelectTrigger>
            <SelectContent>
              {consultations.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {`${c.reason || "Consultation"} - ${new Date(c.createdAt).toLocaleDateString()}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="p-6">
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

          {appointmentsWithDiet.map((apt: any, aptIndex: number) => {
            const mergedPlan = {
              restrictions: apt.dietPlan.find((p: any) => p.restrictions)?.restrictions || "",
              patientDietPlan: apt.dietPlan.flatMap((p: any) => p.patientDietPlan || []),
            };

            const allTimeSlotsSet = new Set<string>();
            mergedPlan.patientDietPlan.forEach((pdp: any) => {
              pdp.dietPlanItem.forEach((item: any) => {
                allTimeSlotsSet.add(item.time);
              });
            });

            const allTimeSlots = Array.from(allTimeSlotsSet).sort((a, b) => {
              const parseTime = (t: string) => {
                const match = t.match(/(\d+):(\d+)(AM|PM)/);
                if (!match) return 0;
                let hours = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const period = match[3];
                if (period === "PM" && hours !== 12) hours += 12;
                if (period === "AM" && hours === 12) hours = 0;
                return hours * 60 + minutes;
              };
              return parseTime(a) - parseTime(b);
            });

            const dateMap = new Map<string, any[]>();
            mergedPlan.patientDietPlan.forEach((pdp: any) => {
              const dateKey = pdp.date;
              if (!dateMap.has(dateKey)) dateMap.set(dateKey, []);
              dateMap.get(dateKey)!.push(pdp);
            });

            const sortedDates = Array.from(dateMap.keys()).sort(
              (a, b) => parseIndianDate(a).getTime() - parseIndianDate(b).getTime()
            );

            return (
              <div
                key={apt.id}
                className="border border-gray-400 rounded-lg p-4 mb-8 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Appointment #{aptIndex + 1} —{" "}
                    {new Date(apt.date).toLocaleDateString("en-IN")} (
                    {apt.consultationType})
                  </h2>
                  <Button
                    onClick={() => downloadPDF(apt.id)}
                    variant="outline"
                    size="sm"
                    disabled={downloadingId === apt.id}
                  >
                    {downloadingId === apt.id ? (
                      "Downloading..."
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" /> Download PDF
                      </>
                    )}
                  </Button>
                </div>

                <h3 className="text-md font-bold bg-gray-200 p-2 rounded text-center mb-4">
                  Weekly Diet Plan
                </h3>

                {mergedPlan.restrictions && (
                  <div className="mb-4 bg-amber-50 border-2 border-amber-400 rounded-lg p-3 text-sm font-semibold">
                    <strong>Restrictions:</strong> {mergedPlan.restrictions}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-2 border-gray-800 text-xs">
                    <thead>
                      <tr>
                        <th className="border-2 border-gray-800 bg-amber-500 text-white p-3 text-center font-bold">
                          Date
                        </th>
                        {allTimeSlots.map((time) => (
                          <th
                            key={time}
                            className="border-2 border-gray-800 bg-amber-100 p-3 text-center font-semibold"
                          >
                            <div>{time}</div>
                            {getLocationLabel(time) && (
                              <div className="text-[10px] text-gray-600 font-normal mt-1">
                                {getLocationLabel(time)}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDates.map((date) => {
                        const pdpsForDate = dateMap.get(date)!;

                        return (
                          <tr key={date}>
                            <td className="border-2 border-gray-800 p-3 font-bold bg-gray-50 text-center align-top">
                              {new Date(date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </td>
                            {allTimeSlots.map((timeSlot) => {
                              const allDietItems: any[] = [];
                              pdpsForDate.forEach((pdp: any) => {
                                const dietItem = pdp.dietPlanItem.find(
                                  (item: any) => item.time === timeSlot
                                );
                                if (dietItem && dietItem.dietItem.length > 0) {
                                  allDietItems.push(...dietItem.dietItem);
                                }
                              });

                              return (
                                <td
                                  key={timeSlot}
                                  className="border-2 border-gray-800 p-3 align-top bg-white"
                                >
                                  {allDietItems.length > 0 ? (
                                    <div className="space-y-2">
                                      {allDietItems.map((food: any, idx: number) => (
                                        <div
                                          key={food.id || idx}
                                          className="leading-tight"
                                        >
                                          <div className="font-semibold text-gray-800">
                                            {food.name}
                                          </div>
                                          {food.subForm && (
                                            <div className="text-[10px] text-gray-500 mt-0.5">
                                              {food.subForm}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-gray-400 italic text-center">
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
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
