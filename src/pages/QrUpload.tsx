import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getBackendToken, API_BASE_URL } from "@/lib/api";
import { Upload, RefreshCw, ShieldCheck, Image as ImageIcon, QrCode } from "lucide-react";

type QrInfo = {
  qrCodeUrl?: string;
  upiId?: string;
  qrId?: string;
  updatedAt?: string;
};

const QrUpload: React.FC = () => {
  const { toast } = useToast();

  // current (server) QR
  const [current, setCurrent] = useState<QrInfo | null>(null);
  const [loadingCurrent, setLoadingCurrent] = useState(false);

  // upload form
  const [file, setFile] = useState<File | null>(null);
  const [upi, setUpi] = useState("");
  const [uploading, setUploading] = useState(false);

  const backendToken = getBackendToken();

  const fetchCurrent = async () => {
    if (!backendToken) return;
    try {
      setLoadingCurrent(true);
      const res = await fetch(`${API_BASE_URL}/qr`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
      });
      if (!res.ok) throw new Error(`QR fetch failed: ${res.status}`);
      const data = await res.json();
      // expected shape: { data: { qrCodeUrl, upiId, qrId, updatedAt } } or flat
      const d = data?.data ?? data;
      setCurrent({
        qrCodeUrl: d?.qrCodeUrl,
        upiId: d?.upi,
        qrId: d?.qrId,
        updatedAt: d?.updatedAt,
      });
      if (d?.upiId) setUpi(d.upiId); // prefill UPI input with current value
    } catch (e: any) {
      console.error(e);
      toast({ title: "Unable to fetch QR", description: e?.message || "Please try again." });
    } finally {
      setLoadingCurrent(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async () => {
    if (!backendToken) {
      toast({ title: "Unauthorized", description: "Please login first." });
      return;
    }
    if (!file && !upi.trim()) {
      toast({
        title: "Nothing to update",
        description: "Select a QR image and/or enter a UPI ID.",
      });
      return;
    }

    const formData = new FormData();
    if (file) formData.append("qrCode", file, file.name);
    if (upi.trim()) formData.append("upi", upi.trim());

    try {
      setUploading(true);
      const res = await fetch(`${API_BASE_URL}/qr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${backendToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      await res.json();

      toast({ title: "QR updated", description: "QR code & UPI saved successfully." });
      setFile(null);
      await fetchCurrent();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Error", description: error?.message || "Failed to upload QR." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-3 bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Super Admin — QR Manager</h1>
            <p className="text-sm text-muted-foreground">
              Manage the payment QR and UPI shown to patients.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchCurrent} disabled={loadingCurrent}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Current QR */}
      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Current QR & UPI
          </CardTitle>
          {!!current?.updatedAt && (
            <span className="text-xs text-muted-foreground">
              Updated: {new Date(current.updatedAt).toLocaleString()}
            </span>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex items-center justify-center">
            <div className="border rounded-xl p-3 bg-white w-full max-w-xs aspect-square flex items-center justify-center">
              {loadingCurrent ? (
                <div className="h-full w-full animate-pulse bg-muted rounded-md" />
              ) : current?.qrCodeUrl ? (
                <img
                  src={current.qrCodeUrl}
                  alt="Current QR"
                  className="max-h-[320px] max-w-full object-contain rounded"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <span className="text-sm">No QR uploaded</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <Label className="text-sm">UPI ID</Label>
              <div className="mt-1 px-3 py-2 rounded border bg-muted/30">
                {current?.upiId || <span className="text-muted-foreground">—</span>}
              </div>
            </div>
            {current?.qrId && (
              <div className="text-xs text-muted-foreground">QR ID: {current.qrId}</div>
            )}
            <p className="text-xs text-muted-foreground">
              This QR & UPI will be shown during patient payment flow.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Replace / Upload QR */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Replace / Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="upi" className="text-sm">
                UPI ID
              </Label>
              <Input
                id="upi"
                placeholder="e.g. 9876543210@upi"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can update just the UPI without changing the QR image.
              </p>
            </div>

            <div>
              <Label htmlFor="qrfile" className="text-sm">
                QR Image
              </Label>
              <Input
                id="qrfile"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {file && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Selected: <span className="font-medium">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {file && (
            <div className="border rounded-lg p-3 bg-white">
              <p className="text-sm mb-2">Preview</p>
              <img
                src={URL.createObjectURL(file)}
                alt="QR Preview"
                className="max-h-56 rounded-md shadow"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading…" : "Save QR / UPI"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setFile(null);
                setUpi(current?.upiId || "");
              }}
            >
              Reset Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QrUpload;
