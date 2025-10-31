import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

const FeedbackForm = ({ patient }: { patient: any }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Feedback submitted!", description: "Thank you for your response." });
    console.log({ ...form, ratings });
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

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="text-2xl font-bold text-center">Patient Feedback Form</CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. How did you come to know about us? */}
          <div>
            <Label className="font-semibold text-lg">1. How did you come to know about us?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              {["Website", "Social Media", "Friend/Family", "Other"].map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm">
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
              ))}
            </div>
            {form.heardFrom === "Other" && (
              <Input
                placeholder="Please specify"
                value={form.otherSource}
                onChange={(e) => setForm((f) => ({ ...f, otherSource: e.target.value }))}
                className="mt-3"
              />
            )}
          </div>

          {/* 3. Rating Table */}
          <div>
            <Label className="font-semibold text-lg">
              2. Rate the following (1 – Poor, 5 – Excellent)
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

          {/* 4. Relief */}
          <div>
            <Label className="font-semibold text-lg">
              3. Did you get relief from your health concern?
            </Label>
            <RadioGroup
              onValueChange={(v) => setForm((f) => ({ ...f, relief: v }))}
              value={form.relief}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="No" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Partially" id="partially" />
                <Label htmlFor="partially">Partially</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 5. What did you like the most */}
          <div>
            <Label className="font-semibold text-lg">
              4. What did you like the most about our centre?
            </Label>
            <Textarea
              placeholder="Your answer..."
              value={form.likes}
              onChange={(e) => setForm((f) => ({ ...f, likes: e.target.value }))}
              className="mt-2"
            />
          </div>

          {/* 6. What can we improve */}
          <div>
            <Label className="font-semibold text-lg">5. What can we improve?</Label>
            <Textarea
              placeholder="Your suggestions..."
              value={form.improvements}
              onChange={(e) => setForm((f) => ({ ...f, improvements: e.target.value }))}
              className="mt-2"
            />
          </div>

          {/* 7. Recommend */}
          <div>
            <Label className="font-semibold text-lg">
              6. Would you recommend our centre to others?
            </Label>
            <RadioGroup
              onValueChange={(v) => setForm((f) => ({ ...f, recommend: v }))}
              value={form.recommend}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Yes" id="recommend-yes" />
                <Label htmlFor="recommend-yes">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="No" id="recommend-no" />
                <Label htmlFor="recommend-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Comments */}
          <div>
            <Label className="font-semibold text-lg">Additional Comments</Label>
            <Textarea
              placeholder="Share your thoughts..."
              value={form.comments}
              onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
              className="mt-2"
            />
          </div>

          {/* Signature */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold text-lg">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label className="font-semibold text-lg">Signature</Label>
              <Input placeholder="(Digital or drawn signature...)" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="px-6">
              Submit Feedback
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
