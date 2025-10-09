import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getBackendToken, API_BASE_URL } from "@/lib/api";

const QrUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a QR code image." });
      return;
    }

    const backendToken = getBackendToken();
    if (!backendToken) {
      toast({ title: "Unauthorized", description: "Please login first to upload QR code." });
      return;
    }

    const formData = new FormData();
    formData.append("qrCode", file, file.name);

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/qr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${backendToken}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      toast({ title: "Success", description: "QR code uploaded successfully!" });
      console.log("Upload result:", data);
      setFile(null); // Reset file input
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Error", description: "Failed to upload QR code." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Upload QR Code</h2>
      <div className="flex flex-col items-center space-y-4">
        <label className="w-full">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="cursor-pointer"
          />
        </label>
        {file && (
          <div className="w-full p-2 border border-gray-300 rounded text-sm text-gray-700">
            Selected file: {file.name}
          </div>
        )}
        <Button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-foreground hover:bg-foreground/80"} text-white`}
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      {file && (
        <div className="w-full flex justify-center">
          <img
            src={URL.createObjectURL(file)}
            alt="QR Preview"
            className="max-h-48 rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
};

export default QrUpload;
