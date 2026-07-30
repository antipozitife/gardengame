import toast from 'react-hot-toast';
import type { ToastType } from '../types';

const ACTIVE_TOAST_ID = 'garden-game-notification';

export const notify = (message: string, type: ToastType = 'info') => {
  if (type === 'success') {
    toast.success(message, { id: ACTIVE_TOAST_ID });
    return;
  }
  if (type === 'error') {
    toast.error(message, { id: ACTIVE_TOAST_ID });
    return;
  }
  toast(message, { id: ACTIVE_TOAST_ID });
};

export const useToast = () => ({
  showToast: notify,
  dismissToast: toast.dismiss,
});
