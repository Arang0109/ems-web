import { toast as sonner } from 'sonner';

const toast = Object.assign(
  (message: string) => sonner(message),
  {
    success: (message: string) => sonner.success(message),
    error: (message: string) => sonner.error(message),
    info: (message: string) => sonner.info(message),
    warning: (message: string) => sonner.warning(message),
    promise: sonner.promise,
  },
);

export { toast };
