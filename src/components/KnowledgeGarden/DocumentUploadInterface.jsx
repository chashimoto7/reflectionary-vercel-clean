// src/components/KnowledgeGarden/DocumentUploadInterface.jsx
import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  File,
  Image,
  FileText,
  Eye,
  Scan,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  Info
} from 'lucide-react';

export default function DocumentUploadInterface({ onUploadComplete, onClose }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [processingType, setProcessingType] = useState('auto');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const supportedTypes = {
    visual: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'],
    ocr: ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'],
    digital: ['.txt', '.docx', '.md', '.rtf', '.csv', '.json', '.xml'],
    exports: ['.json', '.xml', '.csv', '.zip']
  };

  const allSupportedTypes = [
    ...supportedTypes.visual,
    ...supportedTypes.ocr,
    ...supportedTypes.digital,
    ...supportedTypes.exports
  ];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return allSupportedTypes.includes(extension);
    });

    setSelectedFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      size: file.size,
      type: file.type,
      name: file.name,
      status: 'ready',
      processingType: detectProcessingType(file)
    }))]);
  };

  const detectProcessingType = (file) => {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const filename = file.name.toLowerCase();

    // Journaling app exports
    if (filename.includes('day_one') || filename.includes('journey') ||
        filename.includes('diarium') || filename.includes('export')) {
      return 'digital';
    }

    // Pure digital formats
    if (supportedTypes.digital.includes(extension)) {
      return 'digital';
    }

    // Image files - check for OCR indicators
    if (supportedTypes.visual.includes(extension)) {
      if (file.size > 2 * 1024 * 1024 || // > 2MB
          filename.includes('scan') ||
          filename.includes('page') ||
          filename.includes('document')) {
        return 'ocr';
      }
      return 'visual_analysis';
    }

    // PDF files
    if (extension === '.pdf') {
      return 'ocr';
    }

    return 'digital';
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const startUpload = async () => {
    for (const fileItem of selectedFiles) {
      if (fileItem.status !== 'ready') continue;

      setUploadProgress(prev => ({
        ...prev,
        [fileItem.id]: { status: 'uploading', progress: 0 }
      }));

      try {
        const formData = new FormData();
        formData.append('document', fileItem.file);
        formData.append('user_id', 'current-user-id'); // This would come from auth context
        formData.append('processing_preference', processingType === 'auto' ? 'auto' : processingType);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: { status: 'completed', progress: 100, uploadId: result.data.uploadId }
          }));

          // Update file status
          setSelectedFiles(prev => prev.map(f =>
            f.id === fileItem.id
              ? { ...f, status: 'uploaded', uploadId: result.data.uploadId }
              : f
          ));

          if (onUploadComplete) {
            onUploadComplete(result.data);
          }
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        setUploadProgress(prev => ({
          ...prev,
          [fileItem.id]: { status: 'error', error: error.message }
        }));
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName, processingType) => {
    const extension = '.' + fileName.split('.').pop().toLowerCase();

    if (supportedTypes.visual.includes(extension)) {
      return processingType === 'ocr' ? Scan : Eye;
    }
    if (extension === '.pdf') {
      return FileText;
    }
    return File;
  };

  const getProcessingTypeInfo = (type) => {
    const info = {
      visual_analysis: {
        name: 'Visual Analysis',
        description: 'Analyze drawings, doodles, and visual elements',
        icon: Eye,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        cost: 'Free'
      },
      ocr: {
        name: 'OCR Processing',
        description: 'Extract text from scanned documents and images',
        icon: Scan,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        cost: '1-2 credits per page'
      },
      digital: {
        name: 'Digital Import',
        description: 'Import and organize digital documents',
        icon: FileText,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        cost: 'Free'
      }
    };
    return info[type] || info.digital;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Upload Documents</h2>
            <p className="text-gray-400 text-sm mt-1">
              Import documents, images, and journal exports to your Knowledge Garden
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Processing Type Selection */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Processing Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setProcessingType('auto')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  processingType === 'auto'
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-purple-400 mb-2">✨</div>
                <h4 className="text-white font-medium">Auto-Detect</h4>
                <p className="text-gray-400 text-xs mt-1">Let AI choose the best processing method</p>
              </button>

              {Object.entries({
                visual_analysis: 'Visual',
                ocr: 'OCR',
                digital: 'Digital'
              }).map(([key, label]) => {
                const info = getProcessingTypeInfo(key);
                const Icon = info.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setProcessingType(key)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      processingType === key
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`${info.bgColor} p-2 rounded-lg inline-block mb-2`}>
                      <Icon className={`h-4 w-4 ${info.color}`} />
                    </div>
                    <h4 className="text-white font-medium">{label}</h4>
                    <p className="text-gray-400 text-xs mt-1">{info.cost}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-purple-400 bg-purple-500/10'
                : 'border-white/20 bg-white/5 hover:bg-white/10'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Drop files here or click to browse</h3>
            <p className="text-gray-400 text-sm mb-4">
              Supports: Images, PDFs, Documents, Journal Exports
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allSupportedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Selected Files ({selectedFiles.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedFiles.map((fileItem) => {
                  const Icon = getFileIcon(fileItem.name, fileItem.processingType);
                  const typeInfo = getProcessingTypeInfo(fileItem.processingType);
                  const progress = uploadProgress[fileItem.id];

                  return (
                    <div
                      key={fileItem.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`${typeInfo.bgColor} p-2 rounded-lg flex-shrink-0`}>
                          <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-white font-medium truncate">{fileItem.name}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-gray-400 text-sm">
                                  {formatFileSize(fileItem.size)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${typeInfo.bgColor} ${typeInfo.color}`}>
                                  {typeInfo.name}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(fileItem.id)}
                              className="text-gray-400 hover:text-red-400 p-1 rounded"
                              disabled={progress?.status === 'uploading'}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Progress */}
                          {progress && (
                            <div className="mt-3">
                              {progress.status === 'uploading' && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Loader className="h-4 w-4 text-blue-400 animate-spin" />
                                    <span className="text-blue-400 text-sm">Uploading...</span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full transition-all"
                                      style={{ width: `${progress.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                              {progress.status === 'completed' && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <span className="text-green-400 text-sm">Upload completed</span>
                                </div>
                              )}
                              {progress.status === 'error' && (
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-400" />
                                  <span className="text-red-400 text-sm">{progress.error}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Processing Info */}
          {selectedFiles.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-300 font-medium mb-1">Processing Information</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Visual analysis and digital imports are free</li>
                    <li>• OCR processing uses credits (1-2 per page)</li>
                    <li>• Processing happens in the background</li>
                    <li>• You'll be notified when complete</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={startUpload}
            disabled={selectedFiles.length === 0 || selectedFiles.every(f => f.status !== 'ready')}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Start Upload ({selectedFiles.filter(f => f.status === 'ready').length})
          </button>
        </div>
      </div>
    </div>
  );
}