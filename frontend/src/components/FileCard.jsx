import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { formatFileSize, formatDate, isImageFile } from '../utils/helpers';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineTrash,
  HiOutlineExternalLink,
  HiOutlineDownload,
} from 'react-icons/hi';
import { BsFilePdf, BsImage } from 'react-icons/bs';
import './FileCard.css';

const FileCard = ({ file, onDelete, onFavoriteToggle, viewMode }) => {
  const [deleting, setDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this file permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/files/${file._id}`);
      toast.success('File deleted');
      onDelete(file._id);
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setDeleting(false);
    }
  };

  const handleFavorite = async () => {
    try {
      const res = await api.patch(`/files/${file._id}/favorite`);
      onFavoriteToggle(file._id, res.data.file.isFavorite);
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const isImage = isImageFile(file.fileType);

  return (
    <>
      <div className={`file-card ${viewMode}`}>
        <div className="file-card-thumb" onClick={() => setShowPreview(true)}>
          {isImage ? (
            <img src={file.fileUrl} alt={file.fileName} loading="lazy" />
          ) : (
            <div className="pdf-thumb">
              <BsFilePdf size={viewMode === 'grid' ? 40 : 28} />
              <span>PDF</span>
            </div>
          )}
          <div className="thumb-overlay">
            <HiOutlineExternalLink size={22} />
          </div>
        </div>

        <div className="file-card-info">
          <p className="file-card-name" title={file.fileName}>
            {file.fileName}
          </p>
          <div className="file-card-meta">
            <span className={`file-type-badge ${file.fileType}`}>
              {isImage ? <BsImage size={11} /> : <BsFilePdf size={11} />}
              {file.fileType.toUpperCase()}
            </span>
            <span className="file-size">{formatFileSize(file.fileSize)}</span>
            <span className="file-date">{formatDate(file.createdAt)}</span>
          </div>
        </div>

        <div className="file-card-actions">
          <button
            className={`action-btn fav-btn ${file.isFavorite ? 'active' : ''}`}
            onClick={handleFavorite}
            title={file.isFavorite ? 'Remove favorite' : 'Add favorite'}
          >
            {file.isFavorite ? <HiHeart size={17} /> : <HiOutlineHeart size={17} />}
          </button>
          <a
            className="action-btn"
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Download"
          >
            <HiOutlineDownload size={17} />
          </a>
          <button
            className="action-btn delete-btn"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
          >
            <HiOutlineTrash size={17} />
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={() => setShowPreview(false)}>✕</button>
            <h3 className="preview-title">{file.fileName}</h3>
            {isImage ? (
              <img className="preview-image" src={file.fileUrl} alt={file.fileName} />
            ) : (
              <iframe
                className="preview-pdf"
                src={file.fileUrl}
                title={file.fileName}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FileCard;
