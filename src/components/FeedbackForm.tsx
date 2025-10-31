import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import {
  createFeedback,
  getFeedbackByPatientId,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FeedbackForm = ({ patient }: { patient: any }) => {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Fetch all feedbacks
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await getFeedbackByPatientId(patient.id);
        if (res?.data) {
          setFeedbackList(Array.isArray(res.data) ? res.data : [res.data]);
        } else {
          setFeedbackList([]);
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [patient]);

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

    try {
      setSubmitting(true);
      const res = await createFeedback(payload);
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your response.",
      });
      setFeedbackList((prev) => [res.data || payload, ...prev]);
      setOpen(false);
      setForm({
        heardFrom: "",
        otherSource: "",
        relief: "",
        likes: "",
        improvements: "",
        recommend: "",
        comments: "",
        name: patient?.fullName || "",
      });
      setRatings({
        reception: 0,
        cleanliness: 0,
        staff: 0,
        doctor: 0,
        treatment: 0,
        overall: 0,
      });
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

  if (loading)
    return (
      <Card className="p-8 text-center text-gray-500">
        Loading feedback...
      </Card>
    );

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="text-2xl font-bold text-center">
          Patient Feedbacks
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Feedback Accordion */}
        {feedbackList.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {feedbackList.map((fb, index) => (
              <AccordionItem
                key={fb.id || index}
                value={`item-${index}`}
                className="border rounded-lg mb-2 bg-gray-50"
              >
                <AccordionTrigger className="px-4 py-3 text-left">
                  <div className="flex justify-between w-full items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{fb.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-indigo-600">
                      Overall: {fb.overallExperience || 0} ★
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 space-y-2 text-gray-800">
                  <p>
                    <strong>Heard From:</strong>{" "}
                    {fb.website
                      ? "Website"
                      : fb.socialMedia
                      ? "Social Media"
                      : fb.friendFamily
                      ? "Friend/Family"
                      : fb.otherSource || "N/A"}
                  </p>
                  <p>
                    <strong>Relief:</strong> {fb.reliefReceived || "N/A"}
                  </p>
                  <p>
                    <strong>Liked Most:</strong> {fb.likedMost || "—"}
                  </p>
                  <p>
                    <strong>Improvements:</strong> {fb.improvements || "—"}
                  </p>
                  <p>
                    <strong>Recommend:</strong>{" "}
                    {fb.recommendToOthers ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Comments:</strong> {fb.additionalComments || "—"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Ratings:</strong>{" "}
                    {`Reception: ${fb.receptionRegistration || 0}, Cleanliness: ${fb.cleanlinessHygiene || 0}, Staff: ${fb.staffBehavior || 0}, Doctor: ${fb.doctorsConsultation || 0}, Treatment: ${fb.treatmentQuality || 0}, Overall: ${fb.overallExperience || 0}`}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-gray-500 text-center">
            No feedback submitted yet.
          </p>
        )}

        {/* Add Feedback Button */}
        <div className="flex justify-center pt-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white">Add Feedback</Button>
            </DialogTrigger>

            {/* Feedback Form */}
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
              <DialogHeader className="border-b pb-2 mb-3">
                <DialogTitle>Submit New Feedback</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Heard From */}
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

                {/* Other Fields */}
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
