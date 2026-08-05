import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import IkshaLogo from "../../assets/iksha_logo.png";
import { generateDietPDF, getDiet } from "@/lib/api";
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
  const [dietCategoryMap, setDietCategoryMap] = useState<Record<string, string>>({});
  useEffect(() => {
    const loadDietItems = async () => {
      try {
        const response = await getDiet({ limit: 1000 });
        const map: Record<string, string> = {};
        (response.data || []).forEach((cat: any) => {
          (cat.subCategories || []).forEach((sub: any) => {
            (sub.items || []).forEach((item: any) => {
              map[item.id] = cat.name;
            });
          });
        });
        setDietCategoryMap(map);
      } catch (error) {
        console.error("Error loading diet items:", error);
      }
    };
    loadDietItems();
  }, []);
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
  const DEFAULT_MEAL_TIMINGS = [
    { time: "04:30AM-05:00AM", label: "Early Morning" },
    { time: "08:00AM-09:00AM", label: "Breakfast" },
    { time: "11:00AM-01:00PM", label: "Mid-Morning" },
    { time: "01:30PM-02:30PM", label: "Lunch" },
    { time: "05:00PM-06:00PM", label: "Evening" },
    { time: "07:30PM-08:30PM", label: "Dinner" },
    { time: "08:30PM", label: "Before Sleep" },
  ];
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
    if (time === "04:30AM-05:00AM" || time === "07:30AM-08:00AM") return "";
    if (time === "05:00PM-06:00PM") return "";
    return "";
  };
  const getMealLabel = (time: string) => {
    return (
      DEFAULT_MEAL_TIMINGS.find((x) => x.time === time)?.label || ""
    );
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
              <p>📍 Indore, Madhya Pradesh</p>
            </div>
          </div>

          {appointmentsWithDiet.map((apt: any, aptIndex: number) => {
            const mergedPlan = {
              restrictions: apt.dietPlan.find((p: any) => p.restrictions)?.restrictions || "",
              vegetables: apt.dietPlan.flatMap((p: any) => p.vegetables || []),
              fruits: apt.dietPlan.flatMap((p: any) => p.fruits || []),
              atta: apt.dietPlan.flatMap((p: any) => p.atta || []),
              dal: apt.dietPlan.flatMap((p: any) => p.dal || []),
              patientDietPlan: apt.dietPlan.flatMap((p: any) => p.patientDietPlan || []),
            };
            console.log("Merged Diet Plan for Appointment ID", apt.id, mergedPlan);
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


                <div className="overflow-x-auto">
                  <table className="w-full border-2 border-gray-800 text-sm">
                    <thead>
                      <tr>
                        <th className="border-2 border-gray-800 bg-amber-500 text-white p-3 text-center font-bold w-[150px]">
                          Date
                        </th>

                        <th className="border-2 border-gray-800 bg-amber-100 p-3 text-center font-bold w-[220px]">
                          Time Slot
                        </th>

                        <th className="border-2 border-gray-800 bg-amber-100 p-3 text-center font-bold">
                          Diet Plan
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {sortedDates.map((date) => {
                        const pdpsForDate = dateMap.get(date)!;

                        const rows: {
                          timeSlot: string;
                          dietItems: any[];
                          text: string;
                        }[] = [];

                        allTimeSlots.forEach((timeSlot) => {
                          const allDietItems: any[] = [];
                          let cellText = "";

                          pdpsForDate.forEach((pdp: any) => {
                            const dietItem = pdp.dietPlanItem.find(
                              (item: any) => item.time === timeSlot
                            );

                            if (dietItem) {
                              if (dietItem.text) {
                                cellText = dietItem.text;
                              }
                              if (
                                dietItem.dietItem &&
                                dietItem.dietItem.length > 0
                              ) {
                                allDietItems.push(...dietItem.dietItem);
                              }
                            }
                          });

                          rows.push({
                            timeSlot,
                            dietItems: allDietItems,
                            text: cellText,
                          });
                        });

                        return rows.map((row, index) => (
                          <tr key={`${date}-${row.timeSlot}`}>
                            {index === 0 && (
                              <td
                                rowSpan={rows.length}
                                className="border-2 border-gray-800 p-3 font-bold bg-gray-50 text-center align-top"
                              >
                                {new Date(date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                )}
                              </td>
                            )}

                            <td className="border-2 border-gray-800 p-3 bg-amber-50 align-top">
                              <div className="font-bold text-gray-900">
                                {getMealLabel(row.timeSlot)}
                              </div>

                              <div className="text-sm text-gray-600">
                                {row.timeSlot}
                              </div>

                              {getLocationLabel(row.timeSlot) && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {getLocationLabel(row.timeSlot)}
                                </div>
                              )}
                            </td>

                            <td className="border-2 border-gray-800 p-3 align-top">
                              {row.text ? (
                                <div className="whitespace-pre-wrap text-sm leading-6">
                                  {row.text}
                                </div>
                              ) : row.dietItems.length > 0 ? (
                                <div className="space-y-3">
                                  {(() => {
                                    const groups = row.dietItems.reduce((acc: any, item: any) => {
                                      const category =
                                        dietCategoryMap[item.id] || item.category?.name || "Other";

                                      if (!acc[category]) {
                                        acc[category] = [];
                                      }

                                      acc[category].push(item);

                                      return acc;
                                    }, {});

                                    return (
                                      <div className="text-sm leading-7">
                                        {Object.entries(groups).map(([category, foods]: any, index, arr) => (
                                          <span key={category}>
                                            <span className="font-bold text-amber-700">{category}: </span>
                                            (
                                            {foods
                                              .map((food: any) => food.subForm || food.name)
                                              .join(" / ")}
                                            )
                                            {index !== arr.length - 1 && (
                                              <span className="font-bold text-gray-500"> + </span>
                                            )}
                                          </span>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <div className="text-gray-400 italic">
                                  No Diet Assigned
                                </div>
                              )}
                            </td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>

                {mergedPlan.restrictions && (
                  <div className="mb-4 mt-4 bg-amber-50 border-2 border-amber-400 rounded-lg p-3 text-sm font-semibold">
                    <strong>Restrictions:</strong> {mergedPlan.restrictions}
                  </div>
                )}
                {mergedPlan.vegetables.length > 0 && (
                  <div className="mb-4">
                    <strong className="font-semibold">Vegetables:</strong>{" "}
                    {mergedPlan.vegetables.join(", ")}
                  </div>
                )}
                {mergedPlan.fruits.length > 0 && (
                  <div className="mb-4">
                    <strong className="font-semibold">Fruits:</strong>{" "}
                    {mergedPlan.fruits.join(", ")}
                  </div>
                )}
                {mergedPlan.atta.length > 0 && (
                  <div className="mb-4">
                    <strong className="font-semibold">Atta:</strong>{" "}
                    {mergedPlan.atta.join(", ")}
                  </div>
                )}
                {mergedPlan.dal.length > 0 && (
                  <div className="mb-4">
                    <strong className="font-semibold">Dal:</strong>{" "}
                    {mergedPlan.dal.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
