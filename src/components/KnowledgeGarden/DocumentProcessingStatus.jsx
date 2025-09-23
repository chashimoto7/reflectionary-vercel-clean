// src/components/KnowledgeGarden/DocumentProcessingStatus.jsx
import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  FileText,
  Eye,
  Scan,
  Upload,
  Pause,
  Play,
  RotateCcw,
  X
} from 'lucide-react';

export default function DocumentProcessingStatus({ onClose }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchUploads();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchUploads, 3000); // Refresh every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchUploads = async () => {
    try {
      const response = await fetch('/api/documents/history?user_id=current-user-id&limit=20');
      const result = await response.json();

      if (result.success) {
        setUploads(result.data);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'processing':
        return 'text-blue-400 bg-blue-500/20';
      case 'completed':
        return 'text-green-400 bg-green-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getProcessingTypeIcon = (type) => {
    switch (type) {
      case 'visual_analysis':
        return <Eye className="h-4 w-4 text-blue-400" />;
      case 'ocr':
        return <Scan className="h-4 w-4 text-orange-400" />;
      case 'digital':
        return <FileText className="h-4 w-4 text-green-400" />;
      default:
        return <Upload className="h-4 w-4 text-gray-400" />;
    }
  };

  const getProcessingTypeLabel = (type) => {
    switch (type) {
      case 'visual_analysis':
        return 'Visual Analysis';
      case 'ocr':
        return 'OCR Processing';
      case 'digital':
        return 'Digital Import';
      default:
        return 'Unknown';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRetry = async (uploadId) => {
    // In a real implementation, this would trigger reprocessing
    console.log('Retrying upload:', uploadId);
    alert('Retry functionality not yet implemented');
  };

  const handleDelete = async (uploadId) => {
    if (!confirm('Are you sure you want to delete this upload?')) return;

    try {
      const response = await fetch(`/api/documents/history?user_id=current-user-id&upload_id=${uploadId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        setUploads(prev => prev.filter(upload => upload.id !== uploadId));
      }
    } catch (error) {
      console.error('Error deleting upload:', error);
      alert('Failed to delete upload');
    }
  };

  const pendingUploads = uploads.filter(u => u.processing_status === 'pending' || u.processing_status === 'processing');
  const completedUploads = uploads.filter(u => u.processing_status === 'completed');
  const failedUploads = uploads.filter(u => u.processing_status === 'failed');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Document Processing Status</h2>
            <p className="text-gray-400 text-sm mt-1">
              Track the progress of your document uploads and processing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh
                  ? 'text-green-400 bg-green-500/20 hover:bg-green-500/30'
                  : 'text-gray-400 bg-gray-500/20 hover:bg-gray-500/30'
              }`}
              title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            >
              {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={fetchUploads}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
              title="Refresh now"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 text-purple-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{uploads.length}</div>
                  <div className="text-gray-400 text-sm">Total Uploads</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{pendingUploads.length}</div>
                  <div className="text-blue-300 text-sm">Processing</div>
                </div>
                <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{completedUploads.length}</div>
                  <div className="text-green-300 text-sm">Completed</div>
                </div>
                <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-400">{failedUploads.length}</div>
                  <div className="text-red-300 text-sm">Failed</div>
                </div>
              </div>

              {/* Processing Queue */}
              {pendingUploads.length > 0 && (
                <section>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Loader className="h-5 w-5 text-blue-400 animate-spin" />
                    Currently Processing ({pendingUploads.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingUploads.map((upload) => (
                      <div key={upload.id} className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
                              {getProcessingTypeIcon(upload.processing_type)}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{upload.original_filename}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-gray-400 text-sm">{formatFileSize(upload.file_size)}</span>
                                <span className="text-blue-300 text-sm">{getProcessingTypeLabel(upload.processing_type)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(upload.processing_status)}`}>
                              {getStatusIcon(upload.processing_status)}
                              {upload.processing_status}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">{formatTimeAgo(upload.created_at)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Failed Uploads */}
              {failedUploads.length > 0 && (
                <section>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    Failed Processing ({failedUploads.length})
                  </h3>
                  <div className="space-y-3">
                    {failedUploads.map((upload) => (
                      <div key={upload.id} className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="bg-red-500/20 p-2 rounded-lg flex-shrink-0">
                              {getProcessingTypeIcon(upload.processing_type)}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{upload.original_filename}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-gray-400 text-sm">{formatFileSize(upload.file_size)}</span>
                                <span className="text-red-300 text-sm">{getProcessingTypeLabel(upload.processing_type)}</span>
                              </div>
                              {upload.error_message && (
                                <p className="text-red-200 text-sm mt-2">{upload.error_message}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRetry(upload.id)}
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-500/20"
                            >
                              Retry
                            </button>
                            <button
                              onClick={() => handleDelete(upload.id)}
                              className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Completed */}
              {completedUploads.length > 0 && (
                <section>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Recently Completed
                  </h3>
                  <div className="space-y-3">
                    {completedUploads.slice(0, 5).map((upload) => (
                      <div key={upload.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="bg-green-500/20 p-2 rounded-lg flex-shrink-0">
                              {getProcessingTypeIcon(upload.processing_type)}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{upload.original_filename}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-gray-400 text-sm">{formatFileSize(upload.file_size)}</span>
                                <span className="text-green-300 text-sm">{getProcessingTypeLabel(upload.processing_type)}</span>
                                {upload.credits_used > 0 && (
                                  <span className="text-orange-300 text-sm">{upload.credits_used} credits used</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(upload.processing_status)}`}>
                              {getStatusIcon(upload.processing_status)}
                              {upload.processing_status}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">{formatTimeAgo(upload.processed_at || upload.created_at)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {uploads.length === 0 && (
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No document uploads yet.</p>
                  <p className="text-gray-500 text-sm mt-1">Upload your first document to get started!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}