// Invoices.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Search, User, Calendar as CalIcon, IndianRupee, Download, Printer, Plus,
  Eye, Percent, Tag, Trash2, Edit3
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

// 👉 add these in your api.ts (stubs at bottom of this file)
import {
  getPatients,               // (q: string) -> {data: Patient[]}
  getTreatmentAll,           // () -> {data: ServiceItem[]}
  // listInvoices,              // (q?: string) -> {data: ApiInvoice[]}
  // createInvoice,             // (payload) -> {id: string, ...}
  // updateInvoice,             // (id, payload) -> {id: string, ...}
  // recordInvoicePayment,      // (id, {amount, method, note}) -> {...}
} from "@/lib/api";

/* ---------------- Types ---------------- */
type DiscountType = "percentage" | "fixed";

type ServiceItem = {
  id: string;
  title: string;
  subTitle?: string;
  // optional pricing fields in your backend — fallback to 0 if absent
  price?: number;
  rate?: number;
  // any other fields you have (duration, days, etc.)
};

type InvoiceLine = {
  id?: string;           // server id, optional for new lines
  serviceId?: string;    // from ServiceItem.id
  name: string;          // display name
  quantity: number;
  rate: number;
  amount: number;        // quantity * rate
};

type Patient = {
  id: string;
  fullName: string;
  contactNumber?: string;
  email?: string;
};

type ApiInvoice = {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  date: string;         // ISO
  dueDate?: string;     // ISO
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
  tax: number;
  total: number;
  amountPaid: number;
  status: "paid" | "partially_paid" | "pending" | "overdue";
};

type PaymentPayload = {
  amount: number;
  method?: string;
  note?: string;
};

/* ---------------- Helpers ---------------- */
const getStatusColor = (status: string) => {
  switch (status) {
    case "paid": return "bg-green-500";
    case "partially_paid": return "bg-yellow-500";
    case "pending": return "bg-red-500";
    case "overdue": return "bg-red-600";
    default: return "bg-gray-500";
  }
};
const getStatusText = (status: string) => {
  switch (status) {
    case "paid": return "Paid";
    case "partially_paid": return "Partially Paid";
    case "pending": return "Pending";
    case "overdue": return "Overdue";
    default: return status;
  }
};
const toINR = (n: number) =>
  n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

/* ---------------- Component ---------------- */
const Invoices = () => {
  const { toast } = useToast();

  // Left panel lists
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Patient search & select (for new/edit invoice)
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Services catalog
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceQuery, setServiceQuery] = useState("");

  // Selection
  const [selectedInvoice, setSelectedInvoice] = useState<ApiInvoice | null>(null);

  // Editing invoice (builder) state
  const [isNewInvoice, setIsNewInvoice] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
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

  /* ---------------- Fetch: invoices list ---------------- */
  const refreshInvoices = async () => {
    try {
      setLoadingInvoices(true);
      // // const res = await listInvoices(invoiceSearch);
      // setInvoices((res?.data ?? []).map(mapApiInvoice));
      // if (!selectedInvoice && (res?.data?.length ?? 0) > 0) {
      //   setSelectedInvoice(mapApiInvoice(res!.data![0]));
      // }
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to fetch invoices", description: "Please try again." });
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    refreshInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceSearch]);

  /* ---------------- Fetch: patients for search ---------------- */
  useEffect(() => {
    const loadPatients = async () => {
      setPatientLoading(true);
      try {
        const res = await getPatients(patientSearch);
        setPatients(res?.data ?? []);
      } catch (err) {
        toast({ title: "Error fetching patients", description: "Unable to load patients from the server." });
      } finally {
        setPatientLoading(false);
      }
    };
    loadPatients();
  }, [patientSearch, toast]);

  /* ---------------- Fetch: services/treatments catalog ---------------- */
  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      try {
        const res = await getTreatmentAll();
        // normalize a price/rate
        const data: ServiceItem[] = (res?.data ?? []).map((s: any) => ({
          id: s.id,
          title: s.title || s.name || "Service",
          subTitle: s.subTitle,
          price: typeof s.price === "number" ? s.price : (typeof s.rate === "number" ? s.rate : 0),
          rate: typeof s.rate === "number" ? s.rate : (typeof s.price === "number" ? s.price : 0),
        }));
        setServices(data);
      } catch (e) {
        console.error(e);
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, []);

  /* ---------------- Calculations ---------------- */
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + (l.quantity * l.rate), 0),
    [lines]
  );

  const discountVal = useMemo(() => {
    const d = parseFloat(discountAmount) || 0;
    return discountType === "percentage" ? (subtotal * d) / 100 : d;
  }, [discountAmount, discountType, subtotal]);

  const afterDiscount = useMemo(() => Math.max(0, subtotal - discountVal), [subtotal, discountVal]);

  const tax = useMemo(() => afterDiscount * 0.18, [afterDiscount]); // 18% GST

  const total = useMemo(() => afterDiscount + tax, [afterDiscount, tax]);

  const amountPaid = useMemo(() => {
    if (!selectedInvoice) return 0;
    // When editing/creating, we show persisted paid only in view mode.
    return selectedInvoice.amountPaid || 0;
  }, [selectedInvoice]);

  const balanceDue = useMemo(() => Math.max(0, total - amountPaid), [total, amountPaid]);

  /* ---------------- Builders ---------------- */
  const startNewInvoice = () => {
    setIsNewInvoice(true);
    setSelectedInvoice(null);
    setSelectedPatient(null);
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().slice(0, 10));
    setLines([]);
    setDiscountAmount("0");
    setDiscountType("percentage");
    setIsEditingDiscount(false);
  };

  const editExistingInvoice = (inv: ApiInvoice) => {
    setIsNewInvoice(true);
    setSelectedInvoice(inv);
    setSelectedPatient({
      id: inv.patientId,
      fullName: inv.patientName,
      contactNumber: inv.patientPhone,
      email: inv.patientEmail,
    });
    setInvoiceDate(inv.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
    setDueDate(inv.dueDate?.slice(0, 10) || "");
    setLines(inv.items.map(i => ({
      id: i.id, serviceId: i.serviceId, name: i.name,
      quantity: i.quantity, rate: i.rate, amount: i.amount
    })));
    setDiscountAmount(String(inv.discount ?? 0));
    setDiscountType(inv.discountType ?? "percentage");
    setIsEditingDiscount(false);
  };

  const cancelEdit = () => {
    setIsNewInvoice(false);
    setIsEditingDiscount(false);
    // revert to the first available invoice
    if (invoices.length) setSelectedInvoice(invoices[0]);
    else setSelectedInvoice(null);
  };

  const addLineFromService = (svc: ServiceItem) => {
    setLines(prev => [
      ...prev,
      {
        serviceId: svc.id,
        name: svc.title,
        quantity: 1,
        rate: svc.rate ?? svc.price ?? 0,
        amount: svc.rate ?? svc.price ?? 0,
      },
    ]);
  };

  const addCustomLine = () => {
    setLines(prev => [
      ...prev,
      { name: "Custom Line Item", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const updateLine = (idx: number, patch: Partial<InvoiceLine>) => {
    setLines(prev => {
      const next = [...prev];
      const l = { ...next[idx], ...patch };
      l.amount = l.quantity * l.rate;
      next[idx] = l;
      return next;
    });
  };

  const removeLine = (idx: number) => {
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  /* ---------------- Persist ---------------- */
  const handleSaveInvoice = async (markPaid = false) => {
    if (!selectedPatient) {
      toast({ title: "Select a patient", description: "Please pick a patient for this invoice." });
      return;
    }
    if (lines.length === 0) {
      toast({ title: "No items", description: "Add at least one service/treatment." });
      return;
    }

    const payload = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientPhone: selectedPatient.contactNumber ?? "",
      patientEmail: selectedPatient.email ?? "",
      date: new Date(invoiceDate).toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      items: lines.map(l => ({
        id: l.id,
        serviceId: l.serviceId,
        name: l.name,
        quantity: l.quantity,
        rate: l.rate,
        amount: l.amount,
      })),
      subtotal,
      discount: parseFloat(discountAmount) || 0,
      discountType,
      tax,
      total,
      status: markPaid ? "paid" : "pending",
    };

    try {
      if (selectedInvoice) {
        // const res = await updateInvoice(selectedInvoice.id, payload);
        // toast({ title: "Invoice updated", description: `#${res.id}` });
      } else {
        // const res = await createInvoice(payload);
        // toast({ title: "Invoice created", description: `#${res.id}` });
      }
      setIsNewInvoice(false);
      await refreshInvoices();
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to save invoice", description: "Please try again." });
    }
  };

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
      onClick={() => {
        setSelectedInvoice(invoice);
        setIsNewInvoice(false);
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

  const catalogFiltered = services.filter(s =>
    (s.title?.toLowerCase() ?? "").includes(serviceQuery.toLowerCase())
  );

  /* ---------------- View Mode (existing invoice) ---------------- */
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Bill To:</h3>
            <div className="space-y-1">
              <p className="font-medium text-foreground">{inv.patientName}</p>
              <p className="text-sm text-muted-foreground">{inv.patientPhone || "-"}</p>
              <p className="text-sm text-muted-foreground">{inv.patientEmail || "-"}</p>
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

        {/* Services Table */}
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
              <div key={index} className="px-4 py-3 grid grid-cols-12 gap-4 text-sm border-t border-border">
                <div className="col-span-6 text-foreground">{service.name}</div>
                <div className="col-span-2 text-center text-muted-foreground">{service.quantity}</div>
                <div className="col-span-2 text-right text-muted-foreground">₹{toINR(service.rate)}</div>
                <div className="col-span-2 text-right font-medium text-foreground">₹{toINR(service.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-4">
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium text-foreground">₹{toINR(inv.subtotal)}</span>
            </div>

            {inv.discount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Discount {inv.discountType === "percentage" ? `(${inv.discount}%)` : "(Fixed)"}:
                  </span>
                  <span className="font-medium text-green-600">
                    -₹{toINR(inv.subtotal - (inv.total - inv.tax))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">After Discount:</span>
                  <span className="font-medium text-foreground">
                    ₹{toINR(inv.subtotal - (inv.subtotal - (inv.total - inv.tax)))}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (18% GST):</span>
              <span className="font-medium text-foreground">₹{toINR(inv.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-foreground">Total:</span>
              <span className="font-bold text-foreground">₹{toINR(inv.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-medium text-green-600">₹{toINR(inv.amountPaid)}</span>
            </div>
            {inv.total - inv.amountPaid > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance Due:</span>
                <span className="font-medium text-red-600">₹{toINR(inv.total - inv.amountPaid)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Actions */}
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
                        type="number"
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
                    <Button variant="outline" onClick={() => setRecordDialogOpen(false)}>Cancel</Button>
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
              {selectedInvoice ? "Update items and amounts" : "Create a new invoice"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </div>
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
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              <div className="max-h-40 overflow-auto border rounded">
                {patientLoading ? (
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
                      <div className="text-muted-foreground">{p.contactNumber || "-"}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-muted-foreground">No patients found.</div>
                )}
              </div>

              {selectedPatient && (
                <div className="mt-3 text-sm bg-muted/20 p-3 rounded border">
                  <div className="font-medium">{selectedPatient.fullName}</div>
                  <div className="text-muted-foreground">{selectedPatient.contactNumber || "-"}</div>
                  <div className="text-muted-foreground">{selectedPatient.email || "-"}</div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Invoice Date</Label>
              <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
                            className="p-2 hover:bg-muted/50 cursor-pointer border-b"
                            onClick={() => addLineFromService(s)}
                          >
                            <div className="font-medium">{s.title}</div>
                            {s.subTitle && (
                              <div className="text-xs text-muted-foreground">{s.subTitle}</div>
                            )}
                            <div className="text-xs mt-1">Default Rate: ₹{toINR(s.rate ?? s.price ?? 0)}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground">No services found.</div>
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
                <div key={idx} className="px-4 py-3 grid grid-cols-12 gap-4 text-sm border-t border-border">
                  <div className="col-span-5">
                    <Input
                      value={l.name}
                      onChange={(e) => updateLine(idx, { name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 text-center">
                    <Input
                      type="number"
                      min="1"
                      value={l.quantity}
                      onChange={(e) => updateLine(idx, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <Input
                      className="text-right"
                      type="number"
                      min="0"
                      value={l.rate}
                      onChange={(e) => updateLine(idx, { rate: Math.max(0, Number(e.target.value) || 0) })}
                    />
                  </div>
                  <div className="col-span-2 text-right font-medium text-foreground pt-2">
                    ₹{toINR(l.quantity * l.rate)}
                  </div>
                  <div className="col-span-1 text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeLine(idx)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-muted-foreground">No items yet — add from catalog or custom.</div>
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
              <Button variant="outline" size="sm" onClick={() => setIsEditingDiscount(true)}>
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
                    <Label htmlFor="percentage" className="flex items-center gap-1 cursor-pointer">
                      <Percent className="h-3 w-3" />
                      Percentage
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="flex items-center gap-1 cursor-pointer">
                      <IndianRupee className="h-3 w-3" />
                      Fixed Amount
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-amount">
                  {discountType === "percentage" ? "Discount Percentage" : "Discount Amount"}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="discount-amount"
                      type="number"
                      min="0"
                      max={discountType === "percentage" ? "100" : undefined}
                      step={discountType === "percentage" ? "0.1" : "1"}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      placeholder={discountType === "percentage" ? "Enter percentage" : "Enter amount"}
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

              {parseFloat(discountAmount) > 0 && (
                <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded border border-primary/20">
                  <p className="font-medium text-foreground mb-1">Discount Preview:</p>
                  <p>
                    {discountType === "percentage"
                      ? `${discountAmount}% discount = ₹${toINR(discountVal)}`
                      : `Fixed discount = ₹${toINR(parseFloat(discountAmount))}`}
                  </p>
                  <p className="mt-1">New Total: ₹{toINR(total)}</p>
                </div>
              )}
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
                    Discount {discountType === "percentage" ? `(${discountAmount}%)` : "(Fixed)"}:
                  </span>
                  <span className="font-medium text-green-600">-₹{toINR(discountVal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">After Discount:</span>
                  <span className="font-medium text-foreground">₹{toINR(afterDiscount)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (18% GST):</span>
              <span className="font-medium text-foreground">₹{toINR(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-foreground">Total:</span>
              <span className="font-bold text-foreground">₹{toINR(total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={() => handleSaveInvoice(false)}>Save Draft</Button>
          <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSaveInvoice(true)}>
            Save & Mark Paid
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Invoices</h1>
          <p className="text-muted-foreground">Generate and manage invoices based on services/treatments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Invoice List + search */}
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
              <Button className="bg-primary" onClick={startNewInvoice}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {loadingInvoices ? (
                <Card><CardContent className="p-4 text-sm text-muted-foreground">Loading…</CardContent></Card>
              ) : invoices.length ? (
                invoices.map(renderInvoiceListCard)
              ) : (
                <Card><CardContent className="p-4 text-sm text-muted-foreground">No invoices yet.</CardContent></Card>
              )}
            </div>
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
                  Select an invoice from the left, or click <strong>+ New</strong> to create one.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- map from backend shape if needed ---------- */
function mapApiInvoice(inv: any): ApiInvoice {
  return {
    id: inv.id,
    patientId: inv.patientId,
    patientName: inv.patientName,
    patientPhone: inv.patientPhone,
    patientEmail: inv.patientEmail,
    date: inv.date,
    dueDate: inv.dueDate,
    items: (inv.items || []).map((i: any) => ({
      id: i.id,
      serviceId: i.serviceId,
      name: i.name,
      quantity: i.quantity,
      rate: i.rate,
      amount: i.amount,
    })),
    subtotal: inv.subtotal ?? 0,
    discount: inv.discount ?? 0,
    discountType: (inv.discountType ?? "percentage") as DiscountType,
    tax: inv.tax ?? 0,
    total: inv.total ?? 0,
    amountPaid: inv.amountPaid ?? 0,
    status: inv.status ?? "pending",
  };
}

export default Invoices;
