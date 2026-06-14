import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload } from 'lucide-react';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { colors, radius } from '@/theme/tokens';

type Props = {
  onScan: (decoded: string) => void;
  onError?: (message: string) => void;
};

const READER_ID = 'device-qr-reader';

/** Glass-styled QR scanner — decodes a device's `deviceId:activationPin` QR code via camera or an uploaded image. */
export function QrScanner({ onScan, onError }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function startCamera() {
    try {
      if (!scannerRef.current) scannerRef.current = new Html5Qrcode(READER_ID);
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          onScan(decoded.trim());
          scannerRef.current?.stop().catch(() => {});
          setScanning(false);
        },
        () => {},
      );
      setScanning(true);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Camera access denied');
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (!scannerRef.current) scannerRef.current = new Html5Qrcode(READER_ID);
      const result = await scannerRef.current.scanFile(file, true);
      onScan(result.trim());
    } catch {
      onError?.('Could not read QR code from image');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        id={READER_ID}
        className="overflow-hidden"
        style={{ minHeight: 240, borderRadius: radius.lg, border: `1px solid ${colors.glassBorder}`, background: 'rgba(255,255,255,0.04)' }}
      />
      <div className="flex flex-wrap gap-3">
        <LiquidButton
          label={scanning ? 'Scanning…' : 'Open Camera'}
          variant="glass"
          icon={<Camera size={16} color={colors.textPrimary} />}
          onClick={startCamera}
          disabled={scanning}
        />
        <label className="relative">
          <LiquidButton label="Upload QR Image" variant="ghost" icon={<Upload size={16} color={colors.textPrimary} />} />
          <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={handleFileUpload} />
        </label>
      </div>
    </div>
  );
}
