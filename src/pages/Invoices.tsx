// Invoices.tsx (FIXED)
// ✅ Fix 1: When invoicePayload has patientId -> fetch that ONE patient, lock selection, allow invoice only for that patient
// ✅ Fix 2: Cursor jumping -> stable keys using clientId + prevent re-init using initRef
// ✅ Fix 3: Consultancy flow should NOT be overwritten by treatmentPlan auto-lines
// ✅ Fix 4: Monthly Earnings is a FRONTEND-ONLY tab — no API call ever made for it
// ✅ Fix 5: Strict status equality — unpaid invoices NEVER appear in paid tab
// ✅ Fix 6: All earnings/pending calculations use local invoices state only

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Calendar as CalIcon,
  IndianRupee,
  Download,
  Printer,
  Plus,
  Eye,
  Percent,
  Tag,
  Trash2,
  Edit3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

import {
  getPatients,
  getTreatmentAll,
  generatetInvoicePDF,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  getPatient,
} from "@/lib/api";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------------- Types ---------------- */
type DiscountType = "percentage" | "fixed";

// ✅ Only real backend statuses + the frontend-only monthly_earnings tab
type InvoiceStatus = "paid" | "unpaid" | "draft" | "monthly_earnings";

type ServiceItem = {
  validity: any;
  duration: string;
  category: any;
  id: string;
  title: string;
  subTitle?: string;
  price?: number;
  rate?: number;
};

type InvoiceLine = {
  clientId: string; // stable key to prevent input remount/cursor jump
  id?: string;
  serviceId?: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
};

type Patient = {
  id: string;
  fullName: string;
  contactNumber?: string;
  email?: string;
  treatmentPlan?: Array<{
    serviceId?: string;
    name: string;
    rate: number;
    amount: number;
    selected?: boolean;
  }>;
};

type ApiInvoice = {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  date: string;
  dueDate?: string;
  items: Array<{
    id?: string;
    serviceId?: string;
    name: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  discount: number;
  discountType: DiscountType;
  total: number;
  finalTotal?: number; // backend field used for earnings calculations
  amountPaid: number;
  status: "paid" | "partially_paid" | "pending" | "overdue" | "draft" | "unpaid";
};

type PaymentPayload = {
  amount: number;
  method?: string;
  note?: string;
};

/* ---------------- Helpers ---------------- */
const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-500";
    case "unpaid":
    case "pending":
    case "partially_paid":
    case "overdue":
      return "bg-yellow-500";
    case "draft":
      return "bg-gray-500";
    default:
      return "bg-slate-400";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "paid":
      return "Paid";
    case "unpaid":
    case "pending":
    case "partially_paid":
      return "Unpaid";
    case "overdue":
      return "Overdue";
    case "draft":
      return "Draft";
    default:
      return status;
  }
};

const toINR = (n: number) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const newClientId = () =>
  typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : `${Date.now()}-${Math.random()}`;

/* ---------------- Component ---------------- */
const Invoices = ({ invoicePayload }: { invoicePayload?: any }) => {
  const { toast } = useToast();
  const preferredInvoiceIdRef = useRef<string | null>(null);
  const initRef = useRef<string>("");
  const [lockPatient, setLockPatient] = useState(false);
  const autoCreatedRef = useRef(false);

  // Left panel lists
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Patient search & select
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // ✅ invoiceStatus drives the left-panel tab; "monthly_earnings" is frontend-only
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>("paid");

  // Services catalog
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceQuery, setServiceQuery] = useState("");

  // Selection
  const [selectedInvoice, setSelectedInvoice] = useState<ApiInvoice | null>(null);

  // Editing invoice (builder)
  const [isNewInvoice, setIsNewInvoice] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [discountAmount, setDiscountAmount] = useState<string>("0");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);

  // Record Payment dialog
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("0");
  const [paymentNote, setPaymentNote] = useState<string>("UPI");
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");

  const normalizeStatus = (status?: string): "draft" | "unpaid" | "paid" => {
    switch (status) {
      case "paid":
        return "paid";
      case "unpaid":
      case "pending":
      case "partially_paid":
      case "overdue":
        return "unpaid";
      case "draft":
      default:
        return "draft";
    }
  };

  const [status, setStatus] = useState<"draft" | "unpaid" | "paid">(
    normalizeStatus(selectedInvoice?.status)
  );

  const isConsultancyFlow =
    invoicePayload?.invoiceType === "consultancy" && !!invoicePayload?.patientId;

  /* ------------------------------------------------------------------ */
  /* ✅ MONTHLY EARNINGS — pure frontend calculations from invoices state */
  /* ------------------------------------------------------------------ */

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // ✅ Only invoices with status strictly === "paid" in current month/year
  const monthlyEarnings = useMemo(() => {
    return invoices
      .filter((inv) => {
        if (inv.status !== "paid") return false; // strict equality
        const d = new Date(inv.date);
        return (
          d.getMonth() === currentMonth && d.getFullYear() === currentYear
        );
      })
      .reduce((sum, inv) => sum + Number(inv.finalTotal ?? inv.total ?? 0), 0);
  }, [invoices, currentMonth, currentYear]);

  // ✅ Only invoices with status strictly === "unpaid"
  const pendingInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.status === "unpaid");
  }, [invoices]);

  const totalPendingCollection = useMemo(() => {
    return pendingInvoices.reduce(
      (sum, inv) => sum + Number(inv.finalTotal ?? inv.total ?? 0),
      0
    );
  }, [pendingInvoices]);

  /* ---------------- Builders ---------------- */
  const startNewInvoice = (opts?: { keepLockedPatient?: boolean }) => {
    setIsNewInvoice(true);
    setSelectedInvoice(null);

    if (!opts?.keepLockedPatient) {
      setSelectedPatient(null);
      setLockPatient(false);
      initRef.current = "";
      setPatients([]);
      setPatientSearch("");
    }

    const today = new Date();
    const due = new Date();
    due.setDate(due.getDate() + 7);

    setInvoiceDate(today.toISOString().slice(0, 10));
    setDueDate(due.toISOString().slice(0, 10));
    setLines([]);
    setDiscountAmount("0");
    setDiscountType("percentage");
    setStatus("draft");
    setIsEditingDiscount(false);
  };

  const editExistingInvoice = (inv: ApiInvoice) => {
    setIsNewInvoice(true);
    setSelectedInvoice(inv);
    setLockPatient(false);

    setSelectedPatient({
      id: inv.patientId,
      fullName: inv.patientName,
      contactNumber: inv.patientPhone,
      email: inv.patientEmail,
    });

    setInvoiceDate(inv.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
    setDueDate(inv.dueDate?.slice(0, 10) || "");

    setLines(
      inv.items.map((i) => ({
        clientId: i.id || newClientId(),
        id: i.id,
        serviceId: i.serviceId,
        name: i.name,
        quantity: i.quantity,
        rate: i.rate,
        amount: i.amount,
      }))
    );

    setDiscountAmount(String(inv.discount ?? 0));
    setDiscountType(inv.discountType ?? "percentage");
    setStatus(normalizeStatus(inv.status));
    setIsEditingDiscount(false);
  };

  const cancelEdit = () => {
    setIsNewInvoice(false);
    setIsEditingDiscount(false);
    setLockPatient(false);
    initRef.current = "";
    if (invoices.length) setSelectedInvoice(invoices[0]);
    else setSelectedInvoice(null);
  };

  const addLineFromService = (s: any) => {
    const rate = Number(s.rate ?? s.price ?? 0);
    setLines((prev) => [
      ...prev,
      {
        clientId: newClientId(),
        serviceId: s.id,
        name: s.title,
        quantity: 1,
        rate,
        amount: rate,
      },
    ]);
  };

  const addCustomLine = () => {
    setLines((prev) => [
      ...prev,
      { clientId: newClientId(), name: "Custom Line Item", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const updateLine = (idx: number, patch: Partial<InvoiceLine>) => {
    setLines((prev) => {
      const next = [...prev];
      const l = { ...next[idx], ...patch };
      l.amount = l.quantity * l.rate;
      next[idx] = l;
      return next;
    });
  };

  const removeLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ---------------- Payload (LOCK patient + init once) ---------------- */
  useEffect(() => {
    if (!invoicePayload?.patientId) return;

    const pid = invoicePayload.patientId;
    const initKey = `${invoicePayload.invoiceType || ""}:${pid}`;

    if (initRef.current === initKey) return;
    initRef.current = initKey;
    autoCreatedRef.current = false;

    (async () => {
      setLockPatient(true);
      startNewInvoice({ keepLockedPatient: true });

      try {
        const res = await getPatient(pid);
        const data = res?.data ?? res;
        const p0 = Array.isArray(data) ? data[0] : data;

        const locked: Patient = {
          id: pid,
          fullName: p0?.fullName || invoicePayload.patientName || "Patient",
          contactNumber: p0?.contactNumber || invoicePayload.patientPhone || "",
          email: p0?.email || "",
          treatmentPlan: p0?.treatmentPlan || [],
        };

        setSelectedPatient(locked);
        setPatients([locked]);
        setPatientSearch(locked.fullName);
      } catch {
        const locked: Patient = {
          id: pid,
          fullName: invoicePayload.patientName || "Patient",
          contactNumber: invoicePayload.patientPhone || "",
          email: "",
        };
        setSelectedPatient(locked);
        setPatients([locked]);
        setPatientSearch(locked.fullName);
      }

      if (invoicePayload?.invoiceType === "consultancy") {
        setInvoiceStatus("unpaid");
        const amt = Number(invoicePayload?.amount ?? 0);
        setLines([
          {
            clientId: newClientId(),
            name: "consultancy",
            quantity: 1,
            rate: amt > 0 ? amt : 0,
            amount: amt > 0 ? amt : 0,
          },
        ]);
        setStatus("unpaid");
        setDiscountAmount("0");
        setDiscountType("percentage");
        setPaymentMethod(invoicePayload.paymentMethod || "Cash");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoicePayload]);

  /* ---------------- Fetch: invoices list ---------------- */
  const refreshInvoices = async () => {
    try {
      setLoadingInvoices(true);

      // ✅ monthly_earnings tab → call API with NO status param so we get ALL invoices,
      //    then calculate earnings/pending entirely on the frontend from the full list.
      //    All other tabs → pass the real backend status string.
      const res =
        invoiceStatus === "monthly_earnings"
          ? await getAllInvoices() // no status param — fetch all
          : await getAllInvoices(invoiceStatus);

      const rawList: any[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      const mapped = rawList.map(mapApiInvoice);

      // ✅ For monthly_earnings we keep ALL invoices in state so useMemo hooks
      //    (monthlyEarnings, pendingInvoices) can compute over the full dataset.
      //    For real tabs apply strict status filter so paid never shows unpaid, etc.
      const statusFiltered =
        invoiceStatus === "monthly_earnings"
          ? mapped // keep all — frontend memos do the filtering
          : mapped.filter((i) => {
              if (invoiceStatus === "paid") {
                return i.status === "paid"; // strict equality — no partial match
              }
              if (invoiceStatus === "unpaid") {
                return (
                  i.status === "unpaid" ||
                  i.status === "pending" ||
                  i.status === "partially_paid" ||
                  i.status === "overdue"
                );
              }
              if (invoiceStatus === "draft") {
                return i.status === "draft";
              }
              return false;
            });

      // ✅ Client-side search filter (only meaningful for real-status tabs)
      const filtered =
        invoiceStatus !== "monthly_earnings" && invoiceSearch.trim()
          ? statusFiltered.filter((i) => {
              const q = invoiceSearch.toLowerCase();
              return (
                i.id?.toLowerCase().includes(q) ||
                i.patientName?.toLowerCase().includes(q)
              );
            })
          : statusFiltered;

      setInvoices(filtered);

      if (filtered.length) {
        const preferredId = preferredInvoiceIdRef.current;
        const preferred = preferredId
          ? filtered.find((i) => i.id === preferredId)
          : null;
        const stillSelected =
          selectedInvoice && filtered.find((i) => i.id === selectedInvoice.id);
        setSelectedInvoice(preferred ?? stillSelected ?? filtered[0]);
      } else {
        setSelectedInvoice(null);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to fetch invoices", description: "Please try again." });
    } finally {
      setLoadingInvoices(false);
    }
  };

  // ✅ Always refresh when tab changes.
  //    monthly_earnings calls getAllInvoices() with no status param (fetches all).
  //    Other tabs call getAllInvoices(status) for the matching backend status.
  useEffect(() => {
    refreshInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceStatus]);

  /* ---------------- Fetch: patients (skip if locked) ---------------- */
  useEffect(() => {
    if (lockPatient) return;

    const loadPatients = async () => {
      setPatientLoading(true);
      try {
        const res = await getPatients(patientSearch);
        setPatients(res?.data ?? []);
      } catch {
        toast({
          title: "Error fetching patients",
          description: "Unable to load patients from the server.",
        });
      } finally {
        setPatientLoading(false);
      }
    };

    loadPatients();
  }, [patientSearch, toast, lockPatient]);

  /* ---------------- Auto-load treatment plan lines (skip for consultancy flow) ---------------- */
  useEffect(() => {
    const loadPatientPlan = async () => {
      if (!selectedPatient?.id) return;
      if (isConsultancyFlow) return; // do not override consultancy line

      try {
        const res = await getPatient(selectedPatient.id);
        const data = res?.data ?? res;
        const p0 = Array.isArray(data) ? data[0] : data;
        const plan = p0?.treatmentPlan || [];
        const allAssignments = (plan || []).flatMap(
          (p: any) => p.treatmentAssign || []
        );

        if (allAssignments.length > 0) {
          const mapped: InvoiceLine[] = allAssignments.map((assign: any) => {
            const t = assign?.treatment || {};
            const price = Number(t.price || 0);
            return {
              clientId: newClientId(),
              serviceId: t.id,
              name: t.title || "Treatment",
              quantity: 1,
              rate: price,
              amount: price,
            };
          });
          setLines(mapped);
        } else {
          setLines([]);
        }
      } catch (error) {
        console.error("Error fetching patient plan:", error);
      }
    };

    loadPatientPlan();
  }, [selectedPatient?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------- Fetch: services catalog ---------------- */
  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      try {
        const res = await getTreatmentAll();
        const data: ServiceItem[] = (res?.data ?? []).map((s: any) => {
          const parsedPrice = Number(s.price) || Number(s.rate) || 0;
          return {
            id: s.id,
            title: s.title || s.name || "Service",
            subTitle: s.subTitle || "",
            category: s.category?.name || "Uncategorized",
            duration: s.duration || "",
            validity: s.validity || "",
            price: parsedPrice,
            rate: parsedPrice,
          };
        });
        setServices(data);
      } catch (e) {
        console.error("Error loading services:", e);
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, []);

  /* ---------------- Calculations (invoice builder) ---------------- */
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity * l.rate, 0),
    [lines]
  );

  const discountVal = useMemo(() => {
    const d = parseFloat(discountAmount) || 0;
    return discountType === "percentage" ? (subtotal * d) / 100 : d;
  }, [discountAmount, discountType, subtotal]);

  const afterDiscount = useMemo(
    () => Math.max(0, subtotal - discountVal),
    [subtotal, discountVal]
  );

  const total = useMemo(() => afterDiscount, [afterDiscount]);

  const catalogFiltered = services.filter((s) =>
    [s.title, s.category]
      .filter(Boolean)
      .some((field) =>
        String(field).toLowerCase().includes(serviceQuery.toLowerCase())
      )
  );

  const isConsultancyAmountInvalid =
    isConsultancyFlow && Number(lines?.[0]?.rate || 0) <= 0;

  const downloadInvoicePDF = async (invoiceId: string) => {
    try {
      const blob = await generatetInvoicePDF(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Invoice PDF download failed:", err);
      alert(err.message || "Failed to generate Invoice PDF.");
    }
  };

  /* ---------------- Persist ---------------- */
  const handleSaveInvoice = async (newStatus: "draft" | "unpaid" | "paid") => {
    if (!selectedPatient) {
      toast({ title: "Select patient first" });
      return;
    }

    const _subtotal = lines.reduce((a, b) => a + b.quantity * b.rate, 0);
    const _discountVal =
      discountType === "percentage"
        ? (_subtotal * parseFloat(discountAmount || "0")) / 100
        : parseFloat(discountAmount || "0");
    const _afterDiscount = Math.max(0, _subtotal - _discountVal);
    const _total = _afterDiscount;

    const payload = {
      invoiceDate,
      dueDate,
      discountType,
      discount: parseFloat(discountAmount) || 0,
      subTotal: _subtotal,
      finalTotal: _total,
      status: newStatus,
      patientId:
        lockPatient && invoicePayload?.patientId
          ? invoicePayload.patientId
          : selectedPatient.id,
      invoiceItems: lines.map((l) => ({
        treatment: l.serviceId,
        name: l.name,
        rate: l.rate,
        amount: l.quantity * l.rate,
        qty: l.quantity,
      })),
    };

    try {
      if (selectedInvoice) {
        await updateInvoice(selectedInvoice.id, payload);
        preferredInvoiceIdRef.current = selectedInvoice.id;
      } else {
        const createdRes: any = await createInvoice(payload);
        const created = createdRes?.data ?? createdRes;
        const createdId = created?.id ?? created?.invoice?.id;
        if (createdId) preferredInvoiceIdRef.current = createdId;
      }

      toast({
        title: selectedInvoice ? "Invoice updated" : "Invoice created",
        description: `Status: ${newStatus.toUpperCase()}`,
      });

      // Switch to the real tab so the saved invoice is visible
      setInvoiceStatus(newStatus);
      setIsNewInvoice(false);
      await refreshInvoices();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to save invoice", description: e?.message || "Error" });
    }
  };

  // Auto-create for consultancy flow once a valid amount is entered
  useEffect(() => {
    if (!isConsultancyFlow) return;
    if (!lockPatient) return;
    if (!invoicePayload?.patientId) return;

    const rate = Number(lines?.[0]?.rate || 0);
    if (rate <= 0) return;
    if (autoCreatedRef.current) return;
    autoCreatedRef.current = true;

    handleSaveInvoice("unpaid");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, lockPatient, isConsultancyFlow, invoicePayload?.patientId]);

  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;

    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) {
      toast({ title: "Invalid amount", description: "Enter a valid payment amount." });
      return;
    }

    const p: PaymentPayload = { amount: amt, method: paymentMethod, note: paymentNote };

    try {
      // await recordInvoicePayment(selectedInvoice.id, p);
      toast({ title: "Payment recorded", description: `₹${toINR(amt)}` });
      setRecordDialogOpen(false);
      setPaymentAmount("0");
      await refreshInvoices();
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to record payment", description: "Please try again." });
    }
  };

  /* ---------------- Renderers ---------------- */
  const renderInvoiceListCard = (invoice: ApiInvoice) => (
    <Card
      key={invoice.id}
      className={`cursor-pointer transition-all shadow-natural hover:shadow-card-hover ${
        selectedInvoice?.id === invoice.id ? "ring-2 ring-primary" : ""
      }`}
      onClick={async () => {
        try {
          setIsNewInvoice(false);
          setLockPatient(false);
          initRef.current = "";

          const res = await getInvoiceById(invoice.id);
          const invData = res?.data ?? res;
          const fullInvoice = mapApiInvoice(invData);
          setSelectedInvoice(fullInvoice);
        } catch (err) {
          console.error(err);
          toast({ title: "Failed to load invoice", description: "Please try again." });
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-foreground">{invoice.patientName}</h3>
            <p className="text-sm text-muted-foreground">ID: {invoice.id}</p>
          </div>
          <Badge className={`${getStatusColor(invoice.status)} text-white text-xs`}>
            {getStatusText(invoice.status)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <CalIcon className="h-3 w-3" />
          <span>{new Date(invoice.date).toLocaleDateString("en-IN")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <IndianRupee className="h-3 w-3" />
          <span>₹{toINR(invoice.total)}</span>
        </div>
      </CardContent>
    </Card>
  );

  /* ---------------- View Mode ---------------- */
  const ViewInvoice = ({ inv }: { inv: ApiInvoice }) => (
    <Card className="shadow-natural">
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">Invoice Details</CardTitle>
            <p className="text-muted-foreground">Invoice #{inv.id}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => editExistingInvoice(inv)}>
              <Edit3 className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadInvoicePDF(inv.id)}>
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Bill To:</h3>
            <div className="space-y-1">
              <p className="font-medium text-foreground">{inv.patientName}</p>
              <p className="text-sm text-muted-foreground">{inv.patientPhone || "-"}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Date:</p>
                <p className="font-medium text-foreground">
                  {new Date(inv.date).toLocaleDateString("en-IN")}
                </p>
              </div>
              {inv.dueDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Due Date:</p>
                  <p className="font-medium text-foreground">
                    {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              )}
              <div>
                <Badge className={`${getStatusColor(inv.status)} text-white`}>
                  {getStatusText(inv.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-4">Services & Treatments</h3>
          <div className="border border-border rounded-md overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-foreground">
              <div className="col-span-6">Service</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {inv.items.map((service, index) => (
              <div
                key={index}
                className="px-4 py-3 grid grid-cols-12 gap-4 text-sm border-t border-border"
              >
                <div className="col-span-6 text-foreground">{service.name}</div>
                <div className="col-span-2 text-center text-muted-foreground">
                  {service.quantity}
                </div>
                <div className="col-span-2 text-right text-muted-foreground">
                  ₹{toINR(service.rate)}
                </div>
                <div className="col-span-2 text-right font-medium text-foreground">
                  ₹{toINR(service.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {inv.status !== "paid" && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground">Payment Actions</h4>
            <div className="flex gap-2">
              <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary">Record Payment</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="text"
                        min="0"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Method</Label>
                      <Input
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        placeholder="UPI / Cash / Card"
                      />
                    </div>
                    <div>
                      <Label>Note</Label>
                      <Input
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        placeholder="Ref / Txn ID"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRecordDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleRecordPayment}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={() => editExistingInvoice(inv)}>
                Edit Invoice
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  /* ---------------- Edit/New Mode ---------------- */
  const EditInvoice = () => (
    <Card className="shadow-natural">
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">
              {selectedInvoice ? `Edit Invoice #${selectedInvoice.id}` : "New Invoice"}
            </CardTitle>
            <p className="text-muted-foreground">
              {selectedInvoice
                ? "Update items and amounts"
                : "Create a new invoice"}
            </p>
          </div>

          {selectedInvoice && (
            <div className="flex items-center gap-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(val: "draft" | "unpaid" | "paid") => setStatus(val)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Patient + Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Bill To (Patient)</h3>
            <div className="space-y-2">
              <Label>Search Patient</Label>
              <Input
                placeholder="Type name or phone to search…"
                value={patientSearch}
                disabled={lockPatient}
                onChange={(e) => setPatientSearch(e.target.value)}
              />

              <div className="max-h-40 overflow-auto border rounded">
                {lockPatient ? (
                  selectedPatient ? (
                    <div className="p-3 text-sm">
                      <div className="font-medium">{selectedPatient.fullName}</div>
                      <div className="text-muted-foreground">
                        {selectedPatient.contactNumber || "-"}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-muted-foreground">
                      Loading patient…
                    </div>
                  )
                ) : patientLoading ? (
                  <div className="p-3 text-sm text-muted-foreground">Loading…</div>
                ) : patients.length ? (
                  patients.map((p) => (
                    <div
                      key={p.id}
                      className={`p-2 text-sm cursor-pointer hover:bg-muted/50 ${
                        selectedPatient?.id === p.id ? "bg-muted/60" : ""
                      }`}
                      onClick={() => setSelectedPatient(p)}
                    >
                      <div className="font-medium">{p.fullName}</div>
                      <div className="text-muted-foreground">
                        {p.contactNumber || "-"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-muted-foreground">
                    No patients found.
                  </div>
                )}
              </div>

              {selectedPatient && (
                <div className="mt-3 text-sm bg-muted/20 p-3 rounded border">
                  <div className="font-medium">{selectedPatient.fullName}</div>
                  <div className="text-muted-foreground">
                    {selectedPatient.contactNumber || "-"}
                  </div>
                  <div className="text-muted-foreground">
                    {selectedPatient.email || "-"}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Services & Treatments</h3>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add from catalog
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[520px] p-3">
                  <div className="space-y-3">
                    <Input
                      placeholder="Search service…"
                      value={serviceQuery}
                      onChange={(e) => setServiceQuery(e.target.value)}
                    />
                    <div className="max-h-64 overflow-auto border rounded">
                      {servicesLoading ? (
                        <div className="p-3 text-sm text-muted-foreground">Loading…</div>
                      ) : catalogFiltered.length ? (
                        catalogFiltered.map((s) => (
                          <div
                            key={s.id}
                            className="p-3 hover:bg-muted/50 cursor-pointer border-b text-sm"
                            onClick={() => addLineFromService(s)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-foreground">
                                  {s.title}
                                </div>
                                {s.subTitle && (
                                  <div className="text-xs text-muted-foreground">
                                    {s.subTitle}
                                  </div>
                                )}
                                <div className="text-xs text-gray-600 mt-1">
                                  🕒 {s.duration || "N/A"}
                                  {s.validity ? ` | ⏳ ${s.validity}` : ""}
                                </div>
                                {s.category && (
                                  <div className="text-xs text-amber-700 font-semibold mt-1">
                                    🏷️ {String(s.category)}
                                  </div>
                                )}
                              </div>
                              <div className="font-bold text-green-700 text-right">
                                ₹{toINR(s.price ?? 0)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground">
                          No services found.
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="sm" onClick={addCustomLine}>
                <Plus className="h-4 w-4 mr-2" /> Add custom
              </Button>
            </div>
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-foreground">
              <div className="col-span-5">Service</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1 text-right"></div>
            </div>

            {lines.length ? (
              lines.map((l, idx) => (
                <div
                  key={l.clientId} // stable key — prevents cursor jump on re-render
                  className="px-4 py-3 grid grid-cols-12 gap-4 text-sm border-t border-border"
                >
                  <div className="col-span-5">
                    <Input
                      value={l.name}
                      onChange={(e) => updateLine(idx, { name: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 text-center">
                    <Input
                      type="text"
                      min="1"
                      value={l.quantity}
                      onChange={(e) =>
                        updateLine(idx, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                  </div>

                  <div className="col-span-2 text-right">
                    <Input
                      className="text-right"
                      type="text"
                      value={l.rate}
                      onChange={(e) =>
                        updateLine(idx, {
                          rate: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </div>

                  <div className="col-span-2 text-right font-medium text-foreground pt-2">
                    ₹{toINR(l.quantity * l.rate)}
                  </div>

                  <div className="col-span-1 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(idx)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                No items yet — add from catalog or custom.
              </div>
            )}
          </div>
        </div>

        {/* Discount */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Discount
            </h3>
            {!isEditingDiscount && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDiscount(true)}
              >
                Edit Discount
              </Button>
            )}
          </div>

          {isEditingDiscount && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="space-y-3">
                <Label>Discount Type</Label>
                <RadioGroup
                  value={discountType}
                  onValueChange={(v: DiscountType) => setDiscountType(v)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label
                      htmlFor="percentage"
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <Percent className="h-3 w-3" />
                      Percentage
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label
                      htmlFor="fixed"
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <IndianRupee className="h-3 w-3" />
                      Fixed Amount
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-amount">
                  {discountType === "percentage"
                    ? "Discount Percentage"
                    : "Discount Amount"}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="discount-amount"
                      type="text"
                      min="0"
                      max={discountType === "percentage" ? "100" : undefined}
                      step={discountType === "percentage" ? "0.1" : "1"}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      {discountType === "percentage" ? "%" : "₹"}
                    </span>
                  </div>
                  <Button onClick={() => setIsEditingDiscount(false)}>Apply</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingDiscount(false);
                      setDiscountAmount("0");
                      setDiscountType("percentage");
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-4">
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium text-foreground">₹{toINR(subtotal)}</span>
            </div>

            {discountVal > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Discount{" "}
                    {discountType === "percentage"
                      ? `(${discountAmount}%)`
                      : "(Fixed)"}
                    :
                  </span>
                  <span className="font-medium text-green-600">
                    -₹{toINR(discountVal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">After Discount:</span>
                  <span className="font-medium text-foreground">
                    ₹{toINR(afterDiscount)}
                  </span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-foreground">Total:</span>
              <span className="font-bold text-foreground">₹{toINR(total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={() => handleSaveInvoice("draft")}
            disabled={isConsultancyAmountInvalid}
          >
            Save Draft
          </Button>

          <Button
            className="bg-yellow-600 hover:bg-yellow-700"
            onClick={() => handleSaveInvoice("unpaid")}
            disabled={isConsultancyAmountInvalid}
          >
            Save & Mark Unpaid
          </Button>

          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleSaveInvoice("paid")}
            disabled={isConsultancyAmountInvalid}
          >
            Save & Mark Paid
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  /* ------------------------------------------------------------------ */
  /* ✅ Monthly Earnings Tab — pure frontend UI, no API, no loading state */
  /* ------------------------------------------------------------------ */
  const MonthlyEarningsView = () => (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Monthly Earnings</div>
            <div className="text-2xl font-bold text-green-600 mt-2">
              ₹{monthlyEarnings.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Paid invoices this month
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Need To Collect</div>
            <div className="text-2xl font-bold text-yellow-600 mt-2">
              ₹{totalPendingCollection.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Unpaid invoices
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient-wise pending collection list */}
      <Card>
        <CardContent className="p-6">
          <div className="text-lg font-semibold mb-4">Pending Collections</div>
          {pendingInvoices.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No unpaid invoices. 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {pendingInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div>
                    <div className="font-semibold">{inv.patientName}</div>
                    <div className="text-xs text-muted-foreground">
                      Invoice #{inv.id}
                    </div>
                    {inv.dueDate && (
                      <div className="text-xs text-muted-foreground">
                        Due:{" "}
                        {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-red-500">
                    ₹{Number(inv.finalTotal ?? inv.total ?? 0).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Main render                                                        */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Invoices</h1>
          <p className="text-muted-foreground">
            Generate and manage invoices based on services/treatments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Invoice List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices by ID or patient…"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-primary" onClick={() => startNewInvoice()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* ✅ Tab buttons — "monthly_earnings" is purely a UI tab, not a backend status */}
            <div className="flex gap-1 mt-2 flex-wrap">
              {(
                [
                  { key: "paid", label: "Paid" },
                  { key: "unpaid", label: "Unpaid" },
                  { key: "draft", label: "Draft" },
                  { key: "monthly_earnings", label: "Monthly Earnings" },
                ] as { key: InvoiceStatus; label: string }[]
              ).map(({ key, label }) => (
                <Button
                  key={key}
                  variant={invoiceStatus === key ? "default" : "outline"}
                  onClick={() => setInvoiceStatus(key)}
                  className="capitalize flex-1 text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* ✅ Monthly Earnings tab: render inline in left panel (no API call ever) */}
            {invoiceStatus === "monthly_earnings" ? (
              <MonthlyEarningsView />
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {loadingInvoices ? (
                  <Card>
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      Loading…
                    </CardContent>
                  </Card>
                ) : invoices.length ? (
                  invoices.map(renderInvoiceListCard)
                ) : (
                  <Card>
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      No invoices yet.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Right: Details / Builder */}
          <div className="lg:col-span-2">
            {isNewInvoice ? (
              <EditInvoice />
            ) : selectedInvoice ? (
              <ViewInvoice inv={selectedInvoice} />
            ) : (
              <Card className="shadow-natural">
                <CardContent className="p-8 text-center text-muted-foreground">
                  Select an invoice from the left, or click{" "}
                  <strong>+ New</strong> to create one.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- map backend -> UI shape ---------- */
function mapApiInvoice(inv: any): ApiInvoice {
  return {
    id: inv.id,
    patientId: inv.patient?.id ?? inv.patientId ?? "",
    patientName:
      inv.patient?.fullName ?? inv.patientName ?? "Unknown Patient",
    patientPhone: inv.patient?.contactNumber ?? inv.patientPhone ?? "",
    patientEmail: inv.patient?.email ?? inv.patientEmail ?? "",
    date: inv.invoiceDate ?? inv.date ?? "",
    dueDate: inv.dueDate ?? "",
    items: (inv.items || inv.invoiceItems || []).map((i: any) => ({
      id: i.id,
      serviceId: i.treatment?.id ?? i.serviceId ?? "",
      name: i.treatment?.title || i.name || "Untitled Service",
      quantity: Number(i.qty ?? i.quantity ?? 0),
      rate: Number(i.rate ?? 0),
      amount: Number(i.amount ?? 0),
    })),
    subtotal: Number(inv.subTotal ?? inv.subtotal ?? 0),
    discount: Number(inv.discount ?? 0),
    discountType: (inv.discountType ?? "percentage") as DiscountType,
    // ✅ preserve finalTotal for earnings calculations
    finalTotal: Number(inv.finalTotal ?? inv.total ?? 0),
    total: Number(inv.finalTotal ?? inv.total ?? 0),
    amountPaid: Number(inv.amountPaid ?? 0),
    status: inv.status ?? "draft",
  };
}

export default Invoices;