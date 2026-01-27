import { Transaction, getDiscountedPrice, StoreSettings } from '@/types';
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
  settings: StoreSettings;
}

export function ReceiptModal({ transaction, open, onClose, autoPrint = true, settings }: ReceiptModalProps) {
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

    let itemsHTML = transaction.items.map(item => {
      const discountedPrice = getDiscountedPrice(item);
      const hasDiscount = item.discountType && item.discountValue;
      return `
      <div style="margin-bottom:4px">
        <div>${item.name}${hasDiscount ? ` <span style="font-size:10px;color:#666">(Diskon)</span>` : ''}</div>
        <div style="display:flex;justify-content:space-between">
          <span>${item.quantity} x ${formatPrice(discountedPrice)}</span>
          <span>${formatPrice(discountedPrice * item.quantity)}</span>
        </div>
      </div>
    `;
    }).join('');

    const storeName = settings.storeName || 'Toko';
    const storeAddress = settings.storeAddress || '';
    const storePhone = settings.storePhone || '';

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Struk - #${transaction.id.slice(-6)}</title>
  <style>
    @media print {
      @page {
        size: 80mm auto;
        margin: 2mm;
      }
      body {
        width: 76mm;
        padding: 2mm;
      }
      .no-print {
        display: none !important;
      }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: 11px;
      line-height: 1.2;
      width: 76mm;
      padding: 3mm;
      background: white;
      color: black;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .divider {
      border-top: 1px dashed #000;
      margin: 5px 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
    }
    .title { font-size: 13px; font-weight: bold; }
    .small { font-size: 9px; }
    .large { font-size: 12px; }
  </style>
</head>
<body>
  <div class="center">
    <div class="title">${storeName}</div>
    ${storeAddress ? `<div class="small">${storeAddress}</div>` : ''}
    ${storePhone ? `<div class="small">Telp: ${storePhone}</div>` : ''}
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

  ${transaction.totalDiscount > 0 ? `
  <div class="row small" style="color:#666">
    <span>Total Hemat</span>
    <span>-${formatPrice(transaction.totalDiscount)}</span>
  </div>
  ` : ''}

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
    <div style="margin-top:5px;">***</div>
  </div>

  <div style="height: 8mm"></div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 500);
    };

    window.onafterprint = function() {
      window.close();
    };
  </script>
</body>
</html>`;
  };

  const handlePrint = () => {
    if (!transaction) return;

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      alert('Popup diblokir! Izinkan popup di browser untuk mencetak struk ke dot matrix.');
      return;
    }

    // Tulis HTML ke window baru
    printWindow.document.open();
    printWindow.document.write(generateReceiptHTML());
    printWindow.document.close();

    // Fokus ke window print agar print dialog muncul
    printWindow.focus();
  };

  // Auto print ketika transaksi selesai
  useEffect(() => {
    if (open && transaction && autoPrint && !hasPrinted.current) {
      hasPrinted.current = true;
      // Delay lebih lama untuk memastikan window print siap
      const timer = setTimeout(() => {
        handlePrint();
      }, 800);
      return () => clearTimeout(timer);
    }

    // Reset flag saat modal ditutup
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
            <p className="font-bold text-sm">{settings.storeName || 'Toko'}</p>
            {settings.storeAddress && <p className="text-[10px]">{settings.storeAddress}</p>}
            {settings.storePhone && <p className="text-[10px]">Telp: {settings.storePhone}</p>}
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
            {transaction.items.map(item => {
              const discountedPrice = getDiscountedPrice(item);
              const hasDiscount = item.discountType && item.discountValue;
              return (
                <div key={item.id} className="mb-1">
                  <p>
                    {item.name}
                    {hasDiscount && <span className="text-[9px] text-gray-500 ml-1">(Diskon)</span>}
                  </p>
                  <div className="flex justify-between">
                    <span>{item.quantity} x {formatPrice(discountedPrice)}</span>
                    <span>{formatPrice(discountedPrice * item.quantity)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {transaction.totalDiscount > 0 && (
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Total Hemat</span>
              <span>-{formatPrice(transaction.totalDiscount)}</span>
            </div>
          )}

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
