import { useToastStore } from '../store/toast-store';

export function useToast() {
    const { success, error, warning, info } = useToastStore();

    return {
        success,
        error,
        warning,
        info,
        toast: {
            success,
            error,
            warning,
            info,
        },
    };
}
