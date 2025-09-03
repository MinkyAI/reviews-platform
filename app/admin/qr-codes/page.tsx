'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Archive, 
  RotateCcw, 
  QrCode, 
  Eye, 
  BarChart3,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';

interface QRCodeData {
  id: string;
  shortCode: string;
  label: string;
  status: 'active' | 'archived';
  batchId?: string;
  createdAt: string;
  updatedAt: string;
  client: {
    name: string;
    brandColors?: any;
    logoUrl?: string;
  };
  location?: {
    name: string;
    address?: string;
  };
  stats: {
    totalScans: number;
    totalSubmissions: number;
  };
}

interface BatchData {
  batchId: string;
  createdAt: string;
  clientName: string;
  locationName?: string;
  totalCodes: number;
  activeCodes: number;
  totalScans: number;
}

interface Client {
  id: string;
  name: string;
  brandColors?: any;
  logoUrl?: string;
}

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'codes' | 'batches'>('codes');
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      const [clientsRes, batchesRes] = await Promise.all([
        fetch('/api/admin/clients'),
        fetch('/api/admin/qr-codes/generate')
      ]);
      
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
      }
      
      if (batchesRes.ok) {
        const batchesData = await batchesRes.json();
        setBatches(batchesData.batches || []);
      }
      
      await loadQRCodes();
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadQRCodes = async () => {
    try {
      let url = '/api/admin/qr-codes/export';
      const params = new URLSearchParams();
      
      if (selectedClient) {
        params.append('clientId', selectedClient);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setQrCodes(data.qrCodes || []);
      }
    } catch (error) {
      console.error('Error loading QR codes:', error);
    }
  };
  
  useEffect(() => {
    if (!isLoading) {
      loadQRCodes();
    }
  }, [selectedClient]);
  
  const filteredQRCodes = qrCodes.filter(qr => {
    const matchesClient = !selectedClient || qr.client.name === selectedClient;
    const matchesStatus = !selectedStatus || qr.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      qr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.client.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesClient && matchesStatus && matchesSearch;
  });
  
  const filteredBatches = batches.filter(batch => {
    const matchesClient = !selectedClient || batch.clientName === selectedClient;
    const matchesSearch = !searchQuery || 
      batch.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (batch.locationName && batch.locationName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesClient && matchesSearch;
  });
  
  const updateQRCodeStatus = async (id: string, status: 'active' | 'archived') => {
    try {
      const response = await fetch(`/api/admin/qr-codes/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setQrCodes(prev => 
          prev.map(qr => qr.id === id ? { ...qr, status } : qr)
        );
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update QR code status');
    }
  };
  
  const exportBatch = async (batchId: string) => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/admin/qr-codes/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchId,
          format: 'A4',
          orientation: 'portrait',
          codesPerRow: 3,
          codesPerPage: 9,
          includeUrl: true,
          includeLabel: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to export batch');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = `qr-codes-batch-${batchId}-${Date.now()}.pdf`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export batch');
    } finally {
      setIsExporting(false);
    }
  };
  
  const stats = {
    totalCodes: qrCodes.length,
    activeCodes: qrCodes.filter(qr => qr.status === 'active').length,
    totalScans: qrCodes.reduce((sum, qr) => sum + qr.stats.totalScans, 0),
    totalSubmissions: qrCodes.reduce((sum, qr) => sum + qr.stats.totalSubmissions, 0)
  };
  
  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#F8F9FA]">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
            <p className="text-gray-600 mt-1">Generate, manage, and track your QR codes</p>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 bg-[#007AFF] text-white px-6 py-3 rounded-xl hover:bg-[#0056CC] transition-all duration-200 hover:scale-[0.98] shadow-[0_4px_16px_rgba(0,122,255,0.2)]"
          >
            <Plus className="w-5 h-5" />
            Generate New Codes
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="backdrop-blur-sm bg-white/80 border border-[#E5E5E7] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#007AFF]/10 rounded-xl">
                <QrCode className="w-6 h-6 text-[#007AFF]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Codes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCodes}</p>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-sm bg-white/80 border border-[#E5E5E7] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#34C759]/10 rounded-xl">
                <Eye className="w-6 h-6 text-[#34C759]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Codes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCodes}</p>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-sm bg-white/80 border border-[#E5E5E7] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FF9500]/10 rounded-xl">
                <BarChart3 className="w-6 h-6 text-[#FF9500]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalScans.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-sm bg-white/80 border border-[#E5E5E7] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FF3B30]/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-[#FF3B30]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-sm bg-white/80 border border-[#E5E5E7] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('codes')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'codes' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Individual Codes
                </button>
                <button
                  onClick={() => setViewMode('batches')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'batches' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Batches
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search codes or clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-[#E5E5E7] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="px-4 py-2 border border-[#E5E5E7] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-200"
              >
                <option value="">All clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
              
              {viewMode === 'codes' && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-[#E5E5E7] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-200"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : viewMode === 'codes' ? (
            <div className="space-y-3">
              {filteredQRCodes.length === 0 ? (
                <div className="text-center py-16">
                  <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No QR codes found</p>
                </div>
              ) : (
                filteredQRCodes.map((qrCode, index) => (
                  <motion.div
                    key={qrCode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="backdrop-blur-sm bg-white/60 border border-[#E5E5E7] rounded-xl p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-xl flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{qrCode.label}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-mono">{qrCode.shortCode}</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {qrCode.client.name}
                            </span>
                            {qrCode.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {qrCode.location.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDistanceToNow(new Date(qrCode.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <div className="text-gray-900 font-medium">
                            {qrCode.stats.totalScans} scans
                          </div>
                          <div className="text-gray-600">
                            {qrCode.stats.totalSubmissions} submissions
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            qrCode.status === 'active' 
                              ? 'bg-[#34C759]/10 text-[#34C759]' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {qrCode.status === 'active' ? 'Active' : 'Archived'}
                          </span>
                          
                          <button
                            onClick={() => updateQRCodeStatus(
                              qrCode.id, 
                              qrCode.status === 'active' ? 'archived' : 'active'
                            )}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              qrCode.status === 'active'
                                ? 'text-gray-600 hover:bg-gray-100'
                                : 'text-[#34C759] hover:bg-[#34C759]/10'
                            }`}
                            title={qrCode.status === 'active' ? 'Archive' : 'Reactivate'}
                          >
                            {qrCode.status === 'active' ? 
                              <Archive className="w-4 h-4" /> : 
                              <RotateCcw className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBatches.length === 0 ? (
                <div className="text-center py-16">
                  <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No batches found</p>
                </div>
              ) : (
                filteredBatches.map((batch, index) => (
                  <motion.div
                    key={batch.batchId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="backdrop-blur-sm bg-white/60 border border-[#E5E5E7] rounded-xl p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#FF9500] to-[#FF6B00] rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Batch {batch.batchId.slice(-8)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {batch.clientName}
                            </span>
                            {batch.locationName && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {batch.locationName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(batch.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <div className="text-gray-900 font-medium">
                            {batch.totalCodes} codes ({batch.activeCodes} active)
                          </div>
                          <div className="text-gray-600">
                            {batch.totalScans} total scans
                          </div>
                        </div>
                        
                        <button
                          onClick={() => exportBatch(batch.batchId)}
                          disabled={isExporting}
                          className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0056CC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
          >
            <div className="min-h-screen p-4 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-[#E5E5E7] p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Generate QR Codes</h2>
                    <button
                      onClick={() => setShowGenerator(false)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <QRCodeGenerator 
                    clients={clients} 
                    onSuccess={() => {
                      setShowGenerator(false);
                      loadData();
                    }} 
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}