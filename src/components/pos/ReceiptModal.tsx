import { Transaction } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Check } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
  autoPrint?: boolean;
}

export function ReceiptModal({ transaction, open, onClose, autoPrint = true }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const hasPrinted = useRef(false);

  const formatPrice = (price: number) => {
    return 'Rp ' + price.toLocaleString('id-ID');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const generateReceiptHTML = () => {
    if (!transaction) return '';
    
    let itemsHTML = transaction.items.map(item => `
      <div style="margin-bottom:4px">
        <div>${item.name}</div>
        <div style="display:flex;justify-content:space-between">
          <span>${item.quantity} x ${formatPrice(item.price)}</span>
          <span>${formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Struk</title>
  <style>
    @page { 
      size: 58mm auto; 
      margin: 0; 
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.3;
      width: 58mm;
      padding: 3mm;
      background: white;
      color: black;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .divider { 
      border-top: 1px dashed #000; 
      margin: 6px 0; 
    }
    .row {
      display: flex;
      justify-content: space-between;
    }
    .title { font-size: 14px; font-weight: bold; }
    .small { font-size: 10px; }
    .large { font-size: 14px; }
  </style>
</head>
<body>
  <div class="center">
    <div class="title">TokoKu</div>
    <div class="small">Jl. Contoh No. 123</div>
    <div class="small">Telp: 08xx-xxxx-xxxx</div>
  </div>
  
  <div class="divider"></div>
  
  <div class="small">
    <div>No: #${transaction.id.slice(-6)}</div>
    <div>${formatDate(transaction.date)}</div>
    ${transaction.customer ? `<div>Pelanggan: ${transaction.customer.name}</div>` : ''}
  </div>
  
  <div class="divider"></div>
  
  <div>${itemsHTML}</div>
  
  <div class="divider"></div>
  
  <div class="row bold">
    <span>TOTAL</span>
    <span class="large">${formatPrice(transaction.total)}</span>
  </div>
  
  <div class="row small" style="margin-top:4px">
    <span>Bayar (${transaction.paymentMethod === 'cash' ? 'Tunai' : 'Transfer'})</span>
    <span>${formatPrice(transaction.amountPaid)}</span>
  </div>
  
  ${transaction.change > 0 ? `
  <div class="row small">
    <span>Kembali</span>
    <span>${formatPrice(transaction.change)}</span>
  </div>
  ` : ''}
  
  <div class="divider"></div>
  
  <div class="center small">
    <div>Terima kasih!</div>
    <div>Selamat berbelanja kembali</div>
  </div>
  
  <div style="height: 10mm"></div>
</body>
</html>`;
  };

  const handlePrint = () => {
    if (!transaction) return;
    
    const printWindow = window.open('', '_blank', 'width=250,height=500');
    if (!printWindow) {
      alert('Popup diblokir. Izinkan popup untuk mencetak struk.');
      return;
    }

    printWindow.document.write(generateReceiptHTML());
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  // Auto print when transaction is completed
  useEffect(() => {
    if (open && transaction && autoPrint && !hasPrinted.current) {
      hasPrinted.current = true;
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        handlePrint();
      }, 300);
      return () => clearTimeout(timer);
    }
    
    if (!open) {
      hasPrinted.current = false;
    }
  }, [open, transaction, autoPrint]);

  if (!transaction) return null;

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
          className="mx-auto bg-white p-4 rounded-lg border shadow-inner font-mono text-xs"
          style={{ width: '220px' }}
        >
          <div className="text-center mb-2">
            <p className="font-bold text-sm">TokoKu</p>
            <p className="text-[10px]">Jl. Contoh No. 123</p>
            <p className="text-[10px]">Telp: 08xx-xxxx-xxxx</p>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          <div className="mb-2 text-[10px]">
            <p>No: #{transaction.id.slice(-6)}</p>
            <p>{formatDate(transaction.date)}</p>
            {transaction.customer && (
              <p>Pelanggan: {transaction.customer.name}</p>
            )}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

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

          <div className="border-t border-dashed border-gray-400 my-2" />

          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL</span>
            <span>{formatPrice(transaction.total)}</span>
          </div>

          <div className="flex justify-between text-[10px] mt-1">
            <span>Bayar ({transaction.paymentMethod === 'cash' ? 'Tunai' : 'Transfer'})</span>
            <span>{formatPrice(transaction.amountPaid)}</span>
          </div>

          {transaction.change > 0 && (
            <div className="flex justify-between text-[10px]">
              <span>Kembali</span>
              <span>{formatPrice(transaction.change)}</span>
            </div>
          )}

          <div className="border-t border-dashed border-gray-400 my-2" />

          <div className="text-center text-[10px]">
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
            Cetak Lagi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
