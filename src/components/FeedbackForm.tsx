import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { createFeedback , getFeedbackByPatientId} from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

const FeedbackForm = ({ patient }: { patient: any }) => {
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    heardFrom: "",
    otherSource: "",
    relief: "",
    likes: "",
    improvements: "",
    recommend: "",
    comments: "",
    name: patient?.fullName || "",
  });

  const [ratings, setRatings] = useState({
    reception: 0,
    cleanliness: 0,
    staff: 0,
    doctor: 0,
    treatment: 0,
    overall: 0,
  });

  // ---------------------------
  // 🔹 Fetch existing feedback
  // ---------------------------
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await getFeedbackByPatientId(patient.id);
        if (res && res.data) {
          setFeedback(res.data);
        } else {
          setFeedback(null);
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [patient]);

  // ---------------------------
  // 🔹 Prefill if editing
  // ---------------------------
  useEffect(() => {
    if (feedback) {
      setForm({
        heardFrom: feedback.website
          ? "Website"
          : feedback.socialMedia
          ? "Social Media"
          : feedback.friendFamily
          ? "Friend/Family"
          : feedback.otherSource
          ? "Other"
          : "",
        otherSource: feedback.otherSource || "",
        relief: feedback.reliefReceived || "",
        likes: feedback.likedMost || "",
        improvements: feedback.improvements || "",
        recommend: feedback.recommendToOthers ? "Yes" : "No",
        comments: feedback.additionalComments || "",
        name: feedback.name || patient?.fullName || "",
      });

      setRatings({
        reception: feedback.receptionRegistration || 0,
        cleanliness: feedback.cleanlinessHygiene || 0,
        staff: feedback.staffBehavior || 0,
        doctor: feedback.doctorsConsultation || 0,
        treatment: feedback.treatmentQuality || 0,
        overall: feedback.overallExperience || 0,
      });
    }
  }, [feedback]);

  // ---------------------------
  // 🔹 Submit handler
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      otherSource: form.otherSource || null,
      website: form.heardFrom === "Website",
      socialMedia: form.heardFrom === "Social Media",
      friendFamily: form.heardFrom === "Friend/Family",
      receptionRegistration: ratings.reception,
      cleanlinessHygiene: ratings.cleanliness,
      staffBehavior: ratings.staff,
      doctorsConsultation: ratings.doctor,
      treatmentQuality: ratings.treatment,
      overallExperience: ratings.overall,
      reliefReceived: form.relief,
      likedMost: form.likes,
      improvements: form.improvements,
      recommendToOthers: form.recommend === "Yes",
      additionalComments: form.comments,
      patientId: patient?.id,
      name: form.name,
    };

    console.log("🧾 Payload:", payload);

    try {
      setSubmitting(true);
      const res = await createFeedback(payload);
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your response.",
      });
      setFeedback(res.data || payload);
      setOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit feedback.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderRatingRow = (label: string, key: keyof typeof ratings) => (
    <tr className="text-center border-b">
      <td className="py-2 text-left font-medium">{label}</td>
      {[1, 2, 3, 4, 5].map((num) => (
        <td key={num} className="py-2">
          <input
            type="radio"
            name={key}
            value={num}
            checked={ratings[key] === num}
            onChange={() => setRatings((r) => ({ ...r, [key]: num }))}
            className="accent-indigo-600 cursor-pointer"
          />
        </td>
      ))}
    </tr>
  );

  // ---------------------------
  // 🔹 UI
  // ---------------------------
  if (loading)
    return (
      <Card className="p-8 text-center text-gray-500">
        Loading feedback details...
      </Card>
    );

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="text-2xl font-bold text-center">
          {feedback ? "Patient Feedback Summary" : "Patient Feedback"}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Feedback View */}
        {feedback ? (
          <div className="space-y-3 text-gray-800">
            <p>
              <strong>Heard From:</strong>{" "}
              {feedback.website
                ? "Website"
                : feedback.socialMedia
                ? "Social Media"
                : feedback.friendFamily
                ? "Friend/Family"
                : feedback.otherSource || "N/A"}
            </p>
            <p>
              <strong>Relief:</strong> {feedback.reliefReceived || "N/A"}
            </p>
            <p>
              <strong>Liked Most:</strong> {feedback.likedMost || "—"}
            </p>
            <p>
              <strong>Improvements:</strong> {feedback.improvements || "—"}
            </p>
            <p>
              <strong>Recommend:</strong>{" "}
              {feedback.recommendToOthers ? "Yes" : "No"}
            </p>
            <p>
              <strong>Comments:</strong> {feedback.additionalComments || "—"}
            </p>
            <p>
              <strong>Ratings:</strong>{" "}
              {`Reception: ${feedback.receptionRegistration || 0}, Cleanliness: ${feedback.cleanlinessHygiene || 0}, Staff: ${feedback.staffBehavior || 0}, Doctor: ${feedback.doctorsConsultation || 0}, Treatment: ${feedback.treatmentQuality || 0}, Overall: ${feedback.overallExperience || 0}`}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            No feedback submitted yet.
          </p>
        )}

        {/* Button to open form */}
        <div className="flex justify-center pt-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white">
                {feedback ? "Edit Feedback" : "Add Feedback"}
              </Button>
            </DialogTrigger>

            {/* Feedback Form */}
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
              <DialogHeader className="border-b pb-2 mb-3">
                <DialogTitle>
                  {feedback ? "Edit Your Feedback" : "Submit Feedback"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* How did you hear about us */}
                <div>
                  <Label className="font-semibold text-lg">
                    How did you come to know about us?
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                    {["Website", "Social Media", "Friend/Family", "Other"].map(
                      (option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={form.heardFrom === option}
                            onCheckedChange={() =>
                              setForm((f) => ({
                                ...f,
                                heardFrom: option,
                              }))
                            }
                          />
                          {option}
                        </label>
                      )
                    )}
                  </div>
                  {form.heardFrom === "Other" && (
                    <Input
                      placeholder="Please specify"
                      value={form.otherSource}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          otherSource: e.target.value,
                        }))
                      }
                      className="mt-3"
                    />
                  )}
                </div>

                {/* Ratings */}
                <div>
                  <Label className="font-semibold text-lg">
                    Rate the following (1 – Poor, 5 – Excellent)
                  </Label>
                  <div className="overflow-x-auto mt-3 border rounded-lg">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="text-left py-2 px-3">Parameter</th>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <th key={num} className="px-3 py-2">
                              {num}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {renderRatingRow("Reception & Registration", "reception")}
                        {renderRatingRow("Cleanliness & Hygiene", "cleanliness")}
                        {renderRatingRow("Staff Behavior", "staff")}
                        {renderRatingRow("Doctor’s Consultation", "doctor")}
                        {renderRatingRow("Treatment Quality", "treatment")}
                        {renderRatingRow("Overall Experience", "overall")}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Other text fields */}
                <Textarea
                  placeholder="What did you like the most..."
                  value={form.likes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, likes: e.target.value }))
                  }
                />
                <Textarea
                  placeholder="What can we improve..."
                  value={form.improvements}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, improvements: e.target.value }))
                  }
                />
                <Textarea
                  placeholder="Additional comments..."
                  value={form.comments}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, comments: e.target.value }))
                  }
                />
                <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Save Feedback"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;


