import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import Navbar from './Navbar';
import FileCard from './FileCard';
import UploadModal from './UploadModal';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineSortDescending,
  HiOutlineFilter,
  HiOutlineHeart,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineCollection,
} from 'react-icons/hi';
import './Dashboard.css';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('pn_view') || 'grid';
  });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filterType !== 'all') params.set('type', filterType);
      if (sortBy === 'oldest') params.set('sort', 'oldest');
      else if (sortBy === 'name') params.set('sort', 'name');
      if (showFavorites) params.set('favorites', 'true');

      const res = await api.get(`/files?${params.toString()}`);
      setFiles(res.data.files);
    } catch (err) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType, sortBy, showFavorites]);

  useEffect(() => {
    const timeout = setTimeout(fetchFiles, 300);
    return () => clearTimeout(timeout);
  }, [fetchFiles]);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('pn_view', mode);
  };

  const handleDelete = (id) => {
    setFiles((prev) => prev.filter((f) => f._id !== id));
  };

  const handleFavoriteToggle = (id, isFavorite) => {
    setFiles((prev) =>
      prev.map((f) => (f._id === id ? { ...f, isFavorite } : f))
    );
  };

  const stats = {
    total: files.length,
    pdfs: files.filter((f) => f.fileType === 'pdf').length,
    images: files.filter((f) => ['jpg', 'jpeg'].includes(f.fileType)).length,
    favorites: files.filter((f) => f.isFavorite).length,
  };

  return (
    <div className="dashboard-layout">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="dashboard-main">
        <div className="dashboard-inner">
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card" onClick={() => { setFilterType('all'); setShowFavorites(false); }}>
              <div className="stat-icon all"><HiOutlineCollection size={20} /></div>
              <div>
                <p className="stat-value">{stats.total}</p>
                <p className="stat-label">All Files</p>
              </div>
            </div>
            <div className="stat-card" onClick={() => { setFilterType('pdf'); setShowFavorites(false); }}>
              <div className="stat-icon pdf"><HiOutlineDocumentText size={20} /></div>
              <div>
                <p className="stat-value">{stats.pdfs}</p>
                <p className="stat-label">PDFs</p>
              </div>
            </div>
            <div className="stat-card" onClick={() => { setFilterType('image'); setShowFavorites(false); }}>
              <div className="stat-icon img"><HiOutlinePhotograph size={20} /></div>
              <div>
                <p className="stat-value">{stats.images}</p>
                <p className="stat-label">Images</p>
              </div>
            </div>
            <div className="stat-card" onClick={() => { setShowFavorites(!showFavorites); setFilterType('all'); }}>
              <div className={`stat-icon fav ${showFavorites ? 'active' : ''}`}><HiOutlineHeart size={20} /></div>
              <div>
                <p className="stat-value">{stats.favorites}</p>
                <p className="stat-label">Favorites</p>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-left">
              <button className="upload-btn" onClick={() => setUploadOpen(true)}>
                <HiOutlinePlus size={18} />
                <span>Upload</span>
              </button>

              <button
                className={`tool-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <HiOutlineFilter size={16} />
                <span className="tool-label">Filter</span>
              </button>
            </div>

            <div className="toolbar-right">
              <div className="sort-select-wrapper">
                <HiOutlineSortDescending size={15} />
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => handleViewChange('grid')}
                  aria-label="Grid view"
                >
                  <HiOutlineViewGrid size={17} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => handleViewChange('list')}
                  aria-label="List view"
                >
                  <HiOutlineViewList size={17} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter chips */}
          {showFilters && (
            <div className="filter-chips">
              {['all', 'pdf', 'image'].map((type) => (
                <button
                  key={type}
                  className={`chip ${filterType === type ? 'active' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {type === 'all' && <HiOutlineCollection size={14} />}
                  {type === 'pdf' && <HiOutlineDocumentText size={14} />}
                  {type === 'image' && <HiOutlinePhotograph size={14} />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}{type === 'all' ? ' Files' : 's'}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="loading-state">
              <div className="loader-dots">
                <span></span><span></span><span></span>
              </div>
              <p>Loading your files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                  <path d="M24 28h16M24 36h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="48" cy="48" r="12" fill="var(--accent-color)" fillOpacity="0.1" stroke="var(--accent-color)" strokeWidth="2"/>
                  <path d="M48 42v12M42 48h12" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>No files found</h3>
              <p>{searchQuery ? 'Try a different search term' : 'Upload your first file to get started'}</p>
              {!searchQuery && (
                <button className="upload-btn empty-upload" onClick={() => setUploadOpen(true)}>
                  <HiOutlinePlus size={18} />
                  Upload File
                </button>
              )}
            </div>
          ) : (
            <div className={`files-container ${viewMode}`}>
              {files.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  viewMode={viewMode}
                  onDelete={handleDelete}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={fetchFiles}
      />
    </div>
  );
};

export default Dashboard;
