import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface InvoiceLine {
  clientId: string;
  name: string;
  quantity: string;
  rate: string;
  amount: number;
}

interface Props {
  line: InvoiceLine;
  updateLine: (
    clientId: string,
    patch: Partial<InvoiceLine>
  ) => void;
  removeLine: (clientId: string) => void;
  toINR: (value: number) => string;
}

const InvoiceLineItem = React.memo(
  ({ line, updateLine, removeLine, toINR }: Props) => {
    return (
      <div className="px-4 py-3 grid grid-cols-12 gap-4 text-sm border-t border-border">
        <div className="col-span-5">
          <Input
            value={line.name}
            onChange={(e) =>
              updateLine(line.clientId, {
                name: e.target.value,
              })
            }
          />
        </div>

        <div className="col-span-2">
          <Input
            type="text"
            value={line.quantity}
            onChange={(e) =>
              updateLine(line.clientId, {
                quantity: e.target.value,
              })
            }
          />
        </div>

        <div className="col-span-2">
          <Input
            type="text"
            value={line.rate}
            onChange={(e) =>
              updateLine(line.clientId, {
                rate: e.target.value,
              })
            }
          />
        </div>

        <div className="col-span-2 text-right font-medium pt-2">
          ₹
          {toINR(
            (Number(line.quantity) || 0) *
              (Number(line.rate) || 0)
          )}
        </div>

        <div className="col-span-1 text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              removeLine(line.clientId)
            }
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    );
  }
);

InvoiceLineItem.displayName =
  "InvoiceLineItem";

export default InvoiceLineItem;