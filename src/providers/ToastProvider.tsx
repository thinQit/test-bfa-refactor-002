'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  variant?: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  notify: (message: string, type?: ToastType) => void;
  toast: (message: string, typeOrOptions?: ToastType | { variant?: ToastType; type?: ToastType }) => void;
  addToast: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type, variant: type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const toast = useCallback((message: string, typeOrOptions?: ToastType | { variant?: ToastType; type?: ToastType }) => {
    const type = typeof typeOrOptions === 'string'
      ? typeOrOptions
      : (typeOrOptions?.variant || typeOrOptions?.type || 'info');
    notify(message, type);
  }, [notify]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, notify, toast, addToast: notify, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-white ${
            t.type === 'success' ? 'bg-green-500' :
            t.type === 'error' ? 'bg-red-500' :
            t.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
          }`}>
            {t.message}
            <button onClick={() => dismiss(t.id)} className="ml-2 font-bold">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export default ToastProvider;
