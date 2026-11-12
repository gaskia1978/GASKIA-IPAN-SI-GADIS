/**
 * ASKIA-SI GADIS - QR Code Modal
 * Menghasilkan QR Code dinamis menggunakan pustaka qrcode untuk akses cepat via smartphone
 */

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, ExternalLink, QrCode as QrIcon } from 'lucide-react';
import { Application } from '../../types';

interface QrCodeModalProps {
  application: Application | null;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ application, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (application && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        application.application_url || window.location.href,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [application]);

  if (!application) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(application.application_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${application.application_name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center">
            <QrIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            QR Code Aplikasi
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {application.application_name}
          </p>
          <p className="text-[11px] text-blue-700 font-medium">
            {application.school_name}
          </p>
        </div>

        {/* QR Canvas Display */}
        <div className="flex justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
          <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
        </div>

        <p className="text-center text-xs text-slate-500 mt-3">
          Pindai dengan kamera ponsel atau aplikasi scanner untuk membuka langsung.
        </p>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan Aplikasi'}</span>
          </button>

          <button
            onClick={handleDownloadQr}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Gambar QR (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
