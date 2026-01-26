import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastState {
    toasts: Toast[];

    // Actions
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],

    addToast: (type, message, duration = 5000) => {
        const id = Math.random().toString(36).substring(7);
        const toast: Toast = { id, type, message, duration };

        set({ toasts: [...get().toasts, toast] });

        if (duration > 0) {
            setTimeout(() => {
                get().removeToast(id);
            }, duration);
        }
    },

    removeToast: (id) => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) });
    },

    success: (message, duration) => get().addToast('success', message, duration),
    error: (message, duration) => get().addToast('error', message, duration),
    warning: (message, duration) => get().addToast('warning', message, duration),
    info: (message, duration) => get().addToast('info', message, duration),
}));
