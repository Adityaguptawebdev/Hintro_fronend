import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import Button from '../Button';

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

const Modal = ({ open, onClose, title, size = 'md', children, footer }) => {
  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative z-10 w-full rounded-2xl bg-white shadow-modal',
              sizes[size]
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              <Button variant="ghost" size="xs" onClick={onClose}>✕</Button>
            </div>

            {/* Body */}
            <div className="p-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex justify-end gap-2 border-t border-gray-100 p-4">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
