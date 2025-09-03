'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Copy, Check, X, Grid, FileImage, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
// import { downloadFile } from '@/lib/qr-utils';

const generateFormSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  locationId: z.string().optional(),
  count: z.number().min(1, 'Count must be at least 1').max(100, 'Maximum 100 QR codes per batch'),
  labelPrefix: z.string().min(1, 'Label prefix is required'),
  batchName: z.string().optional()
});

const exportFormSchema = z.object({
  format: z.enum(['A4', 'Letter']),
  orientation: z.enum(['portrait', 'landscape']),
  codesPerRow: z.number().min(1).max(6),
  codesPerPage: z.number().min(1).max(20),
  includeUrl: z.boolean(),
  includeLabel: z.boolean()
});

interface QRCodeData {
  id: string;
  shortCode: string;
  url: string;
  label: string;
  qrCodeDataUrl?: string;
  status: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  brandColors?: { primary?: string; secondary?: string; };
  logoUrl?: string;
}

interface Location {
  id: string;
  name: string;
  address?: string;
}

interface QRCodeGeneratorProps {
  clients: Client[];
  onSuccess?: () => void;
}

export default function QRCodeGenerator({ clients, onSuccess }: QRCodeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<QRCodeData[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const generateForm = useForm<z.infer<typeof generateFormSchema>>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      count: 10,
      labelPrefix: 'Table'
    }
  });
  
  const exportForm = useForm<z.infer<typeof exportFormSchema>>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      format: 'A4',
      orientation: 'portrait',
      codesPerRow: 3,
      codesPerPage: 9,
      includeUrl: true,
      includeLabel: true
    }
  });
  
  const clientId = generateForm.watch('clientId');
  
  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client || null);
      
      fetch(`/api/admin/locations?clientId=${clientId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLocations(data.locations || []);
          }
        })
        .catch(console.error);
    } else {
      setLocations([]);
      setSelectedClient(null);
    }
  }, [clientId, clients]);
  
  const onGenerate = async (data: z.infer<typeof generateFormSchema>) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/admin/qr-codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate QR codes');
      }
      
      setGeneratedCodes(result.qrCodes || []);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      onSuccess?.();
      
    } catch (error) {
      console.error('Generation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate QR codes');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const onExport = async (exportData: z.infer<typeof exportFormSchema>) => {
    if (generatedCodes.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/admin/qr-codes/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qrCodeIds: generatedCodes.map(qr => qr.id),
          clientId: selectedClient?.id,
          ...exportData
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export QR codes');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = `qr-codes-${selectedClient?.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowExportOptions(false);
      
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
      
    } catch (error) {
      console.error('Export error:', error);
      alert(error instanceof Error ? error.message : 'Failed to export QR codes');
    } finally {
      setIsExporting(false);
    }
  };
  
  const copyToClipboard = async (text: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  const downloadSingle = (qrCode: QRCodeData, format: 'png' | 'svg') => {
    if (!qrCode.qrCodeDataUrl) return;
    
    if (format === 'png') {
      const link = document.createElement('a');
      link.href = qrCode.qrCodeDataUrl;
      link.download = `${qrCode.label.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="backdrop-blur-sm bg-white/80 border border-[#E5E5E7] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#007AFF]/10 rounded-xl">
            <QrCode className="w-6 h-6 text-[#007AFF]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Generate QR Codes</h3>
        </div>
        
        <form onSubmit={generateForm.handleSubmit(onGenerate)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                {...generateForm.register('clientId')}
                className="w-full px-4 py-3 border border-[#E5E5E7] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-200"
                disabled={isGenerating}
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {generateForm.formState.errors.clientId && (
                <p className="text-sm text-red-500 mt-1">
                  {generateForm.formState.errors.clientId.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <select
                {...generateForm.register('locationId')}
                className="w-full px-4 py-3 border border-[#E5E5E7] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-200"
                disabled={isGenerating || locations.length === 0}
              >
                <option value="">All locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of QR Codes *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                {...generateForm.register('count', { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#E5E5E7] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-200"
                disabled={isGenerating}
              />
              {generateForm.formState.errors.count && (
                <p className="text-sm text-red-500 mt-1">
                  {generateForm.formState.errors.count.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label Prefix *
              </label>
              <input
                type="text"
                placeholder="e.g., Table, Station, Location"
                {...generateForm.register('labelPrefix')}
                className="w-full px-4 py-3 border border-[#E5E5E7] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-200"
                disabled={isGenerating}
              />
              {generateForm.formState.errors.labelPrefix && (
                <p className="text-sm text-red-500 mt-1">
                  {generateForm.formState.errors.labelPrefix.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Main Dining Room, Outdoor Seating"
              {...generateForm.register('batchName')}
              className="w-full px-4 py-3 border border-[#E5E5E7] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-200"
              disabled={isGenerating}
            />
          </div>
          
          <button
            type="submit"
            disabled={isGenerating || !generateForm.formState.isValid}
            className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-medium hover:bg-[#0056CC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[0.98] active:scale-95"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating QR Codes...
              </div>
            ) : (
              'Generate QR Codes'
            )}
          </button>
        </form>
      </div>
      
      <AnimatePresence>
        {generatedCodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-sm bg-white/80 border border-[#E5E5E7] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#34C759]/10 rounded-xl">
                  <Grid className="w-6 h-6 text-[#34C759]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Generated QR Codes</h3>
                  <p className="text-sm text-gray-600">{generatedCodes.length} codes ready for use</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowExportOptions(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-xl hover:bg-[#0056CC] transition-all duration-200 hover:scale-[0.98]"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedCodes.map((qrCode, index) => (
                <motion.div
                  key={qrCode.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-sm bg-white/60 border border-[#E5E5E7] rounded-xl p-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200"
                >
                  <div className="text-center mb-4">
                    {qrCode.qrCodeDataUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrCode.qrCodeDataUrl}
                        alt={`QR Code for ${qrCode.label}`}
                        className="w-32 h-32 mx-auto mb-3 rounded-lg"
                      />
                    )}
                    <h4 className="font-medium text-gray-900 mb-1">{qrCode.label}</h4>
                    <p className="text-sm text-gray-600 font-mono break-all">{qrCode.shortCode}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(qrCode.url, qrCode.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-200"
                    >
                      {copiedCode === qrCode.id ? (
                        <>
                          <Check className="w-4 h-4 text-[#34C759]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy URL
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => downloadSingle(qrCode, 'png')}
                      className="flex items-center justify-center p-2 bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] rounded-lg transition-colors duration-200"
                      title="Download PNG"
                    >
                      <FileImage className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showExportOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExportOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Export Options</h3>
                <button
                  onClick={() => setShowExportOptions(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={exportForm.handleSubmit(onExport)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format
                    </label>
                    <select
                      {...exportForm.register('format')}
                      className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientation
                    </label>
                    <select
                      {...exportForm.register('orientation')}
                      className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Codes per Row
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      {...exportForm.register('codesPerRow', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Codes per Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      {...exportForm.register('codesPerPage', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...exportForm.register('includeLabel')}
                      className="w-4 h-4 text-[#007AFF] border-[#E5E5E7] rounded focus:ring-[#007AFF]"
                    />
                    <span className="text-sm font-medium text-gray-700">Include labels</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...exportForm.register('includeUrl')}
                      className="w-4 h-4 text-[#007AFF] border-[#E5E5E7] rounded focus:ring-[#007AFF]"
                    />
                    <span className="text-sm font-medium text-gray-700">Include URLs</span>
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowExportOptions(false)}
                    className="flex-1 px-4 py-3 border border-[#E5E5E7] text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isExporting}
                    className="flex-1 bg-[#007AFF] text-white py-3 rounded-xl font-medium hover:bg-[#0056CC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isExporting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Exporting...
                      </div>
                    ) : (
                      'Export PDF'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}