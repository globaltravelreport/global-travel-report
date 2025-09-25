'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
<<<<<<< HEAD
=======
        icon,
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
        ...props
      }) {
        return (
          <Toast key={id} {...props}>
<<<<<<< HEAD
            <div className="grid gap-1">
=======
            <div className="flex gap-3">
              {icon && <div className="flex-shrink-0">{icon}</div>}
              <div className="grid gap-1">
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
<<<<<<< HEAD
=======
            </div>
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}