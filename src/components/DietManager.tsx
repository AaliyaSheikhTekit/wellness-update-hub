// components/DietManager.tsx

import React, { useEffect, useState } from "react";
import { getDiet, createDiet, updateDiet, deleteDiet } from "@/lib/api";

export default function DietManager() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<any>({ type: "category", name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDiet({ limit: 200 });
      // adapt depending on API shape: try res.data then res
      setList(Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setForm({ type: "category", name: "", categoryId: "", subCategoryId: "", subForm: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateDiet(editingId, form);
      } else {
        await createDiet(form);
      }
      await fetchAll();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Submit failed");
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      name: item.name,
      categoryId: item.categoryId || "",
      subCategoryId: item.subCategoryId || "",
      subForm: item.subForm || "",
    });
  };

  const handleDelete = async (id: string) => {
    setError(null);
    if (!confirm("Delete this item?")) return;
    try {
      await deleteDiet(id);
      await fetchAll();
    } catch (err: any) {
      setError(err.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">IK</div>
          <div>
            <h1 className="text-2xl font-semibold">Diet Manager</h1>
            <p className="text-sm text-gray-600">Super Admin panel — manage categories, subcategories, and items</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-1 bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-3">{editingId ? "Edit Entry" : "Add Entry"}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600">Type</label>
              <select
                value={form.type}
               onChange={(e) =>
  setForm({
    type: e.target.value,
    name: "",
    categoryId: "",
    subCategoryId: "",
    subForm: "",
  })
}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                <option value="category">Category</option>
                <option value="subcategory">Subcategory</option>
                <option value="item">Item</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                required
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>

            {form.type === "subcategory" && (
  <div>
    <label className="block text-xs text-gray-600">Select Parent Category</label>
    <select
      value={form.categoryId || ""}
      onChange={(e) =>
        setForm((s) => ({
          ...s,
          categoryId: e.target.value,
        }))
      }
      required
      className="w-full border rounded px-3 py-2 mt-1"
    >
      <option value="">Select Category</option>

      {list.map((category: any) => (
  <option key={category.id} value={category.id}>
    {category.name}
  </option>
))}
    </select>
  </div>
)}

            {form.type === "item" && (
              <>
                <div>
                  <label className="block text-xs text-gray-600">Parent Subcategory ID</label>
                 <select
  value={form.subCategoryId || ""}
  onChange={(e) =>
    setForm((s) => ({
      ...s,
      subCategoryId: e.target.value,
    }))
  }
  required
  className="w-full border rounded px-3 py-2 mt-1"
>
  <option value="">Select Subcategory</option>

  {list.flatMap((category: any) =>
    category.subCategories.map((sub: any) => (
      <option key={sub.id} value={sub.id}>
        {category.name} → {sub.name}
      </option>
    ))
  )}
</select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600">Sub Form (optional)</label>
                  <input
                    value={form.subForm}
                    onChange={(e) => setForm((s) => ({ ...s, subForm: e.target.value }))}
                    placeholder="e.g. RN"
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded">{editingId ? "Update" : "Create"}</button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Reset</button>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
          </form>
        </section>

        <section className="md:col-span-2 bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Diet Listings</h2>
            <div className="flex gap-2">
              <button onClick={fetchAll} className="px-3 py-1 border rounded">Refresh</button>
            </div>
          </div>

          {loading ? (
            <div>Loading …</div>
          ) : (
            <div className="space-y-3">
              {list.length === 0 && <div className="text-sm text-gray-500">No entries found.</div>}
{list.map((category: any) => (
  <div key={category.id} className="border rounded p-3">

    <h3 className="font-bold text-lg">
      {category.name}
    </h3>

    {category.subCategories?.map((sub: any) => (
      <div key={sub.id} className="ml-4 mt-2">

        <div className="font-medium">
          ↳ {sub.name}
        </div>

        {sub.items?.map((item: any) => (
          <div
            key={item.id}
            className="ml-6 text-sm text-gray-700"
          >
            • {item.name}
            {item.subForm && ` (${item.subForm})`}
          </div>
        ))}

      </div>
    ))}

  </div>
))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}   