import { Transaction } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, Check } from 'lucide-react';
import { useRef } from 'react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiptModal({ transaction, open, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !receiptRef.current) return;

    const styles = `
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          width: 280px;
          margin: 0 auto;
          padding: 10px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .divider { border-top: 1px dashed #ccc; margin: 8px 0; }
        .flex { display: flex; justify-content: space-between; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .text-lg { font-size: 14px; }
        .text-sm { font-size: 10px; }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk - ${transaction.id}</title>
          ${styles}
        </head>
        <body>
          ${receiptRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Transaksi Berhasil
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Preview */}
        <div 
          ref={receiptRef}
          className="thermal-receipt mx-auto bg-white p-4 rounded-lg border shadow-inner"
        >
          <div className="text-center mb-2">
            <p className="font-bold text-lg">TokoKu</p>
            <p className="text-sm">Jl. Contoh No. 123</p>
            <p className="text-sm">Telp: 08xx-xxxx-xxxx</p>
          </div>

          <div className="divider" />

          <div className="mb-2">
            <p className="text-sm">No: #{transaction.id.slice(-6)}</p>
            <p className="text-sm">{formatDate(transaction.date)}</p>
            {transaction.customer && (
              <p className="text-sm">Pelanggan: {transaction.customer.name}</p>
            )}
          </div>

          <div className="divider" />

          <div className="mb-2">
            {transaction.items.map(item => (
              <div key={item.id} className="mb-1">
                <p>{item.name}</p>
                <div className="flex justify-between">
                  <span>{item.quantity} x {formatPrice(item.price)}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />

          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{formatPrice(transaction.total)}</span>
          </div>

          <p className="text-sm mt-1">
            Bayar: {transaction.paymentMethod === 'cash' ? 'Tunai' : 'Transfer'}
          </p>

          <div className="divider" />

          <div className="text-center text-sm">
            <p>Terima kasih!</p>
            <p>Selamat berbelanja kembali</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Tutup
          </Button>
          <Button className="flex-1 gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Cetak Struk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
