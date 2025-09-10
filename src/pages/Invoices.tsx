import { useState } from "react";
import { Search, User, Calendar, IndianRupee, Download, Printer, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const mockInvoices = [
  {
    id: "INV001",
    patientName: "Rahul Sharma",
    patientPhone: "+91 98765 43210",
    patientEmail: "rahul.sharma@email.com",
    date: "2024-01-15",
    dueDate: "2024-01-22",
    services: [
      {
        name: "Initial Consultation",
        quantity: 1,
        rate: 1500,
        amount: 1500
      },
      {
        name: "Abhyanga Massage",
        quantity: 3,
        rate: 800,
        amount: 2400
      },
      {
        name: "Steam Therapy",
        quantity: 3,
        rate: 300,
        amount: 900
      },
      {
        name: "Herbal Medicines",
        quantity: 1,
        rate: 1200,
        amount: 1200
      }
    ],
    subtotal: 6000,
    tax: 1080,
    total: 7080,
    amountPaid: 7080,
    status: "paid"
  },
  {
    id: "INV002",
    patientName: "Priya Patel",
    patientPhone: "+91 87654 32109",
    patientEmail: "priya.patel@email.com",
    date: "2024-01-14",
    dueDate: "2024-01-21",
    services: [
      {
        name: "Stress Management Consultation",
        quantity: 1,
        rate: 1200,
        amount: 1200
      },
      {
        name: "Shirodhara Therapy",
        quantity: 6,
        rate: 1200,
        amount: 7200
      },
      {
        name: "Yoga Session",
        quantity: 4,
        rate: 500,
        amount: 2000
      },
      {
        name: "Ayurvedic Medicines",
        quantity: 1,
        rate: 1800,
        amount: 1800
      }
    ],
    subtotal: 12200,
    tax: 2196,
    total: 14396,
    amountPaid: 5000,
    status: "partially_paid"
  },
  {
    id: "INV003",
    patientName: "Amit Kumar",
    patientPhone: "+91 76543 21098",
    patientEmail: "amit.kumar@email.com",
    date: "2024-01-12",
    dueDate: "2024-01-19",
    services: [
      {
        name: "Skin Consultation",
        quantity: 1,
        rate: 1000,
        amount: 1000
      },
      {
        name: "Mud Therapy",
        quantity: 8,
        rate: 600,
        amount: 4800
      },
      {
        name: "Herbal Steam Bath",
        quantity: 4,
        rate: 400,
        amount: 1600
      },
      {
        name: "Natural Skincare Products",
        quantity: 1,
        rate: 2200,
        amount: 2200
      }
    ],
    subtotal: 9600,
    tax: 1728,
    total: 11328,
    amountPaid: 0,
    status: "pending"
  },
  {
    id: "INV004",
    patientName: "Sunita Devi",
    patientPhone: "+91 65432 10987",
    patientEmail: "sunita.devi@email.com",
    date: "2024-01-10",
    dueDate: "2024-01-17",
    services: [
      {
        name: "Weight Management Consultation",
        quantity: 1,
        rate: 1500,
        amount: 1500
      },
      {
        name: "Diet Planning Session",
        quantity: 2,
        rate: 800,
        amount: 1600
      },
      {
        name: "Panchakarma Package",
        quantity: 1,
        rate: 15000,
        amount: 15000
      }
    ],
    subtotal: 18100,
    tax: 3258,
    total: 21358,
    amountPaid: 21358,
    status: "paid"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-500";
    case "partially_paid":
      return "bg-yellow-500";
    case "pending":
      return "bg-red-500";
    case "overdue":
      return "bg-red-600";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "paid":
      return "Paid";
    case "partially_paid":
      return "Partially Paid";
    case "pending":
      return "Pending";
    case "overdue":
      return "Overdue";
    default:
      return status;
  }
};

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(mockInvoices[0]);

  const filteredInvoices = mockInvoices.filter(
    (invoice) =>
      invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Invoices</h1>
          <p className="text-muted-foreground">Manage patient invoices and payments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredInvoices.map((invoice) => (
                <Card 
                  key={invoice.id} 
                  className={`cursor-pointer transition-all shadow-natural hover:shadow-card-hover ${
                    selectedInvoice.id === invoice.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedInvoice(invoice)}
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
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(invoice.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <IndianRupee className="h-3 w-3" />
                      <span>₹{invoice.total.toLocaleString('en-IN')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-natural">
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground">Invoice Details</CardTitle>
                    <p className="text-muted-foreground">Invoice #{selectedInvoice.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
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
                      <p className="font-medium text-foreground">{selectedInvoice.patientName}</p>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.patientPhone}</p>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.patientEmail}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Invoice Date:</p>
                        <p className="font-medium text-foreground">{new Date(selectedInvoice.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date:</p>
                        <p className="font-medium text-foreground">{new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div>
                        <Badge className={`${getStatusColor(selectedInvoice.status)} text-white`}>
                          {getStatusText(selectedInvoice.status)}
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
                    {selectedInvoice.services.map((service, index) => (
                      <div key={index} className="px-4 py-3 grid grid-cols-12 gap-4 text-sm border-t border-border">
                        <div className="col-span-6 text-foreground">{service.name}</div>
                        <div className="col-span-2 text-center text-muted-foreground">{service.quantity}</div>
                        <div className="col-span-2 text-right text-muted-foreground">₹{service.rate.toLocaleString('en-IN')}</div>
                        <div className="col-span-2 text-right font-medium text-foreground">₹{service.amount.toLocaleString('en-IN')}</div>
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
                      <span className="font-medium text-foreground">₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (18% GST):</span>
                      <span className="font-medium text-foreground">₹{selectedInvoice.tax.toLocaleString('en-IN')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-foreground">Total:</span>
                      <span className="font-bold text-foreground">₹{selectedInvoice.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-medium text-green-600">₹{selectedInvoice.amountPaid.toLocaleString('en-IN')}</span>
                    </div>
                    {selectedInvoice.total - selectedInvoice.amountPaid > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Balance Due:</span>
                        <span className="font-medium text-red-600">₹{(selectedInvoice.total - selectedInvoice.amountPaid).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Actions */}
                {selectedInvoice.status !== 'paid' && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="font-semibold text-foreground">Payment Actions</h4>
                    <div className="flex gap-2">
                      <Button className="bg-primary hover:bg-primary-dark">
                        Record Payment
                      </Button>
                      <Button variant="outline">
                        Send Reminder
                      </Button>
                      <Button variant="outline">
                        Generate Payment Link
                      </Button>
                    </div>
                  </div>
                )}

                {/* Footer Note */}
                <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                  <p className="mb-2">
                    <strong>Payment Terms:</strong> Payment is due within 7 days of invoice date.
                  </p>
                  <p>
                    <strong>Note:</strong> All treatments are provided by qualified naturopathy practitioners. 
                    For any queries regarding this invoice, please contact us at info@ikshanaturopathy.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;