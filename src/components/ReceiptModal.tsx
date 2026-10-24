import React, { useMemo, useState } from 'react';
import type { jsPDF as JsPDF } from 'jspdf';
import { GlobalSettings } from '../types/pricing';
import { formatCurrency } from '../utils/pricing';
import { Download, FileText, Share2, X } from 'lucide-react';

interface ReceiptItem {
  code: string;
  name: string;
  quantity: number;
  unitType: string;
  unitPrice: number;
  total: number;
}

interface ReceiptModalProps {
  items: ReceiptItem[];
  total: number;
  clientName: string;
  settings: GlobalSettings;
  onClose: () => void;
}

const createReceiptPdf = (
  Pdf: typeof JsPDF,
  items: ReceiptItem[],
  total: number,
  clientName: string,
  settings: GlobalSettings,
  receiptNumber: string,
) => {
  const pdf = new Pdf();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const xQty = pageWidth - margin - 67;
  const xUnit = pageWidth - margin - 31;
  const xTotal = pageWidth - margin - 2;
  const productWidth = xQty - margin - 10;
  const generatedAt = new Date();
  let y = 0;

  pdf.setProperties({
    title: `Recibo ${receiptNumber}`,
    subject: `Pedido de ${settings.companyName || 'Recibo'}`,
    author: settings.companyName || 'Recibo de Pedido',
  });

  const drawPageHeader = (continued = false) => {
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 43, 'F');
    pdf.setFillColor(234, 88, 12);
    pdf.rect(0, 0, pageWidth, 3, 'F');

    pdf.setFillColor(255, 255, 255);
    pdf.circle(margin + 10, 23, 9, 'F');
    pdf.setTextColor(234, 88, 12);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('REC', margin + 10, 24.5, { align: 'center' });

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.text(settings.companyName || 'Recibo de Pedido', margin + 24, 20);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(8);
    pdf.text(continued ? 'RECIBO DE PEDIDO • CONTINUAÇÃO' : 'RECIBO DE PEDIDO', margin + 24, 28);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text(`Nº ${receiptNumber}`, pageWidth - margin, 20, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(203, 213, 225);
    pdf.text(generatedAt.toLocaleDateString('pt-BR'), pageWidth - margin, 28, { align: 'right' });
    pdf.setTextColor(15, 23, 42);
  };

  const drawTableHeader = () => {
    pdf.setFillColor(255, 247, 237);
    pdf.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
    pdf.setTextColor(124, 45, 18);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('PRODUTO', margin + 3, y + 6.5);
    pdf.text('QTD.', xQty, y + 6.5, { align: 'right' });
    pdf.text('UNITÁRIO', xUnit, y + 6.5, { align: 'right' });
    pdf.text('TOTAL', xTotal, y + 6.5, { align: 'right' });
    pdf.setTextColor(15, 23, 42);
    y += 13;
  };

  drawPageHeader();

  const infoTop = 51;
  const infoHeight = 29;
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, infoTop, contentWidth, infoHeight, 3, 3, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, infoTop, contentWidth, infoHeight, 3, 3, 'S');

  const infoColumnWidth = contentWidth / 2;
  const details = [
    { label: 'CLIENTE', value: clientName.trim() || 'Consumidor' },
    {
      label: 'DATA E HORA',
      value: generatedAt.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    },
    ...(settings.sellerName.trim() ? [{ label: 'ATENDIDO POR', value: settings.sellerName.trim() }] : []),
    ...(settings.sellerPhone.trim() ? [{ label: 'CONTATO', value: settings.sellerPhone.trim() }] : []),
  ];

  details.forEach((detail, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + 5 + column * infoColumnWidth;
    const detailY = infoTop + 8 + row * 12;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(detail.label, x, detailY);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 41, 59);
    pdf.text(pdf.splitTextToSize(detail.value, infoColumnWidth - 10).slice(0, 1), x, detailY + 4);
  });
  pdf.setTextColor(15, 23, 42);

  y = infoTop + infoHeight + 10;
  drawTableHeader();
  pdf.setFontSize(8);

  items.forEach((item, index) => {
    const nameLines = pdf.splitTextToSize(item.name, productWidth) as string[];
    const rowHeight = Math.max(13, nameLines.length * 4 + 7);

    if (y + rowHeight > pageHeight - 39) {
      pdf.addPage();
      drawPageHeader(true);
      y = 52;
      drawTableHeader();
      pdf.setFontSize(8);
    }

    if (index % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, y - 2, contentWidth, rowHeight, 'F');
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(nameLines, margin + 3, y + 3);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    const metadata = [item.code ? `Cód. ${item.code}` : '', item.unitType].filter(Boolean).join('  •  ');
    pdf.text(metadata, margin + 3, y + 3 + nameLines.length * 4);

    pdf.setFontSize(8);
    pdf.setTextColor(51, 65, 85);
    pdf.text(String(item.quantity), xQty, y + 5, { align: 'right' });
    pdf.text(formatCurrency(item.unitPrice), xUnit, y + 5, { align: 'right' });
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatCurrency(item.total), xTotal, y + 5, { align: 'right' });

    y += rowHeight;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, y - 1, pageWidth - margin, y - 1);
  });

  if (y + 31 > pageHeight - 23) {
    pdf.addPage();
    drawPageHeader(true);
    y = 54;
  } else {
    y += 8;
  }

  const quantityTotal = items.reduce((sum, item) => sum + item.quantity, 0);
  pdf.setFillColor(15, 23, 42);
  pdf.roundedRect(margin, y, contentWidth, 25, 3, 3, 'F');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(203, 213, 225);
  pdf.text(`${items.length} ${items.length === 1 ? 'item' : 'itens'}  •  ${quantityTotal} volumes`, margin + 5, y + 9);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text('TOTAL DO PEDIDO', margin + 5, y + 18);
  pdf.setTextColor(253, 186, 116);
  pdf.setFontSize(15);
  pdf.text(formatCurrency(total), pageWidth - margin - 5, y + 16, { align: 'right' });

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Documento referente aos produtos e valores descritos; não comprova quitação.', margin, pageHeight - 13);
    pdf.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 13, { align: 'right' });
  }
  pdf.setTextColor(15, 23, 42);

  return pdf;
};

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (!digits || digits.startsWith('55')) return digits;
  return `55${digits}`;
};

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  items,
  total,
  clientName,
  settings,
  onClose,
}) => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const receiptNumber = useMemo(() => String(Date.now()).slice(-8), []);
  const fileName = `recibo-${receiptNumber}.pdf`;
  const receiptMessage = `Olá${clientName.trim() ? `, ${clientName.trim()}` : ''}! Segue o recibo do pedido ${receiptNumber}, no valor de ${formatCurrency(total)}.`;

  const handleDownload = async () => {
    setError('');
    setStatus('');
    try {
      const { jsPDF: Pdf } = await import('jspdf');
      createReceiptPdf(Pdf, items, total, clientName, settings, receiptNumber).save(fileName);
      setStatus('PDF gerado e baixado com sucesso.');
    } catch (downloadError) {
      console.error('Erro ao gerar recibo em PDF:', downloadError);
      setError('Não foi possível gerar o PDF. Tente novamente.');
    }
  };

  const handleShare = async () => {
    setError('');
    setStatus('');
    setIsSharing(true);

    try {
      const { jsPDF: Pdf } = await import('jspdf');
      const pdf = createReceiptPdf(Pdf, items, total, clientName, settings, receiptNumber);
      const file = new File([pdf.output('blob')], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Recibo ${receiptNumber}`,
          text: receiptMessage,
        });
        setStatus('Recibo compartilhado.');
        return;
      }

      pdf.save(fileName);
      const phone = normalizePhone(customerPhone);
      const whatsappUrl = new URL(`https://wa.me/${phone}`);
      whatsappUrl.searchParams.set('text', `${receiptMessage} O PDF foi baixado; anexe o arquivo à conversa.`);
      window.open(whatsappUrl.toString(), '_blank', 'noopener,noreferrer');
      setStatus('PDF baixado. Anexe o arquivo à conversa do WhatsApp que foi aberta.');
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
      console.error('Erro ao compartilhar recibo:', shareError);
      setError('Não foi possível compartilhar o recibo. Baixe o PDF e tente novamente.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="font-bold text-base">Recibo em PDF</h3>
              <p className="text-[11px] text-slate-300">Pedido Nº {receiptNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar recibo"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {items.map((item, index) => (
              <div key={`${item.code}-${item.name}-${index}`} className="p-3 flex justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800">{item.name}</p>
                  <p className="text-slate-500">{item.quantity} × {formatCurrency(item.unitPrice)} / {item.unitType}</p>
                </div>
                <span className="font-bold text-slate-800 shrink-0">{formatCurrency(item.total)}</span>
              </div>
            ))}
            <div className="p-3 flex justify-between text-sm font-black text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div>
            <label htmlFor="receipt-phone" className="block text-xs font-bold text-slate-700 mb-1">
              WhatsApp do cliente (opcional)
            </label>
            <input
              id="receipt-phone"
              type="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="DDD + número"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Se o compartilhamento de arquivos não estiver disponível, o PDF será baixado para anexar à conversa.
            </p>
          </div>

          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          {status && <p role="status" className="text-xs text-emerald-700">{status}</p>}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              {isSharing ? 'Compartilhando...' : 'Enviar WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
