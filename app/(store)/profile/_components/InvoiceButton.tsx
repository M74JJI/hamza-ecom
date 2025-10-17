// app/(store)/profile/_components/InvoiceButton.tsx
'use client';
import { useTransition } from 'react';
import { downloadInvoice } from '../_actions/order.actions';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2 } from 'lucide-react';

export function InvoiceButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() =>
        start(async () => {
          const res = await downloadInvoice(orderId);
          if (!res) return;

          const blob = new Blob([res.bytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${orderId}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        })
      }
      disabled={pending}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
        pending
          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
      }`}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      {pending ? 'Generating...' : 'Download Invoice'}
      <Download className="w-4 h-4" />
    </motion.button>
  );
}