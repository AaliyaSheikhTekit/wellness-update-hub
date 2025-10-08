import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const NewTreatmentForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    subTitle: "",
    treatment: "",
    packageDescription: "",
    price: "",
    duration: "",
    validity: "",
    days: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "pdf") => {
    const file = e.target.files?.[0] || null;
    if (type === "image") setImageFile(file);
    else setPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bodyData = new FormData();
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        bodyData.append(key, value.toString());
      });
      // Append files if present
      if (imageFile) bodyData.append("image", imageFile);
      if (pdfFile) bodyData.append("pdf", pdfFile);

      const res = await fetch("https://api.ikshanaturopathy.com/v1/treatment/create", {
        method: "POST",
        body: bodyData,
      });

      if (!res.ok) throw new Error("Failed to create treatment");

      const result = await res.json();
      toast({
        title: "Treatment Added",
        description: `Successfully added "${formData.title}"`,
      });
      // Reset form
      setFormData({
        categoryId: "",
        title: "",
        subTitle: "",
        treatment: "",
        packageDescription: "",
        price: "",
        duration: "",
        validity: "",
        days: "",
      });
      setImageFile(null);
      setPdfFile(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add treatment",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start  p-6 bg-white shadow-md rounded-lg space-y- mt-4">
      <h2 className="text-2xl font-semibold text-gray-800">Add New Treatment</h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-[50%]">
        <div>
          <Label htmlFor="categoryId">Category ID</Label>
          <Input name="categoryId" value={formData.categoryId} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="subTitle">Subtitle</Label>
          <Input name="subTitle" value={formData.subTitle} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="treatment">Treatment Description</Label>
          <Textarea name="treatment" value={formData.treatment} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="packageDescription">Package Details</Label>
          <Textarea
            name="packageDescription"
            value={formData.packageDescription}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input type="number" name="price" value={formData.price} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input name="duration" value={formData.duration} onChange={handleChange} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="validity">Validity</Label>
            <Input name="validity" value={formData.validity} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="days">Available Days</Label>
            <Input name="days" value={formData.days} onChange={handleChange} placeholder="Mon, Wed, Fri" />
          </div>
        </div>

        <div>
          <Label htmlFor="image">Upload Image</Label>
          <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")} />
        </div>

        <div>
          <Label htmlFor="pdf">Upload PDF</Label>
          <Input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, "pdf")} />
        </div>

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
          {loading ? "Submitting..." : "Add Treatment"}
        </Button>
      </form>
    </div>
  );
};

export default NewTreatmentForm;
