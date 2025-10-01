import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant = "default", ...props }: {
        id: string;
        title?: React.ReactNode;
        description?: React.ReactNode;
        action?: React.ReactNode;
        variant?: "default" | "destructive" | "success" | "error" | "info";
        [key: string]: any;
      }) => {
        // Choose colors based on toast type
        let borderColor = "border-gray-300";
        let bgColor = "bg-white";
        let titleColor = "text-gray-900";
        let descColor = "text-gray-700";

        if (variant === "success") {
          borderColor = "border-green-400";
          bgColor = "bg-green-50";
          titleColor = "text-green-800";
          descColor = "text-green-700";
        } else if (variant === "error") {
          borderColor = "border-red-400";
          bgColor = "bg-red-50";
          titleColor = "text-red-800";
          descColor = "text-red-700";
        } else if (variant === "info") {
          borderColor = "border-blue-400";
          bgColor = "bg-blue-50";
          titleColor = "text-blue-800";
          descColor = "text-blue-700";
        }

        return (
          <Toast
            key={id}
            className={`flex items-start justify-between p-4 rounded-lg shadow-md border ${borderColor} ${bgColor} w-96 animate-slide-in`}
            {...props}
          >
            <div className="flex-1 space-y-1">
              {title && <ToastTitle className={`font-semibold ${titleColor}`}>{title}</ToastTitle>}
              {description && <ToastDescription className={`text-sm ${descColor}`}>{description}</ToastDescription>}
            </div>
            {action && <div className="ml-4">{action}</div>}
            <ToastClose className="ml-4 hover:text-gray-500 transition-colors" />
          </Toast>
        );
      })}
      <ToastViewport className="fixed top-5 right-5 flex flex-col gap-3 z-[9999]" />
    </ToastProvider>
  );
}
