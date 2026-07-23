import toast from 'react-hot-toast';
import type { ToastType } from '../types';

export const notify = (message: string, type: ToastType = 'info') => {
  if (type === 'success') {
    toast.success(message);
    return;
  }
  if (type === 'error') {
    toast.error(message);
    return;
  }
  toast(message);
};

export const useToast = () => ({
  showToast: notify,
  dismissToast: toast.dismiss,
});
