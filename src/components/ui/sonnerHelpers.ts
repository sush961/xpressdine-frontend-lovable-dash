import * as React from "react";
import { cva } from "class-variance-authority";
import { Button } from "@/components/ui/button";

export const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=move]:translate-x-1/2 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[200%] data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=closed]:animate-out data-[state=closed]:fade-out-80",
  {
    variants: {
      variant: {
        default: "bg-background border",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type ToastActionElement = React.ReactElement<typeof Button>;

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: ToastActionElement;
  variant?: "default" | "destructive";
}


export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const ToastContext = React.createContext<{
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
} | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Dummy toast export for compatibility (replace with actual implementation if needed)
export const toast = (...args: unknown[]) => {
  // You may want to re-export from 'sonner' or implement your own
  // For now, this is a placeholder
  console.warn("toast called with", args);
};
