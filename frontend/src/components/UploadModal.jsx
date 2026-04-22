import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { HiOutlineUpload, HiOutlineX, HiOutlineDocumentAdd } from 'react-icons/hi';
import './UploadModal.css';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validateFile = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error('Only PDF, JPG, and JPEG files are allowed');
      return false;
    }
    if (f.size > MAX_SIZE) {
      toast.error('File size must be under 10MB');
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    if (validateFile(f)) {
      setFile(f);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const pct = Math.round((event.loaded * 100) / event.total);
          setProgress(pct);
        },
      });
      toast.success('File uploaded successfully!');
      setFile(null);
      setProgress(0);
      onUploadSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setProgress(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <HiOutlineDocumentAdd />
            Upload File
          </h2>
          <button className="modal-close" onClick={handleClose} disabled={uploading}>
            <HiOutlineX size={20} />
          </button>
        </div>

        <div
          className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={handleInputChange}
            hidden
          />

          {file ? (
            <div className="file-preview-area">
              <div className={`file-thumb ${file.type === 'application/pdf' ? 'pdf' : 'img'}`}>
                {file.type === 'application/pdf' ? (
                  <span className="file-thumb-text">PDF</span>
                ) : (
                  <img src={URL.createObjectURL(file)} alt="Preview" />
                )}
              </div>
              <div className="file-info-preview">
                <p className="file-name-preview">{file.name}</p>
                <p className="file-size-preview">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!uploading && (
                <button
                  className="remove-file"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <HiOutlineX />
                </button>
              )}
            </div>
          ) : (
            <div className="drop-content">
              <div className="drop-icon">
                <HiOutlineUpload size={32} />
              </div>
              <p className="drop-title">Drag & drop your file here</p>
              <p className="drop-subtitle">or click to browse</p>
              <p className="drop-hint">PDF, JPG, JPEG — Max 10MB</p>
            </div>
          )}
        </div>

        {uploading && (
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={handleClose} disabled={uploading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
