import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import FileShare from './FileShare';
import './FileItem.css';

const FileItem = ({ file, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return '📁';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
    return '📁';
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // If we already have the webContentLink directly on the file object, use it
      if (file.webContentLink) {
        window.open(file.webContentLink, '_blank');
        setIsLoading(false);
        return;
      }
      
      // Otherwise, get the download link from the server
      const response = await axios.get(`/api/files/download/${file.id || file.fileID}`);
      
      if (response.data.success && response.data.downloadLink) {
        // Open in a new tab to avoid CORS issues
        window.open(response.data.downloadLink, '_blank');
      } else {
        toast.error('Download link not available');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`/api/files/${file.id || file.fileID}`);
        toast.success('File deleted successfully');
        if (onDelete) onDelete(file.id || file.fileID);
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file');
      }
    }
  };

  return (
    <div className="file-item">
      <div className="file-icon">{getFileIcon(file.mimeType)}</div>
      
      <div className="file-details">
        <h3 className="file-name">{file.name}</h3>
        <div className="file-meta">
          <span className="file-size">{formatFileSize(file.size)}</span>
          <span className="file-date">{formatDate(file.createdTime)}</span>
        </div>
        
        <div className="file-actions">
          <button 
            className="download-btn"
            onClick={handleDownload}
            disabled={isLoading}
          >
            {isLoading ? 'Downloading...' : 'Download'}
          </button>
          
          <button 
            className="delete-btn"
            onClick={handleDeleteFile}
          >
            Delete
          </button>
        </div>
        
        {/* Add the FileShare component */}
        <FileShare file={file} />
      </div>
    </div>
  );
};

export default FileItem;
