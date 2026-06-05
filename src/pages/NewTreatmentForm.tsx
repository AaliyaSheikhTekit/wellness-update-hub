import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getBackendToken } from "@/lib/api";

const NewTreatmentForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    subTitle: "",
    shortForm: "",
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
const [categories, setCategories] = useState<any[]>([]);
const [newCategoryName, setNewCategoryName] = useState("");
const [categoryLoading, setCategoryLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "pdf") => {
    const file = e.target.files?.[0] || null;
    if (type === "image") setImageFile(file);
    else setPdfFile(file);
  };
  const fetchCategories = async () => {
  try {
    const token = getBackendToken();

    const res = await fetch("https://api.ikshanaturopathy.com/v1/category/get", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch categories");

    const result = await res.json();

    setCategories(result?.data || result || []);
  } catch (err) {
    console.error("Category fetch error:", err);
  }
};

useEffect(() => {
  fetchCategories();
}, []);
const handleCreateCategory = async () => {
  if (!newCategoryName.trim()) {
    toast({
      title: "Error",
      description: "Category name is required",
    });
    return;
  }

  setCategoryLoading(true);

  try {
    const token = getBackendToken();

    const res = await fetch("https://api.ikshanaturopathy.com/v1/category/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newCategoryName.trim(),
      }),
    });

    if (!res.ok) throw new Error("Failed to create category");

    toast({
      title: "Category Added",
      description: `Successfully added "${newCategoryName}"`,
    });

    setNewCategoryName("");
    fetchCategories();
  } catch (err: any) {
    toast({
      title: "Error",
      description: err.message || "Failed to create category",
    });
  } finally {
    setCategoryLoading(false);
  }
};
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const token = getBackendToken();

    const res = await fetch("https://api.ikshanaturopathy.com/v1/treatment/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId: formData.categoryId,
        title: formData.title,
        subTitle: formData.subTitle,
        shortForm: formData.shortForm,
        treatment: formData.treatment,
        packageDescription: formData.packageDescription ||"-",
        price: formData.price,
        duration: formData.duration,
        validity: formData.validity || 0,
        days: formData.days || 0,
      }),
    });

    if (!res.ok) throw new Error("Failed to create treatment");

    await res.json();

    toast({
      title: "Treatment Added",
      description: `Successfully added "${formData.title}"`,
    });

    setFormData({
      categoryId: "",
      title: "",
      subTitle: "",
      shortForm: "",
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
       <div className="space-y-2">
  <Label>Add Category</Label>

  <div className="flex gap-2">
    <Input
      value={newCategoryName}
      onChange={(e) => setNewCategoryName(e.target.value)}
      placeholder="Enter category name"
    />

    <Button
      type="button"
      onClick={handleCreateCategory}
      disabled={categoryLoading}
    >
      {categoryLoading ? "Adding..." : "Add"}
    </Button>
  </div>
</div>

<div>
  <Label htmlFor="categoryId">Select Category</Label>

  <select
    name="categoryId"
    value={formData.categoryId}
    onChange={(e) => {
      const selectedCategory = categories.find(
        (cat: any) => cat.id === e.target.value
      );

      setFormData((prev) => ({
        ...prev,
        categoryId: e.target.value,
        subTitle: selectedCategory?.name || "",
      }));
    }}
    required
    className="w-full border rounded px-3 py-2 mt-1"
  >
    <option value="">Select Category</option>

    {categories.map((category: any) => (
      <option key={category.id} value={category.id}>
        {category.name}
      </option>
    ))}
  </select>
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
  <Label htmlFor="shortForm">Short Form</Label>
  <Input
    name="shortForm"
    value={formData.shortForm}
    onChange={handleChange}
    placeholder="e.g. HCC, SWD, SB"
    required
  />
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
            <Input type="text" name="price" value={formData.price} onChange={handleChange} required />
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
