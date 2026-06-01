import React from "react";
import { Plus, Percent, IndianRupee, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";  
import {
  Card,
  CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
SelectTrigger,  
SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import InvoiceLineItem from "@/components/InvoiceLineItem";
type DiscountType = "percentage" | "fixed";
interface EditInvoiceProps {
  selectedInvoice?: { id: string; [key: string]: any };
  status?: "draft" | "unpaid" | "paid";
  setStatus?: (status: "draft" | "unpaid" | "paid") => void;
  selectedPatient?: { id: string; fullName: string; contactNumber?: string; email?: string };
  setSelectedPatient?: (patient: any) => void;
  patientSearch?: string;
  setPatientSearch?: (search: string) => void;
  lockPatient?: boolean;
  patientLoading?: boolean;
  patients?: any[];
  invoiceDate?: string;
  setInvoiceDate?: (date: string) => void;
  dueDate?: string;
  setDueDate?: (date: string) => void;
  lines?: any[];
  updateLine?: (clientId: string, updates: any) => void;
  removeLine?: (clientId: string) => void;
  serviceQuery?: string;
  setServiceQuery?: (query: string) => void;
  servicesLoading?: boolean;
  catalogFiltered?: any[];
  addLineFromService?: (service: any) => void;
  addCustomLine?: () => void;
  isEditingDiscount?: boolean;
  setIsEditingDiscount?: (editing: boolean) => void;
  discountType?: "percentage" | "fixed";
  setDiscountType?: (type: "percentage" | "fixed") => void;
  discountAmount?: string;
  setDiscountAmount?: (amount: string) => void;
  discountVal?: number;
  afterDiscount?: number;
  subtotal?: number;
  total?: number;
  toINR?: (amount: number) => string;
  handleSaveInvoice?: (status: "draft" | "unpaid" | "paid") => void;
  isConsultancyAmountInvalid?: boolean;
}

const EditInvoice = ({
  selectedInvoice,
  status = "draft",
  setStatus = () => {},
  selectedPatient,
  setSelectedPatient = () => {},
  patientSearch = "",
  setPatientSearch = () => {},
  lockPatient = false,
  patientLoading = false,
  patients = [],
  invoiceDate = "",
  setInvoiceDate = () => {},
  dueDate = "",
  setDueDate = () => {},
  lines = [],
  updateLine = () => {},
  removeLine = () => {},
  serviceQuery = "",
  setServiceQuery = () => {},
  servicesLoading = false,
  catalogFiltered = [],
  addLineFromService = () => {},
  addCustomLine = () => {},
  isEditingDiscount = false,
  setIsEditingDiscount = () => {},
  discountType = "percentage",
  setDiscountType = () => {},
  discountAmount = "0",
  setDiscountAmount = () => {},
  discountVal = 0,
  afterDiscount = 0,
  subtotal = 0,
  total = 0,
  toINR = (amount: number) => amount.toString(),
  handleSaveInvoice = () => {},
  isConsultancyAmountInvalid = false,
}: EditInvoiceProps) => (  
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
  lines.map((l) => (
    <InvoiceLineItem
      key={l.clientId}
      line={l}
      updateLine={updateLine}
      removeLine={removeLine}
      toINR={toINR}
    />
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
  export default React.memo(EditInvoice);